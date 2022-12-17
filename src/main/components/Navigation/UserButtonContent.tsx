import { User } from "firebase/auth"
import AccountCircle from "mdi-react/AccountCircleIcon"
import { FC, useRef, useState } from "react"
import { Localized } from "../../../components/Localized"
import { Menu, MenuItem } from "../../../components/Menu"
import { useTheme } from "../../hooks/useTheme"
import { IconStyle, Tab, TabTitle } from "./Navigation"

export interface UserButtonContentProps {
  user: User | null
  onClickSignIn: () => void
  onClickSignOut: () => void
}

export const UserButtonContent: FC<UserButtonContentProps> = ({
  user,
  onClickSignIn,
  onClickSignOut,
}) => {
  const theme = useTheme()
  const [isOpen, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleClose = () => setOpen(false)

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
      }
    >
      <MenuItem onClick={onClickSignOut}>
        <Localized default="Sign out">sign-out</Localized>
      </MenuItem>
    </Menu>
  )
}
