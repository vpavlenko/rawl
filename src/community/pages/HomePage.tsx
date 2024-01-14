import { FC } from "react"
import { Localized } from "../../components/Localized"
import { RecentSongList } from "../components/RecentSongList"
import { PageLayout, PageTitle } from "../layouts/PageLayout"

export const HomePage: FC = () => {
  return (
    <PageLayout>
      <PageTitle>
        <Localized default="Recent Tracks">recent-tracks</Localized>
      </PageTitle>
      <RecentSongList />
    </PageLayout>
  )
}
