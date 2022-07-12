import styled from "@emotion/styled"
import { CloudOutlined, KeyboardArrowDown } from "@mui/icons-material"
import { Divider, Menu, MenuItem } from "@mui/material"
import Color from "color"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { localized } from "../../../common/localize/localizedString"
import { hasFSAccess } from "../../actions/file"
import { useStores } from "../../hooks/useStores"
import { CloudFileMenu } from "./CloudFileMenu"
import { FileMenu } from "./FileMenu"
import { LegacyFileMenu } from "./LegacyFileMenu"
import { Tab } from "./Navigation"

const StyledMenu = styled(Menu)`
  .MuiList-root {
    background: ${({ theme }) =>
      Color(theme.backgroundColor).lighten(0.2).hex()};
  }
`

export const FileMenuButton: FC = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    exportStore,
    authStore: { user },
  } = rootStore
  const isOpen = rootViewStore.openDrawer
  const handleClose = () => (rootViewStore.openDrawer = false)

  const onClickExport = () => {
    handleClose()
    exportStore.openExportDialog = true
  }

  const ref = useRef<HTMLDivElement>(null)

  return (
    <>
      <Tab
        ref={ref}
        onClick={useCallback(() => (rootViewStore.openDrawer = true), [])}
        id="tab-file"
      >
        <span style={{ marginLeft: "0.25rem" }}>
          {localized("file", "File")}
        </span>
        <KeyboardArrowDown style={{ width: "1rem", marginLeft: "0.25rem" }} />
      </Tab>

      <StyledMenu
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorEl={ref.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration={50}
        disableAutoFocusItem={true}
      >
        {user === null && hasFSAccess && <FileMenu close={handleClose} />}

        {user === null && !hasFSAccess && (
          <LegacyFileMenu close={handleClose} />
        )}

        {user && <CloudFileMenu close={handleClose} />}

        {user === null && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                handleClose()
                rootViewStore.openSignInDialog = true
              }}
            >
              <CloudOutlined sx={{ marginRight: "0.5em" }} />
              {localized("please-sign-up", "Sign up to use Cloud Save")}
            </MenuItem>
          </>
        )}

        <Divider />

        <MenuItem onClick={onClickExport}>
          {localized("export-audio", "Export Audio")}
        </MenuItem>
      </StyledMenu>
    </>
  )
})
