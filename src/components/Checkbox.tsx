import styled from "@emotion/styled"
import { Check } from "@mui/icons-material"
import { CheckboxProps, Indicator, Root } from "@radix-ui/react-checkbox"
import { FC } from "react"

const StyledRoot = styled(Root)`
  border: 1px solid ${({ theme }) => theme.dividerColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ theme }) => theme.secondaryTextColor};
  }
`

const StyledIndicator = styled(Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckIcon = styled(Check)`
  fill: ${({ theme }) => theme.textColor};
  width: 1rem;
  height: 1rem;
`

export const Checkbox: FC<CheckboxProps> = (props) => (
  <StyledRoot {...props}>
    <StyledIndicator>
      <CheckIcon />
    </StyledIndicator>
  </StyledRoot>
)
