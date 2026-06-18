import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">GM</h1>
      <p className="text-muted-foreground">Frontend foundation is up.</p>
      <Button>Get started</Button>
    </main>
  );
}
