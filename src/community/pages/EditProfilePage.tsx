import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { Alert } from "../../components/Alert"
import { PrimaryButton } from "../../components/Button"
import { CircularProgress } from "../../components/CircularProgress"
import { Localized } from "../../components/Localized"
import { TextArea } from "../../components/TextArea"
import { TextField } from "../../components/TextField"
import { useToast } from "../../main/hooks/useToast"
import { useAsyncEffect } from "../hooks/useAsyncEffect"
import { useStores } from "../hooks/useStores"
import { PageLayout, PageTitle } from "../layouts/PageLayout"

const Form = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
`

const Action = styled.div`
  margin-top: 1rem;
`

export const EditProfilePage: FC = observer(() => {
  const {
    authStore: { authUser },
    userRepository,
  } = useStores()

  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const toast = useToast()

  useAsyncEffect(async () => {
    if (authUser) {
      try {
        const user = await userRepository.getCurrentUser()
        if (user !== null) {
          setName(user.name)
          setBio(user.bio)
        } else {
          const newUserData = {
            name: authUser.displayName ?? "",
            bio: "",
          }
          await userRepository.create(newUserData)
          setName(newUserData.name)
          setBio(newUserData.bio)
        }
        setIsLoading(false)
      } catch (e) {
        toast.error(`Failed to load user profile: ${(e as Error)?.message}`)
      }
    }
  }, [authUser])

  const onClickSave = async () => {
    try {
      await userRepository.update({
        name,
        bio,
      })
      toast.success("Successfully updated profile")
    } catch (e) {
      toast.error(`Failed to update profile: ${(e as Error)?.message}`)
    }
  }

  if (!authUser) {
    return (
      <PageLayout>
        <PageTitle>
          <Localized default="Edit Profile">edit-profile</Localized>
        </PageTitle>
        <Alert severity="warning">
          <Localized default="Please sign in to edit your profile">
            signin-to-edit-profile
          </Localized>
        </Alert>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <PageTitle>
          <Localized default="Edit Profile">edit-profile</Localized>
        </PageTitle>
        <CircularProgress />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageTitle>
        <Localized default="Edit Profile">edit-profile</Localized>
      </PageTitle>
      <Form>
        <Label>
          <Localized default="Display name">display-name</Localized>
        </Label>
        <TextField
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />

        <Label>
          <Localized default="Bio">bio</Localized>
        </Label>
        <TextArea
          value={bio}
          onChange={(e) => {
            setBio(e.target.value)
          }}
        />
        <Action>
          <PrimaryButton onClick={onClickSave}>
            <Localized default="Save">save</Localized>
          </PrimaryButton>
        </Action>
      </Form>
    </PageLayout>
  )
})
