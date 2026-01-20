import fs from "fs";
import path from "path";
import Link from "next/link";

function readText(rel: string) {
  const p = path.join(process.cwd(), "gameData", rel);
  return fs.readFileSync(p, "utf8");
}

export default function Codex() {
  const lore = readText("lore.md");
  const story = JSON.parse(readText("story.json"));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Codex</h1>
          <Link className="rounded-xl bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700" href="/">Home</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold">Lore</h2>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{lore}</pre>
          </section>

          <section className="rounded-2xl bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold">Story Beats</h2>
            <div className="mt-3 space-y-4">
              {story.chapters.map((c: any) => (
                <div key={c.id} className="rounded-xl bg-zinc-950/40 p-4">
                  <div className="font-semibold">{c.title}</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300">
                    {c.beats.map((b: string, i: number) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Edit these at: voidphoenix-web\gameData\lore.md and story.json
        </p>
      </div>
    </main>
  );
}
