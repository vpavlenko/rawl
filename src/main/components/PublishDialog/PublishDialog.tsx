import styled from "@emotion/styled"
import OpenInNewIcon from "mdi-react/OpenInNewIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useState } from "react"
import { useLocalization } from "../../../common/localize/useLocalization"
import { useAsyncEffect } from "../../../community/hooks/useAsyncEffect"
import { Alert } from "../../../components/Alert"
import { Button, PrimaryButton } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { LinkShare } from "../../../components/LinkShare"
import { Localized } from "../../../components/Localized"
import { publishSong, unpublishSong } from "../../actions/cloudSong"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { useToast } from "../../hooks/useToast"

type PublishState = "publishable" | "published" | "notPublishable"

export const PublishDialog: FC = observer(() => {
  const rootStore = useStores()
  const { rootViewStore, cloudSongRepository } = rootStore
  const { openPublishDialog: open } = rootViewStore
  const [publishState, setPublishState] =
    useState<PublishState>("notPublishable")
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()
  const theme = useTheme()
  const localized = useLocalization()

  useAsyncEffect(async () => {
    if (open) {
      setIsLoading(true)
      const cloudSongId = rootStore.song.cloudSongId
      if (cloudSongId === null) {
        setPublishState("notPublishable")
        setIsLoading(false)
        return
      }
      const cloudSong = await cloudSongRepository.get(cloudSongId)
      cloudSong?.isPublic
        ? setPublishState("published")
        : setPublishState("publishable")
      setIsLoading(false)
    }
  }, [open])

  const onClose = useCallback(
    () => (rootViewStore.openPublishDialog = false),
    [rootViewStore],
  )

  const onClickPublish = async () => {
    const { song, userRepository } = rootStore
    try {
      setIsLoading(true)
      const user = await userRepository.getCurrentUser()
      if (user === null) {
        throw new Error("Failed to get current user, please re-sign in")
      }
      await publishSong(rootStore)(song, user)
      setPublishState("published")
      toast.success(localized("song-published", "Song published"))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const onClickUnpublish = async () => {
    const { song } = rootStore
    try {
      setIsLoading(true)
      await unpublishSong(rootStore)(song)
      setPublishState("publishable")
      toast.success(localized("song-unpublished", "Song unpublished"))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized default="Publish Song">publish-song</Localized>
      </DialogTitle>
      <DialogContent>
        {publishState === "publishable" && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <Localized default="Publishing your song makes it available for other users to listen to.">
                publish-notice
              </Localized>
            </div>
            <Alert severity="warning">
              <Localized default="Important Notice: On this site, we only permit the posting of music that you have created yourself. In compliance with copyright laws, please ensure that you are the copyright holder or have explicit permission for any music you post. Unauthorized publication of others' music or copyright-protected works is legally prohibited. If such violations are detected, your post may be removed, and restrictions may be placed on your account. We encourage you to share creative and original works and contribute to the healthy growth of our community.">
                publish-rules
              </Localized>
            </Alert>
          </>
        )}
        {publishState === "published" &&
          rootStore.song.cloudSongId !== null && (
            <>
              <SongLink
                href={getCloudSongUrl(rootStore.song.cloudSongId)}
                target="_blank"
              >
                <Localized default="Your song is published and available for other users to listen to.">
                  published-notice
                </Localized>
                <OpenInNewIcon color={theme.secondaryTextColor} size="1rem" />
              </SongLink>
              <LinkShare
                url={getCloudSongUrl(rootStore.song.cloudSongId)}
                text={localized(
                  "share-my-song-text",
                  "🎶 Just created a new track on signal! 🎹✨\nListen to my latest MIDI composition! 🎧👇\n#midi #signalmidi @signalmidi",
                )}
              />
              <Divider />
            </>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
        {publishState === "publishable" && (
          <PrimaryButton onClick={onClickPublish} disabled={isLoading}>
            <Localized default="Publish">publish</Localized>
          </PrimaryButton>
        )}
        {publishState === "published" && (
          <PrimaryButton onClick={onClickUnpublish} disabled={isLoading}>
            <Localized default="Unpublish">unpublish</Localized>
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  )
})

const SongLink = styled.a`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.textColor};
  text-decoration: none;
  margin-bottom: 1rem;

  &:hover {
    opacity: 0.8;
  }
`

const Divider = styled.div`
  margin: 1rem 0 0 0;
  height: 1px;
  background: ${({ theme }) => theme.dividerColor};
`

const getCloudSongUrl = (cloudSongId: string) =>
  `${window.location.origin}/songs/${cloudSongId}`
