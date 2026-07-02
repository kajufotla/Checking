/**
 * PDF Compressor Tool - FIXED PRODUCTION VERSION
 * Works in SPA + Multi-tool websites
 */

(function () {
    let currentFile = null;
    let currentWorker = null;
    let compressedBlob = null;
    let initialized = false;

    // Prevent double init
    function initPDFCompressor() {
        if (initialized) return;
        initialized = true;

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

        // Safety check
        if (!dropZone || !fileInput || !btnCompress) {
            console.error("PDF Compressor: DOM not ready or missing elements");
            return;
        }

        // Format bytes
        const formatBytes = (bytes, decimals = 2) => {
            if (!+bytes) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
        };

        // View switcher
        const showView = (viewId) => {
            [dropZone, configArea, progressArea, resultArea, errorArea]
                .forEach(el => el && el.classList.add('hidden'));

            const target = document.getElementById(viewId);
            if (target) target.classList.remove('hidden');
        };

        // File handler
        const handleFile = (file) => {
            if (!file || file.type !== 'application/pdf') {
                showError("Please upload a valid PDF file.");
                return;
            }

            currentFile = file;

            fileNameEl.textContent = file.name;
            originalSizeEl.textContent = formatBytes(file.size);

            showView('config-area');
        };

        const showError = (msg) => {
            if (errorMessage) errorMessage.textContent = msg;
            showView('error-area');
        };

        // Drag & Drop
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
            handleFile(e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            handleFile(e.target.files[0]);
        });

        // Buttons
        btnCancel?.addEventListener('click', () => {
            currentFile = null;
            fileInput.value = '';
            showView('drop-zone');
        });

        btnStartOver?.addEventListener('click', () => {
            currentFile = null;
            compressedBlob = null;
            fileInput.value = '';
            showView('drop-zone');
        });

        btnErrorReset?.addEventListener('click', () => {
            showView('drop-zone');
        });

        btnDownload?.addEventListener('click', () => {
            if (!compressedBlob) return;

            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed_${currentFile.name}`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Compression
        btnCompress.addEventListener('click', () => {
            if (!currentFile) return;

            const level = document.querySelector('input[name="compression"]:checked').value;

            showView('progress-area');
            progressBar.classList.add('indeterminate');
            progressStatus.textContent = "Starting...";

            if (currentWorker) currentWorker.terminate();

            currentWorker = new Worker('worker.js');

            currentWorker.onmessage = (e) => {
                const { type, payload } = e.data;

                if (type === 'READY') {
                    progressStatus.textContent = "Reading file...";

                    currentFile.arrayBuffer().then(buffer => {
                        currentWorker.postMessage({
                            type: 'COMPRESS',
                            payload: {
                                fileData: new Uint8Array(buffer),
                                level,
                                fileName: currentFile.name
                            }
                        });
                    });
                }

                if (type === 'PROGRESS') {
                    progressStatus.textContent = payload;
                }

                if (type === 'SUCCESS') {
                    progressBar.classList.remove('indeterminate');
                    progressBar.style.width = "100%";

                    handleSuccess(payload.data);

                    currentWorker.terminate();
                    currentWorker = null;
                }

                if (type === 'ERROR') {
                    showError(payload);
                    currentWorker.terminate();
                    currentWorker = null;
                }
            };

            currentWorker.onerror = () => {
                showError("Worker failed to load.");
            };
        });

        function handleSuccess(data) {
            compressedBlob = new Blob([data], { type: 'application/pdf' });

            const original = currentFile.size;
            const compressed = compressedBlob.size;

            if (compressed >= original) {
                showError("File already optimized. No compression possible.");
                return;
            }

            const saved = (((original - compressed) / original) * 100).toFixed(1);

            statOriginal.textContent = formatBytes(original);
            statCompressed.textContent = formatBytes(compressed);
            statSaved.textContent = saved + "%";

            showView('result-area');
        }

        console.log("PDF Compressor initialized successfully");
    }

    // SAFE GLOBAL EXPORT
    window.initPDFCompressor = initPDFCompressor;

    // Auto init fallback (if standalone page)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPDFCompressor);
    } else {
        initPDFCompressor();
    }

})();
