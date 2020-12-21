import React from 'react'
import { Button, Box } from "@material-ui/core"
import { createPDFPopup } from '../pdfFiller/fill1040Fields'
import { Link } from "react-router-dom"

export default function CreatePDF() {
    return (
        <Box display="flex" justifyContent="center">
            <form>
                <Box display="flex" justifyContent="flex-start">   
                    <h2>Print Copy to File</h2>
                </Box>

                <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
                    <Box display="flex" justifyContent="flex-start" paddingRight={2}>
                        <Button component={Link} to={"familyinfo"} variant="contained" color="secondary" >
                            Back
                        </Button>
                    </Box>

                    <Button onClick={createPDFPopup} variant="contained" color="primary">
                        Create PDF
                    </Button>
                </Box>
            </form>
        </Box>
    )
}