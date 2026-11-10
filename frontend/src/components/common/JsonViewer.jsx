import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function JsonViewer({ data, title = 'RAW METADATA', defaultOpen = false }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 rounded border border-dark-700 bg-dark-900/80 overflow-hidden text-xs font-mono">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 bg-dark-850 hover:bg-dark-800 cursor-pointer border-b border-dark-700/60 select-none"
      >
        <span className="text-[11px] font-semibold text-dark-400 flex items-center gap-2">
          <span className={`transform transition-transform text-[10px] ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          {title}
        </span>
        <button
          onClick={handleCopy}
          className="text-dark-400 hover:text-dark-200 transition-colors flex items-center gap-1 text-[11px]"
          title="Copy JSON"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {isOpen && (
        <pre className="p-3 text-[11px] text-dark-300 overflow-x-auto max-h-72 leading-relaxed">
          {jsonString}
        </pre>
      )}
    </div>
  );
}

