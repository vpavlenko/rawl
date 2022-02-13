import { Theme as BaseTheme } from "../common/theme/Theme"

declare module "@emotion/react" {
  export interface Theme extends BaseTheme {}
}
