import { mat4 } from "gl-matrix"
import { createContext, useContext } from "react"

export const ProjectionMatrixContext = createContext<mat4>(
  null as unknown as mat4 // never use default value
)
export const useProjectionMatrix = () => useContext(ProjectionMatrixContext)
