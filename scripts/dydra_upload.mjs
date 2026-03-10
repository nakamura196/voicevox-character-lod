/**
 * Dydra SPARQLエンドポイントへのデータアップロード・管理スクリプト
 *
 * Usage:
 *   node scripts/dydra_upload.mjs upload   # TTLデータをアップロード（clear + re-upload）
 *   node scripts/dydra_upload.mjs clear    # リポジトリのデータを全削除
 *   node scripts/dydra_upload.mjs query    # テストクエリを実行
 *   node scripts/dydra_upload.mjs info     # エンドポイント情報を表示
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

config({ path: resolve(PROJECT_ROOT, ".env") });

const API_KEY = process.env.DYDRA_API_KEY;
const ACCOUNT = process.env.DYDRA_ACCOUNT || "ut-digital-archives";
const REPOSITORY = process.env.DYDRA_REPOSITORY || "voicevox-character-lod";

const BASE_URL = `https://dydra.com/${ACCOUNT}/${REPOSITORY}`;
const SERVICE_URL = `${BASE_URL}/service`;
const SPARQL_URL = `${BASE_URL}/sparql`;

const TTL_PATH = resolve(PROJECT_ROOT, "docs/lod/voicevox.ttl");
const ONTOLOGY_PATH = resolve(PROJECT_ROOT, "docs/ns/voicevox.ttl");

/** Dydra SPARQL クエリ実行 (POST, application/sparql-query) */
async function sparqlQuery(sparql) {
  const resp = await fetch(SPARQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/sparql-query",
      Accept: "application/sparql-results+json",
    },
    body: sparql,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SPARQL query failed (${resp.status}): ${text.slice(0, 300)}`);
  }
  return resp.json();
}

/** Dydra SPARQL Update 実行 */
async function sparqlUpdate(update) {
  const resp = await fetch(SPARQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/sparql-update",
    },
    body: update,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SPARQL update failed (${resp.status}): ${text.slice(0, 300)}`);
  }
  return resp;
}

async function upload() {
  // まず既存データをクリア
  console.log("Clearing existing data ...");
  await sparqlUpdate("CLEAR ALL");
  console.log("  Done\n");

  // /service エンドポイントでアップロード
  const files = [
    { label: "Ontology", path: ONTOLOGY_PATH },
    { label: "Dataset", path: TTL_PATH },
  ];

  for (const { label, path } of files) {
    const filename = path.split("/").pop();
    console.log(`Uploading ${label}: ${filename} ...`);
    const data = readFileSync(path, "utf-8");

    const resp = await fetch(SERVICE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "text/turtle",
      },
      body: data,
    });

    if (resp.ok) {
      console.log(`  OK (${resp.status})`);
    } else {
      const text = await resp.text();
      console.error(`  FAILED (${resp.status}): ${text.slice(0, 300)}`);
      process.exit(1);
    }
  }

  // 名前付きグラフからデフォルトグラフにコピー
  console.log("\nMerging named graphs into default graph ...");
  await sparqlUpdate(`
    INSERT { ?s ?p ?o }
    WHERE { GRAPH ?g { ?s ?p ?o } }
  `);
  console.log("  Done");

  // 結果確認
  const result = await sparqlQuery(
    "SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }"
  );
  const count = result.results?.bindings?.[0]?.count?.value || "?";
  console.log(`\nUpload complete! (${count} triples in default graph)`);
  console.log(`SPARQL endpoint: ${SPARQL_URL}`);
  console.log(`Query UI: https://dydra.com/${ACCOUNT}/${REPOSITORY}/sparql`);
}

async function clear() {
  console.log("Clearing all triples ...");
  await sparqlUpdate("CLEAR ALL");
  console.log("  Done — all triples removed");
}

async function query(sparql) {
  if (!sparql) {
    sparql = `\
PREFIX vvox: <https://nakamura196.github.io/voicevox-character-lod/ns/voicevox#>
PREFIX schema: <https://schema.org/>

SELECT ?char ?name ?speakerId WHERE {
  ?char a vvox:Character ;
        schema:name ?name ;
        vvox:speakerId ?speakerId .
  FILTER(lang(?name) = "ja")
}
ORDER BY ?speakerId`;
  }

  console.log(`Querying: ${SPARQL_URL}`);
  console.log(`Query:\n${sparql.trim()}\n`);

  const results = await sparqlQuery(sparql);
  const bindings = results.results?.bindings || [];
  console.log(`Results: ${bindings.length} rows\n`);
  for (const row of bindings) {
    const vals = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, v.value])
    );
    console.log(" ", vals);
  }
}

async function info() {
  console.log("=== Dydra SPARQL Endpoint ===");
  console.log(`Account:    ${ACCOUNT}`);
  console.log(`Repository: ${REPOSITORY}`);
  console.log(`Base URL:   ${BASE_URL}`);
  console.log(`SPARQL:     ${SPARQL_URL}`);
  console.log(`Service:    ${SERVICE_URL}`);
  console.log(`Web UI:     https://dydra.com/${ACCOUNT}/${REPOSITORY}/sparql`);
  console.log();

  const result = await sparqlQuery(
    "SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }"
  );
  const count = result.results?.bindings?.[0]?.count?.value || "?";
  console.log(`Triples (default graph): ${count}`);

  const gResult = await sparqlQuery(
    "SELECT ?g (COUNT(*) AS ?count) WHERE { GRAPH ?g { ?s ?p ?o } } GROUP BY ?g"
  );
  const gBindings = gResult.results?.bindings || [];
  if (gBindings.length > 0) {
    console.log("Named graphs:");
    for (const row of gBindings) {
      console.log(`  ${row.g.value}: ${row.count.value} triples`);
    }
  }
}

// --- Main ---
const cmd = process.argv[2];

try {
  switch (cmd) {
    case "upload":
      await upload();
      break;
    case "clear":
      await clear();
      break;
    case "query":
      await query(process.argv[3]);
      break;
    case "info":
      await info();
      break;
    default:
      console.log("Usage: node scripts/dydra_upload.mjs <upload|clear|query|info>");
      break;
  }
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
