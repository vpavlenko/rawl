import { hot } from "react-hot-loader/root"
import React, { FC } from "react"
import { compose } from "recompose"
import { PianoRollEditor } from "containers/PianoRollEditor/PianoRollEditor"
import { BuildInfo } from "main/components/BuildInfo"
import { Drawer } from "../../components/Drawer/Drawer"
import { TransportPanel } from "main/components/TransportPanel/TransportPanel"
import styled from "styled-components"

import "./Resizer.css"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const RootView: FC = () => (
  <Container>
    <Drawer />
    <PianoRollEditor />
    <TransportPanel />
    <BuildInfo />
  </Container>
)

export default compose(hot)(RootView)
