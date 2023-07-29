import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SettingsSupport() {
  return (
    <TabsContent value="support" className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-4">
          <span className="flex gap-1 space-y-8">
            <span className="flex w-full items-center justify-between space-y-1">
              <span className="flex flex-col gap-1 pt-1">
                <h1 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Contact support
                </h1>
                <p className="text-sm text-muted-foreground">
                  Get support directly from the developer of MyNetwrk
                </p>
              </span>
              <Link
                href="mailto:contact@paulgeorge.dev?subject=Support MyNetwrk"
                className="flex items-center gap-2"
              >
                Contact <ArrowRight />
              </Link>
            </span>
          </span>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
