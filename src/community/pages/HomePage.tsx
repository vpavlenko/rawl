import styled from "@emotion/styled"
import { FC } from "react"
import { BottomPlayer } from "../components/BottomPlayer"
import { SongList } from "../components/SongList"
import { PageLayout } from "../layouts/PageLayout"

const Title = styled.h1`
  font-size: 300%;
  margin-top: 4rem;
  margin-bottom: 2rem;
`

export const HomePage: FC = () => {
  return (
    <PageLayout bottom={<BottomPlayer />}>
      <Title>Recent Tracks</Title>
      <SongList />
    </PageLayout>
  )
}
