/**
 * PDFExpert - Core Client-Side Engine (script.js)
 * Architecture: Modular, Object-Oriented, Performance-Optimized
 * Features: Local Processing (No Servers), 100 Tools Data Structure
 */

// ==========================================
// 1. TOOLS DATABASE (100 TOOLS DATA STRUCTURE)
// ==========================================
const PDFExpertTools = [
    // --- CATEGORY 1: ORGANIZE PDF (1-15) ---
    { id: "merge-pdf", name: "Merge PDF", category: "organize", icon: "merge", desc: "Combine multiple PDFs into one unified document." },
    { id: "split-pdf", name: "Split PDF", category: "organize", icon: "split", desc: "Separate pages into independent PDF files." },
    { id: "delete-pages", name: "Delete Pages", category: "organize", icon: "trash", desc: "Remove specific pages from a PDF document." },
    { id: "extract-pages", name: "Extract Pages", category: "organize", icon: "extract", desc: "Get a new PDF containing only the pages you need." },
    { id: "organize-pages", name: "Organize Pages", category: "organize", icon: "layout", desc: "Reorder, rotate, or delete pages visually." },
    { id: "rotate-pdf", name: "Rotate PDF", category: "organize", icon: "rotate", desc: "Rotate multiple PDF pages simultaneously." },
    { id: "crop-pdf", name: "Crop PDF", category: "organize", icon: "crop", desc: "Trim the visible margins of your PDF pages." },
    { id: "n-up-pdf", name: "N-Up PDF", category: "organize", icon: "grid", desc: "Print multiple pages on a single sheet of paper." },
    { id: "reverse-pdf", name: "Reverse PDF", category: "organize", icon: "reverse", desc: "Invert the page order of your PDF document." },
    { id: "sort-pdf", name: "Sort PDF Pages", category: "organize", icon: "sort", desc: "Sort pages alphabetically or numerically." },
    { id: "split-half", name: "Split in Half", category: "organize", icon: "scissors", desc: "Split dual-page layout scans into single pages." },
    { id: "insert-blank", name: "Insert Blank Page", category: "organize", icon: "blank", desc: "Add empty pages anywhere in your document." },
    { id: "duplex-merge", name: "Duplex Merge", category: "organize", icon: "duplex", desc: "Merge odd and even page PDFs together." },
    { id: "booklet-pdf", name: "Booklet Creator", category: "organize", icon: "book", desc: "Convert standard PDF to a printable booklet layout." },
    { id: "trim-margins", name: "Trim White Margins", category: "organize", icon: "trim", desc: "Automatically remove empty borders from pages." },

    // --- CATEGORY 2: OPTIMIZE & EDIT (16-35) ---
    { id: "compress-pdf", name: "Compress PDF", category: "optimize", icon: "compress", desc: "Reduce file size while keeping maximal quality." },
    { id: "watermark-pdf", name: "Watermark PDF", category: "optimize", icon: "watermark", desc: "Stamp images or text over your PDF files." },
    { id: "number-pages", name: "Add Page Numbers", category: "optimize", icon: "hash", desc: "Insert running headers/footers with custom styling." },
    { id: "header-footer", name: "Header & Footer", category: "optimize", icon: "header", desc: "Add custom static text to page margins." },
    { id: "edit-metadata", name: "Edit Metadata", category: "optimize", icon: "edit", desc: "Change Title, Author, Keywords, and Subject." },
    { id: "flatten-pdf", name: "Flatten PDF Forms", category: "optimize", icon: "layer", desc: "Make form fields uneditable and merge layers." },
    { id: "resize-pages", name: "Resize PDF Pages", category: "optimize", icon: "resize", desc: "Change page sizes to A4, Letter, Legal, etc." },
    { id: "b-and-w", name: "Grayscale PDF", category: "optimize", icon: "contrast", desc: "Convert all colorful elements and images to black & white." },
    { id: "repair-pdf", name: "Repair PDF", category: "optimize", icon: "wrench", desc: "Fix and recover corrupted structure from broken PDFs." },
    { id: "deskew-pdf", name: "Deskew PDF", category: "optimize", icon: "align", desc: "Straighten tilted scanned pages automatically." },
    { id: "add-margins", name: "Add Padding", category: "optimize", icon: "padding", desc: "Add empty margins around document content." },
    { id: "scale-pdf", name: "Scale Content", category: "optimize", icon: "scale", desc: "Shrink or expand page content without changing page size." },
    { id: "hyperlink-manager", name: "Manage Hyperlinks", category: "optimize", icon: "link", desc: "Add, edit, or strip external URLs from text." },
    { id: "remove-annotations", name: "Strip Annotations", category: "optimize", icon: "strip", desc: "Delete comments, highlights, and notes from document." },
    { id: "sign-pdf", name: "Sign PDF", category: "optimize", icon: "signature", desc: "Draw or import your digital signature securely." },
    { id: "optimize-web", name: "Optimize for Web", category: "optimize", icon: "globe", desc: "Linearize PDFs for fast byte-range viewing online." },
    { id: "remove-images", name: "Remove All Images", category: "optimize", icon: "no-image", desc: "Strip graphics out to create text-only drafts." },
    { id: "compress-images", name: "Compress Images Only", category: "optimize", icon: "img-comp", desc: "Downsample inner graphics without touching text vectors." },
    { id: "overlay-pdf", name: "Overlay PDFs", category: "optimize", icon: "overlay", desc: "Superimpose two documents on top of each other." },
    { id: "color-adjust", name: "Color Adjust", category: "optimize", icon: "color", desc: "Modify brightness, contrast, and tint of PDF pages." },

    // --- CATEGORY 3: CONVERT FROM PDF (36-55) ---
    { id: "pdf-to-jpg", name: "PDF to JPG", category: "convert-from", icon: "image", desc: "Extract graphics or convert pages to JPG formats." },
    { id: "pdf-to-png", name: "PDF to PNG", category: "convert-from", icon: "png", desc: "Convert document layouts to high-quality transparent PNGs." },
    { id: "pdf-to-word", name: "PDF to Word", category: "convert-from", icon: "word", desc: "Extract text layout into editable DOCX file structure." },
    { id: "pdf-to-excel", name: "PDF to Excel", category: "convert-from", icon: "excel", desc: "Parse structural tables into clean XLSX sheets." },
    { id: "pdf-to-ppt", name: "PDF to PowerPoint", category: "convert-from", icon: "powerpoint", desc: "Convert static pages into presentations." },
    { id: "pdf-to-txt", name: "PDF to Text", category: "convert-from", icon: "text", desc: "Extract raw plain text strings from layout structures." },
    { id: "pdf-to-html", name: "PDF to HTML", category: "convert-from", icon: "html", desc: "Generate fully responsive interactive web markup layouts." },
    { id: "pdf-to-epub", name: "PDF to EPUB", category: "convert-from", icon: "book-open", desc: "Reflow fixed layout content into standard eBook formats." },
    { id: "pdf-to-webp", name: "PDF to WebP", category: "convert-from", icon: "webp", desc: "Convert pages into next-gen web image compression formats." },
    { id: "pdf-to-svg", name: "PDF to SVG", category: "convert-from", icon: "vector", desc: "Export vector elements directly into scalable vector graphics." },
    { id: "pdf-to-csv", name: "PDF to CSV", category: "convert-from", icon: "csv", desc: "Isolate numeric tables and dump into tabular values." },
    { id: "pdf-to-json", name: "PDF to JSON", category: "convert-from", icon: "json", desc: "Extract clean structural key-value objects from raw layouts." },
    { id: "pdf-to-markdown", name: "PDF to Markdown", category: "convert-from", icon: "markdown", desc: "Parse structural layouts into clean readable MD strings." },
    { id: "pdf-to-rtf", name: "PDF to Rich Text", category: "convert-from", icon: "rtf", desc: "Save text formatting inside standard interoperable RTF." },
    { id: "pdf-to-tiff", name: "PDF to TIFF", category: "convert-from", icon: "tiff", desc: "Convert multipage high-res documents for printing archives." },
    { id: "pdf-to-gif", name: "PDF to GIF", category: "convert-from", icon: "gif", desc: "Convert frames or pages into lightweight GIF layouts." },
    { id: "pdf-to-bmp", name: "PDF to BMP", category: "convert-from", icon: "bmp", desc: "Export pages into raw lossless uncompressed bitmap arrays." },
    { id: "pdf-to-odt", name: "PDF to ODT", category: "convert-from", icon: "odt", desc: "Convert document to OpenDocument text processing standard." },
    { id: "pdf-to-ods", name: "PDF to ODS", category: "convert-from", icon: "ods", desc: "Extract data tables directly into OpenDocument Spreadsheets." },
    { id: "pdf-to-xml", name: "PDF to XML", category: "convert-from", icon: "xml", desc: "Map document nodes directly into hierarchical semantic markup tags." },

    // --- CATEGORY 4: CONVERT TO PDF (56-75) ---
    { id: "jpg-to-pdf", name: "JPG to PDF", category: "convert-to", icon: "jpg", desc: "Convert JPG images to PDF with adjustable margins." },
    { id: "png-to-pdf", name: "PNG to PDF", category: "convert-to", icon: "png-in", desc: "Transform high-fidelity transparent PNGs into standard vectors." },
    { id: "word-to-pdf", name: "Word to PDF", category: "convert-to", icon: "word-in", desc: "Render text formatting elements perfectly into PDF canvas." },
    { id: "excel-to-pdf", name: "Excel to PDF", category: "convert-to", icon: "excel-in", desc: "Format messy grid sheets into structured printable page views." },
    { id: "ppt-to-pdf", name: "PowerPoint to PDF", category: "convert-to", icon: "ppt-in", desc: "Freeze slide transitions into beautiful portfolio documents." },
    { id: "txt-to-pdf", name: "Text to PDF", category: "convert-to", icon: "txt-in", desc: "Convert raw text inputs into multi-page formatted layouts." },
    { id: "html-to-pdf", name: "HTML to PDF", category: "convert-to", icon: "html-in", desc: "Render live URLs or source codes directly into vectors." },
    { id: "epub-to-pdf", name: "EPUB to PDF", category: "convert-to", icon: "epub-in", desc: "Convert flowable digital book assets into fixed print documents." },
    { id: "webp-to-pdf", name: "WebP to PDF", category: "convert-to", icon: "webp-in", desc: "Pack responsive web image formats together into a single file." },
    { id: "svg-to-pdf", name: "SVG to PDF", category: "convert-to", icon: "svg-in", desc: "Translate complex vector nodes accurately into core PDF paths." },
    { id: "csv-to-pdf", name: "CSV to PDF", category: "convert-to", icon: "csv-in", desc: "Parse raw values into clean custom borders and clean tables." },
    { id: "markdown-to-pdf", name: "Markdown to PDF", category: "convert-to", icon: "md-in", desc: "Convert documentation markup directly into standard layout grids." },
    { id: "json-to-pdf", name: "JSON to PDF", category: "convert-to", icon: "json-in", desc: "Render structural programmatic trees into visual data nodes." },
    { id: "rtf-to-pdf", name: "RTF to PDF", category: "convert-to", icon: "rtf-in", desc: "Transform rich text strings into production ready formats." },
    { id: "tiff-to-pdf", name: "TIFF to PDF", category: "convert-to", icon: "tiff-in", desc: "Convert massive uncompressed printing frames into scalable assets." },
    { id: "gif-to-pdf", name: "GIF to PDF", category: "convert-to", icon: "gif-in", desc: "Flatten frame animations into standard multi-page static views." },
    { id: "bmp-to-pdf", name: "BMP to PDF", category: "convert-to", icon: "bmp-in", desc: "Convert old uncompressed raster bits into optimized documents." },
    { id: "odt-to-pdf", name: "ODT to PDF", category: "convert-to", icon: "odt-in", desc: "Render open source text processing files cleanly into canvas paths." },
    { id: "ods-to-pdf", name: "ODS to PDF", category: "convert-to", icon: "ods-in", desc: "Transform open source sheets cleanly into standard printable arrays." },
    { id: "xml-to-pdf", name: "XML to PDF", category: "convert-to", icon: "xml-in", desc: "Parse custom tags through visual engines to construct pages." },

    // --- CATEGORY 5: SECURITY & ADVANCED (76-100) ---
    { id: "protect-pdf", name: "Protect PDF", category: "security", icon: "lock", desc: "Encrypt your PDF with standard strong user passwords." },
    { id: "unlock-pdf", name: "Unlock PDF", category: "security", icon: "unlock", desc: "Strip password security permissions out of valid targets." },
    { id: "ocr-pdf", name: "OCR PDF", category: "security", icon: "ocr", desc: "Convert scanned images inside pages into searchable text nodes." },
    { id: "redact-pdf", name: "Redact PDF", category: "security", icon: "eye-off", desc: "Permanently black-out highly confidential strings or shapes." },
    { id: "sanitize-pdf", name: "Sanitize PDF", category: "security", icon: "shield", desc: "Strip hidden document objects like javascripts, links and tags." },
    { id: "digital-seal", name: "Apply Digital Seal", category: "security", icon: "seal", desc: "Embed cryptographically verifiable cryptographic hashes." },
    { id: "validate-signature", name: "Validate Signature", category: "security", icon: "check-circle", desc: "Check authenticity tokens of signed document components." },
    { id: "compare-pdf", name: "Compare PDFs", category: "security", icon: "columns", desc: "Analyze visual structural variance between two file variations." },
    { id: "barcode-generator", name: "Add Barcodes", category: "security", icon: "barcode", desc: "Generate and place programmatic raw barcodes onto surfaces." },
    { id: "qr-generator", name: "Add QR Codes", category: "security", icon: "qr", desc: "Stitch interactive scannable matrix barcodes straight to layouts." },
    { id: "extract-images-raw", name: "Extract All Graphics", category: "security", icon: "extract-img", desc: "Rip original asset vectors out without altering pixels." },
    { id: "extract-text-raw", name: "Extract Fast Text", category: "security", icon: "extract-txt", desc: "Dump string coordinates for analysis." },
    { id: "pdf-a-converter", name: "PDF/A Converter", category: "security", icon: "archive", desc: "Transform standards into ISO-compliant long term archiving forms." },
    { id: "linearize-pdf", name: "Fast Web View", category: "security", icon: "bolt", desc: "Reorder internal object stream tables for progressive loading." },
    { id: "bates-numbering", name: "Bates Numbering", category: "security", icon: "bates", desc: "Apply index codes down operational accounting streams." },
    { id: "change-permissions", name: "Set Permissions", category: "security", icon: "key", desc: "Allow/restrict operations like modifying layout structure or print resolution." },
    { id: "compress-heavy", name: "Extreme Compression", category: "security", icon: "weight", desc: "Force aggressive multi-pass compression filters on targets." },
    { id: "image-compressor", name: "Image Compressor", category: "security", icon: "image-reduce", desc: "Compress standalone JPG, PNG, and WebP images client-side." },
    { id: "remove-metadata", name: "Strip Metadata", category: "security", icon: "clean", desc: "Wipe all tracking headers, dates, and author logs." },
    { id: "watermark-image", name: "Image Watermark", category: "security", icon: "img-water", desc: "Layer transparent images onto document layers." },
    { id: "merge-secure", name: "Secure Merge", category: "security", icon: "lock-merge", desc: "Merge encrypted targets by declaring target secrets." },
    { id: "split-by-bookmarks", name: "Split by Bookmark", category: "security", icon: "bookmark", desc: "Slice complex structured books at visual outline index nodes." },
    { id: "split-by-size", name: "Split by Max Size", category: "security", icon: "pie-chart", desc: "Auto-chop massive layouts into manageable bite chunks." },
    { id: "remove-empty", name: "Drop Blank Pages", category: "security", icon: "ghost", desc: "Auto-detect and drop empty pages using white pixel scanning." },
    { id: "pdf-to-pdfa", name: "Convert PDF to PDF/A", category: "security", icon: "iso", desc: "Convert standard files to archive standard format." }
];

