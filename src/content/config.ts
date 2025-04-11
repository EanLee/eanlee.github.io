import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		date: z.coerce.date(),
		lastmod: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		categories: z.array(z.string()).optional(),
		keywords: z.array(z.string()).optional(),
		coverImage: z.string().optional(),
		series: z.string().optional(),
		epic: z.string().optional(),
	}),
});

export const collections = { blog };
