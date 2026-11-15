import { Link } from '@tanstack/react-router';

import { useAuthTranslation } from '../i18n';

export interface Consents {
  terms: boolean;
  health: boolean;
}

const BOX = 'mt-0.5 size-4 shrink-0 cursor-pointer accent-[#023e8a]';
const LINK = 'font-semibold text-[#023e8a] underline-offset-2 hover:underline';

// The two required sign-up consents: accepting the terms + privacy policy, and the
// separate, explicit consent to processing health data (weight, body composition,
// measurements — GDPR Art. 9). The links open in a new tab so the form keeps its input.
export function RegisterConsents({
  value,
  onChange,
  showError,
}: {
  value: Consents;
  onChange: (next: Consents) => void;
  showError: boolean;
}) {
  const c = useAuthTranslation().register.consent;

  return (
    <div className="flex flex-col gap-3 text-[12.5px] leading-snug text-[#3d4350]">
      <label className="flex gap-2.5">
        <input
          type="checkbox"
          className={BOX}
          checked={value.terms}
          onChange={(e) => onChange({ ...value, terms: e.target.checked })}
        />
        <span>
          {c.termsBefore}
          <Link to="/terms" target="_blank" className={LINK}>
            {c.terms}
          </Link>
          {c.and}
          <Link to="/privacy" target="_blank" className={LINK}>
            {c.privacy}
          </Link>
          .
        </span>
      </label>
      <label className="flex gap-2.5">
        <input
          type="checkbox"
          className={BOX}
          checked={value.health}
          onChange={(e) => onChange({ ...value, health: e.target.checked })}
        />
        <span>{c.health}</span>
      </label>
      {showError && (!value.terms || !value.health) ? (
        <p role="alert" className="text-destructive text-sm">
          {c.required}
        </p>
      ) : null}
    </div>
  );
}
