import { observer } from "mobx-react-lite"
import { FC } from "react"
import { auth } from "../../../firebase/firebase"
import { useStores } from "../../hooks/useStores"
import { UserButtonContent } from "./UserButtonContent"

export const UserButton: FC = observer(() => {
  const {
    rootViewStore,
    authStore: { user },
  } = useStores()

  return (
    <UserButtonContent
      user={user}
      onClickSignIn={() => (rootViewStore.openSignInDialog = true)}
      onClickSignOut={async () => {
        await auth.signOut()
      }}
    />
  )
})
