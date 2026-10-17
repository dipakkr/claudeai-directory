const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/hooks/use-thread-impression.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function setup() {
  let callback, cleanup, timer;
  const events = [], storage = new Map();
  const document = { visibilityState: 'visible', addEventListener: (_, fn) => document.change = fn, removeEventListener() {} };
  class Observer { constructor(fn) { callback = fn; } observe() {} disconnect() {} }
  const context = { exports: {}, window: { IntersectionObserver: Observer, innerHeight: 800 }, IntersectionObserver: Observer, document, location: { hostname: 'example.com' }, sessionStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) }, setTimeout: fn => { timer = fn; return 1; }, clearTimeout: () => { timer = undefined; }, Date, require: name => name === 'react' ? { useRef: () => ({ current: { getBoundingClientRect: () => ({ height: 500 }) } }), useEffect: fn => { cleanup = fn(); } } : { track: (...args) => events.push(args) } };
  vm.runInNewContext(code, context);
  context.exports.useThreadImpression('post');
  return { events, document, show: ratio => callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]), tick: () => { const fn = timer; timer = undefined; fn?.(); }, cleanup: () => cleanup(), hasTimer: () => Boolean(timer) };
}
test('requires sustained visibility and counts once', () => {
 const h = setup(); h.show(0.2); h.tick(); assert.equal(h.events.length,0);
 h.show(0.6); assert(h.hasTimer()); h.show(0); h.tick(); assert.equal(h.events.length,0);
 h.show(0.6); h.tick(); assert.equal(h.events.length,1); assert.equal(h.events[0][0],'thread_impression');
 h.show(0); h.show(1); h.tick(); assert.equal(h.events.length,1);
});
test('background tabs cancel dwell and restart on return; unmount cancels', () => {
 const h = setup(); h.show(1); h.document.visibilityState='hidden'; h.document.change(); h.tick(); assert.equal(h.events.length,0);
 h.document.visibilityState='visible'; h.document.change(); assert(h.hasTimer()); h.cleanup(); h.tick(); assert.equal(h.events.length,0);
});
