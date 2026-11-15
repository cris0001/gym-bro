import { Link } from '@tanstack/react-router';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { useLandingTranslation } from '../i18n';
import { CTA, HAND, SECTION } from '../utils/styles';

// "Free. For now.": the headline, a short note on possible future upkeep costs, then a
// single plan card (what's included + sign up), beside an FAQ accordion (first answer
// open).
export function PricingSection() {
  const t = useLandingTranslation();
  const p = t.pricing;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="pricing"
      className={`${SECTION} grid scroll-mt-16 gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-20`}
    >
      <div>
        <p className={`${HAND} text-lg text-[#023e8a] md:text-[22px]`}>{p.eyebrow}</p>
        <h2 className="font-heading text-[clamp(44px,6vw,68px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
          {p.title}
          <span className="block text-[#023e8a]">{p.accent}</span>
        </h2>
        <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-[#5b6170]">{p.note}</p>
        <div className="mt-8 rounded-[20px] border border-[#e4e1d8] bg-white p-6">
          <ul className="flex flex-col gap-3">
            {p.features.map((line) => (
              <li key={line} className="flex gap-3 text-[15px] font-semibold">
                <Check className="mt-0.5 size-4 shrink-0 text-[#023e8a]" strokeWidth={3} />
                {line}
              </li>
            ))}
          </ul>
          <Link to="/register" className={cn(CTA, 'mt-6 w-full')}>
            {p.cta}
          </Link>
        </div>
      </div>

      <div className="lg:pt-14">
        {p.faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-[#e4e1d8]">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-bold"
              >
                {item.q}
                <Plus
                  className={cn(
                    'size-5 shrink-0 text-[#023e8a] transition-transform duration-300',
                    isOpen && 'rotate-45',
                  )}
                />
              </button>
              {/* grid-rows 0fr → 1fr eases the answer's height open. */}
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <p className="overflow-hidden text-[15px] leading-relaxed text-[#5b6170]">
                  <span className="block pb-5">{item.a}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
