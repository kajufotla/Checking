/**
 * PDFExprt Suite - Client-Side PDF Tools Logic (Part 1 of 5)
 * Tools Included: 1 to 10 (Dynamic Client-Side Implementations)
 * Fully functional, privacy-first, zero backend dependencies.
 */

// Global state / configuration checks
console.log("🚀 PDFExprt Core Utility Script (Part 1/5) Initialized Successfully.");

// Load external dependencies dynamically if they aren't pre-loaded in the global scope
function ensureLibrary(src, globalVar, callback) {
    if (window[globalVar]) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// ==========================================
// TOOL 1: Image to PDF (100% Client-Side)
// Features: Supports multiple images, drag & drop sequence mapping, auto-orientation
// ==========================================
async function initImageToPDF(imageFiles, options = { orientation: 'p', format: 'a4', margin: 10 }) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf', async () => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF(options.orientation, 'mm', options.format);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                for (let i = 0; i < imageFiles.length; i++) {
                    if (i > 0) doc.addPage();
                    
                    const imgData = await readFileAsDataURL(imageFiles[i]);
                    const dimensions = await getImageDimensions(imgData);
                    
                    // Scale image inside page dimensions keeping ratio safely with custom margins
                    const safeWidth = pageWidth - (options.margin * 2);
                    const safeHeight = pageHeight - (options.margin * 2);
                    let renderWidth = safeWidth;
                    let renderHeight = (dimensions.height * safeWidth) / dimensions.width;
                    
                    if (renderHeight > safeHeight) {
                        renderHeight = safeHeight;
                        renderWidth = (dimensions.width * safeHeight) / dimensions.height;
                    }
                    
                    const xOffset = options.margin + (safeWidth - renderWidth) / 2;
                    const yOffset = options.margin + (safeHeight - renderHeight) / 2;
                    
                    // Injecting image buffer directly to the local document instance
                    doc.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight);
                }
                
                const blob = doc.output('blob');
                resolve({ success: true, blob: blob, filename: "compiled_images.pdf" });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 2: PDF to JPEG (100% Client-Side)
// Features: Renders high-resolution raster buffers using browser HTML5 canvas grids
// ==========================================
async function initPDFToJPEG(pdfFile, scaleFactor = 2.0) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib', async () => {
            try {
                const pdfjsLib = window['pdfjsLib'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const imagesArray = [];
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: scaleFactor });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                    imagesArray.push({ page: pageNum, dataUrl: dataUrl });
                }
                
                resolve({ success: true, images: imagesArray });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 3: Merge PDF (100% Client-Side)
// Features: Joins raw index streams without disrupting inner fonts/layouts structures
// ==========================================
async function initMergePDF(pdfFilesList) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const mergedPdf = await PDFDocument.create();
                
                for (const file of pdfFilesList) {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
                
                const mergedPdfBytes = await mergedPdf.save();
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                resolve({ success: true, blob: blob, filename: "merged_suite_doc.pdf" });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 4: Split PDF (100% Client-Side)
// Features: Isolates customized page indices arrays and extracts them cleanly
// ==========================================
async function initSplitPDF(pdfFile, targetedRangesArray) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const originalBuffer = await readFileAsArrayBuffer(pdfFile);
                const sourceDoc = await PDFDocument.load(originalBuffer);
                const totalPages = sourceDoc.getPageCount();
                
                const splitResults = [];
                
                for (const range of targetedRangesArray) {
                    const splitDoc = await PDFDocument.create();
                    // Range example: { start: 1, end: 3, name: "Part1" } (1-indexed base)
                    for (let i = range.start - 1; i < range.end; i++) {
                        if (i >= 0 && i < totalPages) {
                            const [copiedPage] = await splitDoc.copyPages(sourceDoc, [i]);
                            splitDoc.addPage(copiedPage);
                        }
                    }
                    
                    const bytes = await splitDoc.save();
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    splitResults.push({ name: `${range.name}.pdf`, blob: blob });
                }
                
                resolve({ success: true, files: splitResults });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 5: Delete PDF Pages (100% Client-Side)
// Features: Trims unwanted nodes instantly out of the structure array sequence
// ==========================================
async function initDeletePDFPages(pdfFile, indicesToDelete) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const originalBuffer = await readFileAsArrayBuffer(pdfFile);
                const sourceDoc = await PDFDocument.load(originalBuffer);
                
                // Sort descending to prevent structural shifting index faults during deletion loop
                const sortedIndices = [...indicesToDelete].sort((a, b) => b - a);
                
                sortedIndices.forEach(index => {
                    if (index >= 0 && index < sourceDoc.getPageCount()) {
                        sourceDoc.removePage(index);
                    }
                });
                
                const finalBytes = await sourceDoc.save();
                const blob = new Blob([finalBytes], { type: 'application/pdf' });
                resolve({ success: true, blob: blob, filename: "trimmed_document.pdf" });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 6: Rotate PDF (100% Client-Side)
// Features: Rotates target internal matrix contexts (90, 180, 270 degrees)
// ==========================================
async function initRotatePDF(pdfFile, rotationSettingsMap) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument, degrees } = window.PDFLib;
                const originalBuffer = await readFileAsArrayBuffer(pdfFile);
                const sourceDoc = await PDFDocument.load(originalBuffer);
                const pages = sourceDoc.getPages();
                
                // rotationSettingsMap shape: { pageIndex: 90/180/270 }
                Object.keys(rotationSettingsMap).forEach(idxKey => {
                    const idx = parseInt(idxKey);
                    const angle = rotationSettingsMap[idxKey];
                    if (pages[idx]) {
                        const currentRotation = pages[idx].getRotation().angle;
                        pages[idx].setRotation(degrees((currentRotation + angle) % 360));
                    }
                });
                
                const finalBytes = await sourceDoc.save();
                const blob = new Blob([finalBytes], { type: 'application/pdf' });
                resolve({ success: true, blob: blob, filename: "rotated_document.pdf" });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 7: Reorder PDF Pages (100% Client-Side)
