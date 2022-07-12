import styled from "@emotion/styled"
import { AccountCircle } from "@mui/icons-material"
import { Menu, MenuItem } from "@mui/material"
import Color from "color"
import { FC, useRef, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { auth } from "../../firebase/firebase"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { IconStyle, Tab, TabTitle } from "./Navigation"

const StyledMenu = styled(Menu)`
  .MuiList-root {
    background: ${({ theme }) =>
      Color(theme.backgroundColor).lighten(0.2).hex()};
  }
`

export const UserButton: FC = () => {
  const {
    rootViewStore,
    authStore: { user },
  } = useStores()
  const theme = useTheme()
  const [isOpen, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleClose = () => setOpen(false)
  const signOut = async () => {
    await auth.signOut()
  }

  if (user === null) {
    return (
      <Tab onClick={() => (rootViewStore.openSignInDialog = true)}>
        <AccountCircle style={IconStyle} />
        <TabTitle>{localized("sign-in", "Sign in")}</TabTitle>
      </Tab>
    )
  }

  return (
    <>
      <Tab ref={ref} onClick={() => setOpen(true)}>
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

      <StyledMenu
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorEl={ref.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration={50}
        disableAutoFocusItem={true}
      >
        <MenuItem onClick={signOut}>
          {localized("sign-out", "Sign out")}
        </MenuItem>
      </StyledMenu>
    </>
  )
}
