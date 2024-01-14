import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../hooks/useStores"
import { HomePage } from "../pages/HomePage"
import { ProfilePage } from "../pages/ProfilePage"
import { SignInDialog } from "./SignInDialog/SignInDialog"

const Routes: FC = observer(() => {
  const { router } = useStores()
  const path = router.path
  return (
    <>
      {path === "/" && <HomePage />}
      {path === "/profile" && <ProfilePage />}
    </>
  )
})

export const RootView: FC = observer(() => {
  return (
    <>
      <Routes />
      <SignInDialog />
    </>
  )
})
