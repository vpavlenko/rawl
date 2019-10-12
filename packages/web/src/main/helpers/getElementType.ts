import { createElement } from "react"
import _ from "lodash"

export default function getElementType(
  preferredElement: string | undefined
): React.FunctionComponent<any> {
  return props =>
    createElement(preferredElement || "div", _.omit(props, "children"))
}
