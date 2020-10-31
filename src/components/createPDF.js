import React from 'react'
import { Button, Box } from "@material-ui/core"
import { createPDFPopup } from '../pdfFiller/fill1040Fields'

export default function CreatePDF() {
    return (
        <Box display="flex" justifyContent="center">
            <Box display="flex" justifyContent="flex-start">
                <form>
                    <h2>Print Your Copy to File</h2>
                    <Button onClick={createPDFPopup} variant="contained" color="primary">
                        Create PDF
                    </Button>
                </form>
            </Box>
        </Box>
    )
}