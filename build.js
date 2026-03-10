const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');

const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, 'dist');

function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(path.join(DIST, 'img'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
}

function copyAssets() {
  const imgSrc = path.join(ROOT, 'img');
  const imgDest = path.join(DIST, 'img');
  if (fs.existsSync(imgSrc)) {
    const files = fs.readdirSync(imgSrc);
    for (const f of files) {
      fs.copyFileSync(path.join(imgSrc, f), path.join(imgDest, f));
    }
  }
}

function buildTailwind() {
  execSync(
    `npx tailwindcss -i "${path.join(ROOT, 'src', 'input.css')}" -o "${path.join(DIST, 'css', 'main.css')}" --minify`,
    { cwd: ROOT, stdio: 'inherit' }
  );
}

async function buildHtmlAndJs() {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // 1) Remover Tailwind CDN + config inline + <style> custom e substituir por link do CSS buildado
  const tailwindBlock = /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*<script>[\s\S]*?<\/script>\s*<style>[\s\S]*?<\/style>/i;
  html = html.replace(tailwindBlock, '<link rel="stylesheet" href="css/main.css">');

  // 2) Extrair conteúdo do script inline (AOS já carregado antes; o nosso é o que tem DOMContentLoaded)
  const inlineScriptMatch = html.match(/<script src="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.js"><\/script>\s*<script>([\s\S]*?)<\/script>\s*<\/body>/);
  if (!inlineScriptMatch) {
    throw new Error('Script inline não encontrado no HTML.');
  }
  const inlineScriptCode = inlineScriptMatch[1].trim();

  // 3) Minificar JS (preservar nomes e lógica para UTMs, formulário, máscara)
  const minifiedJs = await minifyJs(inlineScriptCode, {
    compress: { passes: 1, keep_fnames: true },
    mangle: false,
    format: { comments: false },
  });
  if (minifiedJs.code === undefined) {
    throw new Error('Terser falhou: ' + (minifiedJs.error && minifiedJs.error.message));
  }
  fs.writeFileSync(path.join(DIST, 'js', 'main.js'), minifiedJs.code, 'utf8');

  // 4) Substituir bloco do script inline por referência ao arquivo
  html = html.replace(
    /<script src="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.js"><\/script>\s*<script>[\s\S]*?<\/script>\s*<\/body>/,
    '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script><script src="js/main.js"></script></body>'
  );

  // 5) Minificar HTML (não minificar JS dentro do HTML pois já está em arquivo externo)
  const minifiedHtml = await minifyHtml(html, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    minifyCSS: false,
    minifyJS: false,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    sortClassName: false,
    sortAttributes: false,
  });

  fs.writeFileSync(path.join(DIST, 'index.html'), minifiedHtml, 'utf8');
}

async function main() {
  console.log('Limpando dist...');
  cleanDist();
  console.log('Copiando assets (img)...');
  copyAssets();
  console.log('Gerando CSS com Tailwind (purge + minify)...');
  buildTailwind();
  console.log('Processando HTML e JS...');
  await buildHtmlAndJs();
  console.log('Build concluído. Pasta dist pronta para deploy.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
