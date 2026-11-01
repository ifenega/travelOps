import { RouterProvider } from "@tanstack/react-router"
import { Toaster } from "@/shared/ui/toast"
import { TooltipProvider } from "@/shared/ui/tooltip"
import { createAppRouter } from "./routes"

const router = createAppRouter()

export function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  )
}
