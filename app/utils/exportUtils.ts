import { Presentation } from '@/app/types/presentation';

export function exportToPDF(presentation: Presentation): void {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${presentation.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .slide {
          width: 210mm;
          height: 148mm;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding: 40px;
        }
        .slide:last-child { page-break-after: avoid; }
        .element {
          position: absolute;
          word-wrap: break-word;
        }
        .title { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; }
        .subtitle { font-size: 1.5rem; margin-bottom: 2rem; }
        .body { font-size: 1.25rem; line-height: 1.6; }
        @media print {
          .slide {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 5%;
          }
        }
      </style>
    </head>
    <body>
      ${presentation.slides.map(slide => `
        <div class="slide" style="background: ${slide.background.color};">
          ${slide.elements.map(element => `
            <div class="element ${element.type}" style="
              left: ${element.position.x}px;
              top: ${element.position.y}px;
              width: ${element.size.width}px;
              height: ${element.size.height}px;
              font-size: ${element.style.fontSize}px;
              color: ${element.style.color};
              font-weight: ${element.style.fontWeight};
              text-align: ${element.style.textAlign};
              font-family: ${element.style.fontFamily};
              line-height: ${element.style.lineHeight};
            ">
              ${element.content.replace(/\n/g, '<br>')}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export function exportToHTML(presentation: Presentation): void {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${presentation.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: #000;
          overflow: hidden;
        }
        .presentation {
          width: 100vw;
          height: 100vh;
          position: relative;
        }
        .slide {
          width: 100%;
          height: 100%;
          position: absolute;
          display: none;
          justify-content: center;
          align-items: center;
          padding: 5%;
        }
        .slide.active { display: flex; }
        .element {
          position: absolute;
          word-wrap: break-word;
        }
        .controls {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 10px 20px;
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn:hover { background: rgba(255,255,255,1); }
        .slide-counter {
          position: fixed;
          top: 20px;
          right: 20px;
          color: white;
          background: rgba(0,0,0,0.7);
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div class="presentation">
        ${presentation.slides.map((slide, index) => `
          <div class="slide ${index === 0 ? 'active' : ''}" id="slide-${index}" style="background: ${slide.background.color};">
            ${slide.elements.map(element => `
              <div class="element" style="
                left: ${element.position.x}px;
                top: ${element.position.y}px;
                width: ${element.size.width}px;
                height: ${element.size.height}px;
                font-size: ${element.style.fontSize}px;
                color: ${element.style.color};
                font-weight: ${element.style.fontWeight};
                text-align: ${element.style.textAlign};
                font-family: ${element.style.fontFamily};
                line-height: ${element.style.lineHeight};
              ">
                ${element.content.replace(/\n/g, '<br>')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      
      <div class="slide-counter">
        <span id="current">1</span> / <span id="total">${presentation.slides.length}</span>
      </div>
      
      <div class="controls">
        <button class="btn" onclick="previousSlide()">← Previous</button>
        <button class="btn" onclick="nextSlide()">Next →</button>
      </div>
      
      <script>
        let currentSlide = 0;
        const totalSlides = ${presentation.slides.length};
        
        function showSlide(index) {
          document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
          });
          document.getElementById('slide-' + index).classList.add('active');
          document.getElementById('current').textContent = index + 1;
        }
        
        function nextSlide() {
          if (currentSlide < totalSlides - 1) {
            currentSlide++;
            showSlide(currentSlide);
          }
        }
        
        function previousSlide() {
          if (currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
          }
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
          if (e.key === 'ArrowLeft') previousSlide();
          if (e.key === 'Home') { currentSlide = 0; showSlide(currentSlide); }
          if (e.key === 'End') { currentSlide = totalSlides - 1; showSlide(currentSlide); }
        });
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function sharePresentation(presentation: Presentation): string {
  // Create a shareable URL with presentation data encoded
  const data = btoa(JSON.stringify(presentation));
  return `${window.location.origin}${window.location.pathname}?presentation=${data}`;
}