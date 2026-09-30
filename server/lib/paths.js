const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

module.exports = {
  ROOT,
  DATA_DIR: path.join(ROOT, 'data'),
  ARTICLES_FILE: path.join(ROOT, 'data', 'articles.json'),
  TEMPLATES_DIR: path.join(ROOT, 'templates'),
  ADMIN_DIR: path.join(ROOT, 'admin'),
  MANAGED_LISTING_DIR: path.join(ROOT, 'artikel', 'managed'),
  MANAGED_LISTING_FILE: path.join(ROOT, 'artikel', 'managed', 'index.html'),
  articleHtmlPath(slug) {
    return path.join(ROOT, `${slug}.html`);
  },
};
