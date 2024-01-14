import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { Alert } from "../../components/Alert"
import { CircularProgress } from "../../components/CircularProgress"
import { Localized } from "../../components/Localized"
import { useToast } from "../../main/hooks/useToast"
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
  const toast = useToast()

  useAsyncEffect(async () => {
    try {
      const user = await userRepository.get(userId)
      setUser(user)
      setIsLoading(false)
    } catch (e) {
      toast.error(`Failed to load user profile: ${(e as Error)?.message}`)
    }
  }, [])

  if (isLoading) {
    return (
      <PageLayout>
        <PageTitle>User</PageTitle>
        <CircularProgress /> Loading...
      </PageLayout>
    )
  }

  if (user === null) {
    return (
      <PageLayout>
        <PageTitle>User</PageTitle>
        <Alert severity="warning">
          <Localized default="User not found">user-not-found</Localized>
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageTitle>{user.name}</PageTitle>
      <Bio>{user.bio}</Bio>
      <SectionTitle>
        <Localized default="Tracks">tracks</Localized>
      </SectionTitle>
      <UserSongList userId={userId} />
    </PageLayout>
  )
})
