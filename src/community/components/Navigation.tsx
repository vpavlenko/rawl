import styled from "@emotion/styled"
import { FC } from "react"

const Container = styled.div`
  width: 80%;
  maxwidth: 60rem;
  margin: 0 auto;
`

const LogoWrapper = styled.a`
  display: flex;

  > img {
    height: 1.7rem;
  }

  &:hover {
    opacity: 0.7;
  }
`

const NavigationWrapper = styled.div`
  background: ${({ theme }) => theme.themeColor};
  padding: 1rem 0;
`

export const Navigation: FC = () => {
  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper href="/">
          <img src="logo-white.svg" />
        </LogoWrapper>
      </Container>
    </NavigationWrapper>
  )
}
