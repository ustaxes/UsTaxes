import { ReactElement, useState } from 'react'
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  makeStyles
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  tabs: {
    minHeight: 36
  },
  tab: {
    minHeight: 36,
    fontSize: 12,
    textTransform: 'none'
  },
  list: {
    paddingTop: 0
  }
}))

type TabPanelProps = {
  index: number
  value: number
  children: ReactElement | ReactElement[]
}

const TabPanel = ({ index, value, children }: TabPanelProps): ReactElement => {
  if (value !== index) return <></>
  return <Box marginTop={2}>{children}</Box>
}

const TaxWiseRightPanel = (): ReactElement => {
  const classes = useStyles()
  const [tab, setTab] = useState(0)

  return (
    <div className={classes.root}>
      <Typography variant="subtitle2">Reference</Typography>
      <Tabs
        value={tab}
        onChange={(_, value) => {
          const nextTab = typeof value === 'number' ? value : 0
          setTab(nextTab)
        }}
        indicatorColor="primary"
        textColor="primary"
        className={classes.tabs}
      >
        <Tab label="Help" className={classes.tab} />
        <Tab label="Diagnostics" className={classes.tab} />
        <Tab label="Docs" className={classes.tab} />
      </Tabs>
      <Divider />
      <TabPanel index={0} value={tab}>
        <>
          <Typography variant="body2" color="textSecondary">
            IRS guidance and inline tips will surface here based on the active
            section.
          </Typography>
          <List className={classes.list}>
            <ListItem>
              <ListItemText primary="Tip: Capture employer EIN exactly as shown on W-2." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Check filing status before entering dependents." />
            </ListItem>
          </List>
        </>
      </TabPanel>
      <TabPanel index={1} value={tab}>
        <>
          <Typography variant="body2" color="textSecondary">
            Diagnostics highlight missing or inconsistent data.
          </Typography>
          <List className={classes.list}>
            <ListItem>
              <ListItemText primary="Missing SSN for dependent on 2024 return." />
            </ListItem>
            <ListItem>
              <ListItemText primary="DOB required for Earned Income Credit." />
            </ListItem>
          </List>
        </>
      </TabPanel>
      <TabPanel index={2} value={tab}>
        <>
          <Typography variant="body2" color="textSecondary">
            Track received documents for the return packet.
          </Typography>
          <List className={classes.list}>
            <ListItem>
              <ListItemText primary="W-2 (Acme Holdings LLC)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="1099-INT (Fidelity)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Driver license / ID" />
            </ListItem>
          </List>
        </>
      </TabPanel>
    </div>
  )
}

export default TaxWiseRightPanel
