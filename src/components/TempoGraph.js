import React from "react"
import DrawCanvas from "./DrawCanvas"
import fitToContainer from "../hocs/fitToContainer"
import tempoGraphPresentation from "../presentations/tempoGraph"
import withTheme from "../hocs/withTheme"

const TempoGraph_ = ({ track, containerWidth, containerHeight, theme }) => {
  if (!containerWidth) {
    return null
  }

  // 0.1 * state.pianoRollScaleX,
  const items = tempoGraphPresentation(track.getEvents(), 0.1, containerWidth, containerHeight)

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)
    items.forEach((item, i) => {
      ctx.beginPath()
      ctx.fillStyle = theme.themeColor
      ctx.strokeStyle = theme.textColor
      ctx.lineWidth = 1
      ctx.rect(item.x, item.y, item.width, item.height)
      ctx.fill()
      ctx.stroke()
    })
    ctx.restore()
  }

  return <div className="TempoGraph">
    <DrawCanvas
      draw={draw}
      width={containerWidth}
      height={containerHeight}
      className="TempoGraphCanvas"
      onContextMenu={e => e.preventDefault()}
    />
  </div>
}

export default withTheme(fitToContainer(TempoGraph_, {
  width: "100%",
  height: "100%"
}))
