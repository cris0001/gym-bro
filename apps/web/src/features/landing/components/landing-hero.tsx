import { Link } from '@tanstack/react-router';

import { useLandingTranslation } from '../i18n';
import { useScreenshot } from '../hooks/use-screenshot';
import { CTA, HAND, SECTION } from '../utils/styles';
import { PhoneFrame } from './phone-frame';

// A small barbell drawn under the accent word: the bar traces in, the plates sit at
// the ends. Echoes the logo without repeating it.
function BarbellUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 260 24"
      preserveAspectRatio="none"
      className="absolute -bottom-3 left-[-4%] h-4 w-[108%] overflow-visible md:-bottom-4 md:h-5"
    >
      <path
        d="M14 12 Q130 4 246 12"
        stroke="#023e8a"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        className="animate-draw [--draw-length:260]"
      />
      <rect x="4" y="2" width="6" height="20" rx="2" fill="#023e8a" />
      <rect x="250" y="2" width="6" height="20" rx="2" fill="#023e8a" />
    </svg>
  );
}

// Hero: a hand-lettered note, the three-line headline (the last word in cobalt over a
// drawn barbell), the lead, and CTAs. From lg up two demo-account
// phones (dashboard in front, diary tilted behind) sit beside it; phones get the text alone.
export function LandingHero() {
  const t = useLandingTranslation();
  const shot = useScreenshot();

  return (
    <section
      className={`${SECTION} grid items-center gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:pb-28`}
    >
      <div className="animate-rise">
        <p className={`${HAND} mb-4 inline-block -rotate-2 text-xl text-[#023e8a] md:text-2xl`}>
          {t.hero.note} ↘
        </p>
        <h1 className="font-heading text-[clamp(44px,6.4vw,84px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance">
          {t.hero.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <span className="relative inline-block text-[#023e8a]">
            {t.hero.accent}
            <BarbellUnderline />
          </span>
        </h1>
        <p className="mt-10 max-w-[520px] text-base leading-relaxed text-[#5b6170] md:text-lg">
          {t.hero.lead}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/register" className={CTA}>
            {t.hero.cta}
          </Link>
          <a
            href="#inside"
            className="border-b-2 border-[#14181f] pb-0.5 text-[15px] font-bold transition-colors hover:border-[#023e8a] hover:text-[#023e8a]"
          >
            {t.hero.seeInside} ↓
          </a>
        </div>
      </div>

      <div className="animate-rise relative hidden h-[680px] [animation-delay:0.25s] lg:block">
        <PhoneFrame inset className="absolute top-12 left-[8%] w-[250px] -rotate-6 opacity-90">
          <img src={shot('diary')} alt="" className="h-full w-full object-cover object-top" />
        </PhoneFrame>
        <PhoneFrame className="absolute top-0 right-[10%] w-[290px]">
          <img src={shot('dashboard')} alt="" className="h-full w-full object-cover object-top" />
        </PhoneFrame>
        <p
          className={`${HAND} animate-float absolute right-[4%] bottom-0 text-xl text-[#5b6170] [--float-rotate:4deg]`}
        >
          {t.hero.shotNote}
        </p>
      </div>
    </section>
  );
}
