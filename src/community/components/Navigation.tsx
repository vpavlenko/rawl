import styled from "@emotion/styled"
import { FC } from "react"
import { auth } from "../../firebase/firebase"
import { UserButtonContent } from "../../main/components/Navigation/UserButtonContent"
import { useStores } from "../hooks/useStores"

const Container = styled.div`
  width: 80%;
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LogoWrapper = styled.a`
  display: flex;

  &:hover {
    opacity: 0.7;
  }
`

const NavigationWrapper = styled.div`
  padding: 1rem 0;
`

export const Navigation: FC = () => {
  const {
    authStore: { user },
  } = useStores()

  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper href="/">
          <img src="logo-white.svg" style={{ height: "1.7rem" }} />
        </LogoWrapper>
        <UserButtonContent
          user={user}
          onClickSignIn={() => {}}
          onClickSignOut={async () => {
            await auth.signOut()
          }}
        />
      </Container>
    </NavigationWrapper>
  )
}
