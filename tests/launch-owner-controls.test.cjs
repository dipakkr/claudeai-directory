/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS node:test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, auth, apps = []) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = { exports: {}, require(name) {
    if (name === '@/lib/auth') return { useAuth: () => auth };
    if (name === '@/hooks/use-showcase') return { useMyShowcaseProjects: () => ({ data: apps, isLoading: false }) };
    if (name === '@/lib/launch-options') return { isLaunchLive: app => app.status === 'listed' };
    if (name === '@/lib/api') return {};
    if (name.startsWith('@/components/')) return new Proxy({}, { get: (_, key) => key });
    return require(name);
  } };
  vm.runInNewContext(code, context);
  return context.exports;
}

const props = { slug: 'videodb-mcp', authorId: 'videodb-maker' };
const auth = (user, extra = {}) => ({ user, isAuthenticated: Boolean(user), isLoading: false, viewOnly: false, ...extra });
const button = session => load('src/components/launches/OwnerEditButton.tsx', session).OwnerEditButton(props);
const app = { id: props.slug, author_id: props.authorId, status: 'listed', title: 'VideoDB MCP' };
const edit = (session, apps = [app]) => load('src/app/launches/[slug]/edit/EditLaunchClient.tsx', session, apps).default({ slug: props.slug });

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
const hasForm = tree => nodes(tree).some(node => node.type?.name === 'EditForm');
const text = tree => nodes(tree).flatMap(node => [node.props?.children].flat(Infinity)).filter(value => typeof value === 'string').join(' ');

test('Edit is visible only to the signed-in launch owner, including admins editing their own launch', () => {
  for (const role of ['member', 'admin']) {
    const result = button(auth({ id: props.authorId, role }));
    assert.equal(result.props.href, '/launches/videodb-mcp/edit');
  }
  assert.equal(button(auth(null)), null);
  assert.equal(button(auth({ id: 'another-member', role: 'member' })), null);
  assert.equal(button(auth({ id: 'another-admin', role: 'admin' })), null);
  assert.equal(button(auth({ role: 'admin' })), null);
});

test('Edit stays hidden during session loading and in read-only account views', () => {
  const owner = { id: props.authorId, role: 'admin' };
  assert.equal(button(auth(owner, { isLoading: true })), null);
  assert.equal(button(auth(owner, { viewOnly: true })), null);
});

test('direct edit route rejects another member’s cached launch for members and admins', () => {
  for (const role of ['member', 'admin']) {
    const tree = edit(auth({ id: 'another-person', role }));
    assert.equal(hasForm(tree), false);
    assert.match(text(tree), /You can only edit launches you submitted/);
  }
  assert.equal(hasForm(edit(auth({ id: props.authorId }))), true);
});

test('direct edit route exposes no form while signed out, loading, or viewing an owner read-only', () => {
  const owner = { id: props.authorId };
  assert.equal(hasForm(edit(auth(null))), false);
  assert.equal(hasForm(edit(auth(owner, { isLoading: true }))), false);
  const readOnly = edit(auth(owner, { viewOnly: true }));
  assert.equal(hasForm(readOnly), false);
  assert.match(text(readOnly), /Editing is disabled/);
});
