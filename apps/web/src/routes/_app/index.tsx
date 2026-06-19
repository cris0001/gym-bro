import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">GM</h1>
      <p className="text-muted-foreground">You're signed in.</p>
      <Button>Get started</Button>
    </main>
  );
}
