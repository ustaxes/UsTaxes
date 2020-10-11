// credit for the recurseAcroFieldKids and getRootAcroFields functions goes to Andrew Dillon
// https://github.com/Hopding/pdf-lib/issues/349
const recurseAcroFieldKids = (field) => {
    const kids = field.get(PDFName.of('Kids'))
    if (!kids) return [field];

    const acroFields = new Array(kids.size());
    for (let idx = 0, len = kids.size(); idx < len; idx++) {
        acroFields[idx] = field.context.lookup(kids.get(idx), PDFDict);
    }

    let flatKids = [];
    for (let idx = 0, len = acroFields.length; idx < len; idx++) {
        flatKids.push(...recurseAcroFieldKids(acroFields[idx]));
    }
    return flatKids;
};

const getRootAcroFields = (pdfDoc) => {
    if (!pdfDoc.catalog.get(PDFName.of('AcroForm'))) return [];
    const acroForm = pdfDoc.context.lookup(
        pdfDoc.catalog.get(PDFName.of('AcroForm')),
        PDFDict,
    );

    if (!acroForm.get(PDFName.of('Fields'))) return [];
    const acroFieldRefs = acroForm.context.lookup(
        acroForm.get(PDFName.of('Fields')),
        PDFArray,
    );

    const acroFields = new Array(acroFieldRefs.size());
    for (let idx = 0, len = acroFieldRefs.size(); idx < len; idx++) {
        acroFields[idx] = pdfDoc.context.lookup(acroFieldRefs.get(idx), PDFDict);
    }

    return acroFields;
};

const main = async function () {
    // returns PDFDocument
    const pdfDoc = await PDFDocument.load(fs.readFileSync('./f1040.pdf'))
}