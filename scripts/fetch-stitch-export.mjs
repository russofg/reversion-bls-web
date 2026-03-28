/**
 * Descarga HTML + captura de pantalla de un screen de Stitch (API MCP vía SDK).
 * Requiere STITCH_GOOGLE_API_KEY o STITCH_API_KEY en el entorno.
 */
import { Stitch, StitchToolClient } from "@google/stitch-sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "stitch-export");

const PROJECT_ID = "13439858821881230779";
const SCREEN_ID = "38d99e6c268b47dbba6abf1364004a9c";
const SCREEN_SLUG = "bls-audiovisual-premium-redesign";

const apiKey = process.env.STITCH_GOOGLE_API_KEY || process.env.STITCH_API_KEY;
if (!apiKey) {
  console.error("Falta STITCH_GOOGLE_API_KEY o STITCH_API_KEY en el entorno.");
  process.exit(1);
}

async function curlDownload(url, dest) {
  await execFileAsync("curl", ["-fsSL", "-o", dest, url], {
    maxBuffer: 50 * 1024 * 1024,
  });
}

/** URLs absolutas http(s) en HTML (src, href, url(), @import). */
function extractUrls(html) {
  const set = new Set();
  const patterns = [
    /src=["'](https?:\/\/[^"']+)["']/gi,
    /href=["'](https?:\/\/[^"']+)["']/gi,
    /url\(["']?(https?:\/\/[^)"']+)["']?\)/gi,
    /@import\s+["'](https?:\/\/[^"']+)["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) set.add(m[1]);
  }
  return [...set];
}

function safeFilenameFromUrl(url) {
  try {
    const u = new URL(url);
    const base = (u.pathname.split("/").pop() || "asset").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const short = base.length > 120 ? base.slice(-120) : base;
    return short || "asset.bin";
  } catch {
    return "asset.bin";
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const assetsDir = join(OUT, "assets");
  await mkdir(assetsDir, { recursive: true });

  const client = new StitchToolClient({
    apiKey,
    baseUrl: "https://stitch.googleapis.com/mcp",
  });
  const stitch = new Stitch(client);
  const project = stitch.project(PROJECT_ID);

  const raw = await client.callTool("get_screen", {
    projectId: PROJECT_ID,
    screenId: SCREEN_ID,
    name: `projects/${PROJECT_ID}/screens/${SCREEN_ID}`,
  });

  await writeFile(
    join(OUT, "get-screen-response.json"),
    JSON.stringify(raw, null, 2),
    "utf8"
  );

  const screen = await project.getScreen(SCREEN_ID);
  const htmlUrl = await screen.getHtml();
  const imageUrl = await screen.getImage();

  await writeFile(
    join(OUT, "download-urls.json"),
    JSON.stringify(
      {
        projectId: PROJECT_ID,
        screenId: SCREEN_ID,
        screenTitle: "BLS Audiovisual - Premium Redesign",
        htmlUrl,
        imageUrl,
      },
      null,
      2
    ),
    "utf8"
  );

  const htmlPath = join(OUT, `${SCREEN_SLUG}.html`);
  const imagePath = join(OUT, `${SCREEN_SLUG}-preview.png`);

  if (htmlUrl) await curlDownload(htmlUrl, htmlPath);
  if (imageUrl) await curlDownload(imageUrl, imagePath);

  let html = "";
  try {
    html = await readFile(htmlPath, "utf8");
  } catch {
    /* noop */
  }

  const assetUrls = extractUrls(html).filter((u) => u !== htmlUrl);
  const manifest = { downloaded: [], failed: [] };

  let i = 0;
  for (const url of assetUrls) {
    const name = `${i++}_${safeFilenameFromUrl(url)}`;
    const dest = join(assetsDir, name);
    try {
      await curlDownload(url, dest);
      manifest.downloaded.push({ url, local: `assets/${name}` });
    } catch (e) {
      manifest.failed.push({ url, error: String(e?.message || e) });
    }
  }

  await writeFile(join(OUT, "assets-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  await client.close();
  console.log("Listo:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
