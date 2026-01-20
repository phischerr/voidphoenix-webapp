import fs from "fs";
import path from "path";

export async function GET() {
  const p = path.join(process.cwd(), "gameData", "settings.json");
  const raw = fs.readFileSync(p, "utf8");
  return new Response(raw, { headers: { "content-type": "application/json" } });
}
