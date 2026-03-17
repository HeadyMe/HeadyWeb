import React, { useState, useRef, useEffect, useCallback } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const IDE = {
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
  folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  folderOpen: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v1',
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6L6 18M6 6l12 12',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z',
  play: 'M5 3l14 9-14 9V3z',
  terminal: 'M4 17l6-6-6-6M12 19h8',
  git: 'M6 3v12M18 9a3 3 0 100 6 3 3 0 000-6zM6 21a3 3 0 100-6 3 3 0 000 6z',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  split: 'M12 3v18M3 3h18v18H3z',
  cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  sparkles: 'M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  chevDown: 'M6 9l6 6 6-6',
  chevRight: 'M9 6l6 6-6 6',
  settings: 'M12 8a4 4 0 100 8 4 4 0 000-8z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  copy: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2',
  check: 'M20 6L9 17l-5-5',
  minus: 'M5 12h14',
  diff: 'M12 3v18M3 12h18',
};

// ── Language definitions for syntax highlighting ──
const LANG_KEYWORDS = {
  javascript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue'],
    ext: ['js', 'jsx', 'mjs'],
  },
  python: {
    keywords: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'lambda', 'yield', 'raise', 'self'],
    ext: ['py'],
  },
  html: {
    keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'script', 'style', 'link', 'meta', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'section', 'nav', 'header', 'footer', 'main', 'article'],
    ext: ['html', 'htm'],
  },
  css: {
    keywords: ['color', 'background', 'display', 'flex', 'grid', 'margin', 'padding', 'border', 'font', 'position', 'width', 'height', 'top', 'left', 'right', 'bottom', 'z-index', 'opacity', 'transform', 'transition', 'animation', 'overflow', 'cursor', 'visibility'],
    ext: ['css', 'scss', 'less'],
  },
  json: { keywords: [], ext: ['json'] },
  yaml: { keywords: [], ext: ['yaml', 'yml'] },
};

function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  for (const [lang, def] of Object.entries(LANG_KEYWORDS)) {
    if (def.ext.includes(ext)) return lang;
  }
  return 'text';
}

function getLanguageLabel(lang) {
  const labels = { javascript: 'JavaScript', python: 'Python', html: 'HTML', css: 'CSS', json: 'JSON', yaml: 'YAML', text: 'Plain Text' };
  return labels[lang] || lang;
}

