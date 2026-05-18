import { $ } from 'bun';

await $`bun build src/index.tsx --outdir dist`.quiet();
await $`cp src/App.css dist/app.css`.quiet();

const js = await Bun.file('dist/index.js').bytes();
const css = await Bun.file('dist/app.css').bytes();
const hasher = new Bun.CryptoHasher('sha256');
hasher.update(js);
hasher.update(css);
const version = hasher.digest('hex').slice(0, 10);

const html = await Bun.file('index.html').text();
const out = html
  .replace('href="app.css"', `href="app.css?v=${version}"`)
  .replace('src="index.js"', `src="index.js?v=${version}"`);
await Bun.write('dist/index.html', out);

console.log(`Built (version ${version})`);
