import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Helmet } from "react-helmet-async"
import { useStores } from "../../hooks/useStores"

export const Head: FC = observer(() => {
  const { song } = useStores()

  return (
    <Helmet>
      <title>
        {song.name.length === 0 ? "New song" : song.name}
        {song.isSaved ? "" : " *"}
      </title>
    </Helmet>
  )
})
