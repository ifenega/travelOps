import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview } from "@storybook/react-vite"
import { QueryClientProvider } from "@tanstack/react-query"
import { createQueryClient } from "@/shared/lib/query-client"
import { Toaster } from "@/shared/ui/toast"
import { TooltipProvider } from "@/shared/ui/tooltip"
import "@/shared/styles/globals.css"

const queryClient = createQueryClient()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Accessibility violations fail the test run. Turn off per story only with a written reason.
    a11y: {
      test: "error",
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Story />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    ),
    // Light/dark switch in the toolbar: adds the `dark` class to <html>, same as the app will.
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
}

export default preview
