import styled from "@emotion/styled"
import { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { EmotionThemeProvider } from "../../main/components/Theme/EmotionThemeProvider"
import { GlobalCSS } from "../../main/components/Theme/GlobalCSS"
import { MuiThemeProvider } from "../../main/components/Theme/MuiThemeProvider"
import { Navigation } from "./Navigation"
import { SongList } from "./SongList"

const Container = styled.div`
  width: 80%;
  maxwidth: 60rem;
  margin: 0 auto;
`

const RootView: FC = () => {
  return (
    <>
      <Navigation />
      <Container>
        <h1 style={{ marginTop: "4rem", marginBottom: "2rem" }}>
          Community Tracks
        </h1>
        <SongList />
      </Container>
    </>
  )
}

export const App: FC = () => {
  return (
    <MuiThemeProvider>
      <EmotionThemeProvider>
        <HelmetProvider>
          <GlobalCSS />
          <RootView />
        </HelmetProvider>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  )
}
