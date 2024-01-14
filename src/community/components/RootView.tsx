import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Route, useLocation } from "wouter"
import { EditProfilePage } from "../pages/EditProfilePage"
import { HomePage } from "../pages/HomePage"
import { SignInDialog } from "./SignInDialog/SignInDialog"

const Routes: FC = observer(() => {
  const [location] = useLocation()
  console.log(location)
  return (
    <>
      <Route path="/community" component={HomePage} />
      <Route path="/profile" component={EditProfilePage} />
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
