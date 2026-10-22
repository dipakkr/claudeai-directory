const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");
const { unstable_doesMiddlewareMatch } = require("next/experimental/testing/server");

const code = ts.transpileModule(fs.readFileSync("src/proxy.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function guard(deploymentId) {
  const context = {
    exports: {}, require,
    process: { env: { NEXT_DEPLOYMENT_ID: deploymentId } },
  };
  vm.runInNewContext(code, context);
  return (headers = {}, method = "GET", path = "/launches/example") => {
    const url = `https://example.test${path}`;
    if (!unstable_doesMiddlewareMatch({ config: context.exports.config, url, headers })) {
      return NextResponse.next();
    }
    // Match production's adapter: it removes Flight headers before proxy().
    const forwarded = { ...headers };
    delete forwarded.rsc;
    delete forwarded["next-router-prefetch"];
    return context.exports.proxy(new NextRequest(url, { headers: forwarded, method }));
  };
}

test("rejects an old tab before returning any RSC payload", async () => {
  const response = guard("release-b")({ rsc: "1", "x-deployment-id": "release-a" });
  assert.equal(response.status, 409);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.match(await response.text(), /Reload/);
});

test("legacy tabs without an ID also get a document-navigation fallback", () => {
  assert.equal(guard("release-b")({ rsc: "1" }).status, 409);
});

test("matching navigation and prefetch requests keep client-side routing", () => {
  for (const prefetch of [undefined, "1"]) {
    const headers = { rsc: "1", "x-deployment-id": "release-b" };
    if (prefetch) headers["next-router-prefetch"] = prefetch;
    const response = guard("release-b")(headers);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});

test("full page loads, POST requests and development remain unaffected", () => {
  for (const response of [
    guard("release-b")(),
    guard("release-b")({ "x-deployment-id": "release-a" }),
    guard("release-b")({ rsc: "1", "x-deployment-id": "release-a" }, "POST"),
    guard(undefined)({ rsc: "1" }),
  ]) {
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});

test("static assets and API endpoints are excluded even with RSC headers", () => {
  for (const path of ["/_next/static/chunks/example.js", "/_next/image", "/api/showcase"]) {
    assert.equal(guard("release-b")({ rsc: "1" }, "GET", path).headers.get("x-middleware-next"), "1");
  }
});