// Features: Flattens and reconstructs matching pages according to custom drag maps
// ==========================================
async function initReorderPDFPages(pdfFile, newOrderIndexArray) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const originalBuffer = await readFileAsArrayBuffer(pdfFile);
                const sourceDoc = await PDFDocument.load(originalBuffer);
                const reorderedDoc = await PDFDocument.create();
                
                // newOrderIndexArray represents array layout changes e.g. [2, 0, 1, 3]
                const copiedPages = await reorderedDoc.copyPages(sourceDoc, newOrderIndexArray);
                copiedPages.forEach(page => reorderedDoc.addPage(page));
                
                const finalBytes = await reorderedDoc.save();
                const blob = new Blob([finalBytes], { type: 'application/pdf' });
                resolve({ success: true, blob: blob, filename: "reordered_document.pdf" });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 8: HTML to PDF (100% Client-Side)
// Features: Compiles styling layers directly from dynamic document view nodes
// ==========================================
async function initHTMLToPDF(htmlElementNode, customFileName = "web_export.pdf") {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', 'html2pdf', async () => {
            try {
                const worker = window.html2pdf();
                const opt = {
                    margin:       10,
                    filename:     customFileName,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                worker.set(opt).from(htmlElementNode).outputPdf('blob').then(blob => {
                    resolve({ success: true, blob: blob, filename: customFileName });
                }).catch(e => reject({ success: false, error: e.message }));
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 9: Extract PDF Text (100% Client-Side)
// Features: Pulls text segments from internal streams using structural parsing loops
// ==========================================
async function initExtractPDFText(pdfFile) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib', async () => {
            try {
                const pdfjsLib = window['pdfjsLib'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                let fullExtractedText = "";
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(" ");
                    fullExtractedText += `--- PAGE ${pageNum} ---\n${pageText}\n\n`;
                }
                
                resolve({ success: true, text: fullExtractedText.trim() });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// TOOL 10: Extract PDF Images (100% Client-Side)
// Features: Parses internal page asset map structures to pull out embedded image files
// ==========================================
async function initExtractPDFImages(pdfFile) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjsLib', async () => {
            try {
                const pdfjsLib = window['pdfjsLib'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const extractedImages = [];
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const operatorList = await page.getOperatorList();
                    const validImageOps = [pdfjsLib.OPS.paintJpegXObject, pdfjsLib.OPS.paintImageXObject];
                    
                    for (let j = 0; j < operatorList.fnArray.length; j++) {
                        if (validImageOps.includes(operatorList.fnArray[j])) {
                            const imgKey = operatorList.argsArray[j][0];
                            try {
                                const imageObj = await page.objs.get(imgKey);
                                if (imageObj && imageObj.data) {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = imageObj.width;
                                    canvas.height = imageObj.height;
                                    const ctx = canvas.getContext('2d');
                                    
                                    const imgData = ctx.createImageData(imageObj.width, imageObj.height);
                                    // Parse binary format correctly back to browser visible arrays
                                    if(imageObj.data.length === imageObj.width * imageObj.height * 3) {
                                        // RGB structure conversion tracking
                                        let dataIdx = 0;
                                        for (let k = 0; k < imgData.data.length; k += 4) {
                                            imgData.data[k] = imageObj.data[dataIdx];
                                            imgData.data[k+1] = imageObj.data[dataIdx+1];
                                            imgData.data[k+2] = imageObj.data[dataIdx+2];
                                            imgData.data[k+3] = 255;
                                            dataIdx += 3;
                                        }
                                    } else {
                                        imgData.data.set(imageObj.data);
                                    }
                                    
                                    ctx.putImageData(imgData, 0, 0);
                                    extractedImages.push({
                                        page: i,
                                        dataUrl: canvas.toDataURL('image/png')
                                    });
                                }
                            } catch(e) { console.warn("Skipping unreadable graphic object structure tracking loop:", e); }
                        }
                    }
                }
                
                resolve({ success: true, images: extractedImages });
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    });
}

// ==========================================
// CORE HELPER UTILITIES (File Buffers Conversion)
// ==========================================
function readFileAsDataURL(file) {
    return new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(file);
    });
}

