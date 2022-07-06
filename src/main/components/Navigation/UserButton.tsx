import { AccountCircle } from "@mui/icons-material"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { IconStyle, Tab, TabTitle } from "./Navigation"

export const UserButton: FC = () => {
  const {
    rootViewStore,
    authStore: { user },
  } = useStores()
  const theme = useTheme()

  if (user === null) {
    return (
      <Tab
        onClick={useCallback(() => (rootViewStore.openSignInDialog = true), [])}
      >
        <AccountCircle style={IconStyle} />
        <TabTitle>{localized("sign-in", "Sign in")}</TabTitle>
      </Tab>
    )
  }

  return (
    <Tab
      onClick={useCallback(() => (rootViewStore.openSignInDialog = true), [])}
    >
      <img
        style={{
          ...IconStyle,
          borderRadius: "0.65rem",
          border: `1px solid ${theme.dividerColor}`,
        }}
        src={user.photoURL ?? undefined}
      />
      <TabTitle>{user.displayName}</TabTitle>
    </Tab>
  )
}
