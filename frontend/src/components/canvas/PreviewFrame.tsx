import { useEffect, useRef } from 'react';
import { useWebsiteStore } from '@/store/websiteStore';

export function PreviewFrame() {
  const { htmlCode, cssCode, jsCode } = useWebsiteStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const document = iframe.contentDocument;

    if (!document) return;

    if (!htmlCode && !cssCode) return;

    // Combine HTML, CSS, and JS
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        ${cssCode || ''}
        </style>
      </head>
      <body>
        ${htmlCode || '<p>No content yet...</p>'}
        <script>
        ${jsCode || ''}
        </script>
      </body>
      </html>
    `;

    document.open();
    document.write(fullHTML);
    document.close();
  }, [htmlCode, cssCode, jsCode]);

  return (
    <div className="flex items-center justify-center h-full w-full bg-background p-4">
      <iframe
        ref={iframeRef}
        className="w-full h-full bg-white border-0 rounded-lg shadow-2xl"
        sandbox="allow-scripts allow-same-origin"
        title="Website Preview"
      />
    </div>
  );
}
