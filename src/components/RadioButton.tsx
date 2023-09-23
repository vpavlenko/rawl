import styled from "@emotion/styled"
import CircleIcon from "mdi-react/CircleIcon"
import { FC } from "react"

const Button = styled.div`
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
`

const CheckIcon = styled(CircleIcon)`
  fill: ${({ theme }) => theme.textColor};
  width: 0.7rem;
  height: 0.7rem;
`

const RowWrapper = styled.div`
  display: flex;
  padding: 0.5rem 0;
  align-items: center;

  &:hover ${Button} {
    border-color: ${({ theme }) => theme.secondaryTextColor};
  }
`

const RowLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

export interface RadioButtonProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

export const RadioButton: FC<RadioButtonProps> = ({
  label,
  isSelected,
  onClick,
}) => {
  return (
    <RowWrapper onClick={onClick}>
      <Button>{isSelected && <CheckIcon />}</Button>
      <RowLabel>{label}</RowLabel>
    </RowWrapper>
  )
}
