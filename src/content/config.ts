import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		date: z.coerce.date(),
		lastmod: z.coerce.date().optional(),
		tags: z.preprocess(
			(val) => (Array.isArray(val) ? val.filter((item) => item !== null) : val),
			z.array(z.string()).nullable().optional()
		),
		categories: z.preprocess(
			(val) => (Array.isArray(val) ? val.filter((item) => item !== null) : val),
			z.array(z.string()).nullable().optional()
		),
		keywords: z.preprocess(
			(val) => (Array.isArray(val) ? val.filter((item) => item !== null) : val),
			z.array(z.string()).nullable().optional()
		),
		coverImage: z.union([image(), z.string()]).nullable().optional(),
		series: z.string().nullable().optional(),
		epic: z.string().nullable().optional(),
	relatedProjects: z.string().optional(), // 相關專案 alias（單一專案）
	}),
});

const projects = defineCollection({
	schema: ({ image }) => z.object({
		title: z.string(),                        // 專案名稱
		alias: z.string().optional(),            // 專案別名，用於文章引用
		description: z.string(),                  // 簡短描述
		techStack: z.array(z.string()),          // 技術棧
		status: z.enum(['active', 'maintained', 'archived']).default('active'), // 專案狀態
		startDate: z.coerce.date(),              // 開始日期
		coverImage: z.union([image(), z.string()]).nullable().optional(), // 封面圖
		url: z.string().url().optional(),        // 專案網址
		downloadUrl: z.string().url().optional(), // 下載連結
		github: z.string().url().optional(),     // GitHub 連結
		license: z.string().optional(),          // 開源協議
		keywords: z.array(z.string()).optional(), // SEO 關鍵字
		relatedPosts: z.array(z.string()).optional(), // 相關文章 slug
	}),
});

export const collections = { blog, projects };
