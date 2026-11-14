import { useLandingTranslation } from '../i18n';
import { HAND } from '../utils/styles';

// The ink strip with the brush-lettered motto, looping endlessly (two identical
// halves slide by 50%, so there's no seam).
export function LandingMarquee() {
  const t = useLandingTranslation();
  return (
    <div className="w-full overflow-hidden bg-[#14181f] py-3 md:py-4">
      <div className="animate-marquee flex w-max motion-reduce:animate-none">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className={`${HAND} flex items-center gap-6 pr-6 text-[clamp(20px,2.4vw,30px)] whitespace-nowrap text-[#f7f6f2]`}
              >
                {t.marquee}
                <span className="text-[#7fa6ff]">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
