import {
  AppBar,
  makeStyles,
  Toolbar as MaterialToolbar,
} from "@material-ui/core"
import { FC } from "react"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
}))

export const Toolbar: FC = ({ children }) => {
  const classes = useStyles({})

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <MaterialToolbar variant="dense">{children}</MaterialToolbar>
    </AppBar>
  )
}
