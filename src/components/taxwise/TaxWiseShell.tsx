import {
  ReactElement,
  PropsWithChildren,
  useMemo,
  useState,
  useEffect
} from 'react'
import {
  AppBar,
  Box,
  Chip,
  CssBaseline,
  Drawer,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
  makeStyles,
  useMediaQuery,
  Theme
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYears } from 'ustaxes/core/data'
import TaxWiseNav from './TaxWiseNav'
import TaxWiseRightPanel from './TaxWiseRightPanel'
import { TaxWiseSection } from './routes'
import { useAutosave } from './useAutosave'

const drawerWidth = 240
const panelWidth = 320

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: '#12263a',
    color: '#f9fbfd'
  },
  toolbar: {
    minHeight: 48,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  nav: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth,
    borderRight: '1px solid #e4e8f0'
  },
  content: {
    flex: 1,
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3),
    minWidth: 0
  },
  panel: {
    width: panelWidth,
    flexShrink: 0,
    borderLeft: '1px solid #e4e8f0',
    backgroundColor: theme.palette.background.paper
  },
  panelDrawer: {
    width: panelWidth
  },
  toolSpacer: {
    minHeight: 48
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  statusChip: {
    backgroundColor: '#2e7d32',
    color: '#ffffff',
    fontWeight: 600
  },
  progress: {
    width: 140
  },
  progressTrack: {
    height: 6,
    borderRadius: 4
  },
  progressBar: {
    borderRadius: 4
  },
  saveStatus: {
    fontSize: 12,
    color: '#dce6f2'
  }
}))

type TaxWiseShellProps = PropsWithChildren<{
  sections: TaxWiseSection[]
}>

const TaxWiseShell = ({
  sections,
  children
}: TaxWiseShellProps): ReactElement => {
  const classes = useStyles()
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const [navOpen, setNavOpen] = useState(!isMobile)
  const [panelOpen, setPanelOpen] = useState(false)

  const activeYear = useSelector((state: YearsTaxesState) => state.activeYear)

  const progressValue = useMemo(() => 38, [])
  const returnStatus = useMemo(() => 'Draft', [])
  const saveStatus = useAutosave()
  const saveLabel = saveStatus === 'saving' ? 'Saving...' : 'Saved'

  useEffect(() => {
    setNavOpen(!isMobile)
  }, [isMobile])

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <div className={classes.headerRow}>
            {isMobile ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open navigation"
                onClick={() => setNavOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Typography variant="subtitle1">
              UsTaxes Pro · {TaxYears[activeYear]} Return
            </Typography>
            <div className={classes.grow} />
            <Typography className={classes.saveStatus}>{saveLabel}</Typography>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              className={classes.progress}
              classes={{
                root: classes.progressTrack,
                bar: classes.progressBar
              }}
            />
            <Chip
              size="small"
              label={returnStatus}
              className={classes.statusChip}
            />
            <IconButton
              color="inherit"
              aria-label="open help and diagnostics panel"
              onClick={() => setPanelOpen(true)}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <nav className={classes.nav} aria-label="return navigation">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor="left"
          open={navOpen}
          onClose={() => setNavOpen(false)}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          <div className={classes.toolSpacer} />
          <TaxWiseNav
            sections={sections}
            onNavigate={() => setNavOpen(false)}
          />
        </Drawer>
      </nav>
      <main className={classes.content} tabIndex={-1}>
        <div className={classes.toolSpacer} />
        {children}
      </main>
      {isMobile ? (
        <Drawer
          anchor="right"
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          classes={{ paper: classes.panelDrawer }}
        >
          <div className={classes.toolSpacer} />
          <TaxWiseRightPanel />
        </Drawer>
      ) : (
        <Box className={classes.panel}>
          <div className={classes.toolSpacer} />
          <TaxWiseRightPanel />
        </Box>
      )}
    </div>
  )
}

export default TaxWiseShell
