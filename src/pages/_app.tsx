import { type AppType } from 'next/app';

import '@/styles/globals.css';

import { api } from '@/utils/api';
import { Analytics } from '@vercel/analytics/react';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarContextProvider } from '@/contexts/SheetContext';

export { reportWebVitals } from 'next-axiom';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SidebarContextProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider session={session}>
            <Component {...pageProps} />
          </SessionProvider>
        </ThemeProvider>
      </SidebarContextProvider>
      <Toaster />
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
