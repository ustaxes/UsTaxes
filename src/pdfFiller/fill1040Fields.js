// credit for the recurseAcroFieldKids and getRootAcroFields functions goes to Andrew Dillon
// https://github.com/Hopding/pdf-lib/issues/349

import fetch from 'node-fetch'
import {
    drawImage,
    drawLinesOfText,
    drawRectangle,
    drawText,
    PDFArray,
    PDFContentStream,
    PDFDictionary,
    PDFDocument,
    PDFDocumentFactory,
    PDFDocumentWriter,
    PDFIndirectReference,
    PDFName,
    PDFNumber,
    PDFRawStream,
    PDFString,
    PDFBool,
    PDFDict,
    PDFField,
    PDFCheckBox,
    PDFAcroForm
} from 'pdf-lib'
import flatFieldMappings from './1040flatFieldMappings'
import { getAllDataFlat } from '../redux/selectors'
import { store } from '../redux/store';

function fillAcroTextField(
    // pdfDoc,
    acroField,
    // fontObject,
    text,
    // fontSize = 15,
) {
    console.log(acroField)
    acroField.setText(text)
    // set text field
    // acroField.set(PDFName.of('V'), PDFString.of(text));
    // // set font properties
    // acroField.set(PDFName.of('DA'), PDFString.of("/ZapfDingbats 10.00 Tf"))
    // // acroField.set(PDFName.of('Ff'), PDFNumber.of(
    // //     1 << 0 // Read Only
    // //     |
    // //     1 << 12 // Multiline
    // // ));
    
    // // is the field a textbox?
    // if (acroField.has(PDFName.of('AP'))){
    //     // acroField.check()
    //     // console.log( acroField.get(PDFName.of('T')).value)
    //     acroField.set(PDFName.of('V'), PDFName.of('Yes'));
    //     acroField.set(PDFName.of('AS'), PDFName.of('Yes'));
        
        // acroField.set(PDFName.of('DA'), PDFString.of("/HelveticaLTStd-Bold 10.00 Tf"))
        // acroField.get(PDFName.of('FT')).get(PDFName.of('Btn'))
        // console.log(acroField.get(PDFName.of('FT')))
        // acroField.set(PDFName.of('FT'), PDFName.of('Yes'));
    // }
};

// returns PDFDocument in the form of a Uint8Array
// I'm using my repo's github pages hosting as a CDN because it's free and allows cross origin requests
export async function fillPDF() {
    const information = getAllDataFlat(store.getState())

    console.log(getAllDataFlat(store.getState()))

    const pdfDoc = await PDFDocument.load(await fetch('https://thegrims.github.io/UsTaxes/tax_forms/f1040.pdf').then(res => res.arrayBuffer()))
    const formFields = pdfDoc.getForm().getFields()
    formFields[0].check()
    console.log(formFields)

    Object.keys(flatFieldMappings).forEach(
        key => information[key] && 
        fillAcroTextField(
            formFields[
                flatFieldMappings[key]
            ], 
            information[key]
        )
    )
    
    formFields.forEach(formField => formField.enableReadOnly())
    

    const pdfBytes = await pdfDoc.save();
    return pdfBytes
}

// opens new with filled information in the window of the component it is called from
export async function createPDFPopup () {
    const PDF = await fillPDF()
    const blob = new Blob([PDF], { type: 'application/pdf' });
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL)
}