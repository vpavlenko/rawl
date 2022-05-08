import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { IPoint, IRect } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import { colorToVec4 } from "../../gl/color"
import { Renderer2D, translateMatrix } from "../../gl/Renderer2D"
import { Drawable } from "../../gl/Drawable"
import { BorderedRectangleObject } from "../../gl/shaders/BorderedRectangleShader"
import {
  SolidRectangleBuffer,
  SolidRectangleObject,
  SolidRectangleObject2,
  SolidRectangleShader,
} from "../../gl/shaders/SolidRectangleShader"
import { TransformGroup } from "../../gl/TransformGroup"
import { RenderObject } from "../../gl/RenderObject"
import { DisplayObject } from "../../gl/DisplayObject"

export class ArrangeViewRenderer {
  private renderer: Renderer2D

  private noteObject: SolidRectangleObject2
  private cursorObject: SolidRectangleObject2
  private beatObject: SolidRectangleObject2
  private highlightedBeatObject: SolidRectangleObject2
  private lineObject: SolidRectangleObject2
  private selectionObject: BorderedRectangleObject

  private rootGroup = new TransformGroup()
  private scrollXGroup = new TransformGroup()
  private scrollYGroup = new TransformGroup()
  private scrollXYGroup = new TransformGroup()
  private foregroundScrollXGroup = new TransformGroup()

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.noteObject = new SolidRectangleObject2(gl)
    this.cursorObject = new SolidRectangleObject2(gl)
    this.beatObject = new SolidRectangleObject2(gl)
    this.highlightedBeatObject = new SolidRectangleObject2(gl)

    this.lineObject = new SolidRectangleObject2(gl)

    this.selectionObject = new BorderedRectangleObject(gl)

    this.rootGroup.addChild(this.scrollXGroup)
    this.rootGroup.addChild(this.scrollYGroup)
    this.rootGroup.addChild(this.scrollXYGroup)
    this.rootGroup.addChild(this.foregroundScrollXGroup)

    this.scrollXGroup.addChild(this.beatObject)
    this.scrollXGroup.addChild(this.highlightedBeatObject)
    this.scrollYGroup.addChild(this.lineObject)
    this.scrollXYGroup.addChild(this.noteObject)
    this.foregroundScrollXGroup.addChild(this.cursorObject)

    const objects = [this.selectionObject]

    objects.forEach((o) => this.renderer.addObject(o))
  }

  private vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.renderer.gl.canvas.height,
  })

  private hline = (y: number): IRect => ({
    x: 0,
    y,
    width: this.renderer.gl.canvas.width,
    height: 1,
  })

  render(
    cursorX: number,
    notes: IRect[],
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    lines: number[],
    scroll: IPoint
  ) {
    this.noteObject.updateBuffer(notes)
    this.selectionObject.updateBuffer([selection])
    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.lineObject.updateBuffer(lines.map(this.hline))

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
    this.lineObject.setProps({
      color: colorToVec4(Color(this.theme.dividerColor)),
    })

    this.beatObject.setProps({
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
    })

    this.highlightedBeatObject.setProps({
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.5)),
    })

    this.noteObject.setProps({
      color: colorToVec4(Color(this.theme.themeColor)),
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
