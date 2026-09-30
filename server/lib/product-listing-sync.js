const fs = require('fs/promises');
const path = require('path');
const { ROOT } = require('./paths');
const { escapeHtml } = require('./utils');
const { getAllCategories } = require('./product-categories');
const { publishAttr, ensureScheduleScript, ensureArticleSchedule } = require('./static-schedule');

const START_MARKER = '<!-- PB_ADMIN_PRODUCTS_START -->';
const END_MARKER = '<!-- PB_ADMIN_PRODUCTS_END -->';

function generateProductCard(article, category) {
  const href = `/${article.slug}.html`;
  const title = escapeHtml(article.title);
  const dataId = `pb-${escapeHtml(article.slug)}`;
  const imageSrc = article.featuredImage
    ? escapeHtml(article.featuredImage)
    : '/wp-content/uploads/2024/08/Logo-Pramana-Baja-80x80.png';
  const categoryClass = escapeHtml(category.listingDir);
  const categoryLabel = escapeHtml(category.label);

  return `<div class="rt-col-md-3 rt-col-sm-6 rt-col-xs-12 default rt-grid-item" data-id="${dataId}" data-pb-admin="true"${publishAttr(article)}>
	<div class="rt-holder tpg-post-holder ">
		<div class="rt-detail rt-el-content-wrapper">
			<div class="rt-img-holder tpg-el-image-wrap has-thumbnail">
				<a data-id="${dataId}" href="${href}" class="tpg-post-link" target="_self">
					<img loading="lazy" decoding="async" src="${imageSrc}" class="rt-img-responsive" width="768" height="768" alt="${title}">
				</a>
				<div class="overlay grid-hover-content"></div>
			</div>
			<div class="entry-title-wrapper"><h3 class="entry-title"><a data-id="${dataId}" href="${href}" class="tpg-post-link" target="_self">${title}</a></h3></div>
			<div class="post-meta-tags rt-el-post-meta">
				<span class="categories-links"><i class="fas fa-folder-open "></i><a class="${categoryClass}" href="/${categoryClass}/">${categoryLabel}</a></span>
			</div>
		</div>
	</div>
</div>`;
}

function replaceBetween(html, start, end, inner) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;
  return `${html.slice(0, startIndex)}${start}\n${inner}\n${end}${html.slice(endIndex + end.length)}`;
}

function insertMarkers(html) {
  if (html.includes(START_MARKER) && html.includes(END_MARKER)) return html;
  const needle = 'grid_layout_wrapper">';
  const at = html.indexOf(needle);
  if (at === -1) return null;
  const close = at + needle.length;
  return `${html.slice(0, close)}\n${START_MARKER}\n${END_MARKER}${html.slice(close)}`;
}

async function syncProductListings(articles) {
  const adminArticles = (Array.isArray(articles) ? articles : []).filter(
    (article) => article && article.source === 'admin' && article.slug && article.title
  );

  for (const category of getAllCategories()) {
    const file = path.join(ROOT, category.listingDir, 'index.html');
    let html;
    try {
      html = await fs.readFile(file, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }

    const cards = adminArticles
      .filter((article) => article.categoryId === category.id)
      .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
      .map((article) => generateProductCard(article, category))
      .join('\n');

    html = insertMarkers(html);
    if (!html) continue;
    const replaced = replaceBetween(html, START_MARKER, END_MARKER, cards);
    if (!replaced) continue;
    await fs.writeFile(file, replaced, 'utf8');
    await ensureScheduleScript(file);
  }

  for (const article of adminArticles) {
    await ensureArticleSchedule(article.slug, article.publishedAt);
  }
}

module.exports = {
  syncProductListings,
};
