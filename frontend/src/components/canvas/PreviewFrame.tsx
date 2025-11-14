import { useEffect, useRef } from 'react';
import { useWebsiteStore } from '@/store/websiteStore';
import { cn } from '@/utils/cn';

const deviceSizes = {
  desktop: 'w-full h-full',
  tablet: 'w-[768px] h-[1024px]',
  mobile: 'w-[375px] h-[667px]'
};

export function PreviewFrame() {
  const { htmlCode, cssCode, jsCode, deviceType } = useWebsiteStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('🎨 PreviewFrame rendering with:', {
      hasHTML: !!htmlCode,
      hasCSS: !!cssCode,
      hasJS: !!jsCode,
      htmlLength: htmlCode?.length || 0,
      cssLength: cssCode?.length || 0,
      jsLength: jsCode?.length || 0
    });

    if (!iframeRef.current) {
      console.warn('⚠️ Iframe ref not available');
      return;
    }

    const iframe = iframeRef.current;
    const document = iframe.contentDocument;

    if (!document) {
      console.warn('⚠️ Iframe document not available');
      return;
    }

    if (!htmlCode && !cssCode) {
      console.log('📭 No code to render yet');
      return;
    }

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

    console.log('✅ Writing to iframe, HTML length:', fullHTML.length);
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
