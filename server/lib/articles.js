const crypto = require('crypto');
const fs = require('fs/promises');
const { readArticles, writeArticles } = require('./store');
const { generateArticleHtml, generateListingHtml } = require('./generator');
const { syncArtikelPage } = require('./artikel-sync');
const { articleHtmlPath, MANAGED_LISTING_DIR, MANAGED_LISTING_FILE } = require('./paths');
const { slugify, stripHtml, truncate, toIsoDate } = require('./utils');
const { filterPublished } = require('./publish');
const { notifyPublishScheduleChanged } = require('./schedule');

function createId() {
  return crypto.randomUUID();
}

function normalizeArticle(input, existing) {
  const now = toIsoDate();
  const title = String(input.title || existing?.title || '').trim();
  const slug = slugify(input.slug || title || existing?.slug || '');

  if (!title) {
    throw new Error('Judul artikel wajib diisi.');
  }

  if (!slug) {
    throw new Error('Slug artikel tidak valid.');
  }

  const content = String(input.content ?? existing?.content ?? '').trim();
  if (!content) {
    throw new Error('Konten artikel wajib diisi.');
  }

  const excerpt = truncate(
    String(input.excerpt || existing?.excerpt || stripHtml(content)).trim(),
    220
  );

  return {
    id: existing?.id || createId(),
    slug,
    title,
    excerpt,
    content,
    featuredImage: String(input.featuredImage ?? existing?.featuredImage ?? '').trim(),
    category: String(input.category ?? existing?.category ?? 'artikel').trim() || 'artikel',
    author: String(input.author ?? existing?.author ?? 'admin').trim() || 'admin',
    publishedAt: toIsoDate(input.publishedAt || existing?.publishedAt || now),
    updatedAt: now,
    managed: true,
    source: existing?.source || 'admin',
  };
}

async function writeArticleFile(article) {
  const html = generateArticleHtml(article);
  await fs.writeFile(articleHtmlPath(article.slug), html, 'utf8');
}

async function removeArticleFile(slug) {
  try {
    await fs.unlink(articleHtmlPath(slug));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function rebuildListing() {
  const articles = await readArticles();
  const visible = filterPublished(articles.filter((item) => item.managed));
  const html = generateListingHtml(visible);
  await fs.mkdir(MANAGED_LISTING_DIR, { recursive: true });
  await fs.writeFile(MANAGED_LISTING_FILE, html, 'utf8');
  await syncArtikelPage(articles);
}

async function listArticles() {
  return readArticles();
}

async function getArticle(slug) {
  const articles = await readArticles();
  return articles.find((article) => article.slug === slug) || null;
}

async function createArticle(input) {
  const articles = await readArticles();
  const article = normalizeArticle(input);

  if (articles.some((item) => item.slug === article.slug)) {
    throw new Error(`Artikel dengan slug "${article.slug}" sudah ada.`);
  }

  articles.push(article);
  await writeArticles(articles);
  await writeArticleFile(article);
  await rebuildListing();
  await notifyPublishScheduleChanged();
  return article;
}

async function updateArticle(slug, input) {
  const articles = await readArticles();
  const index = articles.findIndex((item) => item.slug === slug);

  if (index === -1) {
    throw new Error('Artikel tidak ditemukan.');
  }

  const existing = articles[index];

  const article = normalizeArticle({ ...existing, ...input }, existing);

  if (article.slug !== slug && articles.some((item) => item.slug === article.slug)) {
    throw new Error(`Artikel dengan slug "${article.slug}" sudah ada.`);
  }

  if (article.slug !== slug) {
    await removeArticleFile(slug);
  }

  articles[index] = article;
  await writeArticles(articles);
  await writeArticleFile(article);
  await rebuildListing();
  await notifyPublishScheduleChanged();
  return article;
}

async function deleteArticle(slug) {
  const articles = await readArticles();
  const index = articles.findIndex((item) => item.slug === slug);

  if (index === -1) {
    throw new Error('Artikel tidak ditemukan.');
  }

  const removed = articles[index];

  articles.splice(index, 1);
  await writeArticles(articles);
  await removeArticleFile(removed.slug);

  await rebuildListing();
  await notifyPublishScheduleChanged();
  return removed;
}

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  rebuildListing,
};
