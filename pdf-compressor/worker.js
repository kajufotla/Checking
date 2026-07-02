// Web Worker for handling the heavy lifting and loading Ghostscript WASM
self.importScripts('gs-worker.js');

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'COMPRESS') {
        const { fileData, level, fileName } = payload;
        
        try {
            self.postMessage({ type: 'PROGRESS', payload: 'Configuring Ghostscript engine...' });

            // Ensure the Module from gs-worker.js is ready
            if (!self.Module || !self.Module.FS) {
                throw new Error("Ghostscript WebAssembly module not fully loaded.");
            }

            const inputPath = '/input.pdf';
            const outputPath = '/output.pdf';

            // 1. Write the file to the Emscripten Virtual File System
            self.Module.FS.writeFile(inputPath, fileData);

            self.postMessage({ type: 'PROGRESS', payload: 'Optimizing and linearizing PDF...' });

            // 2. Define Ghostscript arguments based on selected level
            // Ghostscript pdfmarks:
            // /screen = 72 dpi (Extreme)
            // /ebook = 150 dpi (High)
            // /printer = 300 dpi (Medium)
            // /prepress = 300 dpi, color preserving (Low)
            
            const gsArgs = [
                'gs',
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                `-dPDFSETTINGS=/${level}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                '-dDetectDuplicateImages=true',
                '-dCompressFonts=true',
                '-dFastWebView=true', // Linearizes PDF for web
                `-sOutputFile=${outputPath}`,
                inputPath
            ];

            // 3. Execute Ghostscript
            // The callMain function is the standard Emscripten entry point for C programs
            const exitCode = self.Module.callMain(gsArgs);

            if (exitCode !== 0) {
                throw new Error(`Ghostscript exited with code ${exitCode}`);
            }

            self.postMessage({ type: 'PROGRESS', payload: 'Finalizing...' });

            // 4. Read the output from Virtual File System
            const outputData = self.Module.FS.readFile(outputPath);

            // Clean up memory
            self.Module.FS.unlink(inputPath);
            self.Module.FS.unlink(outputPath);

            // 5. Send result back to main thread
            self.postMessage({ 
                type: 'SUCCESS', 
                payload: { data: outputData } 
            });

        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message || 'Compression failed.' });
        }
    }
};
