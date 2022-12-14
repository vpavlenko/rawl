import NinetyRingWithBg from "@ryohey/react-svg-spinners/dist/NinetyRingWithBg"
import { FC } from "react"
import { useTheme } from "../main/hooks/useTheme"

export interface CircularProgressProps {
  size?: string | number
}

export const CircularProgress: FC<CircularProgressProps> = ({
  size = "2rem",
}) => {
  const theme = useTheme()
  return (
    <NinetyRingWithBg
      style={{ width: size, height: size }}
      color={theme.themeColor}
    />
  )
}
