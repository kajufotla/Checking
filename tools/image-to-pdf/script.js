/**
 * PDFExpert - Image to PDF Core Engine (script.js)
 * 100% Client-Side Vector Matrix Conversion
 */

document.addEventListener('DOMContentLoaded', () => {
    // Local In-Memory Pool for Files Structure
    let selectedFilesArray = [];

    // DOM Elements Binding
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewWrapper = document.getElementById('preview-wrapper');
    const previewGrid = document.getElementById('preview-grid');
    const fileCountBadge = document.getElementById('file-count');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const controlPanel = document.getElementById('control-panel');
    
    const pageSizeSelect = document.getElementById('page-size');
    const orientationSelect = document.getElementById('page-orientation');
    const marginSelect = document.getElementById('page-margin');
    const qualitySlider = document.getElementById('compression-quality');
    const qualityDisplay = document.getElementById('quality-display');
    const filenameInput = document.getElementById('output-filename');
    const convertBtn = document.getElementById('convert-btn');
    const processingModal = document.getElementById('processing-modal');

    // ==========================================
    // 1. DRAG & DROP & INPUT HANDLERS
    // ==========================================
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleIncomingFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleIncomingFiles(e.target.files);
    });

    /**
     * Parse and filter uploaded files streams
     */
    function handleIncomingFiles(filesList) {
        const acceptableTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        Array.from(filesList).forEach(file => {
            if (acceptableTypes.includes(file.type)) {
                // Attach safe random unique reference token
                file.uniqueToken = Math.random().toString(36).substring(2, 9);
                selectedFilesArray.push(file);
            }
        });

        syncWorkspaceState();
    }

    // ==========================================
    // 2. UI SYNC & PREVIEW ENGINE
    // ==========================================
    function syncWorkspaceState() {
        fileCountBadge.textContent = selectedFilesArray.length;

        if (selectedFilesArray.length === 0) {
            previewWrapper.classList.add('container-hidden');
            controlPanel.classList.add('panel-disabled');
            return;
        }

        previewWrapper.classList.remove('container-hidden');
        controlPanel.classList.remove('panel-disabled');
        
        // Render Thumbnails via Local Object URLs
        previewGrid.innerHTML = '';
        selectedFilesArray.forEach((file, index) => {
            const itemCard = document.createElement('div');
            itemCard.className = 'preview-item';
            
            const objectUrl = URL.createObjectURL(file);

            itemCard.innerHTML = `
                <button class="remove-item-btn" data-token="${file.uniqueToken}">&times;</button>
                <div class="preview-thumbnail-container">
                    <img src="${objectUrl}" alt="Preview Asset">
                </div>
                <div class="preview-meta">${file.name}</div>
            `;

            // Setup Individual Removal Stream
            itemCard.querySelector('.remove-item-btn').addEventListener('click', (e) => {
                const token = e.target.getAttribute('data-token');
                selectedFilesArray = selectedFilesArray.filter(f => f.uniqueToken !== token);
                URL.revokeObjectURL(objectUrl);
                syncWorkspaceState();
            });

            previewGrid.appendChild(itemCard);
        });
    }

    // Settings Alterations Flow
    pageSizeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'auto') {
            orientationSelect.disabled = true;
        } else {
            orientationSelect.disabled = false;
        }
    });

    qualitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        qualityDisplay.textContent = val == 100 ? "Original (100%)" : `${val}%`;
    });

    clearAllBtn.addEventListener('click', () => {
        selectedFilesArray = [];
        syncWorkspaceState();
    });

    // ==========================================
    // 3. CORE IMAGE TO PDF COMPRESSION ENGINE
    // ==========================================
    convertBtn.addEventListener('click', async () => {
        if (selectedFilesArray.length === 0) return;
        if (typeof window.PDFLib === 'undefined') {
            alert('Core system library is loading. Please wait a brief moment.');
            return;
        }

        processingModal.classList.remove('overlay-hidden');

        try {
            const PDFDocument = window.PDFLib.PDFDocument;
            const pdfDoc = await PDFDocument.create();

            const compressionFactor = parseInt(qualitySlider.value) / 100;
            const targetPageSize = pageSizeSelect.value;
            const isLandscape = orientationSelect.value === 'landscape';
            const marginConfig = marginSelect.value;

            // Calculate active margins mapping values
            let marginOffset = 0;
            if (marginConfig === 'small') marginOffset = 20;
            if (marginConfig === 'big') marginOffset = 40;

            // Loop sequentially to handle resource allocations gracefully
            for (const file of selectedFilesArray) {
                // Step A: Force Canvas scaling logic to achieve 100% accurate compression slider results
                const processedImageBlob = await compressAndResizeImage(file, compressionFactor);
                const arrayBuffer = await processedImageBlob.arrayBuffer();

                let embeddedPdfImage;
                if (file.type === 'image/png' && compressionFactor === 1) {
                    embeddedPdfImage = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    embeddedPdfImage = await pdfDoc.embedJpg(arrayBuffer);
                }

                let imgWidth = embeddedPdfImage.width;
                let imgHeight = embeddedPdfImage.height;

                // Step B: Set boundaries for standard constraints models (A4 / Letter)
                let pageDimensionsWidth;
                let pageDimensionsHeight;

                if (targetPageSize === 'auto') {
                    pageDimensionsWidth = imgWidth + (marginOffset * 2);
                    pageDimensionsHeight = imgHeight + (marginOffset * 2);
                } else {
                    // Predefined Dimension Constants standard maps
                    const standardsMap = {
                        a4: { w: 595.28, h: 841.89 }, // PDF Points mapping arrays
                        letter: { w: 612, h: 792 }
                    };
                    
                    let activeNorm = standardsMap[targetPageSize];
                    pageDimensionsWidth = isLandscape ? activeNorm.h : activeNorm.w;
                    pageDimensionsHeight = isLandscape ? activeNorm.w : activeNorm.h;
                }

                const page = pdfDoc.addPage([pageDimensionsWidth, pageDimensionsHeight]);

                // Scale image coordinates gracefully to sit inside defined page borders safely
                const availableWidth = pageDimensionsWidth - (marginOffset * 2);
                const availableHeight = pageDimensionsHeight - (marginOffset * 2);

                const scaleFactor = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
                const finalRenderWidth = imgWidth * scaleFactor;
                const finalRenderHeight = imgHeight * scaleFactor;

                // Perfect centering mechanics calculations
                const horizontalPlacementX = marginOffset + (availableWidth - finalRenderWidth) / 2;
                const verticalPlacementY = marginOffset + (availableHeight - finalRenderHeight) / 2;

                page.drawImage(embeddedPdfImage, {
                    x: horizontalPlacementX,
                    y: verticalPlacementY,
                    width: finalRenderWidth,
                    height: finalRenderHeight,
                });
            }

            // Save and trigger direct local storage download
            const pdfBytes = await pdfDoc.save();
            const outputName = filenameInput.value.trim() || 'pdfexpert_converted';
            
            triggerDownload(pdfBytes, `${outputName}.pdf`);

        } catch (error) {
            console.error(error);
            alert('An unexpected local vector allocation processing error occurred.');
        } finally {
            processingModal.classList.add('overlay-hidden');
        }
    });

    /**
     * Browser Canvas Compression Core Matrix Utility
     */
    function compressAndResizeImage(fileSource, qualityValue) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(fileSource);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(img.src);
                    resolve(blob);
                }, 'image/jpeg', qualityValue);
            };
        });
    }

    /**
     * Clean safe dynamic memory download trigger execution node
     */
    function triggerDownload(dataArray, fullFilename) {
        const blob = new Blob([dataArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fullFilename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }
});
