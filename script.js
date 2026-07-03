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
    extractImages: initExtractPDFImages
};