// ── Syntax Highlighter (simple CSS-class-based) ──
function highlightCode(code, language) {
  if (!code) return '';
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // String highlighting
  html = html.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="ide-string">$&</span>');

  // Comment highlighting
  html = html.replace(/(\/\/.*$)/gm, '<span class="ide-comment">$&</span>');
  html = html.replace(/(#.*$)/gm, '<span class="ide-comment">$&</span>');

  // Number highlighting
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="ide-number">$&</span>');

  // Keyword highlighting
  const langDef = LANG_KEYWORDS[language];
  if (langDef && langDef.keywords.length > 0) {
    const kwRegex = new RegExp(`\\b(${langDef.keywords.join('|')})\\b`, 'g');
    html = html.replace(kwRegex, '<span class="ide-keyword">$&</span>');
  }

  // Function calls
  html = html.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="ide-function">$1</span>(');

  return html;
}

// ── Virtual File System ──
const DEFAULT_FILES = {
  'project': {
    type: 'folder',
    children: {
      'src': {
        type: 'folder',
        children: {
          'index.js': {
            type: 'file',
            content: `// HeadyWeb Cloud Project
import { HeadyBrain } from '@heady/brain';
import { createApp } from './app.js';

const brain = new HeadyBrain({
  model: 'heady-brain-pro',
  temperature: 0.7,
  endpoint: 'https://manager.headysystems.com/api/brain/chat'
});

async function main() {
  const app = createApp();

  // Initialize HeadyBrain connection
  await brain.connect();
  console.log('HeadyBrain connected!');

  // Start the application
  app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('HeadyBrain AI: Ready');
  });
}

main().catch(console.error);
`,
          },
          'app.js': {
            type: 'file',
            content: `// Application setup
export function createApp() {
  const routes = new Map();

  return {
    get(path, handler) {
      routes.set(\`GET:\${path}\`, handler);
    },
    post(path, handler) {
      routes.set(\`POST:\${path}\`, handler);
    },
    listen(port, callback) {
      callback?.();
      return { port, routes: routes.size };
    }
  };
}
`,
          },
          'styles.css': {
            type: 'file',
            content: `/* Sacred Geometry Theme */
:root {
  --bg-primary: #06091a;
  --bg-secondary: #0d1325;
  --text-primary: #e8f0fe;
  --text-secondary: rgba(200, 214, 229, 0.65);
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-cyan: #06b6d4;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.sacred-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.sacred-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
}
`,
          },
        },
      },
      'config': {
        type: 'folder',
        children: {
          'heady.config.json': {
            type: 'file',
            content: `{
  "name": "my-heady-project",
  "version": "1.0.0",
  "brain": {
    "model": "heady-brain-pro",
    "temperature": 0.7,
    "maxTokens": 4096
  },
  "cloud": {
    "provider": "heady-cloud",
    "region": "us-east-1",
    "autoScale": true
  },
  "features": {
    "headyBattle": true,
    "hcfp": true,
    "sacredGeometry": true
  }
}
`,
          },
        },
      },
      'README.md': {
        type: 'file',
        content: `# My HeadyCloud Project

A cloud-native application powered by HeadyBrain AI.

## Getting Started

\`\`\`bash
heady init
heady dev
\`\`\`

## Features

- HeadyBrain AI integration
- HeadyBattle verification
- HCFP enforcement
- Sacred Geometry UI patterns

## Deploy

\`\`\`bash
heady deploy --cloud
\`\`\`

Built with HeadyWeb IDE on HeadyCloud.
`,
      },
      'package.json': {
        type: 'file',
        content: `{
  "name": "my-heady-project",
  "version": "1.0.0",
  "description": "A HeadyCloud project",
  "main": "src/index.js",
  "scripts": {
    "dev": "heady dev",
    "build": "heady build",
    "deploy": "heady deploy --cloud",
    "test": "heady test"
  },
  "dependencies": {
    "@heady/brain": "^2.0.0",
    "@heady/cloud": "^1.5.0",
    "@heady/mcp": "^1.2.0"
  }
}
`,
      },
    },
  },
};

function flattenFiles(tree, path = '') {
  const result = [];
  for (const [name, node] of Object.entries(tree)) {
    const fullPath = path ? `${path}/${name}` : name;
    if (node.type === 'folder') {
      result.push({ name, path: fullPath, type: 'folder' });
      result.push(...flattenFiles(node.children, fullPath));
    } else {
      result.push({ name, path: fullPath, type: 'file', content: node.content });
    }
  }
  return result;
}

// ── File Tree Component ──
function FileTree({ files, selectedFile, onSelectFile, onNewFile }) {
  const [expanded, setExpanded] = useState(new Set(['project', 'project/src', 'project/config']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const toggleFolder = (path) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop();
    const icons = {
      js: '📜', jsx: '⚛️', py: '🐍', html: '🌐', css: '🎨',
      json: '📋', md: '📝', yaml: '⚙️', yml: '⚙️', txt: '📄',
    };
    return icons[ext] || '📄';
  };

  const renderTree = (tree, path = '', depth = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isExpanded = expanded.has(fullPath);

      if (node.type === 'folder') {
        return (
          <div key={fullPath}>
            <div className={`ide-tree-item folder`} style={{ paddingLeft: depth * 12 + 8 }}
              onClick={() => toggleFolder(fullPath)}>
              <Icon d={isExpanded ? IDE.chevDown : IDE.chevRight} size={10} className="text-white/30 mr-1" />
              <span className="text-sm mr-1">{isExpanded ? '📂' : '📁'}</span>
              <span className="ide-tree-name">{name}</span>
            </div>
            {isExpanded && renderTree(node.children, fullPath, depth + 1)}
          </div>
        );
      }
      return (
        <div key={fullPath}
          className={`ide-tree-item file ${selectedFile === fullPath ? 'active' : ''}`}
          style={{ paddingLeft: depth * 12 + 24 }}
          onClick={() => onSelectFile(fullPath, node.content)}>
          <span className="text-xs mr-1.5">{getFileIcon(name)}</span>
          <span className="ide-tree-name">{name}</span>
        </div>
      );
    });
  };

  return (
    <div className="ide-file-tree">
      <div className="ide-tree-header">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1">
          <button className="ide-tree-btn" onClick={() => setShowSearch(!showSearch)} title="Search Files (Cmd+P)">
            <Icon d={IDE.search} size={12} />
          </button>
          <button className="ide-tree-btn" onClick={onNewFile} title="New File">
            <Icon d={IDE.plus} size={12} />
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="ide-tree-search">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files..." className="ide-tree-search-input" autoFocus />
        </div>
      )}
      <div className="ide-tree-list">
        {renderTree(DEFAULT_FILES)}
      </div>
    </div>
  );
}

