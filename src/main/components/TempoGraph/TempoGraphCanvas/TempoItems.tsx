import { useTheme } from "@emotion/react"
import Color from "color"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { IPoint, IRect } from "../../../../common/geometry"
import { joinObjects } from "../../../../common/helpers/array"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { BordererdCircles } from "../../GLSurface/shapes/BordererdCircles"
import { Rectangles } from "../../GLSurface/shapes/Rectangles"

export interface TempoItemsProps {
  width: number
}

export const TempoItems: VFC<TempoItemsProps> = observer(({ width }) => {
  const rootStore = useStores()
  const theme = useTheme()
  const { items, selectedEventIds, controlPoints } = rootStore.tempoEditorStore

  const lineWidth = 2

  const right = scrollX + width
  const values = items.map((i) => ({ ...i.bounds, id: i.id }))
  const rects = createLineRects(values, lineWidth, right)
  const [highlightedItems, nonHighlightedItems] = partition(
    controlPoints,
    (i) => selectedEventIds.includes(i.id)
  )

  return (
    <>
      <Rectangles
        rects={rects}
        color={colorToVec4(Color(theme.themeColor))}
        zIndex={4}
      />
      <BordererdCircles
        rects={nonHighlightedItems}
        zIndex={5}
        strokeColor={colorToVec4(Color(theme.themeColor))}
        fillColor={colorToVec4(Color(theme.themeColor))}
      />
      <BordererdCircles
        rects={highlightedItems}
        zIndex={6}
        strokeColor={colorToVec4(Color(theme.themeColor))}
        fillColor={colorToVec4(Color(theme.textColor))}
      />
    </>
  )
})

const createLineRects = (
  values: IPoint[],
  lineWidth: number,
  right: number
): IRect[] => {
  const horizontalLineRects = values.map(({ x, y }, i) => {
    const next = values[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return {
      x,
      y: y - lineWidth / 2,
      width: nextX - x,
      height: lineWidth,
    }
  })

  // add vertical lines between horizontal lines
  return joinObjects<IRect>(horizontalLineRects, (prev, next) => {
    const y = Math.min(prev.y, next.y)
    const height = Math.abs(prev.y - next.y) + lineWidth
    return {
      x: next.x - lineWidth / 2,
      y,
      width: lineWidth,
      height,
    }
  })
}
