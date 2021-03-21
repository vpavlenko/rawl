import { mat4 } from "gl-matrix"
import { useObserver } from "mobx-react-lite"
import { settings } from "pixi.js"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { IPoint, IRect } from "../../../common/geometry"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { NoteCoordTransform } from "../../../common/transform"
import { removeEvent } from "../../actions"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useNoteTransform } from "../../hooks/useNoteTransform"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { observeDoubleClick } from "./MouseHandler/observeDoubleClick"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { isPianoNote } from "./PianoNotes/PianoNote"
import { PianoSelectionContextMenu } from "./PianoSelectionContextMenu"

export interface PianoRollStageProps {
  width: number
}

export interface PianoNotesMouseEvent {
  pixiEvent: PIXI.InteractionEvent
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
}
//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!

  // Create the shader program

  const shaderProgram = gl.createProgram()!
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    )
    return null
  }

  return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!

  // Send the source to the shader object

  gl.shaderSource(shader, source)

  // Compile the shader program

  gl.compileShader(shader)

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    )
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function rectToTriangles(rect: IRect): number[] {
  return [
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y,
    rect.x,
    rect.y + rect.height,
    rect.x + rect.width,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    rect.x,
    rect.y + rect.height,
  ]
}

function initBuffers(gl: WebGLRenderingContext, rects: IRect[]) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer()

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.

  const positions = rects.flatMap(rectToTriangles)

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    count: rects.length * 6,
  }
}

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: number
  }
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null
    modelViewMatrix: WebGLUniformLocation | null
  }
}

function drawScene(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  buffers: ReturnType<typeof initBuffers>
) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180 // in radians
  const canvas = gl.canvas as HTMLCanvasElement
  const aspect = canvas.clientWidth / canvas.clientHeight
  const zNear = 0
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.ortho(
    projectionMatrix,
    0,
    canvas.clientWidth,
    canvas.clientHeight,
    0,
    zNear,
    zFar
  )

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create()

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  // mat4.translate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to translate
  //   [-0.0, 0.0, -6.0]
  // ) // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2 // pull out 2 values per iteration
    const type = gl.FLOAT // the data in the buffer is 32bit floats
    const normalize = false // don't normalize
    const stride = 0 // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0 // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program)

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  )
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  )

  {
    const offset = 0
    gl.drawArrays(gl.TRIANGLES, offset, buffers.count)
  }
}

export const PianoRollStage: FC<PianoRollStageProps> = ({ width }) => {
  const rootStore = useStores()
  const {
    trackId,
    ghostTrackIds,
    measures,
    playerPosition,
    timebase,
    mouseMode,
    scrollLeft,
    scrollTop,
    notesCursor,
    selection,
  } = useObserver(() => {
    const ghostTrackIds =
      rootStore.pianoRollStore.ghostTracks[rootStore.song.selectedTrackId] ?? []

    return {
      trackId: rootStore.song.selectedTrackId,
      ghostTrackIds,
      measures: rootStore.song.measures,
      playerPosition: rootStore.services.player.position,
      timebase: rootStore.services.player.timebase,
      mouseMode: rootStore.pianoRollStore.mouseMode,
      scrollLeft: rootStore.pianoRollStore.scrollLeft,
      scrollTop: rootStore.pianoRollStore.scrollTop,
      notesCursor: rootStore.pianoRollStore.notesCursor,
      selection: rootStore.pianoRollStore.selection,
    }
  })
  const transform = useNoteTransform()
  const theme = useTheme()

  const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
  const [selectionMouseHandler] = useState(new SelectionMouseHandler(rootStore))

  const stageHeight = transform.pixelsPerKey * transform.numberOfKeys
  const startTick = scrollLeft / transform.pixelsPerTick

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = (e: PIXI.InteractionEvent): PianoNotesMouseEvent => {
    const local = {
      x: e.data.global.x - theme.keyWidth + scrollLeft,
      y: e.data.global.y - theme.rulerHeight + scrollTop,
    }
    return {
      pixiEvent: e,
      nativeEvent: e.data.originalEvent as MouseEvent,
      local,
      tick: transform.getTicks(local.x),
      noteNumber: Math.ceil(transform.getNoteNumber(local.y)),
      transform,
    }
  }

  const handleMouseDown = (e: PIXI.InteractionEvent) => {
    if (isPianoNote(e.target)) {
      const { item } = e.target
      observeDoubleClick(() => {
        removeEvent(rootStore)(item.id)
      })
    }

    mouseHandler.onMouseDown(extendEvent(e))
  }

  const handleMouseMove = (e: PIXI.InteractionEvent) => {
    if (
      mouseMode === "pencil" &&
      e.data.buttons === 2 &&
      isPianoNote(e.target)
    ) {
      removeEvent(rootStore)(e.target.item.id)
    }
    mouseHandler.onMouseMove(extendEvent(e))
  }

  const handleMouseUp = (e: PIXI.InteractionEvent) =>
    mouseHandler.onMouseUp(extendEvent(e))

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    width
  )

  const cursorPositionX = transform.getX(playerPosition)
  const contentHeight = transform.getMaxY()

  const { onContextMenu, menuProps } = useContextMenu()

  const onRightClickSelection = useCallback(
    (ev: PIXI.InteractionEvent) => {
      ev.stopPropagation()
      const e = ev.data.originalEvent as MouseEvent
      onContextMenu(e)
    },
    [onContextMenu]
  )

  const handleRightClick = useCallback(
    (ev: PIXI.InteractionEvent) => {
      if (
        isPianoNote(ev.target) &&
        rootStore.pianoRollStore.mouseMode == "pencil"
      ) {
        removeEvent(rootStore)(ev.target.item.id)
      }
      if (rootStore.pianoRollStore.mouseMode === "selection") {
        const e = ev.data.originalEvent as MouseEvent
        ev.stopPropagation()
        onContextMenu(e)
      }
    },
    [rootStore, onContextMenu]
  )

  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    // GL コンテキストを初期化する
    const gl = canvas.getContext("webgl")

    // WebGL が使用可能で動作している場合にのみ続行します
    if (gl === null) {
      alert(
        "WebGL を初期化できません。ブラウザーまたはマシンがサポートしていない可能性があります。"
      )
      return
    }

    // クリアカラーを黒に設定し、完全に不透明にします
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // 指定されたクリアカラーでカラーバッファをクリアします
    gl.clear(gl.COLOR_BUFFER_BIT)
    const vsSource = `
      attribute vec4 aVertexPosition;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `
    const fsSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)!
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix"
        ),
        modelViewMatrix: gl.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix"
        ),
      },
    }
    const buffers = initBuffers(gl, [
      { x: 0, y: 0, width: 150, height: 20 },
      { x: -0.3, y: -1, width: 0.5, height: 0.25 },
    ])

    drawScene(gl, programInfo, buffers)
  }, [])

  settings.ROUND_PIXELS = true

  return (
    <>
      <canvas
        className="alphaContent"
        width={300}
        height={300}
        onContextMenu={useCallback((e) => e.preventDefault(), [])}
        ref={ref}
      ></canvas>
      <PianoSelectionContextMenu {...menuProps} />
    </>
  )
}
