export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">VoidPhoenix</h1>
        <p className="text-zinc-600">Ignite. Ascend. Rebirth.</p>

        <div className="rounded-xl border p-4 space-y-2">
          <p className="font-medium">Start</p>
          <div className="flex gap-3 flex-wrap">
            <a className="underline" href="/account">Create Character</a>
            <a className="underline" href="/explore">Enter Explore</a>
            <a className="underline" href="/quest">Quest Log</a>
          </div>
        </div>
      </div>
    </main>
  );
}
