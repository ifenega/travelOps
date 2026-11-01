import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/shared/ui/toast"
import { TooltipProvider } from "@/shared/ui/tooltip"
import "@/shared/styles/globals.css"

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
    // A fresh query client per story, so cached data never leaks from one story to the next.
    (Story) => (
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
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
