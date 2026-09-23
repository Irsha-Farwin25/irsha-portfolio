import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Client-only mount detection without an effect, to avoid SSR/CSR hydration mismatches. */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