// ==========================================
// 2. CORE HYBRID ENGINE & INITIALIZATION
// ==========================================
class PDFExpertEngine {
    constructor() {
        this.pdfLibInstance = null;
        this.currentActiveTool = null;
        this.uploadedFilesPool = [];
        
        this.initDOM();
        this.loadPDFLib();
    }

    /**
     * Load PDF-Lib library asynchronously and completely client-side
     */
    async loadPDFLib() {
        try {
            if (typeof window.PDFLib !== 'undefined') {
                this.pdfLibInstance = window.PDFLib;
                console.log("PDF-Lib loaded successfully via window.");
                return;
            }
            // Dynamic fallback injection
            const script = document.createElement('script');
            script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
            script.async = true;
            script.onload = () => {
                this.pdfLibInstance = window.PDFLib;
                console.log("PDF-Lib dynamically initialized securely.");
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error("Critical: Error initializing core client side PDF-Lib engine:", error);
        }
    }

    /**
     * DOM elements and main interface wiring
     */
    initDOM() {
        this.toolsGrid = document.querySelector('.tools-grid');
        this.searchBarInput = document.querySelector('.search-bar input');
        this.categoryFilters = document.querySelectorAll('.category-filter-btn');

        if (this.toolsGrid) {
            this.renderTools(PDFExpertTools);
        }
        this.setupEventHandlers();
    }

    /**
     * Safe events registering
     */
    setupEventHandlers() {
        if (this.searchBarInput) {
            this.searchBarInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (this.categoryFilters) {
            this.categoryFilters.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const category = e.target.getAttribute('data-category');
                    this.filterByCategory(category);
                });
            });
        }
    }

    // ==========================================
    // 3. UI RENDERING & FILTER LOGIC (CSS-First)
    // ==========================================
    
    /**
     * Render the 100 tools dynamically into HTML structure
     * (Visual styles are completely kept inside style.css)
     */
    renderTools(toolsList) {
        this.toolsGrid.innerHTML = '';
        
        if (toolsList.length === 0) {
            this.toolsGrid.innerHTML = `<div class="no-results">No tools found matching your request.</div>`;
            return;
        }

        toolsList.forEach(tool => {
            const card = document.createElement('article');
            card.className = 'tool-card';
            card.setAttribute('data-id', tool.id);
            card.setAttribute('data-category', tool.category);

            // [CHANGE 1]: Set direct workspace links for active tools, otherwise use hash router anchor
            const isTargetTool = (tool.id === "jpg-to-pdf" || tool.id === "png-to-pdf");
            const finalLink = isTargetTool ? "tools/image-to-pdf/index.html" : `#/tool/${tool.id}`;

            card.innerHTML = `
                <a href="${finalLink}" class="tool-link" aria-label="${tool.name}"></a>
                <div class="tool-icon" data-icon="${tool.icon}">
                    <!-- SVG placeholders dynamically customizable by CSS selectors -->
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                </div>
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
                <span class="btn btn-outline-tool">Open Tool</span>
            `;

            // Action dispatcher inside tool execution
            card.querySelector('.btn').addEventListener('click', (e) => {
                if (!isTargetTool) {
                    e.preventDefault();
                }
                this.launchTool(tool.id);
            });

            this.toolsGrid.appendChild(card);
        });
    }

    /**
     * High performance search handling across 100 tools
     */
    handleSearch(query) {
        const cleanQuery = query.toLowerCase().trim();
        const filtered = PDFExpertTools.filter(tool => 
            tool.name.toLowerCase().includes(cleanQuery) || 
            tool.desc.toLowerCase().includes(cleanQuery)
        );
        this.renderTools(filtered);
    }

    /**
     * Filter array structures down to explicit categorical groups
     */
    filterByCategory(category) {
        if (!category || category === 'all') {
            this.renderTools(PDFExpertTools);
            return;
        }
        const filtered = PDFExpertTools.filter(tool => tool.category === category);
        this.renderTools(filtered);
    }

    // ==========================================
    // 4. ACTION CONTROLLERS & CORE UTILITIES
    // ==========================================

    /**
     * Launch target document tool logic dynamically
     */
    launchTool(toolId) {
        this.currentActiveTool = toolId;
        console.log(`Core Engine Action: Launching ${toolId}`);
        
        // [CHANGE 2]: Handle routing logic cleanly. If it's the completed tool, allow browser navigation, else trigger alert
        if (toolId === "jpg-to-pdf" || toolId === "png-to-pdf") {
            window.location.href = "tools/image-to-pdf/index.html";
        } else {
            alert(`${toolId.toUpperCase().replace(/-/g, ' ')} tool is coming soon in the next release batch!`);
        }
    }

    // ==========================================
    // 5. PRODUCTION-READY CORE REUSABLE OFFLINE ENGINES
    // ==========================================

    /**
     * 100% Client-Side PDF Merge Engine via PDF-Lib
     * Processes array of ArrayBuffers locally
     */
    async executeMergePDF(arrayBuffersList) {
        if (!this.pdfLibInstance) throw new Error("PDF-Lib core engine is not loaded yet.");
        
        const mergedPdf = await this.pdfLibInstance.PDFDocument.create();
        
        for (const buffer of arrayBuffersList) {
            const srcDoc = await this.pdfLibInstance.PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        return this.triggerLocalDownload(mergedPdfBytes, "merged-document.pdf", "application/pdf");
    }

    /**
     * 100% Client-Side Page Extractor / Delete Engine
     */
    async executeExtractPages(sourceBuffer, pagesArrayToKeep) {
        if (!this.pdfLibInstance) throw new Error("PDF-Lib core engine is not loaded yet.");
        
        const srcDoc = await this.pdfLibInstance.PDFDocument.load(sourceBuffer);
        const extractedPdf = await this.pdfLibInstance.PDFDocument.create();
        
        // pagesArrayToKeep expects 0-indexed values e.g., [0, 2, 5]
        const copiedPages = await extractedPdf.copyPages(srcDoc, pagesArrayToKeep);
        copiedPages.forEach((page) => extractedPdf.addPage(page));
        
        const extractedPdfBytes = await extractedPdf.save();
        return this.triggerLocalDownload(extractedPdfBytes, "extracted-document.pdf", "application/pdf");
    }

    /**
     * Secure Direct Download Trigger (Zero Upload Server Reliance)
     */
    triggerLocalDownload(uint8ArrayData, filename, mimeType) {
        const blob = new Blob([uint8ArrayData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        
        downloadAnchor.href = url;
        downloadAnchor.download = filename;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        
        // Clean memory streams safely
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
        return true;
    }
}

// Instantiate the architecture when the DOM context fully mounts
window.PDFExpertCore = new PDFExpertEngine();
