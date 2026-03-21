import React, { useState, useRef, useCallback, useEffect } from 'react';

const SYNTAX_KEYWORDS = {
  js: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|switch|case|break|default|typeof|instanceof)\b/g,
  py: /\b(def|class|import|from|return|if|elif|else|for|while|try|except|raise|with|as|yield|async|await|lambda|pass|break|continue|and|or|not|in|is)\b/g,
};

const SYNTAX_STRINGS = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
const SYNTAX_COMMENTS = /\/\/.*$|#.*$/gm;
const SYNTAX_NUMBERS = /\b\d+\.?\d*\b/g;

function highlightCode(code, lang) {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(SYNTAX_COMMENTS, '<span class="syn-comment">$&</span>');
  html = html.replace(SYNTAX_STRINGS, '<span class="syn-string">$&</span>');
  const kw = SYNTAX_KEYWORDS[lang] || SYNTAX_KEYWORDS.js;
  html = html.replace(kw, '<span class="syn-keyword">$&</span>');
  html = html.replace(SYNTAX_NUMBERS, '<span class="syn-number">$&</span>');
  return html;
}

const DEFAULT_CODE = `// HeadyAI-IDE — Powered by Sacred Geometry
// HCFullPipeline v8.0 · Auto-Success Engine · 13 Agent Categories

import { HeadyBrain } from '@heady/brain';
import { HCPipeline } from '@heady/pipeline';
import { AutoSuccess } from '@heady/auto-success';

const PHI = 1.618033988749895;

async function initHeady() {
  const brain = new HeadyBrain({ model: 'premium' });
  const pipeline = new HCPipeline({ stages: 9, deterministic: true });
  const autoSuccess = new AutoSuccess({
    categories: 13,
    tasks: 144,
    heartbeat: Math.pow(PHI, 7) * 1000,
  });

  // Start the Auto-Success Engine
  await autoSuccess.start();
  console.log('[Heady] ORS:', autoSuccess.getORS()); // Always 100

  // Run the pipeline
  const result = await pipeline.run({
    stages: ['ingest', 'plan', 'execute', 'recover', 'critique', 'optimize', 'finalize', 'monitor'],
    concurrency: 8, // fib(6)
    seed: 'heady-sacred-geometry-seed',
  });

  return { brain, pipeline, autoSuccess, result };
}

initHeady().then(({ result }) => {
  console.log('[HCFullPipeline] Complete:', result.status);
});
`;

export default function EditorPanel() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('js');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fileName, setFileName] = useState('heady-init.js');
  const [modified, setModified] = useState(false);
  const textareaRef = useRef(null);

  const lines = code.split('\n');

  const handleChange = (e) => {
    setCode(e.target.value);
    setModified(true);
    updateCursor(e.target);
  };

  const updateCursor = (el) => {
    const val = el.value.substring(0, el.selectionStart);
    const lineNum = val.split('\n').length;
    const colNum = val.split('\n').pop().length + 1;
    setCursorPos({ line: lineNum, col: colNum });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      setModified(false);
    }
  };

  const openFile = useCallback((name, content, lang) => {
    setFileName(name);
    setCode(content);
    setLanguage(lang || 'js');
    setModified(false);
  }, []);

  // Expose openFile globally for file tree integration
  useEffect(() => {
    window.__headyEditorOpen = openFile;
    return () => { delete window.__headyEditorOpen; };
  }, [openFile]);

  return (
    <div className="editor-panel">
      <div className="editor-tab-bar">
        <div className="editor-tab active">
          <span className="editor-tab-icon">📄</span>
          {fileName}
          {modified && <span className="modified-dot">●</span>}
        </div>
      </div>
      <div className="editor-body">
        <div className="line-numbers">
          {lines.map((_, i) => (
            <div key={i} className={`line-num ${cursorPos.line === i + 1 ? 'active' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="editor-code-area">
          <pre
            className="editor-highlight"
            dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }}
          />
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={e => updateCursor(e.target)}
            onKeyUp={e => updateCursor(e.target)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>
      <div className="editor-status-bar">
        <span className="editor-status-left">
          <span className="status-badge heady">HEADY EDITOR</span>
          <span>{fileName}</span>
        </span>
        <span className="editor-status-right">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{language.toUpperCase()}</span>
          <span>{lines.length} lines</span>
          <span>UTF-8</span>
        </span>
      </div>
    </div>
  );
}
