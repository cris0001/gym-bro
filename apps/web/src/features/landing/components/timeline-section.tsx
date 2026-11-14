import { cn } from '@/lib/utils';

import { useInView } from '../hooks/use-in-view';
import { useScreenshot } from '../hooks/use-screenshot';
import { useLandingTranslation } from '../i18n';
import { H2, HAND, SECTION } from '../utils/styles';
import { PhoneFrame } from './phone-frame';

// "One timeline": training, runs and the plan for each day on one calendar. Copy on
// the left; the demo account's calendar on a phone on the right, rising in when it
// scrolls into view, with a hand-lettered note pointing at it.
export function TimelineSection() {
  const t = useLandingTranslation();
  const shot = useScreenshot();
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section
      className={`${SECTION} grid items-center gap-12 py-20 md:grid-cols-[minmax(0,1fr)_320px] md:gap-16 md:py-28 lg:grid-cols-[minmax(0,1fr)_380px]`}
    >
      <div>
        <p className={`${HAND} text-lg text-[#023e8a] md:text-[22px]`}>{t.timeline.eyebrow}</p>
        <h2 className={`${H2} max-w-[560px]`}>{t.timeline.title}</h2>
        <p className="mt-6 max-w-[460px] text-[15.5px] leading-relaxed text-[#5b6170]">
          {t.timeline.body}
        </p>
        <p className={`${HAND} mt-10 hidden -rotate-2 text-xl text-[#5b6170] md:block`}>
          {t.timeline.note} →
        </p>
      </div>

      <div ref={ref} className={cn('flex justify-center', inView ? 'animate-rise' : 'opacity-0')}>
        <PhoneFrame inset className="w-[min(300px,80vw)]">
          <img
            src={shot('calendar')}
            alt={t.timeline.alt}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </PhoneFrame>
      </div>
    </section>
  );
}