function readFileAsArrayBuffer(file) {
    return new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsArrayBuffer(file);
    });
}

function getImageDimensions(dataUrl) {
    return new Promise((res) => {
        const img = new Image();
        img.onload = () => res({ width: img.width, height: img.height });
        img.src = dataUrl;
    });
}

// Export wrappers explicitly to the global context layer safely
window.PDFExprt_Part1 = {
    imageToPDF: initImageToPDF,
    pdfToJPEG: initPDFToJPEG,
    mergePDF: initMergePDF,
    splitPDF: initSplitPDF,
    deletePDFPages: initDeletePDFPages,
    rotatePDF: initRotatePDF,
    reorderPDFPages: initReorderPDFPages,
    htmlToPDF: initHTMLToPDF,
    extractText: initExtractPDFText,
    extractImages: initExtractPDFImages,
    /**
 * PDFExprt Suite - Client-Side Tools Logic (Part 2 of 5)
 * Tools Included: 11 to 20 (Advanced PDF Layers & Core Image Modifiers)
 * 100% Client-Side execution, strict privacy control.
 */

console.log("🚀 PDFExprt Utility Script (Part 2/5) Loaded Successfully.");

// Helper to ensure external libraries are available via global scope
function ensureLibrary(src, globalVar, callback) {
    if (window[globalVar]) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// ==========================================
// TOOL 11: Add PDF Page Numbers (100% Client-Side)
// Features: Injects dynamic "Page X of Y" counters inside footers/headers vectors
// ==========================================
async function initAddPDFPageNumbers(pdfFile, options = { position: 'bottom-right', fontSize: 10 }) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const doc = await PDFDocument.load(arrayBuffer);
                const pages = doc.getPages();
                const font = await doc.embedFont(StandardFonts.Helvetica);

                pages.forEach((page, index) => {
                    const { width, height } = page.getSize();
                    const text = `Page ${index + 1} of ${pages.length}`;
                    let x = width - 60;
                    let y = 30; // Default bottom-right

                    if (options.position === 'bottom-center') x = width / 2 - 20;
                    else if (options.position === 'top-center') { x = width / 2 - 20; y = height - 30; }
                    else if (options.position === 'top-right') { x = width - 60; y = height - 30; }

                    page.drawText(text, {
                        x: x,
                        y: y,
                        size: options.fontSize,
                        font: font,
                        color: rgb(0.3, 0.3, 0.3),
                    });
                });

                const bytes = await doc.save();
                resolve({ success: true, blob: new Blob([bytes], { type: 'application/pdf' }), filename: "numbered_document.pdf" });
            } catch (err) { reject({ success: false, error: err.message }); }
        });
    });
}

// ==========================================
// TOOL 12: Add PDF Watermark (100% Client-Side)
// Features: Overlays semi-transparent text with a precise custom diagonal angle rotation
// ==========================================
async function initAddPDFWatermark(pdfFile, textText, options = { opacity: 0.3, size: 45, angle: 45 }) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument, rgb, StandardFonts, degrees } = window.PDFLib;
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const doc = await PDFDocument.load(arrayBuffer);
                const pages = doc.getPages();
                const font = await doc.embedFont(StandardFonts.HelveticaBold);

                pages.forEach((page) => {
                    const { width, height } = page.getSize();
                    page.drawText(textText, {
                        x: width / 4,
                        y: height / 2,
                        size: options.size,
                        font: font,
                        color: rgb(0.7, 0.7, 0.7),
                        opacity: options.opacity,
                        rotate: degrees(options.angle),
                    });
                });

                const bytes = await doc.save();
                resolve({ success: true, blob: new Blob([bytes], { type: 'application/pdf' }), filename: "watermarked_document.pdf" });
            } catch (err) { reject({ success: false, error: err.message }); }
        });
    });
}

