import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { createQueryClient } from "@/shared/lib/query-client"
import { Toaster } from "@/shared/ui/toast"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { createAppRouter } from "./routes"

const router = createAppRouter()
const queryClient = createQueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
