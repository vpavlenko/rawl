import { User } from "firebase/auth"
import AccountCircle from "mdi-react/AccountCircleIcon"
import { FC, useRef } from "react"
import { Localized } from "../../components/Localized"
import { Menu, MenuItem } from "../../components/Menu"
import {
  IconStyle,
  Tab,
  TabTitle,
} from "../../main/components/Navigation/Navigation"
import { useTheme } from "../../main/hooks/useTheme"

export interface UserButtonContentProps {
  user: User | null
  onClickSignIn: () => void
  onClickSignOut: () => void
  onClickProfile: () => void
}

export const UserButtonContent: FC<UserButtonContentProps> = ({
  user,
  onClickSignIn,
  onClickSignOut,
  onClickProfile,
}) => {
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
      <MenuItem onClick={onClickSignOut}>
        <Localized default="Sign out">sign-out</Localized>
      </MenuItem>
      <MenuItem onClick={onClickProfile}>
        <Localized default="Profile">profile</Localized>
      </MenuItem>
    </Menu>
  )
}
