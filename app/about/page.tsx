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
          We started Repflip because of a{" "}
          <span className="gradient-text">customer from hell.</span>
        </h1>

        {/* Body */}
        <div className="glass-card rounded-2xl p-8 md:p-14">
          <div className="flex flex-col gap-6 text-base leading-[1.9] text-slate-400 md:text-lg">
            <p>
              We&apos;ve run a service business in the Treasure Valley for years. Like every
              contractor, we&apos;ve had our share of difficult jobs. But one customer stands out.
              Terrible communication. Constant scope creep. Multiple threats of legal action. Work
              that was never good enough no matter how many times it was redone. Hours of time,
              energy, and money poured into a relationship that should never have started.
            </p>

            <p>
              The frustrating part wasn&apos;t the customer. It was that there was no way to know.
            </p>

            <p>
              No system existed to warn us before we took the job. No way to tell the next
              plumber, electrician, or landscaper who called that customer what they were walking
              into. The business absorbed all the risk. The customer faced none of the consequences.
            </p>

            <p className="text-lg font-semibold text-white md:text-xl">
              We built Repflip to change that.
            </p>

            <p>
              The idea is simple: businesses rate customers the same way customers rate businesses.
              Consumers build a reputation score that follows them across every service provider they
              work with. Good behavior gets rewarded with points, prizes, and priority access to the
              best businesses in town. And businesses finally get what they&apos;ve always deserved —
              a clear signal before they commit.
            </p>

            <p>
              We&apos;re starting in the Treasure Valley because this is home. The businesses
              building this with us aren&apos;t customers — they&apos;re co-founders of a movement.
              Every review they submit makes the platform more valuable for every business that comes
              after them.
            </p>

            <p className="text-lg font-semibold text-white md:text-xl">
              This isn&apos;t just a software company. It&apos;s the beginning of a trust layer for
              the entire service economy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
