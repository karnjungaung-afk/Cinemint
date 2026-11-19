import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "js", "movies-data.js");
const outputPath = path.join(root, "apps", "web", "src", "data", "movies.seed.json");
const checkOnly = process.argv.includes("--check");

const source = await readFile(sourcePath, "utf8");
const context = {};
vm.runInNewContext(`${source}\nglobalThis.__cinemintMovies = movieDatabase;`, context, {
  timeout: 1_000,
});

const movies = context.__cinemintMovies;
assert.ok(Array.isArray(movies), "movieDatabase must be an array");
assert.equal(movies.length, 83, "Expected 83 validated V1 movie records");

const ids = movies.map((movie) => movie.id);
assert.equal(new Set(ids).size, ids.length, "Movie IDs must be unique");

for (const movie of movies) {
  assert.ok(movie.id && movie.title, "Movie ID and title are required");
  assert.ok(Number.isInteger(movie.year), `${movie.id}: year must be an integer`);
  assert.ok(Number.isFinite(movie.rating) && movie.rating >= 0 && movie.rating <= 100,
    `${movie.id}: rating must be between 0 and 100`);
  assert.match(movie.poster ?? "", /^https:\/\/image\.tmdb\.org\/t\/p\/[^/]+\/.+/,
    `${movie.id}: poster URL is invalid`);
  assert.match(movie.backdrop ?? "", /^https:\/\/image\.tmdb\.org\/t\/p\/[^/]+\/.+/,
    `${movie.id}: backdrop URL is invalid`);
}

const serialized = `${JSON.stringify(movies, null, 2)}\n`;

if (checkOnly) {
  const committed = await readFile(outputPath, "utf8");
  assert.equal(committed, serialized, "movies.seed.json is out of sync with js/movies-data.js");
  console.log(`V2 seed data is current: ${movies.length} movies.`);
} else {
  await writeFile(outputPath, serialized, "utf8");
  console.log(`Exported ${movies.length} movies to apps/web/src/data/movies.seed.json.`);
}
