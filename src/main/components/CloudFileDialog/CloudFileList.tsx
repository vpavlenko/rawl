import styled from "@emotion/styled"
import { QueryDocumentSnapshot } from "firebase/firestore"
import ArrowDownward from "mdi-react/ArrowDownwardIcon"
import ArrowDropDown from "mdi-react/ArrowDropDownIcon"
import ArrowUpward from "mdi-react/ArrowUpwardIcon"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { CircularProgress } from "../../../components/CircularProgress"
import { IconButton } from "../../../components/IconButton"
import { Localized } from "../../../components/Localized"
import { Menu, MenuItem } from "../../../components/Menu"
import { FirestoreSong, loadSong } from "../../../firebase/song"
import { setSong } from "../../actions"
import { useLocalization } from "../../hooks/useLocalization"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { useToast } from "../../hooks/useToast"
import { CloudFileRow } from "./CloudFileRow"

const ArrowUp = styled(ArrowUpward)`
  width: 1.1rem;
  height: 1.1rem;
`

const ArrowDown = styled(ArrowDownward)`
  width: 1.1rem;
  height: 1.1rem;
`

const HeaderCell = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.backgroundColor};
  font-weight: ${({ isSelected }: { isSelected?: boolean }) =>
    isSelected ? "bold" : "normal"};
  cursor: pointer;
  padding: 0 1rem;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const NameCell = styled(HeaderCell)`
  flex-grow: 1;
`

const DateCell = styled(HeaderCell)`
  width: 12rem;
`

const MenuCell = styled(HeaderCell)`
  width: 4rem;
`

const Body = styled.div`
  max-height: 20rem;
  overflow-y: auto;

  tr:hover td {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const SortButton: FC<{ sortAscending: boolean }> = ({ sortAscending }) =>
  sortAscending ? <ArrowDown /> : <ArrowUp />

const Container = styled.div``

const Header = styled.div`
  display: flex;
  height: 2.5rem;
`

export const CloudFileList = observer(() => {
  const rootStore = useStores()
  const { cloudFileStore, rootViewStore } = rootStore
  const toast = useToast()
  const theme = useTheme()
  const localized = useLocalization()
  const { isLoading, dateType, files, selectedColumn, sortAscending } =
    cloudFileStore

  useEffect(() => {
    cloudFileStore.load()
  }, [])

  const onClickSong = async (song: QueryDocumentSnapshot<FirestoreSong>) => {
    try {
      const midiSong = await loadSong(song)
      setSong(rootStore)(midiSong)
      rootViewStore.openCloudFileDialog = false
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  if (isLoading) {
    return <CircularProgress />
  }

  const sortLabel = (() => {
    switch (dateType) {
      case "created":
        return localized("created-date", "Created")
      case "updated":
        return localized("modified-date", "Modified")
    }
  })()

  return (
    <Container>
      <Header>
        <NameCell
          onClick={() => {
            if (cloudFileStore.selectedColumn === "name") {
              cloudFileStore.sortAscending = !cloudFileStore.sortAscending
            } else {
              cloudFileStore.selectedColumn = "name"
            }
          }}
          isSelected={selectedColumn === "name"}
        >
          <Localized default="Name">name</Localized>
          <div style={{ width: "0.5rem" }}></div>
          {selectedColumn === "name" && (
            <SortButton sortAscending={sortAscending} />
          )}
        </NameCell>
        <DateCell
          onClick={() => {
            if (cloudFileStore.selectedColumn === "date") {
              cloudFileStore.sortAscending = !cloudFileStore.sortAscending
            } else {
              cloudFileStore.selectedColumn = "date"
            }
          }}
          isSelected={selectedColumn === "date"}
        >
          {sortLabel}
          <Menu
            trigger={
              <IconButton
                style={{
                  marginLeft: "0.2em",
                }}
              >
                <ArrowDropDown style={{ fill: theme.secondaryTextColor }} />
              </IconButton>
            }
          >
            <MenuItem onClick={() => (cloudFileStore.dateType = "created")}>
              <Localized default="Created">created-date</Localized>
            </MenuItem>
            <MenuItem onClick={() => (cloudFileStore.dateType = "updated")}>
              <Localized default="Modified">modified-date</Localized>
            </MenuItem>
          </Menu>
          {selectedColumn === "date" && (
            <SortButton sortAscending={sortAscending} />
          )}
        </DateCell>
        <MenuCell></MenuCell>
      </Header>
      <Body>
        {files.map((song) => (
          <CloudFileRow
            song={song}
            dateType={dateType}
            onClick={() => onClickSong(song)}
          />
        ))}
      </Body>
    </Container>
  )
})
