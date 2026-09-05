const fs = require('node:fs');
const path = require('node:path');
const { construirCsp } = require('./lib/frontend-csp');

const apiUrl = process.env.ARTIFY_API_URL || '';
const csp = construirCsp(apiUrl);
const outputPath = path.join(
  __dirname,
  '..',
  'frontend',
  'assets',
  'js',
  'config.js'
);

const contenido = `// Configuración generada para despliegue.
window.ARTIFY_API_URL = ${JSON.stringify(apiUrl)};
`;

fs.writeFileSync(outputPath, contenido, 'utf8');
const frontend = path.join(__dirname, '..', 'frontend');
const paginas = [path.join(frontend, 'index.html'), ...fs.readdirSync(path.join(frontend, 'pages'))
  .filter((nombre) => nombre.endsWith('.html'))
  .map((nombre) => path.join(frontend, 'pages', nombre))];
for (const pagina of paginas) {
  const html = fs.readFileSync(pagina, 'utf8');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}" />`;
  const actualizado = /<meta http-equiv="Content-Security-Policy"[^>]*>/.test(html)
    ? html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, meta)
    : html.replace(/(<meta charset="UTF-8"\s*\/>)/, `$1\n    ${meta}`);
  fs.writeFileSync(pagina, actualizado, 'utf8');
}
console.log(`Configuración frontend generada en ${outputPath}`);
