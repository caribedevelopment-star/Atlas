import { AppShell, PageHeader } from '@/components/app-shell';
import { WineLibrary } from '@/components/wine-library';
import { wines } from '@/lib/data';

export default function WinesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Cellar"
        title="Wine Library"
        description="Bottles worth remembering, rated by everyone who shared them."
      />
      <WineLibrary wines={wines} />
    </AppShell>
  );
}
