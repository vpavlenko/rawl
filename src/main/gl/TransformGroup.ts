import { mat4 } from "gl-matrix"
import { Drawable } from "./Drawable"

export class TransformGroup implements Drawable {
  transform: mat4 = mat4.create()
  private children: Drawable[] = []

  addChild(child: Drawable) {
    this.children.push(child)
  }

  render(transform: mat4) {
    const t = mat4.create()
    mat4.multiply(t, transform, this.transform)
    this.children.forEach((c) => c.render(t))
  }
}
