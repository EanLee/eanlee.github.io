import getReadingTime from 'reading-time';

export interface ReadingTimeResult {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

/**
 * 計算文章的預計閱讀時間（分鐘）
 * 基於官方推薦的 reading-time 套件，設定 CJK 默讀速度 350 字/分
 * @param content - 文章內容（Markdown 或純文字）
 * @returns 預計閱讀時間（分鐘），最少為 1 分鐘
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const result = getReadingTime(content, { wordsPerMinute: 350 });
  return Math.max(1, Math.round(result.minutes));
}

/**
 * 格式化閱讀時間為中文友善字串
 * @param minutes - 閱讀時間（分鐘）
 * @returns 例如「5 分鐘閱讀」
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} 分鐘閱讀`;
}

/**
 * 取得完整閱讀時間統計資訊（包含字數與時間）
 */
export function getReadingTimeDetails(content: string): ReadingTimeResult {
  if (!content) {
    return {
      text: '約 1 分鐘閱讀',
      minutes: 1,
      time: 60000,
      words: 0,
    };
  }
  const result = getReadingTime(content, { wordsPerMinute: 350 });
  const roundedMinutes = Math.max(1, Math.round(result.minutes));
  return {
    text: `約 ${roundedMinutes} 分鐘閱讀`,
    minutes: roundedMinutes,
    time: result.time,
    words: result.words,
  };
}
