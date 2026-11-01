import type { ReactNode } from "react"
import { type FlagName, isEnabled } from "./flags"

/** Read a flag inside a component. A hook so a remote flag source can be swapped in later. */
export function useFlag(name: FlagName) {
  return isEnabled(name)
}

/**
 * Shows its children only when the flag is on.
 *   <Feature flag="wallet"><WalletCard /></Feature>
 * For whole routes, use isEnabled() in the route's beforeLoad instead (see src/app/routes.tsx).
 */
export function Feature({
  flag,
  fallback = null,
  children,
}: {
  flag: FlagName
  fallback?: ReactNode
  children: ReactNode
}) {
  return useFlag(flag) ? children : fallback
}
