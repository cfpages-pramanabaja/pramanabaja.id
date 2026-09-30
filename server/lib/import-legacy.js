const fs = require('fs/promises');
const path = require('path');
const { readArticles, writeArticles } = require('./store');
const { rebuildListing } = require('./articles');
const { ROOT } = require('./paths');
const { slugify, stripHtml, truncate, toIsoDate } = require('./utils');

const ARTIKEL_LISTING = path.join(ROOT, 'artikel', 'index.html');
const SKIP_SLUGS = new Set(['index', 'admin', 'artikel']);

function extractListingSlugs(html) {
  const slugs = new Set();
  const re = /href="\/([a-z0-9][a-z0-9-]*)\.html"/gi;
  let match = re.exec(html);
  while (match) {
    const slug = match[1];
    if (!SKIP_SLUGS.has(slug)) slugs.add(slug);
    match = re.exec(html);
  }
  return [...slugs];
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (!match) return '';
  return match[1].replace(/\s*[–-]\s*PRAMANA Baja.*$/i, '').trim();
}

function extractExcerpt(html) {
  const meta = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (meta?.[1]) return meta[1].trim();
  const contentMatch = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!contentMatch) return '';
  return truncate(stripHtml(contentMatch[1]), 220);
}

function extractContent(html) {
  const match = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!-- \.entry-content/i);
  if (match) return match[1].trim();
  const fallback = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  return fallback ? fallback[1].trim() : '';
}

function extractFeaturedImage(html) {
  const thumbBlock = html.match(/<div class="post-thumb-img-content post-thumb">[\s\S]*?<\/div>/i);
  if (thumbBlock) {
    const src = thumbBlock[0].match(/\ssrc="([^"]+)"/i);
    if (src?.[1]) return src[1];
  }

  const imgTag = html.match(/<img[^>]*wp-post-image[^>]*>/i);
  if (imgTag) {
    const src = imgTag[0].match(/\ssrc="([^"]+)"/i);
    if (src?.[1]) return src[1];
  }

  return '';
}

function extractPublishedDate(html) {
  const match = html.match(/class="published"[^>]*>([^<]+)</i);
  if (match?.[1]) return toIsoDate(match[1]);
  const updatedMatch = html.match(/property="article:modified_time"\s+content="([^"]+)"/i);
  if (updatedMatch?.[1]) return toIsoDate(updatedMatch[1]);
  return toIsoDate();
}

function isArticleHtml(html) {
  return /single-post|category-artikel|type-post/i.test(html);
}

async function importArticleFromFile(slug) {
  const filePath = path.join(ROOT, `${slug}.html`);
  let html;
  try {
    html = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }

  if (!isArticleHtml(html)) return null;

  const title = extractTitle(html);
  const content = extractContent(html);
  if (!title || !content) return null;

  return {
    id: `import-${slug}`,
    slug,
    title,
    excerpt: extractExcerpt(html),
    content,
    featuredImage: extractFeaturedImage(html),
    category: 'artikel',
    author: 'admin',
    publishedAt: extractPublishedDate(html),
    updatedAt: toIsoDate(),
    managed: false,
    source: 'imported',
  };
}

async function importLegacyArticles({ rebuild = true, resync = true } = {}) {
  const listingHtml = await fs.readFile(ARTIKEL_LISTING, 'utf8');
  const slugs = extractListingSlugs(listingHtml);
  const existing = await readArticles();
  const existingSlugs = new Set(existing.map((item) => item.slug));
  const imported = [];
  let resynced = 0;

  if (resync) {
    for (let index = 0; index < existing.length; index += 1) {
      const article = existing[index];
      if (article.source !== 'imported') continue;
      const fresh = await importArticleFromFile(article.slug);
      if (!fresh) continue;
      const next = { ...article };
      let changed = false;
      if (!article.featuredImage && fresh.featuredImage) {
        next.featuredImage = fresh.featuredImage;
        changed = true;
      }
      if (!article.excerpt && fresh.excerpt) {
        next.excerpt = fresh.excerpt;
        changed = true;
      }
      if (changed) {
        existing[index] = next;
        resynced += 1;
      }
    }
    if (resynced > 0) {
      await writeArticles(existing);
    }
  }

  for (const slug of slugs) {
    if (existingSlugs.has(slug)) continue;
    const article = await importArticleFromFile(slug);
    if (!article) continue;
    imported.push(article);
    existingSlugs.add(slug);
  }

  if (imported.length > 0) {
    await writeArticles([...existing, ...imported]);
  }

  if (rebuild && (imported.length > 0 || resynced > 0)) {
    await rebuildListing();
  }

  if (imported.length === 0 && resynced === 0) {
    return { imported: 0, resynced: 0, total: existing.length, slugs: [] };
  }

  return {
    imported: imported.length,
    resynced,
    total: existing.length + imported.length,
    slugs: imported.map((item) => item.slug),
  };
}

module.exports = {
  importLegacyArticles,
  importArticleFromFile,
  extractListingSlugs,
};
