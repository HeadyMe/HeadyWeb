import React, { useState } from 'react';

const FILE_TREE = [
  {
    name: 'heady-ecosystem', type: 'dir', open: true, children: [
      {
        name: 'configs', type: 'dir', children: [
          { name: 'hcfullpipeline.yaml', type: 'file', lang: 'yaml' },
          { name: 'service-catalog.yaml', type: 'file', lang: 'yaml' },
          { name: 'resource-policies.yaml', type: 'file', lang: 'yaml' },
          { name: 'governance-policies.yaml', type: 'file', lang: 'yaml' },
          { name: 'data-schema.yaml', type: 'file', lang: 'yaml' },
          { name: 'concepts-index.yaml', type: 'file', lang: 'yaml' },
          { name: 'HeadySims-scheduler.yaml', type: 'file', lang: 'yaml' },
        ],
      },
      {
        name: 'src', type: 'dir', children: [
          {
            name: 'orchestration', type: 'dir', children: [
              { name: 'hc_auto_success.js', type: 'file', lang: 'js' },
              { name: 'monte-carlo-scheduler.js', type: 'file', lang: 'js' },
            ],
          },
          {
            name: 'agents', type: 'dir', children: [
              { name: 'agent-orchestrator.js', type: 'file', lang: 'js' },
              { name: 'heady-buddy.js', type: 'file', lang: 'js' },
              { name: 'bee-factory.js', type: 'file', lang: 'js' },
            ],
          },
          {
            name: 'patterns', type: 'dir', children: [
              { name: 'pattern-engine.js', type: 'file', lang: 'js' },
            ],
          },
          {
            name: 'services', type: 'dir', children: [
              { name: 'HeadySims-service.js', type: 'file', lang: 'js' },
              { name: 'heady-service-mesh.js', type: 'file', lang: 'js' },
            ],
          },
        ],
      },
      {
        name: 'packages', type: 'dir', children: [
          { name: 'hc-brain', type: 'dir', children: [{ name: 'index.js', type: 'file', lang: 'js' }] },
          { name: 'hc-supervisor', type: 'dir', children: [{ name: 'index.js', type: 'file', lang: 'js' }] },
          { name: 'hc-checkpoint', type: 'dir', children: [{ name: 'index.js', type: 'file', lang: 'js' }] },
          { name: 'phi-math', type: 'dir', children: [{ name: 'index.js', type: 'file', lang: 'js' }] },
        ],
      },
      { name: 'heady-manager.js', type: 'file', lang: 'js' },
      { name: 'package.json', type: 'file', lang: 'json' },
      { name: 'CLAUDE.md', type: 'file', lang: 'md' },
    ],
  },
];

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(node.open || false);
  const isDir = node.type === 'dir';

  const handleClick = () => {
    if (isDir) {
      setOpen(!open);
    } else if (window.__headyEditorOpen) {
      window.__headyEditorOpen(node.name, `// Loading ${node.name}...\n// Connected to Heady file system`, node.lang);
    }
  };

  const FILE_ICONS = {
    js: '📜', jsx: '⚛️', yaml: '📋', json: '📦', md: '📝', py: '🐍',
  };

  return (
    <div>
      <div
        className={`tree-node ${isDir ? 'dir' : 'file'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="tree-icon">
          {isDir ? (open ? '📂' : '📁') : (FILE_ICONS[node.lang] || '📄')}
        </span>
        <span className="tree-name">{node.name}</span>
      </div>
      {isDir && open && node.children?.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FileTreePanel() {
  return (
    <div className="file-tree-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">📂</span>
          Explorer
        </div>
      </div>
      <div className="file-tree-content">
        {FILE_TREE.map((node, i) => (
          <TreeNode key={i} node={node} />
        ))}
      </div>
    </div>
  );
}
