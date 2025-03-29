// search-index.json.js
// This file generates the search index JSON at build time

import { getCollection } from 'astro:content';

export async function GET() {
  try {
    // Get all blog posts
    const posts = await getCollection('blog');
    
    // Create search index data
    const searchIndex = posts.map(post => {
      const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
      return {
        title: post.data.title,
        description: post.data.description || '',
        date: post.data.date.toISOString(),
        tags: post.data.tags || [],
        categories: post.data.categories || [],
        url: `/post/${path}/`,
        slug: post.slug,
        id: post.id
      };
    });
    
    // Sort by date (newest first)
    searchIndex.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return new Response(
      JSON.stringify(searchIndex),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600'
        }
      }
    );
  } catch (error) {
    console.error('Error generating search index:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate search index' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
