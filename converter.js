#!/usr/bin/env node

/**
 * Obsidian to Astro Converter
 * 將 Obsidian 格式的文章轉換為 Astro 格式
 */

const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================
const config = {
  sourceDir: 'obsidian-vault/publish',
  imagesDir: 'obsidian-vault/images',
  targetDir: 'src/content/blog',
  verbose: true
};

// ==================== 工具函數 ====================

/**
 * 遞歸取得所有 markdown 檔案
 */
function getAllMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  目錄不存在: ${dir}`);
    return [];
  }

  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });

  return results;
}

/**
 * 解析 YAML front matter
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, content: content };
  }

  const frontMatterText = match[1];
  const bodyContent = match[2];

  const frontMatter = {};
  let currentKey = null;
  let currentArray = null;

  frontMatterText.split('\n').forEach(line => {
    const trimmedLine = line.trim();

    // 處理陣列元素
    if (trimmedLine.startsWith('- ') && currentArray) {
      const value = trimmedLine.substring(2).trim();
      currentArray.push(value);
      return;
    }

    // 處理 key: value
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // 檢查是否為陣列開始
      if (value === '' && line.endsWith(':')) {
        currentKey = key;
        currentArray = [];
        frontMatter[key] = currentArray;
      } else {
        currentKey = null;
        currentArray = null;

        // 處理單行陣列 [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1)
            .split(',')
            .map(v => v.trim().replace(/^["']|["']$/g, ''));
        }

        frontMatter[key] = value;
      }
    }
  });

  return { frontMatter, content: bodyContent };
}

/**
 * 生成 YAML front matter 字串
 */
function stringifyFrontMatter(frontMatter) {
  let result = '---\n';

  for (const [key, value] of Object.entries(frontMatter)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${key}: []\n`;
      } else {
        result += `${key}:\n`;
        value.forEach(item => {
          result += `  - ${item}\n`;
        });
      }
    } else {
      result += `${key}: ${value}\n`;
    }
  }

  result += '---\n';
  return result;
}

/**
 * 提取圖片引用
 */
function extractImageReferences(content) {
  const imageRefs = new Set();

  // 1. 標準 markdown 圖片: ![alt](../../images/pic.png)
  const stdRegex = /!\[([^\]]*)\]\(\.\.\/\.\.\/images\/([^)]+)\)/g;
  let match;
  while ((match = stdRegex.exec(content)) !== null) {
    imageRefs.add(match[2]);
  }

  // 2. Wiki-style 圖片: ![[pic.png]]
  const wikiRegex = /!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\]\]/gi;
  while ((match = wikiRegex.exec(content)) !== null) {
    imageRefs.add(path.basename(match[1]));
  }

  return Array.from(imageRefs);
}

/**
 * 轉換單一文章
 */
