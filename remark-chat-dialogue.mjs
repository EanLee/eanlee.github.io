import { visit } from 'unist-util-visit';

/**
 * 簡易 HTML 跳脫
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 格式化訊息行內語法（支援粗體 **...** 與行內代碼 `...`）
 */
function formatInline(text) {
  let res = escapeHtml(text);
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  return res;
}

/**
 * 智慧提取頭像縮寫（英文縮寫如 PM/QA/AI 保留全字，中文取首字）
 */
function getAvatarInitial(name) {
  const trimmed = name.trim();
  if (/^[a-zA-Z]{1,3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
}

/**
 * 解析 Code fence meta 屬性
 * 支援:
 * ```chat title="架構討論會" right="Eric,主管"
 * ```chat right="Alice"
 */
function parseMeta(meta) {
  const options = {
    title: null,
    right: [],
    left: [],
  };
  if (!meta) return options;

  const titleMatch = meta.match(/title=["']([^"']+)["']/i);
  if (titleMatch) {
    options.title = titleMatch[1].trim();
  }

  const rightMatch = meta.match(/right=["']([^"']+)["']/i) || meta.match(/right=([^\s]+)/i);
  if (rightMatch) {
    options.right = rightMatch[1].split(/[,，\s]+/).map((s) => s.trim().toLowerCase());
  }

  const leftMatch = meta.match(/left=["']([^"']+)["']/i) || meta.match(/left=([^\s]+)/i);
  if (leftMatch) {
    options.left = leftMatch[1].split(/[,，\s]+/).map((s) => s.trim().toLowerCase());
  }

  return options;
}

/**
 * 決定發言者應在左側還是右側
 * 優先序:
 * 1. 行內覆蓋: Eric(r): 或 小明(left):
 * 2. Meta 指定: ```chat right="Eric" 或 left="吉米"
 * 3. 只有 1 位發言者: 預設靠左 (保持單人引言與常規文字閱讀流)
 * 4. 2 位或以上發言者: 第 1 位開場者靠左，第 2 位回應者靠右 (自然形成由左至右的一左一右交替動線)
 * 5. 其餘發言者 (第 3 位起): 預設靠左
 */
function isSpeakerOnRight(speaker, sideOverride, metaOptions, speakersList) {
  if (sideOverride) {
    return sideOverride === 'right';
  }

  const s = speaker.trim().toLowerCase();

  // Meta 明確指定
  if (metaOptions.right.length > 0 && metaOptions.right.includes(s)) {
    return true;
  }
  if (metaOptions.left.length > 0 && metaOptions.left.includes(s)) {
    return false;
  }

  // 只有 1 位發言者時，一律靠左
  if (speakersList.length <= 1) {
    return false;
  }

  // 若 meta 有指定特定右側名單但未包含當前人物，則靠左
  if (metaOptions.right.length > 0) {
    return false;
  }

  // 預設開場與對談動線：第 1 位在左側，第 2 位在右側
  return speakersList.indexOf(speaker) === 1;
}

/**
 * 多人色彩調色盤（高質感主題漸層）
 */
const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', text: '#5eead4' }, // 0: Teal 藍綠
  { bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', text: '#fde68a' }, // 1: Amber 琥珀
  { bg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', text: '#d8b4fe' }, // 2: Violet 紫羅蘭
  { bg: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)', text: '#fecdd3' }, // 3: Rose 玫紅
  { bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', text: '#7dd3fc' }, // 4: Sky 天藍
  { bg: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', text: '#fed7aa' }, // 5: Orange 橙橘
  { bg: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', text: '#86efac' }, // 6: Green 翠綠
];

/**
 * 依發言者名稱與順序取得專屬色彩
 */
function getSpeakerColor(speaker, speakersList, isRight) {
  if (isRight) {
    return {
      bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      color: '#ffffff',
      text: '#c7d2fe',
    };
  }

  let idx = speakersList.indexOf(speaker);
  if (idx < 0) idx = 0;
  const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
  return {
    bg: palette.bg,
    color: '#ffffff',
    text: palette.text,
  };
}

/**
 * 解析對話文本
 */
function parseChat(rawText) {
  const lines = rawText.split('\n');
  const items = [];
  let currentItem = null;

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // 匹配發言者行（例如 "Eric:", "吉米(r):", "小明[left]:"）
    const speakerMatch = trimmed.match(/^([^:：\s]{1,16})\s*[:：]\s*(.*)$/);
    if (speakerMatch) {
      if (currentItem) items.push(currentItem);

      let rawSpeaker = speakerMatch[1];
      let sideOverride = null;

      // 檢查行內左右覆蓋語法
      const overrideMatch = rawSpeaker.match(/^(.+?)[（(\[]\s*(r|right|l|left|右|左)\s*[)）\]]$/i);
      if (overrideMatch) {
        rawSpeaker = overrideMatch[1].trim();
        const flag = overrideMatch[2].toLowerCase();
        if (['r', 'right', '右'].includes(flag)) sideOverride = 'right';
        else if (['l', 'left', '左'].includes(flag)) sideOverride = 'left';
      }

      const speaker = rawSpeaker;
      const initialText = speakerMatch[2] ? speakerMatch[2].trim() : '';
      currentItem = {
        type: 'message',
        speaker,
        sideOverride,
        texts: initialText ? [initialText] : [],
      };
    } else {
      if (currentItem && currentItem.type === 'message') {
        currentItem.texts.push(trimmed);
      } else {
        if (!currentItem || currentItem.type !== 'narrator') {
          if (currentItem) items.push(currentItem);
          currentItem = {
            type: 'narrator',
            texts: [trimmed],
          };
        } else {
          currentItem.texts.push(trimmed);
        }
      }
    }
  }

  if (currentItem) items.push(currentItem);
  return items;
}

/**
 * Remark 插件：將 ```chat 代碼區塊轉換為高度自由的 LINE / 聊天軟體風格對話 UI
 */
export function remarkChatDialogue() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'chat') return;

      const items = parseChat(node.value || '');
      if (items.length === 0) return;

      const metaOptions = parseMeta(node.meta || '');

      // 統計所有發言者
      const speakersList = [];
      items.forEach((item) => {
        if (item.type === 'message' && !speakersList.includes(item.speaker)) {
          speakersList.push(item.speaker);
        }
      });

      let html = '<div class="chat-dialogue-container">\n';

      // 若有提供 title，渲染現場對談資訊列
      if (metaOptions.title) {
        const titleSafe = escapeHtml(metaOptions.title);
        const countSafe = speakersList.length;
        html += '  <div class="chat-header">\n';
        html += `    <div class="chat-header-title">👥 ${titleSafe}</div>\n`;
        html += `    <div class="chat-header-members">${countSafe} 位對談者</div>\n`;
        html += '  </div>\n';
      }

      for (const item of items) {
        if (item.type === 'narrator') {
          const content = item.texts.map(formatInline).join('<br />');
          html += '  <div class="chat-narrator">\n';
          html += '    <span class="chat-narrator-badge">☕ 現場情境</span>\n';
          html += `    <span class="chat-narrator-text">${content}</span>\n`;
          html += '  </div>\n';
        } else if (item.type === 'message') {
          const isRight = isSpeakerOnRight(item.speaker, item.sideOverride, metaOptions, speakersList);
          const sideClass = isRight ? 'chat-msg-right' : 'chat-msg-left';
          const avatarInitial = escapeHtml(getAvatarInitial(item.speaker));
          const speakerName = escapeHtml(item.speaker);
          const avatarColor = getSpeakerColor(item.speaker, speakersList, isRight);
          const content = item.texts.map(formatInline).join('<br />');

          html += `  <div class="chat-message ${sideClass}">\n`;
          html += `    <div class="chat-avatar" style="background: ${avatarColor.bg};" title="${speakerName}">${avatarInitial}</div>\n`;
          html += '    <div class="chat-content-wrap">\n';
          html += `      <span class="chat-speaker-name" style="color: ${avatarColor.text};">${speakerName}</span>\n`;
          html += '      <div class="chat-bubble">\n';
          html += `        <div class="chat-bubble-text">${content}</div>\n`;
          html += '      </div>\n';
          html += '    </div>\n';
          html += '  </div>\n';
        }
      }

      html += '</div>';

      node.type = 'html';
      node.value = html;
      delete node.lang;
    });
  };
}

export default remarkChatDialogue;
