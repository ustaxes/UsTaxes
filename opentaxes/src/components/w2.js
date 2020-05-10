import React from 'react'
import { Box, createMuiTheme, ThemeProvider } from "@material-ui/core"
import  W2EmployerInfo from './w2EmployerInfo'

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
});

export default function W2() {

    return (
        <ThemeProvider theme={theme}>
            <Box display="flex" justifyContent="center">
                <Box display="flex" justifyContent="flex-start">
                    <h1>Wages (Form W-2)</h1>
                </Box>
            </Box>
            <W2EmployerInfo/>
        </ThemeProvider>
  )
}