import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

// Load the existing classic-script data file in an isolated VM context.
const movieSource = read("js/movies-data.js");
const sandbox = {};
vm.runInNewContext(`${movieSource}\nglobalThis.__cinemintMovies = movieDatabase;`, sandbox, {
  timeout: 1000,
});
const movies = sandbox.__cinemintMovies;

assert.ok(Array.isArray(movies), "movieDatabase must be an array");
assert.equal(movies.length, 83, "V1 migration must preserve all 83 movie records");

const ids = movies.map((movie) => movie.id);
assert.equal(new Set(ids).size, ids.length, "movie IDs must be unique");

const imageUrlPattern = /^https:\/\/image\.tmdb\.org\/t\/p\/(?:original|w\\d{1,4})\/.+/;
for (const movie of movies) {
  assert.ok(movie.id && typeof movie.id === "string", "every movie needs a stable ID");
  assert.ok(movie.title && typeof movie.title === "string", `${movie.id}: title is required`);
  assert.ok(Number.isInteger(movie.year), `${movie.id}: year must be an integer`);
  assert.ok(Number.isFinite(movie.rating) && movie.rating >= 0 && movie.rating <= 100,
    `${movie.id}: rating must be between 0 and 100`);
  assert.match(movie.poster || "", imageUrlPattern, `${movie.id}: poster URL is invalid`);
  assert.match(movie.backdrop || "", imageUrlPattern, `${movie.id}: backdrop URL is invalid`);
  assert.ok(!movie.poster.includes("/https://"), `${movie.id}: poster URL contains a duplicated URL prefix`);
  assert.ok(!movie.backdrop.includes("/https://"), `${movie.id}: backdrop URL contains a duplicated URL prefix`);
}

// Verify all local href/src references in root-level HTML pages resolve to a file.
const htmlFiles = readdirSync(root).filter((name) => name.endsWith(".html"));
assert.ok(htmlFiles.length > 0, "at least one HTML page must exist");

const missingReferences = [];
for (const htmlFile of htmlFiles) {
  const html = read(htmlFile);
  const references = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);

  for (const reference of references) {
    if (!reference || /^(?:https?:|mailto:|tel:|javascript:|data:|blob:|\/\/|#)/i.test(reference)) {
      continue;
    }

    const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    if (!cleanReference) continue;
    const relativeTarget = cleanReference.startsWith("/") ? cleanReference.slice(1) : cleanReference;
    const target = path.resolve(path.dirname(path.join(root, htmlFile)), relativeTarget);
    const relativeToRoot = path.relative(root, target);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot) || !existsSync(target)) {
      missingReferences.push(`${htmlFile} -> ${reference}`);
    }
  }
}
assert.deepEqual(missingReferences, [], "all local HTML references must resolve");

// Guard key security and UX regressions fixed during Phase 0.
assert.match(read("js/search.js"), /emptyState\.textContent/,
  "search empty state must render query text with textContent");
assert.match(read("js/mintbot-chat.js"), /function escapeHtml\(/,
  "MintBot must escape untrusted message content");
assert.match(read("js/detail.js"), /requestedId\.textContent/,
  "invalid movie IDs must be rendered as text");
assert.match(read("contact.html"), /mailto:karnjungaung@gmail\.com/,
  "contact form must prepare an email instead of faking a server submission");
assert.match(read("privacy.html"), /sessionStorage/,
  "privacy notice must describe temporary chat storage");

const indexHtml = read("index.html");
assert.equal((indexHtml.match(/name="viewport"/g) || []).length, 1,
  "index.html must contain exactly one viewport meta tag");

console.log(`V1 validation passed: ${movies.length} movies, ${htmlFiles.length} HTML pages, local links and Phase 0 safety checks.`);
