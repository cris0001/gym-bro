import { LanguageToggle } from '@/components/language-toggle';
import { PalettePicker } from '@/components/palette-picker';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  FoodNameLangSetting,
  ProfileForm,
  useAuthTranslation,
  useCurrentUser,
  useUpdateProfile,
} from '@/features/auth';

import { useSettingsTranslation } from '../i18n';
import { useSettingsUiStore } from '../stores/settings-ui.store';

const SECTION_TITLE = 'font-heading text-[17px] font-semibold';
const LABEL = 'text-[12.5px] font-semibold text-subtle-foreground';
const DIVIDER = 'border-border border-t border-dashed pt-6';

// Settings as a modal over the current page — a bottom sheet on phones, a centred
// dialog on larger screens. Top to bottom: the food-name language (saves on tap), the
// app's appearance (language, theme, accent), then the onboarding profile (birthdate,
// sex, height), editable any time.
export function SettingsSheet() {
  const t = useSettingsTranslation();
  const authT = useAuthTranslation();
  const open = useSettingsUiStore((s) => s.open);
  const setOpen = useSettingsUiStore((s) => s.setOpen);
  const { data: user, isPending } = useCurrentUser();
  const update = useUpdateProfile();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* The app's bottom variant: a sheet on phones, a centred modal card from sm up,
          capped narrower as it's one column. The card itself doesn't scroll (that put
          the scrollbar against its rounded corners) — only the body below the title. */}
      <SheetContent
        side="bottom"
        className="flex flex-col gap-0 overflow-hidden sm:max-w-lg lg:max-w-lg"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle className="font-heading text-[22px] font-medium">{t.title}</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-6">
          <FoodNameLangSetting />

          <section className={`grid gap-4 ${DIVIDER}`}>
            <h2 className={SECTION_TITLE}>{t.appearance}</h2>
            <div className="grid gap-2">
              <span className={LABEL}>{t.language}</span>
              <LanguageToggle className="w-fit" />
            </div>
            <div className="grid gap-2">
              <span className={LABEL}>{t.theme}</span>
              <ThemeToggle />
            </div>
            <div className="grid gap-2">
              <span className={LABEL}>{t.accent}</span>
              <PalettePicker />
            </div>
          </section>

          <section className={`grid gap-4 ${DIVIDER}`}>
            <div>
              <h2 className={SECTION_TITLE}>{t.profile}</h2>
              <p className="text-muted-foreground text-[13px]">{t.profileHint}</p>
            </div>
            {isPending || !user ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <>
                <div className="grid gap-1">
                  <span className={LABEL}>{t.email}</span>
                  <span className="text-[14px]">{user.email}</span>
                </div>
                {/* Seeded once per open: no key on updatedAt, so saving the food-name
                    language above doesn't wipe half-typed edits here. */}
                <ProfileForm
                  user={user}
                  mode="patch"
                  includeFoodNameLang={false}
                  onSubmit={(input) => update.mutate(input)}
                  isPending={update.isPending}
                  error={update.error}
                  status={
                    update.isSuccess ? (
                      <p className="text-muted-foreground text-sm">{authT.onboarding.saved}</p>
                    ) : null
                  }
                />
              </>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
