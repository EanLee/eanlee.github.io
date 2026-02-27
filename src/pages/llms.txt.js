import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION, ABOUT_ME } from "../consts";

export async function GET(context) {
    const siteUrl = context.site?.toString().replace(/\/$/, "") ?? "https://eandev.com";

    const posts = await getCollection("blog");

    // 排序：最新優先
    const sortedPosts = posts.sort(
        (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
    );

    // 整理 series 資料（取唯一系列名 → 文章列表）
    const seriesMap = new Map();
    for (const post of sortedPosts)
    {
        if (!post.data.series) continue;
        const segments = post.id.split("/");
        const seriesSlug = segments[segments.length - 3].toLowerCase();
        if (!seriesMap.has(seriesSlug))
        {
            seriesMap.set(seriesSlug, { title: post.data.series, posts: [] });
        }
        seriesMap.get(seriesSlug).posts.push(post);
    }

    // 一般文章（非 series）
    const standalonePostsByEpic = {};
    for (const post of sortedPosts)
    {
        if (post.data.series) continue;
        const epic = post.data.epic ?? "software";
        if (!standalonePostsByEpic[epic]) standalonePostsByEpic[epic] = [];
        standalonePostsByEpic[epic].push(post);
    }

    const epicLabels = {
        software: "軟體開發",
        management: "技術管理",
        growth: "自我成長",
        reading: "閱讀筆記",
    };

    function postLink(post) {
        const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
        const url = `${siteUrl}/post/${path}/`;
        const desc = post.data.description ? `: ${post.data.description}` : "";
        return `- [${post.data.title}](${url})${desc}`;
    }

    // ── 組裝 Markdown 內容 ─────────────────────────────────────────────
    const lines = [];

    lines.push(`# ${SITE_TITLE}`);
    lines.push("");
    lines.push(`> ${SITE_DESCRIPTION}`);
    lines.push("");
    lines.push("## 關於作者");
    lines.push("");
    lines.push(ABOUT_ME.trim());
    lines.push("");

    // 重要頁面
    lines.push("## 重要頁面");
    lines.push("");
    lines.push(`- [首頁](${siteUrl}/)`);
    lines.push(`- [關於我](${siteUrl}/about/)`);
    lines.push(`- [文章列表](${siteUrl}/archives/)`);
    lines.push(`- [軟體開發文章](${siteUrl}/software/)`);
    lines.push(`- [技術管理文章](${siteUrl}/management/)`);
    lines.push(`- [自我成長文章](${siteUrl}/growth/)`);
    lines.push(`- [閱讀筆記](${siteUrl}/reading/)`);
    lines.push(`- [個人專案](${siteUrl}/projects/)`);
    lines.push("");

    // Series 系列
    if (seriesMap.size > 0)
    {
        lines.push("## 系列文章");
        lines.push("");
        for (const [slug, { title, posts: sPosts }] of seriesMap)
        {
            lines.push(`### ${title}`);
            lines.push("");
            lines.push(`系列總覽：[${title}](${siteUrl}/series/${slug}/)`);
            lines.push("");
            for (const post of sPosts)
            {
                lines.push(postLink(post));
            }
            lines.push("");
        }
    }

    // 分類文章
    for (const [epic, epicPosts] of Object.entries(standalonePostsByEpic))
    {
        const label = epicLabels[epic] ?? epic;
        lines.push(`## ${label}文章`);
        lines.push("");
        for (const post of epicPosts)
        {
            lines.push(postLink(post));
        }
        lines.push("");
    }

    // Optional 區段（讓 LLM 可選擇跳過）
    lines.push("## Optional");
    lines.push("");
    lines.push(`- [RSS Feed](${siteUrl}/rss.xml)`);
    lines.push(`- [Sitemap](${siteUrl}/sitemap-index.xml)`);
    lines.push("");

    const content = lines.join("\n");

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
