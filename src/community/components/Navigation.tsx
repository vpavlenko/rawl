import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Link, useLocation } from "wouter"
import { auth } from "../../firebase/firebase"
import { useStores } from "../hooks/useStores"
import { UserButtonContent } from "./UserButtonContent"

const Container = styled.div`
  width: 80%;
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LogoWrapper = styled(Link)`
  display: flex;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`

const NavigationWrapper = styled.div`
  padding: 1rem 0;
`

export const Navigation: FC = observer(() => {
  const {
    authStore: { authUser: user },
    rootViewStore,
  } = useStores()
  const [_, navigate] = useLocation()

  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper href="/community">
          <a>
            <img src="logo-white.svg" style={{ height: "1.7rem" }} />
          </a>
        </LogoWrapper>
        <UserButtonContent
          user={user}
          onClickSignIn={() => {
            rootViewStore.openSignInDialog = true
          }}
          onClickSignOut={async () => {
            await auth.signOut()
          }}
          onClickProfile={() => {
            navigate("/profile")
          }}
        />
      </Container>
    </NavigationWrapper>
  )
})