// ── Code Editor Component ──
function CodeEditor({ file, content, language, onChange, lineNumbers = true }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumRef = useRef(null);

  const lines = content.split('\n');
  const lineCount = lines.length;

  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="ide-editor-wrap">
      {lineNumbers && (
        <div className="ide-line-numbers" ref={lineNumRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="ide-line-num">{i + 1}</div>
          ))}
        </div>
      )}
      <div className="ide-editor-container">
        <pre className="ide-highlight" ref={highlightRef}
          dangerouslySetInnerHTML={{ __html: highlightCode(content, language) + '\n' }} />
        <textarea
          ref={textareaRef}
          className="ide-textarea"
          value={content}
          onChange={e => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleTab}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off" />
      </div>
    </div>
  );
}

// ── Terminal Component ──
function IDETerminal({ onClose }) {
  const [history, setHistory] = useState([
    { type: 'system', text: 'HeadyCloud Terminal v1.0 — Connected to heady-cloud-us-east-1' },
    { type: 'system', text: 'Running on HeadyCloud infrastructure. Type "help" for commands.' },
    { type: 'output', text: '$ ' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const commands = {
    help: 'Available commands: help, clear, ls, cat, pwd, echo, heady, node, git, npm, whoami, date',
    clear: '__clear__',
    ls: 'README.md  package.json  src/  config/  node_modules/',
    pwd: '/home/heady/project',
    whoami: 'heady@heady-cloud-us-east-1',
    date: new Date().toLocaleString(),
    'heady status': 'HeadyBrain: connected | HeadyBattle: active | HCFP: enforced | Cloud: online',
    'heady version': 'HeadyCloud CLI v2.1.0',
    'node -v': 'v20.11.0',
    'npm -v': '10.2.4',
    'git status': 'On branch main\nnothing to commit, working tree clean',
    'git log': 'commit a1b2c3d (HEAD -> main)\nAuthor: Heady Developer\nDate:   Today\n\n    Initial commit with HeadyBrain integration',
    'npm install': 'added 42 packages in 1.2s\n\n3 packages are looking for funding\n  run `npm fund` for details',
    'heady dev': 'Starting development server...\n  Local:   http://localhost:3000\n  Cloud:   https://project.heady.cloud\n  Brain:   Connected to heady-brain-pro\n\nReady in 340ms',
    'heady deploy --cloud': 'Deploying to HeadyCloud...\n  Building... done\n  Uploading... done\n  Propagating... done\n\nDeployed! https://my-project.heady.cloud',
  };

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const newEntries = [{ type: 'input', text: `$ ${cmd}` }];

    if (cmd === 'clear') {
      setHistory([{ type: 'system', text: 'HeadyCloud Terminal v1.0' }]);
      setInput('');
      return;
    }

    const response = commands[cmd];
    if (response) {
      newEntries.push({ type: 'output', text: response });
    } else if (cmd.startsWith('echo ')) {
      newEntries.push({ type: 'output', text: cmd.slice(5) });
    } else if (cmd.startsWith('cat ')) {
      newEntries.push({ type: 'output', text: `Reading ${cmd.slice(4)}...\n(File contents would appear here)` });
    } else {
      newEntries.push({ type: 'error', text: `heady: command not found: ${cmd.split(' ')[0]}` });
    }

    setHistory(prev => [...prev, ...newEntries]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex]);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="ide-terminal">
      <div className="ide-terminal-header">
        <div className="flex items-center gap-2">
          <Icon d={IDE.terminal} size={12} className="text-green-400/60" />
          <span className="text-xs font-medium text-white/50">Terminal</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/70">HeadyCloud</span>
        </div>
        <button className="ide-tree-btn" onClick={onClose}>
          <Icon d={IDE.x} size={12} />
        </button>
      </div>
      <div className="ide-terminal-output" onClick={() => inputRef.current?.focus()}>
        {history.map((entry, i) => (
          <div key={i} className={`ide-term-line ${entry.type}`}>{entry.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleCommand} className="ide-terminal-input-row">
        <span className="text-green-400/60 text-xs mr-1">$</span>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="ide-terminal-input" autoFocus />
      </form>
    </div>
  );
}

// ── AI Assistant Panel ──
function AIAssistant({ onInsertCode }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Welcome to HeadyAI Code Assistant. I can help you write, debug, refactor, and explain code. I have full context of your project.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const quickActions = [
    'Explain this code',
    'Add error handling',
    'Write unit tests',
    'Optimize performance',
    'Add TypeScript types',
    'Generate API docs',
  ];

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);

    setTimeout(() => {
      let response;
      if (msg.includes('explain')) {
        response = 'This code sets up a HeadyBrain connection and creates an Express-like application server. The `createApp()` function returns an object with route registration methods (`get`, `post`) and a `listen` method that starts the server.\n\nKey patterns:\n- Factory function pattern for app creation\n- Map-based route storage for O(1) lookups\n- Async/await for brain initialization';
      } else if (msg.includes('error')) {
        response = 'Here\'s the code with error handling added:\n\n```javascript\nasync function main() {\n  try {\n    const app = createApp();\n    await brain.connect();\n    app.listen(3000, () => {\n      console.log(\'Server running\');\n    });\n  } catch (error) {\n    console.error(\'Failed to start:\', error);\n    process.exit(1);\n  }\n}\n```\n\nI\'ve wrapped the main function in a try-catch block with proper error logging and process exit.';
      } else if (msg.includes('test')) {
        response = 'Here are unit tests for your app:\n\n```javascript\nimport { createApp } from \'./app.js\';\n\ndescribe(\'createApp\', () => {\n  it(\'should create an app with get method\', () => {\n    const app = createApp();\n    expect(app.get).toBeDefined();\n  });\n\n  it(\'should register routes\', () => {\n    const app = createApp();\n    app.get(\'/test\', () => {});\n    const result = app.listen(3000);\n    expect(result.routes).toBe(1);\n  });\n});\n```';
      } else {
        response = `I'll help you with "${msg}". Based on your project structure, I can see you're building a HeadyBrain-powered application. Let me analyze the codebase and provide targeted suggestions.\n\nYour project uses:\n- HeadyBrain AI (v2.0.0)\n- HeadyCloud deployment\n- MCP integration\n\nWould you like me to elaborate on any specific aspect?`;
      }
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 600);
  };

  return (
    <div className="ide-ai-panel">
      <div className="ide-ai-header">
        <div className="flex items-center gap-2">
          <Icon d={IDE.sparkles} size={14} className="text-blue-400/60" />
          <span className="text-xs font-semibold text-white/60">HeadyAI Assistant</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400/70">AI</span>
        </div>
      </div>
      <div className="ide-ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ide-ai-msg ${m.role}`}>
            {m.role === 'assistant' && <span className="text-blue-400/50 text-[10px] font-medium mb-1 block">HeadyAI</span>}
            <div className="whitespace-pre-wrap text-xs leading-relaxed">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 && (
        <div className="ide-ai-quick-actions">
          {quickActions.map((a, i) => (
            <button key={i} className="ide-ai-action-chip" onClick={() => handleSend(a)}>
              <Icon d={IDE.zap} size={10} /> {a}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="ide-ai-input-row">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask HeadyAI about your code..." className="ide-ai-input" />
        <button type="submit" className="ide-ai-send">
          <Icon d={IDE.zap} size={12} />
        </button>
      </form>
    </div>
  );
}

// ── Git Panel ──
function GitPanel() {
  const [changes] = useState([
    { file: 'src/index.js', status: 'modified', staged: false },
    { file: 'src/app.js', status: 'modified', staged: true },
    { file: 'config/heady.config.json', status: 'new', staged: false },
  ]);
  const [commitMsg, setCommitMsg] = useState('');

  const statusColors = { modified: 'text-yellow-400', new: 'text-green-400', deleted: 'text-red-400' };
  const statusLabels = { modified: 'M', new: 'A', deleted: 'D' };

  return (
    <div className="ide-git-panel">
      <div className="ide-git-header">
        <div className="flex items-center gap-2">
          <Icon d={IDE.git} size={14} className="text-orange-400/60" />
          <span className="text-xs font-semibold text-white/60">Source Control</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400/70">main</span>
        </div>
      </div>
      <div className="ide-git-commit-input">
        <input type="text" value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
          placeholder="Commit message..." className="ide-git-msg-input" />
        <button className="ide-git-commit-btn" disabled={!commitMsg.trim()}>
          <Icon d={IDE.check} size={12} /> Commit
        </button>
      </div>
      <div className="ide-git-section">
        <div className="ide-git-section-title">Staged Changes ({changes.filter(c => c.staged).length})</div>
        {changes.filter(c => c.staged).map((c, i) => (
          <div key={i} className="ide-git-change">
            <span className={`ide-git-status ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
            <span className="ide-git-filename">{c.file}</span>
            <button className="ide-tree-btn"><Icon d={IDE.minus} size={10} /></button>
          </div>
        ))}
      </div>
      <div className="ide-git-section">
        <div className="ide-git-section-title">Changes ({changes.filter(c => !c.staged).length})</div>
        {changes.filter(c => !c.staged).map((c, i) => (
          <div key={i} className="ide-git-change">
            <span className={`ide-git-status ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
            <span className="ide-git-filename">{c.file}</span>
            <button className="ide-tree-btn"><Icon d={IDE.plus} size={10} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Command Palette ──
function CommandPalette({ onClose, onCommand }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const commands = [
    { id: 'new-file', label: 'New File', category: 'File' },
    { id: 'save', label: 'Save File', category: 'File', shortcut: 'Ctrl+S' },
    { id: 'save-all', label: 'Save All', category: 'File' },
    { id: 'toggle-terminal', label: 'Toggle Terminal', category: 'View', shortcut: 'Ctrl+`' },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View' },
    { id: 'toggle-ai', label: 'Toggle AI Assistant', category: 'View' },
    { id: 'split-editor', label: 'Split Editor Right', category: 'View' },
    { id: 'format', label: 'Format Document', category: 'Edit', shortcut: 'Shift+Alt+F' },
    { id: 'find', label: 'Find in File', category: 'Edit', shortcut: 'Ctrl+F' },
    { id: 'find-all', label: 'Find in All Files', category: 'Edit', shortcut: 'Ctrl+Shift+F' },
    { id: 'git-commit', label: 'Git: Commit', category: 'Git' },
    { id: 'git-push', label: 'Git: Push', category: 'Git' },
    { id: 'git-pull', label: 'Git: Pull', category: 'Git' },
    { id: 'heady-deploy', label: 'HeadyCloud: Deploy', category: 'Heady' },
    { id: 'heady-brain', label: 'HeadyBrain: Query', category: 'Heady' },
    { id: 'run', label: 'Run Project', category: 'Run', shortcut: 'F5' },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ide-command-palette" onClick={e => e.stopPropagation()}>
        <div className="ide-cmd-input-wrap">
          <Icon d={IDE.search} size={14} className="text-white/30" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="ide-cmd-input"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) {
                onCommand(filtered[0].id);
                onClose();
              }
            }} />
        </div>
        <div className="ide-cmd-list">
          {filtered.map(cmd => (
            <button key={cmd.id} className="ide-cmd-item"
              onClick={() => { onCommand(cmd.id); onClose(); }}>
              <span className="ide-cmd-category">{cmd.category}</span>
              <span className="ide-cmd-label">{cmd.label}</span>
              {cmd.shortcut && <span className="ide-cmd-shortcut">{cmd.shortcut}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── File Search (Cmd+P) ──
function FileSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const allFiles = flattenFiles(DEFAULT_FILES).filter(f => f.type === 'file');

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = allFiles.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.path.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ide-command-palette" onClick={e => e.stopPropagation()}>
        <div className="ide-cmd-input-wrap">
          <Icon d={IDE.file} size={14} className="text-white/30" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search files by name..."
            className="ide-cmd-input"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) {
                onSelect(filtered[0].path, filtered[0].content);
                onClose();
              }
            }} />
        </div>
        <div className="ide-cmd-list">
          {filtered.map(f => (
            <button key={f.path} className="ide-cmd-item"
              onClick={() => { onSelect(f.path, f.content); onClose(); }}>
              <span className="text-xs mr-2">{f.name.split('.').pop() === 'js' ? '📜' : '📄'}</span>
              <span className="ide-cmd-label">{f.name}</span>
              <span className="text-xs text-white/20 ml-auto">{f.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HTML Preview Pane ──
function PreviewPane({ content, filename }) {
  if (!filename.endsWith('.html') && !filename.endsWith('.htm')) {
    return (
      <div className="ide-preview-empty">
        <Icon d={IDE.eye} size={24} className="text-white/10 mb-2" />
        <div className="text-xs text-white/20">Preview available for HTML files</div>
      </div>
    );
  }

  return (
    <div className="ide-preview">
      <div className="ide-preview-header">
        <Icon d={IDE.eye} size={12} className="text-blue-400/60" />
        <span className="text-xs text-white/40">Preview: {filename}</span>
      </div>
      <iframe className="ide-preview-frame" srcDoc={content} sandbox="allow-scripts" title="Preview" />
    </div>
  );
}

// ── Main HeadyIDE Component ──
export default function HeadyIDE() {
  const [openFiles, setOpenFiles] = useState([
    { path: 'project/src/index.js', name: 'index.js', content: DEFAULT_FILES.project.children.src.children['index.js'].content, modified: false },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showGit, setShowGit] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [sidebarPanel, setSidebarPanel] = useState('files'); // 'files' | 'git' | 'ai'

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key === 'P') { e.preventDefault(); setShowCommandPalette(true); }
      if (mod && e.key === 'p' && !e.shiftKey) { e.preventDefault(); setShowFileSearch(true); }
      if (mod && e.key === '`') { e.preventDefault(); setShowTerminal(t => !t); }
      if (mod && e.key === 's') { e.preventDefault(); /* save */ }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openFile = (path, content) => {
    const existing = openFiles.findIndex(f => f.path === path);
    if (existing >= 0) {
      setActiveFileIndex(existing);
      return;
    }
    const name = path.split('/').pop();
    setOpenFiles(prev => [...prev, { path, name, content, modified: false }]);
    setActiveFileIndex(openFiles.length);
  };

  const closeFile = (index) => {
    if (openFiles.length <= 1) return;
    setOpenFiles(prev => prev.filter((_, i) => i !== index));
    setActiveFileIndex(prev => prev >= index ? Math.max(0, prev - 1) : prev);
  };

  const updateContent = (content) => {
    setOpenFiles(prev => prev.map((f, i) =>
      i === activeFileIndex ? { ...f, content, modified: true } : f
    ));
  };

  const handleCommand = (cmd) => {
    switch (cmd) {
      case 'toggle-terminal': setShowTerminal(t => !t); break;
      case 'toggle-ai': setShowAI(a => !a); break;
      case 'toggle-sidebar': setSidebarPanel(p => p ? null : 'files'); break;
      case 'split-editor': setSplitView(s => !s); break;
      case 'new-file': /* TODO */ break;
    }
  };

  const activeFile = openFiles[activeFileIndex];
  const language = activeFile ? detectLanguage(activeFile.name) : 'text';

  return (
    <div className="ide-container">
      {/* Activity Bar */}
      <div className="ide-activity-bar">
        <button className={`ide-activity-btn ${sidebarPanel === 'files' ? 'active' : ''}`}
          onClick={() => setSidebarPanel(sidebarPanel === 'files' ? null : 'files')} title="Explorer">
          <Icon d={IDE.file} size={18} />
        </button>
        <button className={`ide-activity-btn ${sidebarPanel === 'search' ? 'active' : ''}`}
          onClick={() => setShowFileSearch(true)} title="Search (Cmd+P)">
          <Icon d={IDE.search} size={18} />
        </button>
        <button className={`ide-activity-btn ${sidebarPanel === 'git' ? 'active' : ''}`}
          onClick={() => setSidebarPanel(sidebarPanel === 'git' ? null : 'git')} title="Source Control">
          <Icon d={IDE.git} size={18} />
        </button>
        <button className={`ide-activity-btn ${showAI ? 'active' : ''}`}
          onClick={() => setShowAI(!showAI)} title="HeadyAI Assistant">
          <Icon d={IDE.sparkles} size={18} />
        </button>
        <div className="flex-1" />
        <button className="ide-activity-btn" onClick={() => setShowTerminal(!showTerminal)} title="Terminal">
          <Icon d={IDE.terminal} size={18} />
        </button>
        <button className="ide-activity-btn" title="Settings">
          <Icon d={IDE.settings} size={18} />
        </button>
      </div>

      {/* Sidebar */}
      {sidebarPanel && (
        <div className="ide-sidebar">
          {sidebarPanel === 'files' && (
            <FileTree
              files={DEFAULT_FILES}
              selectedFile={activeFile?.path}
              onSelectFile={openFile}
              onNewFile={() => {}} />
          )}
          {sidebarPanel === 'git' && <GitPanel />}
        </div>
      )}

      {/* Main Editor Area */}
      <div className="ide-main">
        {/* Editor Tabs */}
        <div className="ide-editor-tabs">
          {openFiles.map((file, i) => (
            <div key={file.path}
              className={`ide-editor-tab ${activeFileIndex === i ? 'active' : ''}`}
              onClick={() => setActiveFileIndex(i)}>
              <span className="text-xs mr-1.5">{file.name.endsWith('.js') || file.name.endsWith('.jsx') ? '📜' : file.name.endsWith('.css') ? '🎨' : file.name.endsWith('.json') ? '📋' : file.name.endsWith('.md') ? '📝' : '📄'}</span>
              <span className="text-xs truncate">{file.name}</span>
              {file.modified && <span className="ide-modified-dot" />}
              <button className="ide-tab-close" onClick={e => { e.stopPropagation(); closeFile(i); }}>
                <Icon d={IDE.x} size={10} />
              </button>
            </div>
          ))}
          <div className="flex-1" />
          <button className="ide-tree-btn mr-1" onClick={() => setSplitView(!splitView)} title="Split Editor">
            <Icon d={IDE.split} size={12} />
          </button>
          <button className="ide-tree-btn mr-1" onClick={() => setShowPreview(!showPreview)} title="Toggle Preview">
            <Icon d={IDE.eye} size={12} />
          </button>
        </div>

        {/* Editor Content */}
        <div className="ide-editor-area">
          <div className={`ide-editor-main ${splitView ? 'split' : ''}`}>
            {activeFile ? (
              <CodeEditor
                file={activeFile.path}
                content={activeFile.content}
                language={language}
                onChange={updateContent} />
            ) : (
              <div className="ide-welcome">
                <span className="text-5xl mb-4 opacity-20">✦</span>
                <div className="text-lg text-white/20 font-light">HeadyAI-IDE</div>
                <div className="text-xs text-white/10 mt-1">Open a file to start editing</div>
                <div className="ide-welcome-shortcuts">
                  <div><kbd>Ctrl+P</kbd> Search Files</div>
                  <div><kbd>Ctrl+Shift+P</kbd> Command Palette</div>
                  <div><kbd>Ctrl+`</kbd> Toggle Terminal</div>
                </div>
              </div>
            )}
            {splitView && activeFile && (
              <div className="ide-split-divider" />
            )}
            {splitView && activeFile && (
              <CodeEditor
                file={activeFile.path}
                content={activeFile.content}
                language={language}
                onChange={updateContent} />
            )}
          </div>

          {showPreview && activeFile && (
            <PreviewPane content={activeFile.content} filename={activeFile.name} />
          )}
        </div>

        {/* Terminal */}
        {showTerminal && <IDETerminal onClose={() => setShowTerminal(false)} />}

        {/* Status Bar */}
        <div className="ide-status-bar">
          <div className="ide-status-left">
            <span className="ide-status-item">
              <Icon d={IDE.git} size={10} /> main
            </span>
            <span className="ide-status-item">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1" />
              HeadyCloud Connected
            </span>
          </div>
          <div className="ide-status-right">
            <span className="ide-status-item">{getLanguageLabel(language)}</span>
            <span className="ide-status-item">UTF-8</span>
            <span className="ide-status-item">
              Ln {activeFile ? activeFile.content.split('\n').length : 0}
            </span>
            <span className="ide-status-item cloud">
              <Icon d={IDE.cloud} size={10} /> Running on HeadyCloud
            </span>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAI && <AIAssistant onInsertCode={() => {}} />}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand} />
      )}

      {/* File Search */}
      {showFileSearch && (
        <FileSearchModal
          onClose={() => setShowFileSearch(false)}
          onSelect={openFile} />
      )}
    </div>
  );
}
