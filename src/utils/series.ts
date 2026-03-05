import type { CollectionEntry } from "astro:content";

export interface SeriesInfo {
  /** URL segment，例：`"build-automated-deploy"` */
  seriesPath: string;
  /** frontmatter `series` 欄位的值，例：`"從零打造 CI/CD 自動化部署"` */
  seriesTitle: string;
  /** epic 識別字，例：`"software"` */
  epic: string;
  /** 系列中的文章篇數 */
  count: number;
  /** 系列中最新文章的 date */
  latestDate: Date;
}

/**
 * 從所有部落格文章推導系列資訊列表，按文章數降序排列。
 *
 * post.id 路徑結構：
 *   "software/series/build-automated-deploy/article-slug/index.md"
 *   segments[-3] = "build-automated-deploy" → seriesPath
 */
export function getSeriesData(posts: CollectionEntry<"blog">[]): SeriesInfo[] {
  const seriesMap = new Map<string, SeriesInfo>();

  for (const post of posts) {
    if (!post.data.series) continue;

    const segments = post.id.split("/");
    const seriesPath = segments[segments.length - 3].toLowerCase();
    const epic = (post.data.epic || segments[0]).toLowerCase();

    if (!seriesMap.has(seriesPath)) {
      seriesMap.set(seriesPath, {
        seriesPath,
        seriesTitle: post.data.series,
        epic,
        count: 0,
        latestDate: post.data.date,
      });
    }

    const entry = seriesMap.get(seriesPath)!;
    entry.count++;
    if (post.data.date > entry.latestDate) {
      entry.latestDate = post.data.date;
    }
  }

  return Array.from(seriesMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * 將系列列表按 epic 分組，回傳有序的 `[epic, SeriesInfo[]]` 陣列。
 * 已知 epic 按 EPIC_ORDER 排序，未知 epic 排在最後。
 */
export function groupSeriesByEpic(
  seriesList: SeriesInfo[]
): [string, SeriesInfo[]][] {
  const EPIC_ORDER = ["software", "management", "reading", "growth"];
  const grouped = new Map<string, SeriesInfo[]>();

  for (const series of seriesList) {
    if (!grouped.has(series.epic)) grouped.set(series.epic, []);
    grouped.get(series.epic)!.push(series);
  }

  return [...grouped.entries()].sort(([a], [b]) => {
    const ai = EPIC_ORDER.indexOf(a);
    const bi = EPIC_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
