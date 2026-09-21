const STEPS = [
  'Open gymbro.app in your browser',
  'Tap "Add to Home Screen"',
  'Train — even with no signal',
];

// The "Install it like an app" band: a deliberately dark section explaining the PWA
// install, with a numbered how-to and a photo slot (placeholder until a real image is
// dropped into /public/landing/pwa.jpg).
export function PwaSection() {
  return (
    <section id="pwa" className="scroll-mt-16 bg-[#2b2126]">
      <div className="mx-auto grid w-full max-w-[1060px] items-center gap-9 px-6 py-16 md:grid-cols-2">
        <div className="flex flex-col gap-3.5">
          <span className="font-heading text-[15px] text-[#c98fa0] italic">No app store</span>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-medium tracking-tight text-[#f0e7ea]">
            Install it like an app
          </h2>
          <p className="text-[15px] leading-relaxed text-[#bfb2b7]">
            Gym Bro is a Progressive Web App: add it to your home screen straight from the browser —
            no store, no updates to babysit. It runs full-screen like a native app, works offline in
            the gym basement, and syncs your data the moment you&apos;re back online.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            {STEPS.map((step, index) => (
              <span key={step} className="flex items-center gap-2.5 text-[13.5px] text-[#f0e7ea]">
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-[#3a2f34] text-xs font-bold text-[#c98fa0]">
                  {index + 1}
                </span>
                {step}
              </span>
            ))}
            <span className="font-heading pt-1.5 text-[12.5px] text-[#94858b] italic">
              works on iPhone, Android and desktop
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex aspect-[5/4] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-3xl bg-[#3a2f34] text-center text-sm text-[#94858b] shadow-2xl">
            Gym photo
          </div>
        </div>
      </div>
    </section>
  );
}
