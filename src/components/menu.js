import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    NavLink,
    useLocation
} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

function ResponsiveDrawer(props) {
    const location = useLocation()
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <h2>
                <strong>
                    Wages
                </strong>
            </h2>
            <Divider />
            <List>
                    <ListItem 
                        button 
                        key='Employer Information'
                        component={NavLink}
                        exact activeClassName="current"
                        to="/w2employerinfo"
                        selected={location.pathname === "/w2employerinfo"}
                    >
                        <ListItemText primary='Employer Information' />
                    </ListItem>
                
                    <ListItem 
                        button 
                        key='Employee Information'
                        component={NavLink} 
                        exact activeClassName="current"
                        to="/w2employeeinfo"
                        selected={location.pathname === "/w2employeeinfo"}
                    >
                        <ListItemText primary='Employee Information' />
                    </ListItem>

                    
                    <ListItem 
                        button 
                        key='Income'
                        component={NavLink} 
                        exact activeClassName="current"
                        to="/w2income"
                        selected={location.pathname === "/w2income"}
                    >
                        <ListItemText primary='Income' />
                    </ListItem>
                    <Divider />
                    <ListItem
                        button
                        key='Submit'
                        component={NavLink}
                        exact activeClassName="current"
                        to="/createPDF"
                        selected={location.pathname === "/createPDF"}
                    >
                        <ListItemText primary='Review and Print' />
                    </ListItem>
            </List>
        </div>
    );

    return (
        <div className={classes.root}>
            <nav className={classes.drawer} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        </div>
    );
}

export default ResponsiveDrawer;
