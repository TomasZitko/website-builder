import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useWebsiteStore } from '@/store/websiteStore';
import { cn } from '@/utils/cn';

type CodeType = 'html' | 'css' | 'js';

export function CodeEditor() {
  const [activeTab, setActiveTab] = useState<CodeType>('html');
  const { htmlCode, cssCode, jsCode } = useWebsiteStore();

  const codeMap = {
    html: htmlCode,
    css: cssCode,
    js: jsCode
  };

  const languageMap = {
    html: 'html',
    css: 'css',
    js: 'javascript'
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-border">
        {(['html', 'css', 'js'] as CodeType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === type
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text hover:bg-border'
            )}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[activeTab]}
          value={codeMap[activeTab]}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>
    </div>
  );
}
