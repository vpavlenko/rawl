import { FC } from "react"
import { NinetyRingWithBg } from "react-svg-spinners"
import { useTheme } from "../main/hooks/useTheme"

export interface CircularProgressProps {
  size?: string | number
}

export const CircularProgress: FC<CircularProgressProps> = ({
  size = "2rem",
}) => {
  const theme = useTheme()
  return (
    <NinetyRingWithBg width={size} height={size} color={theme.themeColor} />
  )
}
