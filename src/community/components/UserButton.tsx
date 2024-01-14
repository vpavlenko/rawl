import AccountCircle from "mdi-react/AccountCircleIcon"
import { observer } from "mobx-react-lite"
import { useRef } from "react"
import { useLocation } from "wouter"
import { Localized } from "../../components/Localized"
import { Menu, MenuItem } from "../../components/Menu"
import { auth } from "../../firebase/firebase"
import {
  IconStyle,
  Tab,
  TabTitle,
} from "../../main/components/Navigation/Navigation"
import { useTheme } from "../../main/hooks/useTheme"
import { useStores } from "../hooks/useStores"

export const UserButton = observer(() => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  const {
    authStore: { authUser, user },
    rootViewStore,
  } = useStores()
  const [_, navigate] = useLocation()

  const onClickSignIn = () => {
    rootViewStore.openSignInDialog = true
  }
  const onClickSignOut = async () => {
    await auth.signOut()
  }
  if (authUser === null) {
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
          <AccountCircle style={IconStyle} />
          <TabTitle>{user?.name ?? authUser.displayName}</TabTitle>
        </Tab>
      }
    >
      <MenuItem onClick={() => navigate(`/users/${authUser.uid}`)}>
        <Localized default="Profile">profile</Localized>
      </MenuItem>
      <MenuItem onClick={() => navigate("/profile")}>
        <Localized default="Edit Profile">edit-profile</Localized>
      </MenuItem>
      <MenuItem onClick={onClickSignOut}>
        <Localized default="Sign out">sign-out</Localized>
      </MenuItem>
    </Menu>
  )
})
