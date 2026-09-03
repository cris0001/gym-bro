import { useAddEntry } from '../hooks/use-add-entry';
import { AddEntryMobile } from './add-entry-mobile';
import { AddEntryOverlays } from './add-entry-overlays';

// Mobile host for the diary "Add to meal" view: the fullscreen overlay plus its shared
// overlays (portion editor, scanner, food form). Desktop renders the two-pane
// AddEntryDesktop inline in the content column instead (see DiaryPage), so this path
// only covers phones. Renders nothing while no meal is being added to.
export function AddEntrySheet({ loggedDate }: { loggedDate: string }) {
  const state = useAddEntry(loggedDate);
  if (state.addMeal === null) return null;

  return (
    <>
      <AddEntryMobile loggedDate={loggedDate} meal={state.addMeal} state={state} />
      <AddEntryOverlays state={state} />
    </>
  );
}
