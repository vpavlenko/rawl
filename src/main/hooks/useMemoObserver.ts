import { autorun } from "mobx"
import { useEffect, useState } from "react"

export const useMemoObserver = <T>(selector: () => T, deps: any[] = []): T => {
  const [state, setState] = useState<T>(selector)

  useEffect(
    () =>
      autorun(() =>
        // setState prevent re-rendering when selector returns same value (primitives)
        setState(selector)
      ),
    deps
  )

  return state
}