function convertFile(sourceFile) {
  if (config.verbose) {
    console.log(`\n📄 處理: ${sourceFile}`);
  }

  try {
    // 讀取檔案
    const content = fs.readFileSync(sourceFile, 'utf8');
    const { frontMatter, content: markdown } = parseFrontMatter(content);

    // 取得分類和 slug
    const relativePath = path.relative(config.sourceDir, sourceFile);
    const pathParts = relativePath.split(path.sep);
    const category = pathParts.length > 1 ? pathParts[0] : 'Uncategorized';
    const filename = path.basename(sourceFile, '.md');
    const slug = frontMatter.slug || filename;

    if (config.verbose) {
      console.log(`   類別: ${category}`);
      console.log(`   Slug: ${slug}`);
    }

    // 建立目標目錄
    const targetDir = path.join(config.targetDir, category, slug);
    const targetImagesDir = path.join(targetDir, 'images');

    if (!fs.existsSync(targetImagesDir)) {
      fs.mkdirSync(targetImagesDir, { recursive: true });
    }

    // 處理圖片
    const imageRefs = extractImageReferences(markdown);

    if (imageRefs.length > 0 && config.verbose) {
      console.log(`   📷 找到 ${imageRefs.length} 張圖片`);
    }

    for (const imageName of imageRefs) {
      const sourcePath = path.join(config.imagesDir, imageName);
      const targetPath = path.join(targetImagesDir, imageName);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        if (config.verbose) {
          console.log(`      ✓ ${imageName}`);
        }
      } else {
        console.warn(`      ✗ 圖片不存在: ${imageName}`);
      }
    }

    // 轉換內容
    let newContent = markdown;

    // 1. 轉換圖片路徑: ../../images/pic.png -> ./images/pic.png
    newContent = newContent.replace(
      /!\[([^\]]*)\]\(\.\.\/\.\.\/images\/([^)]+)\)/g,
      '![$1](./images/$2)'
    );

    // 2. 轉換 Wiki 圖片: ![[pic.png]] -> ![pic.png](./images/pic.png)
    newContent = newContent.replace(
      /!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\]\]/gi,
      (match, filename) => {
        const basename = path.basename(filename);
        const alt = path.parse(basename).name;
        return `![${alt}](./images/${basename})`;
      }
    );

    // 3. 轉換 Wiki 連結: [[link]] 或 [[link|display]] -> [display](../link/)
    newContent = newContent.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (match, link, display) => {
        const label = display || link;
        // 移除 .md 副檔名（如果有的話）
        const cleanLink = link.replace(/\.md$/, '');
        // 轉換為 kebab-case
        const linkSlug = cleanLink
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        return `[${label}](../${linkSlug}/)`;
      }
    );

    // 4. 轉換高亮: ==text== -> <mark>text</mark>
    newContent = newContent.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');

    // 更新 front matter
    if (!frontMatter.slug) {
      frontMatter.slug = slug;
    }

    if (!frontMatter.lastmod) {
      const now = new Date();
      frontMatter.lastmod = now.toISOString().split('T')[0];
    }

    // 組合最終內容
    const finalContent = stringifyFrontMatter(frontMatter) + newContent;

    // 寫入檔案
    const targetFile = path.join(targetDir, 'index.md');
    fs.writeFileSync(targetFile, finalContent, 'utf8');

    if (config.verbose) {
      console.log(`   ✅ 已轉換: ${path.relative(process.cwd(), targetFile)}`);
    }

    return { success: true, category, slug };

  } catch (error) {
    console.error(`   ❌ 轉換失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ==================== 主程式 ====================

function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Obsidian to Astro Converter                  ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // 檢查來源目錄
  if (!fs.existsSync(config.sourceDir)) {
    console.error(`❌ 來源目錄不存在: ${config.sourceDir}`);
    console.log('\n請先建立目錄結構：');
    console.log('  mkdir -p obsidian-vault/publish/Software');
    console.log('  mkdir -p obsidian-vault/draft');
    console.log('  mkdir -p obsidian-vault/images');
    process.exit(1);
  }

  // 清空目標目錄
  if (fs.existsSync(config.targetDir)) {
    console.log(`🗑️  清空目標目錄: ${config.targetDir}\n`);
    fs.rmSync(config.targetDir, { recursive: true, force: true });
  }

  // 取得所有文章
  const files = getAllMarkdownFiles(config.sourceDir);

  if (files.length === 0) {
    console.log('⚠️  未找到任何 Markdown 文章');
    console.log(`\n請在 ${config.sourceDir} 目錄中添加文章`);
    process.exit(0);
  }

  console.log(`📚 找到 ${files.length} 篇文章\n`);

  // 轉換統計
  const stats = {
    total: files.length,
    success: 0,
    failed: 0,
    categories: new Set()
  };

  // 轉換每篇文章
  files.forEach(file => {
    const result = convertFile(file);
    if (result.success) {
      stats.success++;
      stats.categories.add(result.category);
    } else {
      stats.failed++;
    }
  });

  // 顯示統計
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  轉換完成                                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`總計: ${stats.total} 篇文章`);
  console.log(`成功: ${stats.success} 篇`);
  console.log(`失敗: ${stats.failed} 篇`);
  console.log(`分類: ${Array.from(stats.categories).join(', ')}\n`);

  if (stats.failed > 0) {
    console.warn('⚠️  部分文章轉換失敗，請檢查上方錯誤訊息');
    process.exit(1);
  }

  console.log('✅ 所有文章轉換成功！');
}

// 執行主程式
if (require.main === module) {
  main();
}

module.exports = { convertFile, parseFrontMatter, stringifyFrontMatter };
