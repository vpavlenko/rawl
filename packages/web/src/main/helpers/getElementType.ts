import { createElement, createFactory } from "react"

export default function getElementType(
  preferredElement: string,
  defaultElement = "div"
): React.Factory<any> {
  return createFactory(preferredElement || defaultElement)
}
