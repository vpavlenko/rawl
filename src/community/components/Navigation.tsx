import styled from "@emotion/styled"
import Color from "color"
import PlusIcon from "mdi-react/PlusIcon"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Link } from "wouter"
import { Localized } from "../../components/Localized"
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
  display: flex;
  align-items: center;
  height: 5rem;
`

const Right = styled.div`
  display: flex;
  align-items: center;
`

const CreateButton = styled.a`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0.2rem;
  color: ${({ theme }) => theme.textColor};
  padding: 0 0.5rem;
  cursor: pointer;
  height: 2rem;
  outline: none;
  font-size: 0.8rem;
  text-decoration: none;
  font-weight: 600;
  margin-right: 1rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
  &:active {
    background: ${({ theme }) =>
      Color(theme.secondaryBackgroundColor).lighten(0.1).hex()};
  }
`

export const Navigation: FC = observer(() => {
  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper>
          <Link href="/home">
            <img src="logo-white.svg" style={{ height: "1.7rem" }} />
          </Link>
        </LogoWrapper>
        <Right>
          <CreateButton href="/edit" target="_blank">
            <PlusIcon size="1rem" style={{ marginRight: "0.5rem" }} />
            <Localized default="Create New">create-new</Localized>
          </CreateButton>
          <UserButton />
        </Right>
      </Container>
    </NavigationWrapper>
  )
})
