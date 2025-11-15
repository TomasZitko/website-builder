import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useWebsiteStore } from '@/store/websiteStore';
import { cn } from '@/utils/cn';
import { Save, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type CodeType = 'html' | 'css' | 'js';

interface CodeEditorProps {
  readonly?: boolean;
}

export function CodeEditor({ readonly = false }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<CodeType>('html');
  const { htmlCode, cssCode, jsCode, setCode, websiteId, saveVersion, isSaving } = useWebsiteStore();
  const [localCode, setLocalCode] = useState({ html: htmlCode, css: cssCode, js: jsCode });
  const [hasChanges, setHasChanges] = useState(false);

  // Update local code when store code changes
  useEffect(() => {
    setLocalCode({ html: htmlCode, css: cssCode, js: jsCode });
    setHasChanges(false);
  }, [htmlCode, cssCode, jsCode]);

  const codeMap = {
    html: localCode.html,
    css: localCode.css,
    js: localCode.js
  };

  const languageMap = {
    html: 'html',
    css: 'css',
    js: 'javascript'
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !readonly) {
      setLocalCode(prev => ({ ...prev, [activeTab]: value }));

      // Check if there are changes
      const currentCode = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
      setHasChanges(value !== currentCode);
    }
  };

  const handleSave = async () => {
    if (!websiteId || !hasChanges) return;

    try {
      // Update store with local changes
      setCode(localCode.html, localCode.css, localCode.js);

      // Save version to backend
      await saveVersion(websiteId, 'Manual code edit');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Tabs and Save Button */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        {/* Tabs */}
        <div className="flex gap-2">
          {(['html', 'css', 'js'] as CodeType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === type
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text hover:bg-panel'
              )}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Save Button */}
        {!readonly && hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={languageMap[activeTab]}
          value={codeMap[activeTab]}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: readonly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
