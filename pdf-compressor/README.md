# Real Client-Side PDF Compressor

A fully client-side PDF compressor built with HTML5, CSS3, Vanilla JS, and Web Workers. It handles large PDFs without freezing the browser and ensures total data privacy.

## Architecture

This project is structured for enterprise-level client-side operations:
- **`index.html` & `style.css`**: Modern, responsive, dark-mode compatible UI.
- **`tool.js`**: DOM manipulation, File APIs, and Web Worker bridging.
- **`worker.js`**: Background thread that prevents UI locking. Sets up Ghostscript file system parameters and handles I/O.
- **`gs-worker.js`**: The Emscripten wrapper module for Ghostscript WebAssembly.

## CRITICAL: Integrating Ghostscript WASM

The code provided handles the exact integration, arguments, and memory management for Ghostscript. However, to execute real compression, you must provide the compiled Ghostscript `.wasm` engine.

1. Obtain a Ghostscript WebAssembly build (e.g., compile Ghostscript using Emscripten, or find a trusted pre-compiled `ghostscript.js` repository).
2. Place `gs.wasm` and the generated wrapper `ghostscript.js` in this directory.
3. In `gs-worker.js`, remove the Mock logic block and add `self.importScripts('ghostscript.js');`.

## Ghostscript Command Mappings

The tool uses native Ghostscript parameters (`dPDFSETTINGS`) to perform real compression, image downsampling, and stream garbage collection:

- **Extreme (Screen)**: 72 dpi images, lowest quality.
- **High (eBook)**: 150 dpi images, balanced quality.
- **Medium (Printer)**: 300 dpi images, high quality.
- **Low (Prepress)**: 300 dpi, color preserving.

*Note: Added `-dFastWebView=true` to linearize PDFs for fast web viewing.*

## Local Testing

Because this utilizes Web Workers and WASM, you cannot open `index.html` directly via the `file://` protocol due to browser CORS restrictions. You must serve it via a local HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8000
