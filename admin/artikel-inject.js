(() => {
  const LIST_SELECTOR = '.rt-row.rt-content-loader, .list-layout-wrapper';

  function card(article) {
    const href = `/${article.slug}.html`;
    const image = article.featuredImage || '/wp-content/uploads/2024/08/Logo-Pramana-Baja-80x80.png';
    const wrap = document.createElement('div');
    wrap.className = 'rt-col-md-12 rt-col-sm-12 rt-col-xs-12 tpg-even rt-list-item rt-grid-item';
    wrap.setAttribute('data-id', `pb-${article.slug}`);
    wrap.setAttribute('data-pb-admin', 'true');
    if (article.publishedAt) {
      wrap.setAttribute('data-pb-publish', article.publishedAt);
      const when = new Date(article.publishedAt).getTime();
      if (Number.isNaN(when) || when <= Date.now()) wrap.setAttribute('data-pb-live', '');
    }
    wrap.innerHTML = `
      <div class="rt-holder tpg-post-holder">
        <div class="rt-detail rt-el-content-wrapper">
          <div class="rt-img-holder tpg-el-image-wrap has-thumbnail">
            <a href="${href}" class="tpg-post-link">
              <img loading="lazy" src="" class="rt-img-responsive" width="768" height="768" alt="">
            </a>
            <div class="overlay grid-hover-content"></div>
          </div>
          <div class="post-right-content">
            <div class="entry-title-wrapper">
              <h3 class="entry-title"><a href="${href}" class="tpg-post-link"></a></h3>
            </div>
            <div class="tpg-excerpt tpg-el-excerpt"><div class="tpg-excerpt-inner"></div></div>
            <div class="post-footer"><div class="read-more"><a href="${href}" class="tpg-post-link">Read More</a></div></div>
          </div>
        </div>
      </div>`;
    wrap.querySelector('img').src = image;
    wrap.querySelector('img').alt = article.title;
    wrap.querySelector('.entry-title a').textContent = article.title;
    wrap.querySelector('.tpg-excerpt-inner').textContent = article.excerpt || '';
    return wrap;
  }

  async function run() {
    const list = document.querySelector(LIST_SELECTOR);
    if (!list) return;
    if (list.querySelector('[data-pb-admin="true"]')) return;

    const response = await fetch('/api/public/articles');
    if (!response.ok) return;
    const data = await response.json();
    const articles = data.articles || [];

    list.querySelectorAll('[data-pb-admin="true"]').forEach((node) => node.remove());

    articles
      .slice()
      .reverse()
      .forEach((article) => {
        list.insertBefore(card(article), list.firstChild);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
