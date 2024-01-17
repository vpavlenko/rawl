import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Route, useLocation } from "wouter"
import { EditProfilePage } from "../pages/EditProfilePage"
import { UserPage } from "../pages/UserPage"
import { SignInDialog } from "./SignInDialog/SignInDialog"

const Routes: FC = observer(() => {
  const [location] = useLocation()
  return (
    <>
      {/* <Route path="/community" component={HomePage} /> */}
      <Route path="/profile" component={EditProfilePage} />
      <Route path="/users/:userId">
        {(params) => <UserPage userId={params.userId} />}
      </Route>
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
