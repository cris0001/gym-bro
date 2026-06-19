import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">You're signed in. Nothing here yet.</p>
      <Button>Get started</Button>
    </div>
  );
}
