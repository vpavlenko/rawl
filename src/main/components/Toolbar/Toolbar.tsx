import styled from "@emotion/styled"
import { AppBar, Toolbar as MaterialToolbar } from "@mui/material"
import { FC } from "react"

const StyledAppBar = styled(AppBar)`
  background: ${({ theme }) => theme.backgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
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
