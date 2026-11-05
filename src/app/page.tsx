import { ApplyCta } from "@/components/ApplyCta";
import { ApplyForm } from "@/components/ApplyForm";
import { Faq } from "@/components/Faq";
import { HeroMonitor } from "@/components/HeroMonitor";
import { Nav } from "@/components/Nav";
import { Offer } from "@/components/Offer";
import { Problem } from "@/components/Problem";
import { ProofCounter } from "@/components/ProofCounter";
import { Reveal } from "@/components/Reveal";
import { SampleStrip } from "@/components/SampleStrip";
import { SignalChain } from "@/components/SignalChain";
import { Waitlist } from "@/components/Waitlist";
import { proof, site, testimonials } from "@/lib/site";

const GET = [
  { title: "Live clips", body: "Vertical shorts during your stream, with captions in English, Portuguese or Spanish." },
  { title: "Premium edits", body: "Your top moments rebuilt with motion graphics after the stream." },
  { title: "Weekly compilation", body: "A long-form highlights video for your YouTube." },
];

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        {/* ─── Hero: on its own, this has to explain the whole product ─── */}
        <section
          id="top"
          className="grid min-h-svh items-center gap-6 px-[var(--gutter)] pb-8 pt-[72px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-[clamp(28px,4vw,72px)] lg:pb-10 lg:pt-[84px]"
        >
          <div>
            <h1 className="display text-[16.4vw] sm:text-[12vw] lg:text-[min(7.3vw,16vh)]">
              <span className="block">Chat lost it.</span>
              <span className="block">We already</span>
              <span className="block">clipped it.</span>
            </h1>
            <p className="mt-4 max-w-[46ch] text-[1.02rem] leading-[1.45] sm:text-[1.14rem] lg:mt-7 lg:text-[clamp(1.08rem,1.36vw,1.3rem)]">
              Inbetween is AI clipping for GTA 6 streamers. It watches your stream live, catches the moments chat goes
              crazy, and drops ready-to-post vertical clips in your Discord in about 2 minutes.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2.5 lg:mt-8">
              <ApplyCta location="hero" />
              <p className="pt-1 text-[0.98rem] text-cream/80">Free for your first week. 5 spots.</p>
            </div>
          </div>
          {/* On short laptops the set shrinks to fit the screen. */}
          <div className="min-w-0 lg:ml-auto lg:w-full lg:max-w-[calc((100svh-130px)*1.33)]">
            <HeroMonitor />
          </div>
        </section>

        <Problem />

        <SignalChain />

        {/* ─── What you get: one thing per screen ─── */}
        <section id="get" className="px-[var(--gutter)] pt-28 md:pt-44">
          <h2 className="hud text-[1.5rem] text-cream-dim md:text-[1.8rem]">What you get</h2>
          <ul>
            {GET.map((c) => (
              <li key={c.title} className="flex min-h-[64svh] flex-col justify-center">
                <Reveal>
                  <h3 className="display text-[clamp(3.2rem,11vw,10.6rem)]">{c.title}</h3>
                  <p className="mt-4 max-w-[40ch] text-[1.15rem] md:text-[1.45rem]">{c.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Sample clips" className="px-[var(--gutter)] pb-28 pt-12 md:pb-44">
          <Reveal>
            <SampleStrip />
          </Reveal>
        </section>

        {/* ─── Proof ─── */}
        <section id="proof" className="px-[var(--gutter)] pb-28 md:pb-44">
          <ProofCounter to={proof.reelViews} />
          <p className="mt-4 text-[1.3rem] md:text-[1.8rem]">views on a single reel.</p>

          <Reveal className="mt-32 md:mt-56">
            <p className="hud text-[1.3rem] text-cream-dim md:text-[1.5rem]">Brands we&apos;ve made content for</p>
            <p className="display mt-2 text-[clamp(2.6rem,7vw,6.6rem)]">{proof.brands.join(", ")}</p>
          </Reveal>

          <Reveal className="mt-32 md:mt-56">
            <p className="max-w-[24ch] text-[1.7rem] leading-snug md:text-[2.6rem]">
              Built by the team behind Sameer Error and Sameer Vish.
            </p>
          </Reveal>

          {testimonials.length > 0 && (
            <ul className="mt-32 grid gap-10">
              {testimonials.map((t) => (
                <li key={t.who}>
                  <p className="text-[1.5rem]">{t.quote}</p>
                  <p className="mt-2 text-cream-dim">
                    {t.who}
                    {t.stat ? ` · ${t.stat}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Offer />

        <Faq />

        {/* ─── Apply ─── */}
        <section id="apply" aria-labelledby="apply-title" className="px-[var(--gutter)] pb-28 md:pb-44">
          <div className="mx-auto max-w-[720px]">
            <h2 id="apply-title" className="display text-[clamp(3.2rem,8vw,6.6rem)]">
              Apply for launch week
            </h2>
            <p className="mb-10 mt-4 max-w-[46ch] text-[1.1rem] md:text-[1.2rem]">
              We&apos;ll check out your stream and hit you up within 24 hours. Editor or manager? Fill it in for your
              streamer.
            </p>
            <ApplyForm />
          </div>
        </section>

        <Waitlist />
      </main>

      <footer className="px-[var(--gutter)] pb-10 pt-16 md:pb-14 md:pt-24">
        <p className="display select-none text-[21.5vw] leading-[0.86] text-cream" aria-label={site.name}>
          Inbetween
        </p>
        <div className="mt-8 flex flex-col gap-3 text-[0.98rem] text-cream/80 md:flex-row md:items-center md:justify-between">
          <p>© BrainChain Labs</p>
          <div className="flex gap-5">
            <a className="underline decoration-cream/30 underline-offset-4 hover:text-cream" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            <a className="underline decoration-cream/30 underline-offset-4 hover:text-cream" href={site.youtubeUrl} rel="noopener noreferrer" target="_blank">
              YouTube
            </a>
          </div>
        </div>
        <p className="mt-4 text-[0.9rem] text-cream/65">
          Inbetween is not affiliated with Rockstar Games or Take-Two Interactive.
        </p>
      </footer>
    </>
  );
}
