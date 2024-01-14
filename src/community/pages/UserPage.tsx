import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { CircularProgress } from "../../components/CircularProgress"
import { Localized } from "../../components/Localized"
import { User } from "../../repositories/IUserRepository"
import { UserSongList } from "../components/UserSongList"
import { useAsyncEffect } from "../hooks/useAsyncEffect"
import { useStores } from "../hooks/useStores"
import { PageLayout, PageTitle } from "../layouts/PageLayout"

const Bio = styled.p`
  margin-top: 1rem;
`

const SectionTitle = styled.h2`
  margin-top: 2rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`

export interface UserPageProps {
  userId: string
}

export const UserPage: FC<UserPageProps> = observer(({ userId }) => {
  const { userRepository } = useStores()

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useAsyncEffect(async () => {
    const user = await userRepository.get(userId)
    setUser(user)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <PageLayout>
        <CircularProgress /> Loading...
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageTitle>{user?.name}</PageTitle>
      <Bio>{user?.bio}</Bio>
      <SectionTitle>
        <Localized default="Tracks">tracks</Localized>
      </SectionTitle>
      <UserSongList userId={userId} />
    </PageLayout>
  )
})
