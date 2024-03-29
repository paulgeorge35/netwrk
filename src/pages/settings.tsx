import { type NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { Sidebar } from '@/components/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsCustomization } from '@/components/settings-customization';
import { SettingsAccount } from '@/components/settings-account';
import { PageHeader } from '@/components/page-header';
import { SettingsNotifications } from '@/components/settings-notifications';
import { SettingsSupport } from '@/components/settings-support';

const Settings: NextPage = (_) => {
  const session = useSession();
  return (
    <>
      <Head>
        <title>Settings</title>
        <meta name="description" content="MyNetwrk - Settings page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen bg-background lg:grid-cols-5">
        <Sidebar className="hidden lg:block" userId={session.data?.user.id} />
        <div className="col-span-3 px-4 text-secondary-foreground lg:col-span-4 lg:border-l">
          <PageHeader
            icon="⚙️"
            title="Account Settings"
            subtitle="Customize your account settings and preferences."
          />
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              {/* <TabsTrigger value="data">Data Import/Export</TabsTrigger> */}
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <SettingsAccount />
            <SettingsCustomization />
            <SettingsNotifications />
            <SettingsSupport />
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Settings;
