import { type AppType } from 'next/app'

import '@/styles/globals.css'

import { api } from '@/utils/api'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'

import { ThemeProvider } from '@/components/theme-provider'

export { reportWebVitals } from 'next-axiom'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ClerkProvider {...pageProps}>
          <Component {...pageProps} />
        </ClerkProvider>
      </ThemeProvider>
      <Analytics />
    </>
  )
}

export default api.withTRPC(MyApp)
