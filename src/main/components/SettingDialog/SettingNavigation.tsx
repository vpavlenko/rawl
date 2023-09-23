import styled from "@emotion/styled"
import { FC } from "react"
import { Button } from "../../../components/Button"
import { Localized } from "../../../components/Localized"

export type SettingRoute = "general" | "midi" | "soundfont"
const routes: SettingRoute[] = ["general", "midi", "soundfont"]

const RouteItem = styled(Button)<{ selected: boolean }>`
  display: flex;
  font-size: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
  background: ${({ theme, selected }) =>
    selected ? theme.highlightColor : "inherit"};
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 8em;
  margin-right: 2rem;
`

const RouteName: FC<{ route: SettingRoute }> = ({ route }) => {
  switch (route) {
    case "general":
      return <Localized default="General">general</Localized>
    case "midi":
      return <Localized default="MIDI">midi</Localized>
    case "soundfont":
      return <Localized default="SoundFont">soundfont</Localized>
  }
}

export const SettingNavigation: FC<{
  route: SettingRoute
  onChange: (route: SettingRoute) => void
}> = ({ route, onChange }) => {
  return (
    <Container>
      {routes.map((r) => (
        <RouteItem selected={route === r} onClick={() => onChange(r)}>
          <RouteName key={r} route={r} />
        </RouteItem>
      ))}
    </Container>
  )
}
