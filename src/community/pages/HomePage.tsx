import { FC } from "react"
import { Localized } from "../../components/Localized"
import { SongList } from "../components/SongList"
import { PageLayout, PageTitle } from "../layouts/PageLayout"

export const HomePage: FC = () => {
  return (
    <PageLayout>
      <PageTitle>
        <Localized default="Recent Tracks">recent-tracks</Localized>
      </PageTitle>
      <SongList />
    </PageLayout>
  )
}
