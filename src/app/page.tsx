import Link from "next/link";

export default function Home() {
  return (
    <div className="font-display relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-hero-radial"
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/4 h-112 w-md animate-pulse rounded-full bg-fuchsia-600/35 blur-glow" />
        <div className="absolute -right-1/4 bottom-1/4 h-104 w-104 animate-pulse rounded-full bg-cyan-500/25 blur-glow [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-violet-600/30 blur-glow-soft [animation-delay:500ms]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-14 px-6">
        <h1 className="animate-pulse bg-linear-to-br from-fuchsia-200 via-violet-100 to-cyan-300 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent drop-shadow-glow sm:text-7xl md:text-8xl">
          #ใครโสดโปรโมตด้วย
        </h1>
        <h1 className="animate-pulse bg-linear-to-br from-fuchsia-200 via-violet-100 to-cyan-300 bg-clip-text text-center text-5xl font-extrabold tracking-tight text-transparent drop-shadow-glow sm:text-7xl md:text-4xl">
          PopPrince eiei
        </h1>

        <Link
          href="/upload"
          className="rounded-full border border-white/15 bg-white/5 px-10 py-3.5 text-sm font-semibold text-zinc-100 ring-1 ring-inset ring-white/10 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 hover:ring-white/15"
        >
          ไปแจกวาร์ป
        </Link>
      </div>
    </div>
  );
}