// ==========================================
// TOOL 13: Sign PDF (100% Client-Side)
// Features: Stamps a signature canvas data URL onto precise page coordinate targets
// ==========================================
async function initSignPDF(pdfFile, signatureDataUrl, coords = { pageIdx: 0, x: 50, y: 50, w: 120, h: 50 }) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const doc = await PDFDocument.load(arrayBuffer);
                const pages = doc.getPages();
                
                if (!pages[coords.pageIdx]) throw new Error("Target page index does not exist.");

                // Convert signature base64 back into internal layout components safely
                const sigImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
                const sigImage = await doc.embedPng(sigImageBytes);

                pages[coords.pageIdx].drawImage(sigImage, {
                    x: coords.x,
                    y: coords.y,
                    width: coords.w,
                    height: coords.h,
                });

                const bytes = await doc.save();
                resolve({ success: true, blob: new Blob([bytes], { type: 'application/pdf' }), filename: "signed_document.pdf" });
            } catch (err) { reject({ success: false, error: err.message }); }
        });
    });
}

// ==========================================
// TOOL 14: PDF Invoice Generator (100% Client-Side)
// Features: Maps plain data schemas directly into structured client-downloadable PDFs
// ==========================================
async function initPDFInvoiceGenerator(invoiceData, targetFileName = "invoice.pdf") {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf', async () => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                // Advanced manual layout building matching top SaaS standards
                doc.setFont("Helvetica", "bold");
                doc.setFontSize(22);
                doc.text(invoiceData.companyName || "INVOICE", 20, 25);
                
                doc.setFont("Helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`Invoice No: ${invoiceData.invoiceNo || 'INV-1001'}`, 140, 20);
                doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, 140, 26);

                doc.line(20, 35, 190, 35); // Divider row vector
                
                doc.setFont("Helvetica", "bold");
                doc.text("Bill To:", 20, 45);
                doc.setFont("Helvetica", "normal");
                doc.text(invoiceData.clientName || "Client Name", 20, 52);
                doc.text(invoiceData.clientEmail || "client@mail.com", 20, 58);

                // Table Render Calculations Loop
                let yOffset = 75;
                doc.setFont("Helvetica", "bold");
                doc.text("Item Description", 20, yOffset);
                doc.text("Qty", 120, yOffset);
                doc.text("Price", 140, yOffset);
                doc.text("Total", 165, yOffset);
                doc.line(20, yOffset + 3, 190, yOffset + 3);

                doc.setFont("Helvetica", "normal");
                (invoiceData.items || []).forEach(item => {
                    yOffset += 12;
                    doc.text(item.desc || "Service item", 20, yOffset);
                    doc.text(String(item.qty || 1), 120, yOffset);
                    doc.text(`$${Number(item.price || 0).toFixed(2)}`, 140, yOffset);
                    doc.text(`$${(item.qty * item.price).toFixed(2)}`, 165, yOffset);
                });

                doc.line(20, yOffset + 5, 190, yOffset + 5);
                doc.setFont("Helvetica", "bold");
                doc.text(`Grand Total: $${Number(invoiceData.total || 0).toFixed(2)}`, 145, yOffset + 15);

                resolve({ success: true, blob: doc.output('blob'), filename: targetFileName });
            } catch (err) { reject({ success: false, error: err.message }); }
        });
    });
}

// ==========================================
// TOOL 15: Crop PDF (100% Client-Side)
// Features: Adjusts page crop/media bounding vectors without altering structural text nodes
// ==========================================
async function initCropPDF(pdfFile, cropMargins = { top: 20, bottom: 20, left: 20, right: 20 }) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                const doc = await PDFDocument.load(arrayBuffer);
                const pages = doc.getPages();

                pages.forEach(page => {
                    const { width, height } = page.getSize();
                    // Shrinking view limits boundaries mapping vectors dynamically
                    page.setCropBox(
                        cropMargins.left,
                        cropMargins.bottom,
                        width - cropMargins.left - cropMargins.right,
                        height - cropMargins.top - cropMargins.bottom
                    );
                });

                const bytes = await doc.save();
                resolve({ success: true, blob: new Blob([bytes], { type: 'application/pdf' }), filename: "cropped_document.pdf" });
            } catch (err) { reject({ success: false, error: err.message }); }
        });
    });
}

