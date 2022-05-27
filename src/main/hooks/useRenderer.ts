import { createContext, useContext } from "react"
import { Renderer2D } from "../gl/Renderer2D"

export const RendererContext = createContext<Renderer2D>(
  null as unknown as Renderer2D // never use default value
)
export const useRenderer = () => useContext(RendererContext)
