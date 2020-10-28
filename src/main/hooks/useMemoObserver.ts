import { autorun } from "mobx"
import { useEffect, useState } from "react"

export const useMemoObserver = <T>(selector: () => T, deps: any[] = []): T => {
  const [state, setState] = useState<T>(selector)

  useEffect(
    () =>
      autorun(() => {
        const v = selector()
        setState(v)
      }),
    deps
  )

  return state
}
