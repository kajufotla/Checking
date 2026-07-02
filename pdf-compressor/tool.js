document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const configArea = document.getElementById('config-area');
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');
    const errorArea = document.getElementById('error-area');
    
    const fileNameEl = document.getElementById('file-name');
    const originalSizeEl = document.getElementById('original-size');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCompress = document.getElementById('btn-compress');
    
    const statOriginal = document.getElementById('stat-original');
    const statCompressed = document.getElementById('stat-compressed');
    const statSaved = document.getElementById('stat-saved');
    
    const btnDownload = document.getElementById('btn-download');
    const btnStartOver = document.getElementById('btn-start-over');
    const btnErrorReset = document.getElementById('btn-error-reset');
    const errorMessage = document.getElementById('error-message');
    
    const progressBar = document.getElementById('progress-bar');
    const progressStatus = document.getElementById('progress-status');

    let currentFile = null;
    let currentWorker = null;
    let compressedBlob = null;

    // Format Bytes
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // UI State Management
    const showView = (viewId) => {
        [dropZone, configArea, progressArea, resultArea, errorArea].forEach(el => el.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    };

    // File Handling
    const handleFile = (file) => {
        if (!file || file.type !== 'application/pdf') {
            showError('Please upload a valid PDF file.');
            return;
        }
        currentFile = file;
        fileNameEl.textContent = file.name;
        originalSizeEl.textContent = formatBytes(file.size);
        showView('config-area');
    };

    // Drag & Drop Events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Button Events
    btnCancel.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        showView('drop-zone');
    });

    btnStartOver.addEventListener('click', () => {
        currentFile = null;
        compressedBlob = null;
        fileInput.value = '';
        showView('drop-zone');
    });

    btnErrorReset.addEventListener('click', () => showView('drop-zone'));

    btnDownload.addEventListener('click', () => {
        if (!compressedBlob) return;
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${currentFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const showError = (msg) => {
        errorMessage.textContent = msg;
        showView('error-area');
    };

    // Compression Logic (Worker Bridge)
    btnCompress.addEventListener('click', () => {
        if (!currentFile) return;
        
        const compressionLevel = document.querySelector('input[name="compression"]:checked').value;
        showView('progress-area');
        progressBar.classList.add('indeterminate');
        progressStatus.textContent = "Initializing compression engine...";

        // Terminate existing worker if any
        if (currentWorker) {
            currentWorker.terminate();
        }

        currentWorker = new Worker('worker.js');

        currentWorker.onmessage = (e) => {
            const { type, payload } = e.data;

            switch (type) {
                case 'READY':
                    progressStatus.textContent = "Reading file...";
                    currentFile.arrayBuffer().then(buffer => {
                        currentWorker.postMessage({
                            type: 'COMPRESS',
                            payload: {
                                fileData: new Uint8Array(buffer),
                                level: compressionLevel,
                                fileName: currentFile.name
                            }
                        });
                    }).catch(() => showError("Failed to read file."));
                    break;

                case 'PROGRESS':
                    progressStatus.textContent = payload;
                    break;

                case 'SUCCESS':
                    progressBar.classList.remove('indeterminate');
                    progressBar.style.width = '100%';
                    handleSuccess(payload.data);
                    currentWorker.terminate();
                    currentWorker = null;
                    break;

                case 'ERROR':
                    showError(payload);
                    currentWorker.terminate();
                    currentWorker = null;
                    break;
            }
        };

        currentWorker.onerror = () => {
            showError("Web Worker failed to initialize. Ensure gs-worker.js and gs.wasm are present.");
            if (currentWorker) {
                currentWorker.terminate();
                currentWorker = null;
            }
        };
    });

    const handleSuccess = (compressedData) => {
        compressedBlob = new Blob([compressedData], { type: 'application/pdf' });
        
        const originalSize = currentFile.size;
        const compressedSize = compressedBlob.size;
        
        if (compressedSize >= originalSize) {
            // Note: In reality, sometimes already optimized PDFs can't be compressed further.
            showError("This PDF is already highly optimized. Compression could not reduce its size further.");
            return;
        }

        const percentage = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

        statOriginal.textContent = formatBytes(originalSize);
        statCompressed.textContent = formatBytes(compressedSize);
        statSaved.textContent = `${percentage}%`;

        showView('result-area');
    };
});
