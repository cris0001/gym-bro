import { BicepsFlexed } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useInView } from '../hooks/use-in-view';
import { useLandingTranslation } from '../i18n';
import { H2, HAND, SECTION } from '../utils/styles';

// A phone home screen (sm+): a grid of blank app tiles and the Lift4Me icon popping
// in once the section scrolls into view.
function HomeScreen({ show }: { show: boolean }) {
  return (
    <div className="mx-auto hidden h-[520px] w-[270px] rounded-[26px] bg-[#05070b] p-[7px] shadow-2xl sm:block">
      <div className="grid h-full grid-cols-4 content-start gap-x-3.5 gap-y-5 rounded-[19px] bg-gradient-to-b from-[#1e2a44] to-[#0f1420] px-5 pt-12">
        {Array.from({ length: 11 }).map((_, i) => (
          <span key={i} className="aspect-square rounded-[14px] bg-white/10" />
        ))}
        <span
          className={cn(
            'flex aspect-square items-center justify-center rounded-[14px] bg-white ring-3 ring-[#7fa6ff]',
            show ? 'animate-pop' : 'opacity-0',
          )}
        >
          <BicepsFlexed className="size-[60%] text-[#3a60a0]" strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
}

// "Install it like an app": the dark band with the home-screen mock and three
// numbered steps.
export function PwaSection() {
  const t = useLandingTranslation();
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <section id="pwa" className="scroll-mt-16 bg-[#14181f] text-[#f4f2ec]">
      <div
        ref={ref}
        className={`${SECTION} grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-20`}
      >
        <HomeScreen show={inView} />
        <div>
          <p className={`${HAND} text-lg text-[#7fa6ff] md:text-[22px]`}>{t.pwa.eyebrow}</p>
          <h2 className={H2}>
            {t.pwa.title}
            <span className="block text-[#8a93a6]">{t.pwa.titleMuted}</span>
          </h2>
          <p className="mt-6 max-w-[560px] text-[15.5px] leading-relaxed text-[#b8bfcc]">
            {t.pwa.body}
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {t.pwa.steps.map((step, i) => (
              <li key={step} className="border-t border-[#2d3546] pt-4">
                <span className="font-heading text-3xl font-extrabold text-[#7fa6ff]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-2 text-[15px] leading-relaxed text-[#c7ccd6]">{step}</p>
              </li>
            ))}
          </ol>
          <p className={`${HAND} mt-8 text-lg text-[#8a93a6]`}>{t.pwa.platforms}</p>
        </div>
      </div>
    </section>
  );
}
