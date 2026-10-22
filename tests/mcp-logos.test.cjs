const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const logos = require('../src/data/mcp-logos.json');
const context = { exports: {}, URL, require: (name) => {
  assert.equal(name, '@/data/mcp-logos.json');
  return logos;
}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/directory.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, context);
const { mcpIcon } = context.exports;

test('every reviewed catalog entry resolves to an existing local image', () => {
  assert.equal(Object.keys(logos).length, 156);
  for (const [slug, src] of Object.entries(logos)) {
    assert.equal(mcpIcon({ slug, branding: { icon_url: 'https://example.test/mcp' } }), src);
    assert.match(src, /^\/logos\/mcp\/[\w.-]+\.(png|jpg|svg|webp|ico|gif)$/);
    assert.ok(fs.statSync('public' + src).size > 0, slug);
  }
  assert.equal(mcpIcon({ id: 'slack' }), logos.slack);
});
test('new listings never use product pages or MCP endpoints as image URLs', () => {
  assert.equal(mcpIcon({ id:'new', branding:{icon_url:'https://mcp.example.com/sse'} }),
    'https://www.google.com/s2/favicons?domain=example.com&sz=64');
  assert.equal(mcpIcon({ id:'new', branding:{icon_url:'https://api.example.com/mcp'}, links:{website:'https://example.com'} }),
    'https://www.google.com/s2/favicons?domain=example.com&sz=64');
});
test('new listings retain supplied image assets and reject unsafe or generic sources', () => {
  assert.equal(mcpIcon({id:'new',branding:{icon_url:'https://cdn.example.com/logo.svg?v=2'}}), 'https://cdn.example.com/logo.svg?v=2');
  assert.equal(mcpIcon({id:'new',branding:{icon_url:'javascript:alert(1)'},links:{website:'https://github.com/example/project'}}),null);
});

test('local assets match the reviewed source digests', () => {
  const { createHash } = require('node:crypto');
  for (const source of require('../src/data/mcp-logo-sources.json')) {
    const bytes = fs.readFileSync('public' + logos[source.slug]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.slug);
  }
});
