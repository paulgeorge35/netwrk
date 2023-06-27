import { type NextPage } from 'next'
import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/react'

const SignInPage: NextPage = (_) => {
  const { data } = useSession()
  return (
    <>
      <Head>
        <title>Authentication</title>
        <meta name="description" content="MyNetwrk - Authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen items-center justify-center bg-background">
        <div className="text-secondary-foreground">
          <p className="text-center text-2xl text-white">
            {data && <span>Logged in as {data.user?.name}</span>}
          </p>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={data ? () => void signOut() : () => void signIn()}
          >
            {data ? 'Sign out' : 'Sign in'}
          </button>
        </div>
      </main>
    </>
  )
}

export default SignInPage
