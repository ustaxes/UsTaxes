import React from 'react'
import { Box, createMuiTheme, ThemeProvider } from "@material-ui/core"
import {
    Switch,
    Route
} from "react-router-dom";
import W2EmployerInfo from './w2EmployerInfo'
import W2EmployeeInfo from './w2EmployeeInfo'
import ResponsiveDrawer from './menu'

const theme = createMuiTheme({
    palette: {
        secondary: {
            light: '#4f5b62',
            main: '#263238',
            dark: '#000a12',
            contrastText: '#ffffff',
        },
        primary: {
            light: '#66ffa6',
            main: '#00e676',
            dark: '#00b248',
            contrastText: '#000000',
        },
    },
})

export default function W2() {

    return (
        <ThemeProvider theme={theme}>
            <ResponsiveDrawer/>
            <Box display="flex" justifyContent="center">
                <Box display="flex" justifyContent="flex-start">
                    <h1>Wages (Form W-2)</h1>
                </Box>
            </Box>
            <Switch>
                <Route path="/w2employerinfo" exact>
                    <W2EmployerInfo />
                </Route>
                <Route path="/w2employeeinfo" exact>
                    <W2EmployeeInfo/>
                </Route>
            </Switch>
        </ThemeProvider>
  )
}