/**
 * One-off maintenance: point /atap-galvalum/ grid links at jual-atap-galvalum-* articles.
 */
const fs = require('fs/promises');
const path = require('path');
const { ROOT } = require('../lib/paths');

const LISTING = path.join(ROOT, 'atap-galvalum', 'index.html');

async function main() {
  let html = await fs.readFile(LISTING, 'utf8');
  const beforeSeng = (html.match(/\/jual-atap-seng-[a-z0-9-]+\.html/gi) || []).length;

  html = html.replace(
    /\/jual-atap-seng-([a-z0-9-]+\.html)/gi,
    '/jual-atap-galvalum-$1'
  );
  html = html.replace(
    /Supplier Jual Atap Seng Galvalum Kirim ke/gi,
    'Supplier Jual Atap Galvalum Kirim ke'
  );

  const afterGalvalum = (html.match(/\/jual-atap-galvalum-[a-z0-9-]+\.html/gi) || []).length;
  const afterSeng = (html.match(/\/jual-atap-seng-[a-z0-9-]+\.html/gi) || []).length;

  await fs.writeFile(LISTING, html, 'utf8');
  console.log('Updated', LISTING);
  console.log('Article links before (seng):', beforeSeng);
  console.log('Article links after (galvalum):', afterGalvalum);
  console.log('Remaining seng article links:', afterSeng);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
