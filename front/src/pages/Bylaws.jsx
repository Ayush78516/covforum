import { useEffect, useRef, useState } from "react";

const PDF_URL = "/assets/laws.pdf";
const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

function Bylaws() {
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const pageRenderingRef = useRef(false);
  const pageNumPendingRef = useRef(null);
  const scaleRef = useRef(1.5);
  const rotationRef = useRef(0);

  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(150);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  const renderPage = (num) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    pageRenderingRef.current = true;

    pdfDocRef.current.getPage(num).then((page) => {
      const viewport = page.getViewport({
        scale: scaleRef.current,
        rotation: rotationRef.current,
      });

      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const ctx = canvas.getContext("2d");
      const renderTask = page.render({ canvasContext: ctx, viewport });

      renderTask.promise.then(() => {
        pageRenderingRef.current = false;
        if (pageNumPendingRef.current !== null) {
          renderPage(pageNumPendingRef.current);
          pageNumPendingRef.current = null;
        }
      });
    });

    setPageNum(num);
    setPrevDisabled(num <= 1);
    setNextDisabled(num >= (pdfDocRef.current?.numPages || 1));
  };

  const queueRenderPage = (num) => {
    if (pageRenderingRef.current) {
      pageNumPendingRef.current = num;
    } else {
      renderPage(num);
    }
  };

  useEffect(() => {
    // Load PDF.js script dynamically
    const script = document.createElement("script");
    script.src = PDFJS_URL;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      window.pdfjsLib.getDocument(PDF_URL).promise.then((pdfDoc) => {
        pdfDocRef.current = pdfDoc;
        setPageCount(pdfDoc.numPages);
        setNextDisabled(pdfDoc.numPages <= 1);
        renderPage(1);
      });
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePrev = () => {
    if (pageNum <= 1) return;
    queueRenderPage(pageNum - 1);
  };

  const handleNext = () => {
    if (!pdfDocRef.current || pageNum >= pdfDocRef.current.numPages) return;
    queueRenderPage(pageNum + 1);
  };

  const handleZoomIn = () => {
    scaleRef.current += 0.25;
    setZoomLevel(Math.round(scaleRef.current * 100));
    queueRenderPage(pageNum);
  };

  const handleZoomOut = () => {
    if (scaleRef.current <= 0.5) return;
    scaleRef.current -= 0.25;
    setZoomLevel(Math.round(scaleRef.current * 100));
    queueRenderPage(pageNum);
  };

  const handleRotate = () => {
    rotationRef.current = (rotationRef.current + 90) % 360;
    queueRenderPage(pageNum);
  };

  const handleFullscreen = () => {
    const container = document.getElementById("canvasContainer");
    if (container?.requestFullscreen) container.requestFullscreen();
    else if (container?.webkitRequestFullscreen) container.webkitRequestFullscreen();
    else if (container?.msRequestFullscreen) container.msRequestFullscreen();
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = PDF_URL;
    link.download = "bylaws.pdf";
    link.click();
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>By-Laws</h1>
      </section>

      {/* PDF SECTION */}
      <section className="pdf-section">
        <div className="pdf-container">

          {/* Controls */}
          <div className="pdf-controls">
            <div className="pdf-controls-left">
              <button onClick={handlePrev} disabled={prevDisabled}>
                &#8249; Previous
              </button>
              <span className="pdf-info">
                Page <span>{pageNum}</span> / <span>{pageCount}</span>
              </span>
              <button onClick={handleNext} disabled={nextDisabled}>
                Next &#8250;
              </button>
            </div>

            <div className="pdf-controls-center">
              <button onClick={handleZoomOut}>&#8722;</button>
              <span className="zoom-level">{zoomLevel}%</span>
              <button onClick={handleZoomIn}>&#43;</button>
            </div>

            <div className="pdf-controls-right">
              <button onClick={handleRotate}>↻ Rotate</button>
              <button onClick={handleFullscreen}>⛶ Fullscreen</button>
            </div>
          </div>

          {/* Canvas */}
          <div className="pdf-canvas-container" id="canvasContainer">
            <canvas ref={canvasRef} id="pdfCanvas"></canvas>
          </div>

          {/* Download */}
          <div className="download-section">
            <button className="download-btn" onClick={handleDownload}>
              ⬇ Download By-Laws PDF
            </button>
          </div>

        </div>
      </section>
    </>
  );
}

export default Bylaws;