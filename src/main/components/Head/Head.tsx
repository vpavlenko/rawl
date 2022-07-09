import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Helmet } from "react-helmet-async"
import { useStores } from "../../hooks/useStores"

export const Head: FC = observer(() => {
  const {
    song: { name },
  } = useStores()

  return (
    <Helmet>
      <title>{name}</title>
    </Helmet>
  )
})
