import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { IPoint, IRect } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import { colorToVec4 } from "../../gl/color"
import { Renderer2D } from "../../gl/Renderer2D"
import { BorderedRectangleObject } from "../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject2 } from "../../gl/shaders/SolidRectangleShader"
import { TransformGroup } from "../../gl/TransformGroup"

export class ArrangeViewRenderer {
  readonly renderer: Renderer2D

  private cursorObject: SolidRectangleObject2
  private beatObject: SolidRectangleObject2
  private highlightedBeatObject: SolidRectangleObject2
  private selectionObject: BorderedRectangleObject

  private rootGroup = new TransformGroup()
  readonly scrollXGroup = new TransformGroup()
  readonly scrollYGroup = new TransformGroup()
  readonly scrollXYGroup = new TransformGroup()
  readonly foregroundScrollXGroup = new TransformGroup()

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.cursorObject = new SolidRectangleObject2(gl)
    this.beatObject = new SolidRectangleObject2(gl)
    this.highlightedBeatObject = new SolidRectangleObject2(gl)

    this.selectionObject = new BorderedRectangleObject(gl)

    this.rootGroup.addChild(this.scrollXGroup)
    this.rootGroup.addChild(this.scrollYGroup)
    this.rootGroup.addChild(this.scrollXYGroup)
    this.rootGroup.addChild(this.foregroundScrollXGroup)

    this.scrollXGroup.addChild(this.beatObject)
    this.scrollXGroup.addChild(this.highlightedBeatObject)
    this.foregroundScrollXGroup.addChild(this.cursorObject)

    const objects = [this.selectionObject]

    objects.forEach((o) => this.renderer.addObject(o))
  }

  vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.renderer.gl.canvas.height,
  })

  hline = (y: number): IRect => ({
    x: 0,
    y,
    width: this.renderer.gl.canvas.width,
    height: 1,
  })

  render(
    cursorX: number,
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    scroll: IPoint
  ) {
    this.selectionObject.updateBuffer([selection])
    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))

    this.updateTheme()
    this.updateTransform(scroll)

    this.selectionObject.updateUniforms({
      projectionMatrix: this.scrollXYGroup.transform,
      strokeColor: colorToVec4(Color(this.theme.themeColor)),
      fillColor: vec4.create(),
    })

    this.renderer.render()

    this.rootGroup.render(this.renderer.createProjectionMatrix())
  }

  private updateTheme() {
    this.beatObject.setProps({
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
    })

    this.highlightedBeatObject.setProps({
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.5)),
    })

    this.cursorObject.setProps({
      color: vec4.fromValues(1, 0, 0, 1),
    })
  }

  private updateTransform(scroll: IPoint) {
    this.scrollXGroup.transform = matrixFromTranslation(-scroll.x, 0)
    this.foregroundScrollXGroup.transform = this.scrollXGroup.transform
    this.scrollYGroup.transform = matrixFromTranslation(0, -scroll.y)
    this.scrollXYGroup.transform = matrixFromTranslation(-scroll.x, -scroll.y)
  }
}

export const matrixFromTranslation = (x: number, y: number) => {
  const newMat = mat4.create()
  mat4.fromTranslation(newMat, vec3.fromValues(x, y, 0))
  return newMat
}
