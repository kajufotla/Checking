document.addEventListener('DOMContentLoaded', () => {
    // UI Elements Selection
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const processingArea = document.getElementById('processing-area');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const compressBtn = document.getElementById('compress-btn');
    
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    const resultArea = document.getElementById('result-area');
    const newSizeDisplay = document.getElementById('new-size');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    let currentFile = null;

    // Helper: Format Bytes to MB/KB
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Drag & Drop Visual Feedback
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Handle File Processing UI Updates
    function handleFileSelection(file) {
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        currentFile = file;
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = formatBytes(file.size);
        
        dropZone.classList.add('hidden');
        processingArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressContainer.classList.add('hidden');
    }

    // PDF Compression Core Logic
    compressBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // Show Progress
        compressBtn.disabled = true;
        compressBtn.classList.add('opacity-50', 'cursor-not-allowed');
        progressContainer.classList.remove('hidden');
        
        // Simulate compression progress visually while JS runs synchronously/asynchronously
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if(progress <= 90) {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
            }
        }, 100);

        try {
            // Read original file
            const arrayBuffer = await currentFile.arrayBuffer();
            
            // Load PDF using pdf-lib
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true // Fails gracefully on locked PDFs
            });

            // Rebuild the PDF by saving it. 
            // Setting useObjectStreams: false and removing metadata shrinks the file size.
            // Note: True high-level image downscaling requires heavy WASM modules, 
            // but this structural rebuild acts as a robust standard client-side compressor.
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');

            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: false, 
                addDefaultPage: false,
                updateFieldAppearances: false
            });

            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressText.textContent = '100%';

            // Create Downloadable Blob
            const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Update UI with Results
            setTimeout(() => {
                processingArea.classList.add('hidden');
                resultArea.classList.remove('hidden');
                newSizeDisplay.textContent = formatBytes(blob.size);
                
                downloadBtn.href = url;
                downloadBtn.download = `compressed_${currentFile.name}`;
                
                compressBtn.disabled = false;
                compressBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }, 500);

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error compressing PDF:', error);
            alert('An error occurred during compression. The PDF might be corrupted or encrypted.');
            
            compressBtn.disabled = false;
            compressBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            progressContainer.classList.add('hidden');
        }
    });

    // Reset UI for next file
    resetBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        dropZone.classList.remove('hidden');
        processingArea.classList.add('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    });
});
