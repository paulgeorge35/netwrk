import { type NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Command, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const SignInPage: NextPage = (_) => {
  const { data } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (data) void router.push('/');
  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div
            className="absolute inset-0 bg-zinc-900 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1549317336-206569e8475c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3087&q=80)`,
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Command className="mr-2 h-6 w-6" /> My Netwrk
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Continue with one of these providers
                </span>
              </div>
            </div>
            <div className={cn('grid gap-2')}>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                isLoading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  void signIn('github', {
                    callbackUrl: '/',
                  });
                }}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-blue-500"></div>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Github
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                If you already have an account, you will be signed in.
              </p>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
