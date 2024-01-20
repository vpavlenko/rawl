import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Route } from "wouter"
import { EditProfilePage } from "../pages/EditProfilePage"
import { SongPage } from "../pages/SongPage"
import { UserPage } from "../pages/UserPage"
import { SignInDialog } from "./SignInDialog/SignInDialog"

const Routes: FC = observer(() => {
  return (
    <>
      {/* <Route path="/community" component={HomePage} /> */}
      <Route path="/profile" component={EditProfilePage} />
      <Route path="/users/:userId">
        {(params) => <UserPage userId={params.userId} />}
      </Route>
      <Route path="/songs/:songId">
        {(params) => <SongPage songId={params.songId} />}
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
