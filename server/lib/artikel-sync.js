const fs = require('fs/promises');
const { ROOT } = require('./paths');
const { escapeHtml } = require('./utils');
const { publishAttr, ensureScheduleScript, ensureArticleSchedule } = require('./static-schedule');

const ARTIKEL_PAGE = `${ROOT}/artikel/index.html`;
const START_MARKER = '<!-- PB_ADMIN_ARTICLES_START -->';
const END_MARKER = '<!-- PB_ADMIN_ARTICLES_END -->';
const SCRIPT_MARKER = '<!-- PB_ADMIN_ARTICLES_SCRIPT -->';
const STYLE_MARKER = '<!-- PB_ADMIN_ARTICLES_STYLE -->';

function isAdminArticle(article) {
  return article && article.source !== 'imported' && article.slug && article.title;
}

function generateArtikelListItem(article) {
  const href = `/${article.slug}.html`;
  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt || '');
  const dataId = `pb-${escapeHtml(article.slug)}`;
  const imageSrc = article.featuredImage
    ? escapeHtml(article.featuredImage)
    : '/wp-content/uploads/2024/08/Logo-Pramana-Baja-80x80.png';

  return `
<div class="rt-col-md-12 rt-col-sm-12 rt-col-xs-12 tpg-even rt-list-item rt-grid-item" data-id="${dataId}" data-pb-admin="true"${publishAttr(article)}>
	<div class="rt-holder tpg-post-holder ">
		<div class="rt-detail rt-el-content-wrapper">
			<div class="rt-img-holder tpg-el-image-wrap has-thumbnail">
				<a data-id="${dataId}" href="${href}" class="tpg-post-link" target="_self">
					<img loading="lazy" decoding="async" src="${imageSrc}" class="rt-img-responsive" width="768" height="768" alt="${title}">
				</a>
				<div class="overlay grid-hover-content"></div>
			</div>
			<div class="post-right-content">
				<div class="entry-title-wrapper"><h3 class="entry-title"><a data-id="${dataId}" href="${href}" class="tpg-post-link" target="_self">${title}</a></h3></div>
				<div class="tpg-excerpt tpg-el-excerpt">
					<div class="tpg-excerpt-inner">${excerpt}</div>
				</div>
				<div class="post-footer">
					<div class="read-more">
						<a data-id="${dataId}" href="${href}" class="tpg-post-link" target="_self">Read More</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>`;
}

function replaceBetween(html, start, end, inner) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }
  return html.slice(0, startIndex) + `${start}\n${inner}\n${end}` + html.slice(endIndex + end.length);
}

function insertMarkers(html) {
  if (html.includes(START_MARKER) && html.includes(END_MARKER)) {
    return html;
  }

  const needles = [
    'class="rt-row rt-content-loader list-layout1 tpg-even list-behaviour list-layout-wrapper"',
    'class="rt-row rt-content-loader',
    'list-layout-wrapper"',
  ];

  for (const needle of needles) {
    const at = html.indexOf(needle);
    if (at === -1) continue;
    const close = html.indexOf('>', at);
    if (close === -1) continue;
    return `${html.slice(0, close + 1)}\n${START_MARKER}\n${END_MARKER}${html.slice(close + 1)}`;
  }

  throw new Error('Struktur halaman /artikel/ tidak dikenali.');
}

function ensureInjectScript(html) {
  if (html.includes(SCRIPT_MARKER)) return html;
  const script = `${SCRIPT_MARKER}\n<script src="/admin/artikel-inject.js" defer></script>\n`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }
  return html + script;
}

function removeGridStyle(html) {
  const start = html.indexOf(STYLE_MARKER);
  if (start === -1) return html;
  const endTag = '</style>';
  const end = html.indexOf(endTag, start);
  if (end === -1) return html;
  return html.slice(0, start) + html.slice(end + endTag.length);
}

async function syncArtikelPage(articles) {
  const adminArticles = (Array.isArray(articles) ? articles : []).filter(isAdminArticle);
  const inner = adminArticles.map((article) => generateArtikelListItem(article)).join('\n');

  let html = await fs.readFile(ARTIKEL_PAGE, 'utf8');
  html = removeGridStyle(html);
  html = insertMarkers(html);

  const replaced = replaceBetween(html, START_MARKER, END_MARKER, inner);
  if (!replaced) {
    throw new Error('Gagal menulis blok artikel admin di /artikel/.');
  }

  html = ensureInjectScript(replaced);
  await fs.writeFile(ARTIKEL_PAGE, html, 'utf8');
  await ensureScheduleScript(ARTIKEL_PAGE);
  for (const article of adminArticles) {
    await ensureArticleSchedule(article.slug, article.publishedAt);
  }
}

module.exports = {
  syncArtikelPage,
  generateArtikelListItem,
  isAdminArticle,
};
