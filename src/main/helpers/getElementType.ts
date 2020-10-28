import omit from "lodash/omit"
import { createElement } from "react"

export default function getElementType(
  preferredElement: string | undefined
): React.FunctionComponent<any> {
  return (props) =>
    createElement(preferredElement || "div", omit(props, "children"))
}
