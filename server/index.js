require('dotenv').config();

const express = require('express');
const multer = require('multer');
const {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  rebuildListing,
} = require('./lib/articles');
const { saveUploadedImage } = require('./lib/upload');
const { importLegacyArticles } = require('./lib/import-legacy');
const { importProductArticles } = require('./lib/import-product');
const {
  listProductArticles,
  getProductArticle,
  createProductArticle,
  updateProductArticle,
  deleteProductArticle,
} = require('./lib/product-articles');
const { ROOT, ADMIN_DIR } = require('./lib/paths');
const {
  initScheduleWatcher,
  createPublishGuardMiddleware,
  notifyPublishScheduleChanged,
} = require('./lib/schedule');

const app = express();
const port = Number(process.env.PORT || 8000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 },
});

app.use(express.json({ limit: '2mb' }));

function sendPublicArticles(req, res) {
  return listArticles()
    .then((articles) => {
      res.json({
        articles: articles
          .filter((article) => article.source !== 'imported')
          .map((article) => ({
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            featuredImage: article.featuredImage,
            publishedAt: article.publishedAt,
          })),
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pramanabaja-admin' });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pramanabaja-admin' });
});

app.get('/api/public/articles', sendPublicArticles);
app.get('/api/public/articles', sendPublicArticles);

app.get('/api/articles', async (_req, res) => {
  try {
    const articles = await listArticles();
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await getArticle(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
    }
    return res.json({ article });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const article = await createArticle(req.body);
    res.status(201).json({ article });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/articles/:slug', async (req, res) => {
  try {
    const article = await updateArticle(req.params.slug, req.body);
    res.json({ article });
  } catch (error) {
    const status = /tidak ditemukan/i.test(error.message) ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

app.delete('/api/articles/:slug', async (req, res) => {
  try {
    const article = await deleteArticle(req.params.slug);
    res.json({ article });
  } catch (error) {
    const status = /tidak ditemukan/i.test(error.message) ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

app.post('/api/rebuild-listing', async (_req, res) => {
  try {
    await rebuildListing();
    await notifyPublishScheduleChanged();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/import-legacy', async (_req, res) => {
  try {
    const result = await importLegacyArticles();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/product-categories', async (_req, res) => {
  try {
    const data = await listProductArticles({ limit: 1, page: 1 });
    res.json({ groups: data.groups, total: data.total, lastSyncedAt: data.lastSyncedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/product-articles', async (req, res) => {
  try {
    const data = await listProductArticles({
      categoryId: req.query.category,
      groupId: req.query.group,
      q: req.query.q,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/product-articles/:slug', async (req, res) => {
  try {
    const article = await getProductArticle(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Artikel produk tidak ditemukan.' });
    }
    return res.json({ article });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/product-articles', async (req, res) => {
  try {
    const article = await createProductArticle(req.body);
    res.status(201).json({ article });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/product-articles/:slug', async (req, res) => {
  try {
    const article = await updateProductArticle(req.params.slug, req.body);
    res.json({ article });
  } catch (error) {
    const status = /tidak ditemukan/i.test(error.message) ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

app.delete('/api/product-articles/:slug', async (req, res) => {
  try {
    const result = await deleteProductArticle(req.params.slug);
    res.json(result);
  } catch (error) {
    const status = /tidak ditemukan/i.test(error.message) ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

app.post('/api/import-product', async (_req, res) => {
  try {
    const result = await importProductArticles();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const saved = await saveUploadedImage(req.file);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use(createPublishGuardMiddleware());
app.use(express.static(ROOT, { index: 'index.html' }));
app.use('/admin', express.static(ADMIN_DIR, { index: 'index.html' }));

app.use((error, _req, res, _next) => {
  if (error && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File terlalu besar. Maksimal 40MB, nanti dikompres di bawah 500KB.' });
  }
  if (error && error.name === 'MulterError') {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: error.message || 'Terjadi kesalahan server.' });
});

async function start() {
  try {
    await rebuildListing();
    await initScheduleWatcher();
  } catch (error) {
    console.warn('Listing admin belum tersedia:', error.message);
  }

  app.listen(port, () => {
    console.log(`Pramana Baja server running at http://localhost:${port}`);
    console.log(`Admin dashboard: http://localhost:${port}/admin`);
  });
}

start();
