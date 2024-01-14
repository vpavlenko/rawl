import AccountCircle from "mdi-react/AccountCircleIcon"
import { observer } from "mobx-react-lite"
import { FC, useRef } from "react"
import { Localized } from "../../../components/Localized"
import { Menu, MenuItem } from "../../../components/Menu"
import { auth } from "../../../firebase/firebase"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { IconStyle, Tab, TabTitle } from "./Navigation"

export const UserButton: FC = observer(() => {
  const {
    rootViewStore,
    authStore: { authUser: user },
  } = useStores()

  const onClickSignIn = () => (rootViewStore.openSignInDialog = true)
  const onClickSignOut = async () => {
    await auth.signOut()
  }

  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  if (user === null) {
    return (
      <Tab onClick={onClickSignIn}>
        <AccountCircle style={IconStyle} />
        <TabTitle>
          <Localized default="Sign in">sign-in</Localized>
        </TabTitle>
      </Tab>
    )
  }

  return (
    <Menu
      trigger={
        <Tab ref={ref}>
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
      }
    >
      <MenuItem onClick={() => (location.href = `/users/${user.uid}`)}>
        <Localized default="Profile">profile</Localized>
      </MenuItem>
      <MenuItem onClick={onClickSignOut}>
        <Localized default="Sign out">sign-out</Localized>
      </MenuItem>
    </Menu>
  )
})
