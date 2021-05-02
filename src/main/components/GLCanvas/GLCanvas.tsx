import React, { useEffect, useRef } from "react"

export type GLCanvasProps = Omit<
  React.DetailedHTMLProps<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    HTMLCanvasElement
  >,
  "ref"
> & {
  width: number
  height: number
  onCreateContext: (gl: WebGLRenderingContext) => void
}

export const GLCanvas = ({
  width,
  height,
  onCreateContext,
  style,
  ...props
}: GLCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    // GL コンテキストを初期化する
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      desynchronized: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    })

    // WebGL が使用可能で動作している場合にのみ続行します
    if (gl === null) {
      alert(
        "WebGL を初期化できません。ブラウザーまたはマシンがサポートしていない可能性があります。"
      )
      return
    }

    onCreateContext(gl)

    return () => {
      gl?.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  const canvasScale = window.devicePixelRatio

  return (
    <canvas
      {...props}
      ref={canvasRef}
      width={width * canvasScale}
      height={height * canvasScale}
      style={{
        ...style,
        width: width,
        height: height,
      }}
    />
  )
}
