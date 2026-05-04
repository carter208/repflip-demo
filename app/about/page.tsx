export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020810]">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        {/* Label */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-blue-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Our Story</span>
        </div>

        {/* Headline */}
        <h1 className="mb-16 text-5xl font-black leading-tight tracking-tight text-white md:text-6xl">
          Repflip started because of a{" "}
          <span className="gradient-text">horrible customer.</span>
        </h1>

        {/* Body */}
        <div className="glass-card rounded-2xl p-8 md:p-14">
          <div className="flex flex-col gap-6 text-base leading-[1.9] text-slate-400 md:text-lg">
            <p>
              Carter Baker has run a service business in the Treasure Valley for years. Like every
              contractor, he&apos;s had his share of difficult jobs. But one customer stands out.
              Terrible communication. Constant scope creep. Multiple threats of legal action. Work
              that was never good enough no matter how many times it was redone. Hours of time,
              energy, and money poured into a relationship that should never have started.
            </p>

            <p>
              The frustrating part wasn&apos;t the customer. It was that there was no way to know.
            </p>

            <p>
              No system existed to warn Carter before he took the job. No way to tell the next
              plumber, electrician, or landscaper who called that customer what they were walking
              into. The business absorbed all the risk. The customer faced none of the consequences.
            </p>

            <p className="text-lg font-semibold text-white md:text-xl">
              Carter built Repflip to change that.
            </p>

            <p>
              The idea is simple: businesses rate customers the same way customers rate businesses.
              Consumers build a reputation score that follows them across every service provider they
              work with. Good behavior gets rewarded with points, prizes, and priority access to the
              best businesses in town. And businesses finally get what they&apos;ve always deserved —
              a clear signal before they commit.
            </p>

            <p>
              We&apos;re starting in the Treasure Valley because this is home. The hundreds of
              participating businesses who are helping us aren&apos;t customers, they&apos;re
              co-founders of a movement. Every review they submit makes the platform more valuable
              for every business that comes after them.
            </p>

            <p className="text-lg font-semibold text-white md:text-xl">
              This isn&apos;t just a software company. It&apos;s the beginning of a trust layer for
              the entire service economy.
            </p>

            {/* How Your Data Is Protected */}
            <div className="mt-2 rounded-2xl border border-blue-900/40 bg-blue-950/20 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <span className="text-base font-black text-white">How Your Data Is Protected</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <span className="mt-0.5 text-base">🚫</span>
                  <div>
                    <p className="text-sm font-bold text-white">Your score is never public.</p>
                    <p className="text-sm text-slate-400">Your Repflip score is private by default and is never displayed publicly or shared with anyone outside of verified participating businesses.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-base">✅</span>
                  <div>
                    <p className="text-sm font-bold text-white">Only verified paying businesses can view your score.</p>
                    <p className="text-sm text-slate-400">Access is restricted to vetted businesses on the Repflip platform. Random individuals, third-party services, and unverified companies cannot look you up.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-base">🕶️</span>
                  <div>
                    <p className="text-sm font-bold text-white">Business names are never revealed.</p>
                    <p className="text-sm text-slate-400">You will never know which specific company left a review. Only the trade category is shown — e.g. &ldquo;Plumbing Service.&rdquo; Every review is fully anonymous.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-4 border-t border-blue-900/40 pt-8">
              <p className="mb-6 text-base italic text-slate-500">— Carter Baker, Founder</p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-700/30 bg-gradient-to-br from-blue-600/30 to-cyan-600/20 text-xl font-black text-blue-400">
                  C
                </div>
                <div>
                  <p className="font-bold text-blue-400">Carter Baker</p>
                  <p className="text-sm text-slate-500">Founder &amp; CEO, Repflip</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
