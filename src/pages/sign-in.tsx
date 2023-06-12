import { type NextPage } from 'next'
import Head from 'next/head'
import { SignIn, useUser } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

const SignInPage: NextPage = (_) => {
  const user = useUser()
  return (
    <>
      <Head>
        <title>Authentication</title>
        <meta name="description" content="MyNetwrk - Authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen items-center justify-center bg-background">
        <div className="text-secondary-foreground">
          {!user.isSignedIn && (
            <SignIn
              appearance={{
                baseTheme: dark,
              }}
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-in"
            />
          )}
        </div>
      </main>
    </>
  )
}

export default SignInPage
