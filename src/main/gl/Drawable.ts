import { mat4 } from "gl-matrix"

export interface Drawable {
  render(transform: mat4): void
}
