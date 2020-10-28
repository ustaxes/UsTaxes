import React from 'react'
import { Button, Box } from "@material-ui/core"
import { createPDFPopup } from '../pdfFiller/fill1040Fields'

export default function CreatePDF() {
    return (
        <Box display="flex" justifyContent="center">
            <Box display="flex" justifyContent="flex-start">
                <h2>Employee Information</h2>
                <Button variant="contained" color="primary" onClick={createPDFPopup}>
                    Create PDF
                </Button>
            </Box>
        </Box>
    )
}