import React, { useEffect } from 'react'
import { Box } from "@material-ui/core"
import fillPDF from '../pdfFiller/fill1040Fields'

export default function CreatePDF() {
    useEffect(() => {
        console.log('blah')
        const createPDF = async () => {
            const PDF = await fillPDF()
            const blob = new Blob([PDF], { type: 'application/pdf' });
            const blobURL = URL.createObjectURL(blob);
            window.open(blobURL)
        }
        createPDF()
    });
    
    return (
        <Box display="flex" justifyContent="center">
            <Box display="flex" justifyContent="flex-start">
                <h2>Employee Information</h2>
            </Box>
        </Box>
    )
}