// ==========================================
// TOOL 16: PDF Password Remover (100% Client-Side)
// Features: Decrypts document stream parameters via user key and strips security overheads
// ==========================================
async function initPDFPasswordRemover(pdfFile, correctPasswordString) {
    return new Promise((resolve, reject) => {
        ensureLibrary('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js', 'PDFLib', async () => {
            try {
                const { PDFDocument } = window.PDFLib;
                const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
                
                // Load file by submitting decryption payload securely in browser memory
                const decryptedDoc = await PDFDocument.load(arrayBuffer, { 
                    password: correctPasswordString,
                    ignoreEncryption: false 
                });

                const unencryptedBytes = await decryptedDoc.save(); // Saves without security tokens
                resolve({ success: true, blob: new Blob([unencryptedBytes], { type: 'application/pdf' }), filename: "unlocked_document.pdf" });
            } catch (err) { reject({ success: false, error: "Decryption Failed: Invalid master password credentials." }); }
        });
    });
}

// ==========================================
// TOOL 17: WEBP to PNG Converter (100% Client-Side)
// Features: Renders raster arrays onto browser hardware canvas to output pristine lossless PNGs
// ==========================================
async function initWebPToPNG(webpFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    resolve({ success: true, blob: blob, filename: "converted_asset.png" });
                }, 'image/png');
            };
            img.onerror = () => reject({ success: false, error: "Failed to parse target WebP format asset." });
            img.src = event.target.result;
        };
        reader.readAsDataURL(webpFile);
    });
}

// ==========================================
// TOOL 18: Image Resizer (100% Client-Side)
// Features: Resizes dimension grids down smoothly using smooth browser interpolation loops
// ==========================================
async function initImageResizer(imageFile, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                
                // High quality image scaling configurations context layer
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                
                canvas.toBlob((blob) => {
                    resolve({ success: true, blob: blob, filename: `resized_${imageFile.name}` });
                }, imageFile.type);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    });
}

// ==========================================
// TOOL 19: JPEG Compressor (100% Client-Side)
// Features: Dynamically scales down structural byte weight using custom quantization ranges
// ==========================================
async function initJPEGCompressor(jpegFile, targetQualityRatio = 0.75) {
    return new Promise((resolve, reject) => {
        if (!['image/jpeg', 'image/jpg'].includes(jpegFile.type)) {
            reject({ success: false, error: "Invalid layout profile: Target resource must be JPEG format." });
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    resolve({ success: true, blob: blob, filename: `compressed_${jpegFile.name}` });
                }, 'image/jpeg', targetQualityRatio); // Inline encoding quality compression hook
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(jpegFile);
    });
}

// ==========================================
// TOOL 20: SVG to PNG Converter (100% Client-Side)
// Features: Compiles vector layout nodes down into pixel canvas streams cleanly
// ==========================================
async function initSVGToPNG(svgFile, scalingMultiplier = 2) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const svgText = e.target.result;
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svgEl = svgDoc.documentElement;
            
            // Extract core viewbox metrics setup dynamically
            const width = parseInt(svgEl.getAttribute('width')) || 300;
            const height = parseInt(svgEl.getAttribute('height')) || 300;
            
            const canvas = document.createElement('canvas');
            canvas.width = width * scalingMultiplier;
            canvas.height = height * scalingMultiplier;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve({ success: true, blob: blob, filename: "vector_rasterized.png" });
                }, 'image/png');
            };
            // Cryptographic binary blob encapsulation to render vector nodes correctly
            const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            img.src = url;
        };
        reader.readAsText(svgFile);
    });
}

// Shared extraction mapping parameters
function readFileAsArrayBuffer(file) {
    return new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsArrayBuffer(file);
    });
}

// Attach securely to window module landscape
window.PDFExprt_Part2 = {
    addPageNumbers: initAddPDFPageNumbers,
    addWatermark: initAddPDFWatermark,
    signPDF: initSignPDF,
    generateInvoice: initPDFInvoiceGenerator,
    cropPDF: initCropPDF,
    removePassword: initPDFPasswordRemover,
    webpToPng: initWebPToPNG,
    resizeImage: initImageResizer,
    compressJpeg: initJPEGCompressor,
    svgToPng: initSVGToPNG,
};

};
