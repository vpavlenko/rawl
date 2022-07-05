import styled from "@emotion/styled"
import { FC } from "react"

export const Toolbar: FC<React.PropsWithChildren<unknown>> = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;

  background: ${({ theme }) => theme.backgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
`
