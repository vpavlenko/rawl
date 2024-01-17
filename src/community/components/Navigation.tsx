import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { UserButton } from "./UserButton"

const Container = styled.div`
  width: 80%;
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LogoWrapper = styled.div`
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
  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper>
          <a href="/">
            <img src="logo-white.svg" style={{ height: "1.7rem" }} />
          </a>
        </LogoWrapper>
        <UserButton />
      </Container>
    </NavigationWrapper>
  )
})
