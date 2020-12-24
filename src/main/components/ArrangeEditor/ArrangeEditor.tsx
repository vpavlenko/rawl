import React, { FC } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"
import { ArrangeToolbar } from "../ArrangeView/ArrangeToolbar"
import ArrangeView from "./ArrangeView"

interface NavItemProps {
  title: string
  onClick: () => void
}

function NavItem({ title, onClick }: NavItemProps) {
  return (
    <div className="NavItem" onClick={onClick}>
      {title}
    </div>
  )
}

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
`

export const ArrangeEditor: FC = () => {
  const { router } = useStores()

  return (
    <Container>
      <ArrangeToolbar />
      <ArrangeView />
    </Container>
  )
}
