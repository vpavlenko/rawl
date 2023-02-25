import { FC } from "react"
import { ContextMenu, ContextMenuProps } from "../../../components/ContextMenu"
import { Localized } from "../../../components/Localized"
import { MenuItem } from "../../../components/Menu"

export type TrackListContextMenuProps = ContextMenuProps & {
  onClickAdd: () => void
  onClickDelete: () => void
  onClickProperty: () => void
  onClickChangeTrackColor: () => void
}

export const TrackListContextMenu: FC<TrackListContextMenuProps> = ({
  onClickAdd,
  onClickDelete,
  onClickProperty,
  onClickChangeTrackColor,
  ...props
}) => {
  const { handleClose } = props
  return (
    <ContextMenu {...props}>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickAdd()
          handleClose()
        }}
      >
        <Localized default="Add track">add-track</Localized>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickDelete()
          handleClose()
        }}
      >
        <Localized default="Delete track">delete-track</Localized>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickProperty()
          handleClose()
        }}
      >
        <Localized default="Property">property</Localized>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickChangeTrackColor()
          handleClose()
        }}
      >
        <Localized default="Change track color">change-track-color</Localized>
      </MenuItem>
    </ContextMenu>
  )
}
