const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/components/layout/OnlineChip.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const now=Date.parse('2026-10-23T10:30:00Z');
function render(data,isError=false,clock=now){
 const context={exports:{},require(name){
  if(name==='react')return {useState:()=>[clock,()=>{}],useEffect:()=>{}};
  if(name==='@tanstack/react-query')return {useQuery:()=>({data,isError})};
  if(name==='@/lib/api')return {api:{}};
  if(name==='next/link')return 'a';
  return require(name);
 }};
 vm.runInNewContext(code,context);
 return context.exports.OnlineChip().props.children;
}
const stats=(rows,updated_at=new Date(now).toISOString())=>({updated_at,rows});
test('uses today UTC row, never live or aggregate totals',()=>{
 const node=render({...stats([{date:'2026-10-22',visitors:99},{date:'2026-10-23',visitors:42}]),stats:{live_now:11},summary:{visitors:{range:900}}});
 assert.equal(node.props.children[1].props.children.join(''),'42 online today');
});
test('keeps zero honest and hides absent, invalid, failed, or expired data',()=>{
 assert.ok(render(stats([{date:'2026-10-23',visitors:0}])));
 for(const value of [null,-1,1.5,'11'])assert.equal(render(stats([{date:'2026-10-23',visitors:value}])),false);
 assert.equal(render(stats([])),false);
 assert.equal(render(stats([{date:'2026-10-23',visitors:11}]),true),false);
 assert.equal(render(stats([{date:'2026-10-23',visitors:11}],new Date(now-720001).toISOString())),false);
});
test('hides yesterday at UTC midnight until today is available',()=>{
 const midnight=Date.parse('2026-10-24T00:00:00Z');
 assert.equal(render(stats([{date:'2026-10-23',visitors:11}],'2026-10-23T23:59:59Z'),false,midnight),false);
});
