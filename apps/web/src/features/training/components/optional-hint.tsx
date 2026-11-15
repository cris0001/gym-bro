// The muted "(optional)" suffix after a form label.
import { useTrainingTranslation } from '../i18n';
export function OptionalHint() {
  const t = useTrainingTranslation();
  return <span className="text-muted-foreground font-normal">{t.common.optional}</span>;
}
