#!/usr/bin/env node

/**
 * Phase 1 驗證腳本
 * 檢查所有修復項目是否正確實作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let allPassed = true;

/**
 * 計算顏色的相對亮度
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 計算對比度
 */
function getContrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 將 hex 顏色轉換為 RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 檢查項目 1: Sitemap
 */
function checkSitemap() {
  console.log('\n📊 檢查 1: Sitemap 生成');

  const sitemapIndexPath = path.join(projectRoot, 'dist', 'sitemap-index.xml');
  const sitemap0Path = path.join(projectRoot, 'dist', 'sitemap-0.xml');
  const robotsTxtPath = path.join(projectRoot, 'dist', 'robots.txt');

  // 檢查 sitemap-index.xml 是否存在
  if (!fs.existsSync(sitemapIndexPath)) {
    console.log('  ❌ sitemap-index.xml 不存在');
    console.log('  提示：請先執行 npm run build');
    allPassed = false;
    return false;
  }
  console.log('  ✅ sitemap-index.xml 存在');

  // 檢查 sitemap-0.xml 是否存在（向後相容）
  if (!fs.existsSync(sitemap0Path)) {
    console.log('  ❌ sitemap-0.xml 不存在');
    allPassed = false;
    return false;
  }
  console.log('  ✅ sitemap-0.xml 存在（向後相容）');

  // 檢查 robots.txt 是否正確指向
  if (!fs.existsSync(robotsTxtPath)) {
    console.log('  ⚠️  robots.txt 不存在（建置後才會生成）');
    return true;
  }

  const robotsContent = fs.readFileSync(robotsTxtPath, 'utf-8');
  if (robotsContent.includes('sitemap-index.xml')) {
    console.log('  ✅ robots.txt 正確指向 sitemap-index.xml');
  } else {
    console.log('  ❌ robots.txt 未正確指向 sitemap-index.xml');
    allPassed = false;
    return false;
  }

  return true;
}

/**
 * 檢查項目 2: 色彩對比度
 */
function checkColorContrast() {
  console.log('\n🎨 檢查 2: 色彩對比度');

  const designTokensPath = path.join(projectRoot, 'src', 'styles', 'design-tokens.css');

  if (!fs.existsSync(designTokensPath)) {
    console.log('  ❌ design-tokens.css 不存在');
    allPassed = false;
    return false;
  }

  const content = fs.readFileSync(designTokensPath, 'utf-8');

  // 提取顏色值
  const textMutedMatch = content.match(/--(?:color-)?text-muted:\s*(#[0-9a-f]{6})/i);
  const borderLightMatch = content.match(/--color-border-light:\s*(#[0-9a-f]{6})/i);
  const bgColor = '#0f1419'; // 背景色

  if (!textMutedMatch) {
    console.log('  ❌ 未找到 text-muted 顏色');
    allPassed = false;
    return false;
  }

  if (!borderLightMatch) {
    console.log('  ❌ 未找到 border-light 顏色');
    allPassed = false;
    return false;
  }

  const textMuted = textMutedMatch[1];
  const borderLight = borderLightMatch[1];

  // 計算對比度
  const textContrast = getContrast(textMuted, bgColor);
  const borderContrast = getContrast(borderLight, bgColor);

  console.log(`  text-muted (${textMuted}): 對比度 ${textContrast.toFixed(2)}`);
  if (textContrast >= 5.5) {
    console.log('    ✅ 通過 (目標 ≥ 5.5)');
  } else {
    console.log(`    ❌ 未通過 (目標 ≥ 5.5)`);
    allPassed = false;
  }

  console.log(`  border-light (${borderLight}): 對比度 ${borderContrast.toFixed(2)}`);
  if (borderContrast >= 3.0) {
    console.log('    ✅ 通過 (目標 ≥ 3.0)');
  } else {
    console.log(`    ❌ 未通過 (目標 ≥ 3.0)`);
    allPassed = false;
  }

  return textContrast >= 5.5 && borderContrast >= 3.0;
}

/**
 * 檢查項目 3: LazyImage aspect-ratio 支援
 */
function checkLazyImageAspectRatio() {
  console.log('\n🖼️  檢查 3: LazyImage aspect-ratio 支援');

  const lazyImagePath = path.join(projectRoot, 'src', 'components', 'LazyImage.astro');

  if (!fs.existsSync(lazyImagePath)) {
    console.log('  ❌ LazyImage.astro 不存在');
    allPassed = false;
    return false;
  }

  const content = fs.readFileSync(lazyImagePath, 'utf-8');

  // 檢查是否有 aspectRatio prop
  if (content.includes('aspectRatio?:')) {
    console.log('  ✅ 包含 aspectRatio prop 定義');
  } else {
    console.log('  ❌ 缺少 aspectRatio prop 定義');
    allPassed = false;
    return false;
  }

  // 檢查是否有計算 containerStyle 的邏輯
  if (content.includes('containerStyle') && content.includes('aspect-ratio')) {
    console.log('  ✅ 包含 aspect-ratio 計算邏輯');
  } else {
    console.log('  ❌ 缺少 aspect-ratio 計算邏輯');
    allPassed = false;
    return false;
  }

  // 檢查圖片是否使用絕對定位
  if (content.includes('position: absolute') && content.includes('object-fit: cover')) {
    console.log('  ✅ 圖片使用絕對定位和 object-fit');
  } else {
    console.log('  ❌ 圖片未使用正確的定位方式');
    allPassed = false;
    return false;
  }

  return true;
}

/**
 * 檢查項目 4: 關鍵位置使用 aspect-ratio
 */
function checkCriticalImageUsage() {
  console.log('\n📐 檢查 4: 關鍵位置使用 aspect-ratio');

  const filesToCheck = [
    {
      path: path.join(projectRoot, 'src', 'layouts', 'BlogPost.astro'),
      name: 'BlogPost (文章封面)',
      pattern: /aspectRatio="16\/9"/
    },
    {
      path: path.join(projectRoot, 'src', 'components', 'LatestPosts.astro'),
      name: 'LatestPosts (文章縮圖)',
      pattern: /aspectRatio="1\/1"/
    }
  ];

  let allFound = true;

  for (const file of filesToCheck) {
    if (!fs.existsSync(file.path)) {
      console.log(`  ❌ ${file.name}: 檔案不存在`);
      allPassed = false;
      allFound = false;
      continue;
    }

    const content = fs.readFileSync(file.path, 'utf-8');

    if (file.pattern.test(content)) {
      console.log(`  ✅ ${file.name}: 已使用 aspect-ratio`);
    } else {
      console.log(`  ❌ ${file.name}: 未使用 aspect-ratio`);
      allPassed = false;
      allFound = false;
    }
  }

  return allFound;
}

/**
 * 主要驗證函數
 */
function validate() {
  console.log('🔍 Phase 1 驗證開始...');
  console.log('=' + '='.repeat(50));

  checkSitemap();
  checkColorContrast();
  checkLazyImageAspectRatio();
  checkCriticalImageUsage();

  console.log('\n' + '='.repeat(51));

  if (allPassed) {
    console.log('\n✅ 總體結果: 全部通過');
    console.log('\n建議：');
    console.log('  1. 執行 Lighthouse 審計確認 CLS 改善');
    console.log('  2. 手動測試圖片載入體驗');
    console.log('  3. 在多種裝置上測試響應式表現');
    process.exit(0);
  } else {
    console.log('\n❌ 總體結果: 部分檢查未通過');
    console.log('\n請修復上述問題後重新驗證。');
    process.exit(1);
  }
}

// 執行驗證
validate();
