import { createElement } from "react"
import omit from "lodash/omit"

export default function getElementType(
  preferredElement: string | undefined
): React.FunctionComponent<any> {
  return (props) =>
    createElement(preferredElement || "div", omit(props, "children"))
}
