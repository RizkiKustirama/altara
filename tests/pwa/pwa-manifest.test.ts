import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("🧪 Testing PWA Manifest & Service Worker Offline Configuration...", () => {
  const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
  const swPath = path.resolve(process.cwd(), "public/sw.js");

  assert.ok(fs.existsSync(manifestPath), "public/manifest.json must exist");
  assert.ok(fs.existsSync(swPath), "public/sw.js must exist");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  // 1. Verify PWA standalone mode and display settings
  assert.strictEqual(manifest.display, "standalone");
  assert.strictEqual(manifest.start_url, "/");
  assert.strictEqual(manifest.theme_color, "#1c1917");
  assert.strictEqual(manifest.background_color, "#1c1917");

  // 2. Verify icon definitions
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  const icon192 = manifest.icons.find((i: any) => i.sizes === "192x192");
  const icon512 = manifest.icons.find((i: any) => i.sizes === "512x512");
  assert.ok(icon192, "192x192 icon must be declared");
  assert.ok(icon512, "512x512 icon must be declared");

  // 3. Verify physical icon files exist on disk
  const icon192File = path.resolve(process.cwd(), "public", icon192.src.replace(/^\//, ""));
  const icon512File = path.resolve(process.cwd(), "public", icon512.src.replace(/^\//, ""));
  assert.ok(fs.existsSync(icon192File), `Icon file ${icon192.src} must exist on disk`);
  assert.ok(fs.existsSync(icon512File), `Icon file ${icon512.src} must exist on disk`);

  // 4. Verify Service Worker strategies
  const swContent = fs.readFileSync(swPath, "utf-8");
  assert.ok(swContent.includes("CACHE_NAME"), "Service Worker must define CACHE_NAME");
  assert.ok(swContent.includes("caches.open"), "Service Worker must open cache storage");
  assert.ok(swContent.includes("caches.match"), "Service Worker must match cached responses");
  assert.ok(swContent.includes("Network-First with Cache Fallback"), "Service Worker must implement Network-First with Cache Fallback");
  assert.ok(swContent.includes("request.mode === \"navigate\""), "Service Worker must handle navigation offline fallback");

  console.log("✅ PWA Manifest & Service Worker offline configuration verified!");
});
