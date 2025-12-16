#!/usr/bin/env ts-node

/**
 * Obsidian to Astro Converter
 * 將 Obsidian 格式的 Markdown 文章轉換為 Astro 格式
 *
 * @author EanLee
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

// ==================== 型別定義 ====================

/**
 * 轉換器配置介面
 */
interface ConverterConfig {
  /** Obsidian 文章來源目錄 */
  sourceDir: string;
  /** 共用圖片目錄 */
  imagesDir: string;
  /** Astro 目標輸出目錄 */
  targetDir: string;
  /** 是否顯示詳細日誌 */
  verbose: boolean;
}

/**
 * Front Matter 資料結構
 */
interface FrontMatter {
  /** 文章標題 */
  title?: string;
  /** 文章描述 */
  description?: string;
  /** 發布日期 */
  date?: string;
  /** 最後修改日期 */
  lastmod?: string;
  /** URL slug */
  slug?: string;
  /** 標籤列表 */
  tags?: string[];
  /** 分類列表 */
  categories?: string[];
  /** 關鍵字列表 */
  keywords?: string[];
  /** 其他自訂欄位 */
  [key: string]: any;
}

/**
 * 解析後的 Markdown 結構
 */
interface ParsedMarkdown {
  /** Front Matter 資料 */
  frontMatter: FrontMatter;
  /** Markdown 內容 */
  content: string;
}

/**
 * 轉換結果
 */
interface ConversionResult {
  /** 是否成功 */
  success: boolean;
  /** 文章分類 */
  category?: string;
  /** 文章 slug */
  slug?: string;
  /** 錯誤訊息（如果失敗） */
  error?: string;
}

/**
 * 轉換統計資訊
 */
interface ConversionStats {
  /** 總文章數 */
  total: number;
  /** 成功數 */
  success: number;
  /** 失敗數 */
  failed: number;
  /** 涉及的分類 */
  categories: Set<string>;
}

// ==================== 配置 ====================

const config: ConverterConfig = {
  sourceDir: 'obsidian-vault/publish',
  imagesDir: 'obsidian-vault/images',
  targetDir: 'src/content/blog',
  verbose: true
};

// ==================== 工具函數 ====================

/**
 * 遞歸取得目錄下所有 Markdown 檔案
 *
 * @param dir - 要掃描的目錄路徑
 * @returns Markdown 檔案路徑陣列
 *
 * @example
 * ```typescript
 * const files = getAllMarkdownFiles('obsidian-vault/publish');
 * // ['obsidian-vault/publish/Software/article1.md', ...]
 * ```
 */
function getAllMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  目錄不存在: ${dir}`);
    return [];
  }

  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 遞歸處理子目錄
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });

  return results;
}

/**
 * 解析 YAML Front Matter
 * 支援多種格式：
 * - 單行值: `key: value`
 * - 單行陣列: `tags: [tag1, tag2]`
 * - 多行陣列:
 *   ```yaml
 *   tags:
 *     - tag1
 *     - tag2
 *   ```
 *
 * @param content - Markdown 完整內容
 * @returns 解析後的 Front Matter 和內容
 *
 * @example
 * ```typescript
 * const result = parseFrontMatter(`---
 * title: 測試
 * tags: [Docker, DevOps]
 * ---
 * 內容...`);
 * // result.frontMatter.title === '測試'
 * // result.frontMatter.tags === ['Docker', 'DevOps']
 * ```
 */
function parseFrontMatter(content: string): ParsedMarkdown {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, content: content };
  }

  const frontMatterText = match[1];
  const bodyContent = match[2];

  const frontMatter: FrontMatter = {};
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  frontMatterText.split('\n').forEach(line => {
    const trimmedLine = line.trim();

    // 處理陣列元素 (- item)
    if (trimmedLine.startsWith('- ') && currentArray) {
      const value = trimmedLine.substring(2).trim();
      currentArray.push(value);
      return;
    }

    // 處理 key: value 格式
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // 檢查是否為多行陣列開始
      if (value === '' && line.endsWith(':')) {
        currentKey = key;
        currentArray = [];
        frontMatter[key] = currentArray;
      } else {
        currentKey = null;
        currentArray = null;

        // 處理單行陣列 [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayValue = value.slice(1, -1)
            .split(',')
            .map(v => v.trim().replace(/^["']|["']$/g, ''));
          frontMatter[key] = arrayValue;
        } else {
          // 一般值（移除引號）
          frontMatter[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  });

  return { frontMatter, content: bodyContent };
}

/**
 * 將 Front Matter 物件轉換為 YAML 字串
 *
 * @param frontMatter - Front Matter 資料物件
 * @returns YAML 格式字串
 *
 * @example
 * ```typescript
 * const yaml = stringifyFrontMatter({
 *   title: '測試文章',
 *   tags: ['Docker', 'DevOps']
 * });
 * // 輸出:
 * // ---
 * // title: 測試文章
 * // tags:
 * //   - Docker
 * //   - DevOps
 * // ---
 * ```
 */
function stringifyFrontMatter(frontMatter: FrontMatter): string {
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
 * 從 Markdown 內容中提取所有圖片引用
 * 支援兩種格式：
 * 1. 標準 Markdown: `![alt](../../images/pic.png)`
 * 2. Obsidian Wiki: `![[pic.png]]`
 *
 * @param content - Markdown 內容
 * @returns 圖片檔名陣列（去重）
 *
 * @example
 * ```typescript
 * const images = extractImageReferences(`
 *   ![Docker](../../images/docker.png)
 *   ![[container.png]]
 * `);
 * // ['docker.png', 'container.png']
 * ```
 */
function extractImageReferences(content: string): string[] {
  const imageRefs = new Set<string>();

  // 1. 標準 markdown 圖片: ![alt](../../images/pic.png)
  const stdRegex = /!\[([^\]]*)\]\(\.\.\/\.\.\/images\/([^)]+)\)/g;
  let match: RegExpExecArray | null;

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
 * 轉換單一 Markdown 文章
 *
 * 執行步驟：
 * 1. 讀取並解析 Front Matter
 * 2. 確定文章分類和 slug
 * 3. 建立目標目錄結構
 * 4. 提取並複製圖片
 * 5. 轉換內容格式：
 *    - 圖片路徑：`../../images/pic.png` → `./images/pic.png`
 *    - Wiki 圖片：`![[pic.png]]` → `![pic](./images/pic.png)`
 *    - Wiki 連結：`[[link]]` → `[link](../link/)`
 *    - 高亮：`==text==` → `<mark>text</mark>`
 * 6. 更新 Front Matter（補充 slug 和 lastmod）
 * 7. 寫入轉換後的檔案
 *
 * @param sourceFile - 來源 Markdown 檔案路徑
 * @returns 轉換結果
 *
 * @example
 * ```typescript
 * const result = convertFile('obsidian-vault/publish/Software/docker.md');
 * if (result.success) {
 *   console.log(`轉換成功: ${result.category}/${result.slug}`);
 * }
 * ```
 */
function convertFile(sourceFile: string): ConversionResult {
  if (config.verbose) {
    console.log(`\n📄 處理: ${sourceFile}`);
  }

  try {
    // ========== 1. 讀取並解析檔案 ==========
    const content = fs.readFileSync(sourceFile, 'utf8');
    const { frontMatter, content: markdown } = parseFrontMatter(content);

    // ========== 2. 確定分類和 slug ==========
    const relativePath = path.relative(config.sourceDir, sourceFile);
    const pathParts = relativePath.split(path.sep);
    const category = pathParts.length > 1 ? pathParts[0] : 'Uncategorized';
    const filename = path.basename(sourceFile, '.md');
    const slug = frontMatter.slug || filename;

    if (config.verbose) {
      console.log(`   類別: ${category}`);
      console.log(`   Slug: ${slug}`);
    }

    // ========== 3. 建立目標目錄 ==========
    const targetDir = path.join(config.targetDir, category, slug);
    const targetImagesDir = path.join(targetDir, 'images');

    if (!fs.existsSync(targetImagesDir)) {
      fs.mkdirSync(targetImagesDir, { recursive: true });
    }

    // ========== 4. 處理圖片 ==========
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

    // ========== 5. 轉換內容 ==========
    let newContent = markdown;

    // 5.1 轉換圖片路徑: ../../images/pic.png -> ./images/pic.png
    newContent = newContent.replace(
      /!\[([^\]]*)\]\(\.\.\/\.\.\/images\/([^)]+)\)/g,
      '![$1](./images/$2)'
    );

    // 5.2 轉換 Wiki 圖片: ![[pic.png]] -> ![pic.png](./images/pic.png)
    newContent = newContent.replace(
      /!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\]\]/gi,
      (match: string, filename: string) => {
        const basename = path.basename(filename);
        const alt = path.parse(basename).name; // 使用檔名作為 alt
        return `![${alt}](./images/${basename})`;
      }
    );

    // 5.3 轉換 Wiki 連結: [[link]] 或 [[link|display]] -> [display](../link/)
    newContent = newContent.replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (match: string, link: string, display?: string) => {
        const label = display || link;
        // 移除 .md 副檔名（如果有）
        const cleanLink = link.replace(/\.md$/, '');
        // 轉換為 URL 友善的 slug (kebab-case)
        const linkSlug = cleanLink
          .toLowerCase()
          .replace(/\s+/g, '-')           // 空格轉 -
          .replace(/[^a-z0-9-]/g, '');    // 移除特殊字元
        return `[${label}](../${linkSlug}/)`;
      }
    );

    // 5.4 轉換高亮: ==text== -> <mark>text</mark>
    newContent = newContent.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');

    // ========== 6. 更新 Front Matter ==========

    // 補充 slug（如果沒有）
    if (!frontMatter.slug) {
      frontMatter.slug = slug;
    }

    // 補充 lastmod（最後修改日期）
    if (!frontMatter.lastmod) {
      const now = new Date();
      frontMatter.lastmod = now.toISOString().split('T')[0];
    }

    // ========== 7. 組合並寫入檔案 ==========
    const finalContent = stringifyFrontMatter(frontMatter) + newContent;

    const targetFile = path.join(targetDir, 'index.md');
    fs.writeFileSync(targetFile, finalContent, 'utf8');

    if (config.verbose) {
      console.log(`   ✅ 已轉換: ${path.relative(process.cwd(), targetFile)}`);
    }

    return { success: true, category, slug };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ 轉換失敗: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// ==================== 主程式 ====================

/**
 * 主程式入口
 *
 * 執行流程：
 * 1. 檢查來源目錄是否存在
 * 2. 清空目標目錄
 * 3. 掃描所有 Markdown 檔案
 * 4. 逐一轉換文章
 * 5. 顯示轉換統計
 *
 * @throws 當來源目錄不存在時終止程式
 */
function main(): void {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Obsidian to Astro Converter                  ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // ========== 檢查來源目錄 ==========
  if (!fs.existsSync(config.sourceDir)) {
    console.error(`❌ 來源目錄不存在: ${config.sourceDir}`);
    console.log('\n請先建立目錄結構：');
    console.log('  mkdir -p obsidian-vault/publish/Software');
    console.log('  mkdir -p obsidian-vault/draft');
    console.log('  mkdir -p obsidian-vault/images');
    process.exit(1);
  }

  // ========== 清空目標目錄 ==========
  if (fs.existsSync(config.targetDir)) {
    console.log(`🗑️  清空目標目錄: ${config.targetDir}\n`);
    fs.rmSync(config.targetDir, { recursive: true, force: true });
  }

  // ========== 掃描文章 ==========
  const files = getAllMarkdownFiles(config.sourceDir);

  if (files.length === 0) {
    console.log('⚠️  未找到任何 Markdown 文章');
    console.log(`\n請在 ${config.sourceDir} 目錄中添加文章`);
    process.exit(0);
  }

  console.log(`📚 找到 ${files.length} 篇文章\n`);

  // ========== 轉換統計 ==========
  const stats: ConversionStats = {
    total: files.length,
    success: 0,
    failed: 0,
    categories: new Set<string>()
  };

  // ========== 轉換每篇文章 ==========
  files.forEach(file => {
    const result = convertFile(file);
    if (result.success) {
      stats.success++;
      if (result.category) {
        stats.categories.add(result.category);
      }
    } else {
      stats.failed++;
    }
  });

  // ========== 顯示統計 ==========
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

// ==================== 模組導出 ====================

/**
 * 如果直接執行此檔案，則執行主程式
 * 否則導出函數供其他模組使用
 */
if (require.main === module) {
  main();
}

export {
  convertFile,
  parseFrontMatter,
  stringifyFrontMatter,
  extractImageReferences,
  getAllMarkdownFiles
};

export type {
  ConverterConfig,
  FrontMatter,
  ParsedMarkdown,
  ConversionResult,
  ConversionStats
};
