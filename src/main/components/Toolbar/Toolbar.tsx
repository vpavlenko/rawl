import { AppBar, Toolbar as MaterialToolbar } from "@mui/material"
import { FC } from "react"
import styled from "styled-components"

const StyledAppBar = styled(AppBar)`
  background: var(--background-color);
  border-bottom: 1px solid var(--divider-color);
`

const StyledToolbar = styled(MaterialToolbar)`
  .title {
    marginright: 1rem;
  }
`

export const Toolbar: FC = ({ children }) => {
  return (
    <StyledAppBar position="static" elevation={0}>
      <StyledToolbar variant="dense">{children}</StyledToolbar>
    </StyledAppBar>
  )
}
