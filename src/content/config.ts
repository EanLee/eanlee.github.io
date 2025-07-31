import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
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
		coverImage: z.string().nullable().optional(),
		series: z.string().nullable().optional(),
		epic: z.string().nullable().optional(),
	}),
});

export const collections = { blog };
