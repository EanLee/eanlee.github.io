import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

/**
 * 官方 Astro 推薦的閱讀時間 Remark 外掛
 * 使用 reading-time 與 mdast-util-to-string 計算閱讀時間與字數，
 * 並將 minutesRead 與 readingTime 物件注入到 frontmatter 中。
 */
export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    // 中文默認默讀速度約 350-500 字/分鐘，以 350 WPM 估算避免時間偏長
    const readingTime = getReadingTime(textOnPage, { wordsPerMinute: 350 });
    const roundedMinutes = Math.max(1, Math.round(readingTime.minutes));

    // 格式化為中文友善字串，例如「約 5 分鐘閱讀」
    const formattedText = `約 ${roundedMinutes} 分鐘閱讀`;

    if (!data.astro) {
      data.astro = {};
    }
    if (!data.astro.frontmatter) {
      data.astro.frontmatter = {};
    }

    data.astro.frontmatter.minutesRead = formattedText;
    data.astro.frontmatter.readingTime = {
      text: formattedText,
      minutes: roundedMinutes,
      words: readingTime.words,
      time: readingTime.time,
    };
  };
}

export default remarkReadingTime;
