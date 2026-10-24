import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
function verifyOutput(dir, base) {
  const output = files(dir);
  const all = output.filter(file => /\.(html|xml|js|css|txt|svg)$/.test(file)).map(file => readFileSync(file, 'utf8')).join('\n');
  // Public output must not expose game source hosts or internal identities.
  assert.doesNotMatch(all, /github\.com|raw\.githubusercontent\.com/i);
  for (const relative of ['index.html', 'about/index.html', 'media/index.html', 'roadmap/index.html', 'devlog/index.html', 'rss.xml', 'sitemap-index.xml', '404.html']) assert.ok(existsSync(join(dir, relative)), relative);
  for (const file of output.filter(file => file.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${file}: one h1`);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /href="#main"/);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /property="og:description"/);
    for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      const href = match[1].replaceAll('&amp;', '&');
      if (/^(?:https?:|data:|mailto:)/.test(href)) continue;
      if (href.startsWith('#')) {
        assert.ok(html.includes(`id="${href.slice(1)}"`), `${file}: missing anchor ${href}`);
        continue;
      }
      assert.ok(href.startsWith(`${base}/`), `${file}: URL does not respect base: ${href}`);
      const pathname = decodeURIComponent(href.split(/[?#]/)[0].slice(base.length));
      const target = join(dir, pathname.replace(/^\//, ''), pathname.endsWith('/') ? 'index.html' : '');
      assert.ok(existsSync(target), `${file}: broken local link ${href}`);
    }
  }
  const rss = readFileSync(join(dir, 'rss.xml'), 'utf8');
  const articleCount = output.filter(file => /[\\/]devlog[\\/][^\\/]+[\\/]index\.html$/.test(file)).length;
  assert.equal((rss.match(/<item>/g) || []).length, articleCount);
  assert.match(rss, /Welcome to Project Gotthard/);
  assert.ok(rss.includes(`${base}/devlog/welcome-to-project-gotthard/`));
  assert.doesNotMatch(all, /EXCLUSION_SENTINEL/);
}
const astro = resolve('node_modules/astro/bin/astro.mjs');
function build(base) {
  return spawnSync(process.execPath, [astro, 'build', '--outDir', './.test-build'], {
    encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', BASE_PATH: base }, timeout: 120000,
  });
}
test('production routes, assets, metadata, feed and privacy boundary', () => {
  verifyOutput('dist', process.env.BASE_PATH === '/' ? '' : (process.env.BASE_PATH || '/ProjectGotthard').replace(/\/$/, ''));
});
test('drafts, major spoilers and future posts are absent at root and project base', () => {
  const fixtures = [
    ['draft', 'draft: true'], ['major', 'spoilerLevel: major'], ['future', 'pubDate: 2099-01-01'],
  ].map(([name, field]) => {
    const file = resolve(`src/content/posts/qa-exclusion-${name}.md`);
    assert.ok(!existsSync(file));
    const date = name === 'future' ? '' : 'pubDate: 2026-01-01\n';
    writeFileSync(file, `---\ntitle: "EXCLUSION_SENTINEL ${name}"\ndescription: "EXCLUSION_SENTINEL content must never appear in a public build."\n${date}tags: [technical]\n${field}\n---\nEXCLUSION_SENTINEL body.\n`);
    return file;
  });
  try {
    for (const base of ['/ProjectGotthard', '/']) {
      const result = build(base);
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      verifyOutput('.test-build', base === '/' ? '' : base);
      assert.equal(existsSync('.test-build/tags/technical/index.html'), existsSync('dist/tags/technical/index.html'), 'excluded posts must not introduce a topic');
      for (const name of ['draft', 'major', 'future']) assert.ok(!existsSync(`.test-build/devlog/qa-exclusion-${name}/index.html`));
    }
  } finally { fixtures.forEach(file => unlinkSync(file)); }
});
test('invalid article metadata fails the production build', () => {
  const file = resolve('src/content/posts/qa-invalid-schema.md');
  assert.ok(!existsSync(file));
  writeFileSync(file, '---\ntitle: "Bad"\ndescription: "short"\npubDate: not-a-date\ntags: [unapproved]\n---\nInvalid fixture.');
  try {
    const result = build('/ProjectGotthard');
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /InvalidContentEntryDataError|does not match collection schema/);
  } finally { unlinkSync(file); }
});
