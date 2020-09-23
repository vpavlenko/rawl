import React, { FC } from "react"

import NavigationBar from "components/groups/NavigationBar"

import { TempoGraph } from "./TempoGraph"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const TempoEditor: FC = () => {
  const stores = useStores()
  const onClickNavBack = () => (stores.rootStore.router.path = "/track")
  return (
    <Container>
      <NavigationBar title="Tempo" onClickBack={onClickNavBack} />
      <TempoGraph />
    </Container>
  )
}
