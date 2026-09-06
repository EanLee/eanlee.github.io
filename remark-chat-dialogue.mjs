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
 * 格式化訊息行內語法（如行內程式碼 `...` 與粗體 **...**）
 */
function formatInline(text) {
  let res = escapeHtml(text);
  // 支援粗體 **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 支援行內程式碼 `code`
  res = res.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  return res;
}

/**
 * 找出在該對話中應固定於右側的發言者名稱
 */
function getRightSideSpeaker(speakers) {
  const authorKeywords = ['eric', '伊恩', 'ean', 'me', 'author', '我'];
  for (const s of speakers) {
    if (authorKeywords.includes(s.trim().toLowerCase())) {
      return s;
    }
  }
  // 若無特定格主名稱，預設由第二位登場者在右側（第一位在左側）
  if (speakers.length > 1) {
    return speakers[1];
  }
  return null;
}

/**
 * 解析 chat 代碼區塊純文字為結構化對話陣列
 */
function parseChat(rawText) {
  const lines = rawText.split('\n');
  const items = [];
  let currentItem = null;

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // 匹配發言者行（例如 "Eric:" 或 "吉米: 既然..."）
    const speakerMatch = trimmed.match(/^([^:：\s]{1,12})\s*[:：]\s*(.*)$/);
    if (speakerMatch) {
      if (currentItem) items.push(currentItem);
      const speaker = speakerMatch[1];
      const initialText = speakerMatch[2] ? speakerMatch[2].trim() : '';
      currentItem = {
        type: 'message',
        speaker,
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
 * Remark 插件：將 ```chat 代碼區塊轉換為 LINE / 聊天軟體風格對話 UI
 */
export function remarkChatDialogue() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'chat') return;

      const items = parseChat(node.value || '');
      if (items.length === 0) return;

      // 統計發言者清單
      const speakers = [];
      items.forEach((item) => {
        if (item.type === 'message' && !speakers.includes(item.speaker)) {
          speakers.push(item.speaker);
        }
      });

      const rightSpeaker = getRightSideSpeaker(speakers);

      let html = '<div class="chat-dialogue-container">\n';

      for (const item of items) {
        if (item.type === 'narrator') {
          const content = item.texts.map(formatInline).join('<br />');
          html += '  <div class="chat-narrator">\n';
          html += '    <span class="chat-narrator-badge">💬 場景</span>\n';
          html += `    <span class="chat-narrator-text">${content}</span>\n`;
          html += '  </div>\n';
        } else if (item.type === 'message') {
          const isRight = rightSpeaker !== null && item.speaker === rightSpeaker;
          const sideClass = isRight ? 'chat-msg-right' : 'chat-msg-left';
          const avatarInitial = escapeHtml(item.speaker.charAt(0).toUpperCase());
          const speakerName = escapeHtml(item.speaker);
          const content = item.texts.map(formatInline).join('<br />');

          html += `  <div class="chat-message ${sideClass}">\n`;
          html += `    <div class="chat-avatar" title="${speakerName}">${avatarInitial}</div>\n`;
          html += '    <div class="chat-content-wrap">\n';
          html += `      <span class="chat-speaker-name">${speakerName}</span>\n`;
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
