/**
 * 計算文章的預計閱讀時間
 * @param content - 文章內容（Markdown 格式）
 * @returns 預計閱讀時間（分鐘），最少為 1 分鐘
 */
export function calculateReadingTime(content: string): number {
  // 移除 Markdown 語法標記
  const plainText = content
    // 移除程式碼區塊
    .replace(/```[\s\S]*?```/g, '')
    // 移除行內程式碼
    .replace(/`[^`]*`/g, '')
    // 移除連結
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除圖片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 移除標題標記
    .replace(/#{1,6}\s/g, '')
    // 移除粗體和斜體標記
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    // 移除其他 Markdown 標記
    .replace(/[>#\-*]/g, '');

  // 計算中文字符數（包含中文標點符號）
  const chineseCharacters = plainText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || [];
  const chineseCount = chineseCharacters.length;

  // 計算英文單詞數（移除中文後計算）
  const englishText = plainText.replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ' ');
  const englishWords = englishText.match(/\b[a-zA-Z]+\b/g) || [];
  const englishCount = englishWords.length;

  // 閱讀速度設定
  const CHINESE_WPM = 300; // 中文每分鐘 300 字
  const ENGLISH_WPM = 200; // 英文每分鐘 200 詞

  // 計算總閱讀時間
  const chineseTime = chineseCount / CHINESE_WPM;
  const englishTime = englishCount / ENGLISH_WPM;
  const totalMinutes = chineseTime + englishTime;

  // 向上取整，最少 1 分鐘
  return Math.max(1, Math.ceil(totalMinutes));
}

/**
 * 格式化閱讀時間為人類可讀的文字
 * @param minutes - 閱讀時間（分鐘）
 * @returns 格式化的文字，例如 "3 分鐘閱讀"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} 分鐘閱讀`;
}
