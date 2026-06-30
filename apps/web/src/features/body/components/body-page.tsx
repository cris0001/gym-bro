// The body-measurements page: a prominent quick-add weight form, the history list
// with edit/delete, and trend charts. Built incrementally — this is the Slice 1
// stub; the form, list, and charts land in the following slices.
export function BodyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Body</h1>
      <p className="text-muted-foreground text-sm">Measurement tracking coming up next.</p>
    </div>
  );
}
