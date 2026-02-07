'use client'
import {isServer, QueryClient, QueryClientProvider} from '@tanstack/react-query'
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,//stale time 1 minute
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) { 
    return makeQueryClient()//return a new query client for each server request
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient//return the same query client for the browser
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}