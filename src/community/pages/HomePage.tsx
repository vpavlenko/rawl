import styled from "@emotion/styled"
import { FC } from "react"
import { BottomPlayer } from "../components/BottomPlayer"
import { Navigation } from "../components/Navigation"
import { SongList } from "../components/SongList"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Content = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  flex-basis: 0;
  padding-bottom: 2rem;
`

const Inner = styled.div`
  width: 80%;
  max-width: 60rem;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: 300%;
  margin-top: 4rem;
  margin-bottom: 2rem;
`

export const HomePage: FC = () => {
  return (
    <Container>
      <Navigation />
      <Content>
        <Inner>
          <Title>Recent Tracks</Title>
          <SongList />
        </Inner>
      </Content>
      <BottomPlayer />
    </Container>
  )
}
