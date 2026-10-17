import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAuthSession, VIEW_TOKEN_KEY } from '../src/lib/auth-session.ts';

function store(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

test('incoming member view wins over the operator and any previous member session', () => {
  const tab = store({ [VIEW_TOKEN_KEY]: 'previous-member' });
  const account = store({ cc_token: 'operator' });
  assert.deepEqual(resolveAuthSession({ pathname: '/view-as', hash: '#t=selected-member' }, tab, account), { token: 'selected-member', view: true });
  assert.equal(account.getItem('cc_token'), 'operator');
  assert.deepEqual(resolveAuthSession({ pathname: '/dashboard', hash: '' }, tab, account), { token: 'selected-member', view: true });
  // React effect replay after clearing the fragment keeps the selected member.
  assert.deepEqual(resolveAuthSession({ pathname: '/view-as', hash: '' }, tab, account), { token: 'selected-member', view: true });
});

test('missing handoff never falls back to operator', () => {
  assert.deepEqual(resolveAuthSession({ pathname: '/view-as', hash: '' }, store(), store({ cc_token: 'operator' })), { token: null, view: true });
});

test('unavailable tab storage fails closed', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.deepEqual(resolveAuthSession({ pathname: '/view-as', hash: '#t=member' }, blocked, store({ cc_token: 'operator' })), { token: null, view: true });
});

test('ordinary dashboard continues using the ordinary account', () => {
  assert.deepEqual(resolveAuthSession({ pathname: '/dashboard', hash: '' }, store(), store({ cc_token: 'operator' })), { token: 'operator', view: false });
});
