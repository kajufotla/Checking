document.addEventListener('DOMContentLoaded', () => {
    // Set Current Tool ID for Global Core
    window.currentToolId = 'merge';
    window.activeFiles = [];

    // Initialize Drag and Drop UI Events
    const dropZone = document.getElementById('drop-zone');
    if(dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
        });
        
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            // Multiple is TRUE for Merge PDF, tool color is 'blue-600'
            window.AppUI.handleFileSelect({target: {files: dt.files}}, true, 'blue-600');
        }, false);
    }
});
