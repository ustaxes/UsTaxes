import React from 'react'
import { Box, Paper } from "@material-ui/core"
import  W2EmployerInfo from './w2EmployerInfo'

export default function W2() {

    return (
        <div>
            <Box display="flex" justifyContent="center">
                <Box display="flex" justifyContent="flex-start">
                    <h1>Capital One Services LLC Wages (Form W-2)</h1>
                </Box>
            </Box>
            <W2EmployerInfo/>
        </div>
  )
}