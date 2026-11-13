import { Link } from '@tanstack/react-router';

import { useLandingTranslation } from '../i18n';

// "Free. Actually free." — the live Free plan (bordered, current) beside a struck-through
// Pro placeholder with no price, then a short FAQ. Fixed light palette.
export function PricingSection() {
  const t = useLandingTranslation();
  const p = t.pricing;

  return (
    <section
      id="pricing"
      className="mx-auto flex w-full max-w-[1060px] scroll-mt-16 flex-col gap-8 px-6 py-16"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-heading text-[15px] text-[#8d4a5e] italic">{p.eyebrow}</span>
        <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-medium tracking-tight text-[#2b2126]">
          {p.title}
        </h2>
      </div>

      <div className="grid w-full max-w-[760px] gap-4 self-center sm:grid-cols-2">
        {/* Free — the live plan */}
        <div className="relative flex flex-col gap-3.5 rounded-[20px] border-2 border-[#8d4a5e] bg-[#fdfbf9] p-7">
          <span className="absolute -top-3 left-6 rounded-full bg-[#8d4a5e] px-3 py-1 text-[10.5px] font-bold tracking-[0.08em] text-[#fdf6f5]">
            {p.current}
          </span>
          <span className="font-heading text-2xl font-semibold text-[#2b2126]">{p.free}</span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[44px] leading-none font-semibold text-[#2b2126]">
              $0
            </span>
            <span className="text-[13px] text-[#94858b]">{p.noTimeLimit}</span>
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            {p.features.map((line) => (
              <span key={line} className="flex gap-2.5 text-[13.5px] text-[#5f5257]">
                <span className="shrink-0 text-[#5a7a52]">✓</span>
                {line}
              </span>
            ))}
          </div>
          <Link
            to="/register"
            className="mt-auto flex h-[46px] items-center justify-center rounded-full bg-[#8d4a5e] text-sm font-semibold whitespace-nowrap text-[#fdf6f5] hover:bg-[#75394c]"
          >
            {p.cta}
          </Link>
        </div>

        {/* Pro — a maybe-someday paid tier: struck through, no price, disabled CTA. */}
        <div className="flex flex-col gap-3.5 rounded-[20px] border border-[#e8e1da] bg-[#f0ece8] p-7">
          <span className="font-heading text-2xl font-semibold text-[#94858b] line-through decoration-2">
            Pro
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[44px] leading-none font-semibold text-[#c9bcb2]">
              —
            </span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-[#94858b]">{p.proBody}</p>
          <span className="mt-auto flex h-[46px] cursor-not-allowed items-center justify-center rounded-full bg-[#e4dcd6] text-sm font-semibold whitespace-nowrap text-[#a89a9f]">
            {p.proCta}
          </span>
        </div>
      </div>

      {/* FAQ */}
      <div className="grid w-full max-w-[920px] gap-3.5 self-center pt-2 sm:grid-cols-3">
        {p.faq.map((item) => (
          <div
            key={item.q}
            className="flex flex-col gap-1.5 rounded-2xl border border-[#e8e1da] bg-[#fdfbf9] px-5 py-4"
          >
            <span className="font-heading text-base font-semibold text-[#2b2126]">{item.q}</span>
            <p className="text-[13px] leading-relaxed text-[#5f5257]">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
