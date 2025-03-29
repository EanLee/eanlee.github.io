// generate-search-index.js
// This script generates a search index JSON file from blog posts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCollection } from 'astro:content';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSearchIndex() {
  console.log('Generating search index...');
  
  try {
    // Get all blog posts
    const posts = await getCollection('blog');
    
    // Create search index data
    const searchIndex = posts.map(post => {
      return {
        title: post.data.title,
        description: post.data.description || '',
        date: post.data.date.toISOString(),
        tags: post.data.tags || [],
        categories: post.data.categories || [],
        url: `/post/${post.slug}/`,
      };
    });
    
    // Sort by date (newest first)
    searchIndex.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Write to public directory so it's available at runtime
    const outputPath = path.join(__dirname, '../../public/search-index.json');
    
    // Ensure the directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
    
    console.log(`Search index generated with ${searchIndex.length} posts`);
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error('Error generating search index:', error);
  }
}

// Run the function
generateSearchIndex();
