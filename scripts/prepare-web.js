// Copia la web (dairel.html) a www/ y le inyecta el puente nativo.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = process.env.WEB_SRC || path.join(root, 'web', 'dairel.html');
const out = path.join(root, 'www');
fs.mkdirSync(out, { recursive: true });
let html = fs.readFileSync(src, 'utf8');
if (!html.includes('native-bridge.js')) {
  html = html.replace(/<head[^>]*>/i, m => m + '\n<script src="native-bridge.js"></script>');
}
// viewport-fit=cover para respetar notch / barra de inicio
html = html.replace(/(<meta[^>]*name="viewport"[^>]*content=")([^"]*)(")/i,
  (m, a, c, d) => /viewport-fit/.test(c) ? m : a + c + ', viewport-fit=cover' + d);
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.copyFileSync(path.join(root, 'native', 'native-bridge.js'), path.join(out, 'native-bridge.js'));
console.log('www listo:', (html.length / 1024).toFixed(0), 'KB');
