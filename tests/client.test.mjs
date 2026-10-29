import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
function client(fetcher) {
  const source = ts.transpileModule(
    fs.readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const sandbox = {
    exports: {},
    process: { env: {} },
    fetch: fetcher,
    Headers,
    Response,
    FormData,
    Blob,
    URL,
    TextEncoder,
    DOMException,
    AbortSignal,
    atob,
    setTimeout,
    console,
  };
  vm.runInNewContext(source, sandbox);
  return sandbox.exports;
}
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const token = (exp) =>
  `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
test("API handles empty 204 responses and does not send multipart Content-Type", async () => {
  let headers;
  const api = client(async (_url, options) => {
    headers = options.headers;
    return new Response(null, { status: 204 });
  });
  const form = new FormData();
  form.set(
    "resume",
    new Blob(["%PDF-test"], { type: "application/pdf" }),
    "resume.pdf",
  );
  assert.equal(
    await api.default("/api/applications", { method: "POST", body: form }),
    undefined,
  );
  assert.equal(headers.has("Content-Type"), false);
});
test("refresh is single flight and rotates only once for concurrent callers", async () => {
  let calls = 0;
  const api = client(async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return json({
      token: token(Date.now() / 1000 + 900),
      user: { id: "candidate" },
      success: true,
    });
  });
  const result = await Promise.all([
    api.refreshSession(),
    api.refreshSession(),
    api.refreshSession(),
  ]);
  assert.equal(calls, 1);
  assert.equal(result[0].token, result[2].token);
});
test("an expiring token is refreshed before a mutation, which is submitted once", async () => {
  const calls = [];
  const api = client(async (url, options) => {
    calls.push({ url, options });
    return url.endsWith("/refresh")
      ? json({ token: token(Date.now() / 1000 + 900), user: {}, success: true })
      : json({ success: true });
  });
  api.setAccessToken(token(0));
  await api.default("/api/applications", api.json("POST", { job_id: "test" }));
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /refresh$/);
  assert.equal(calls[0].options.credentials, "include");
  assert.equal(calls[0].options.headers["X-CSRF-Protection"], "1");
  assert.equal(calls[1].options.method, "POST");
  assert.ok(
    calls[1].options.headers.get("Authorization").startsWith("Bearer "),
  );
});
test("401 never blindly replays an application and clears bearer state", async () => {
  let calls = 0;
  const api = client(async () => {
    calls++;
    return json({ message: "Session revoked" }, 401);
  });
  api.setAccessToken(token(Date.now() / 1000 + 900));
  await assert.rejects(api.default("/api/applications", api.json("POST", {})), {
    status: 401,
  });
  assert.equal(calls, 1);
});
test("server errors retain validation, support reference and retry guidance", async () => {
  const api = client(
    async () =>
      new Response(
        JSON.stringify({
          message: "Too many requests",
          requestId: "ref-123",
          errors: [{ path: "email", message: "Invalid" }],
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "60" },
        },
      ),
  );
  try {
    await api.default("/api/jobs");
    assert.fail();
  } catch (e) {
    assert.equal(e.status, 429);
    assert.match(api.errorMessage(e), /ref-123/);
    assert.match(api.errorMessage(e), /60 seconds/);
    assert.match(api.errorMessage(e), /email: Invalid/);
  }
});
test("password checks enforce the backend UTF-8 limit", () => {
  const api = client(() => {});
  assert.ok(api.passwordError("short"));
  assert.equal(api.passwordError("a".repeat(12)), "");
  assert.equal(api.passwordError("a".repeat(72)), "");
  assert.ok(api.passwordError("a".repeat(73)));
  assert.ok(api.passwordError("😀".repeat(19)));
});
test("login return paths reject external, protocol relative and backslash targets", () => {
  const api = client(() => {});
  for (const value of [
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "/\nevil.invalid",
  ])
    assert.equal(api.safeReturnPath(value), "/dashboard");
  assert.equal(
    api.safeReturnPath("/jobs?q=React&work_mode=remote"),
    "/jobs?q=React&work_mode=remote",
  );
});
