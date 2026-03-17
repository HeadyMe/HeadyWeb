import React, { useState, useRef, useCallback, useEffect } from 'react';

// ── Icons ──
const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const Icons = {
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6L6 18M6 6l12 12',
  pin: 'M12 2v8m-4-4l4 4 4-4M5 14h14M7 14v6h10v-6',
  copy: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2m0 4v4a2 2 0 01-2 2h-2',
  volumeX: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  volume: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
  columns: 'M12 3v18M3 3h18v18H3z',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  grip: 'M8 6h.01M12 6h.01M16 6h.01M8 12h.01M12 12h.01M16 12h.01M8 18h.01M12 18h.01M16 18h.01',
  chevronDown: 'M6 9l6 6 6-6',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
};

const TAB_GROUP_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
];

// ── Tab Context Menu ──
function TabContextMenu({ x, y, tab, onClose, onAction }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [
    { label: tab.pinned ? 'Unpin Tab' : 'Pin Tab', action: 'pin' },
    { label: tab.muted ? 'Unmute Tab' : 'Mute Tab', action: 'mute' },
    { label: 'Duplicate Tab', action: 'duplicate' },
    { type: 'separator' },
    { label: 'Add to Group', action: 'group', hasSubmenu: true },
    { type: 'separator' },
    { label: 'Move to Split View', action: 'split' },
    { type: 'separator' },
    { label: 'Close Tab', action: 'close', danger: true },
    { label: 'Close Other Tabs', action: 'closeOthers' },
    { label: 'Close Tabs to the Right', action: 'closeRight' },
  ];

  return (
    <div ref={ref} className="tab-context-menu" style={{ left: x, top: y }}>
      {items.map((item, i) => {
        if (item.type === 'separator') return <div key={i} className="tab-ctx-sep" />;
        return (
          <button key={i} className={`tab-ctx-item ${item.danger ? 'danger' : ''}`}
            onClick={() => { onAction(item.action); onClose(); }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Tab Group Label ──
function TabGroupLabel({ group, onRename, onChangeColor, onUngroup }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [showColors, setShowColors] = useState(false);

  return (
    <div className="tab-group-label" style={{ borderColor: group.color, background: `${group.color}15` }}>
      {editing ? (
        <input type="text" value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => { setEditing(false); onRename(name); }}
          onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onRename(name); } }}
          className="tab-group-input" autoFocus />
      ) : (
        <span className="tab-group-name" style={{ color: group.color }}
          onClick={() => setEditing(true)} onContextMenu={e => { e.preventDefault(); setShowColors(!showColors); }}>
          {group.name || 'Group'}
        </span>
      )}
      {showColors && (
        <div className="tab-group-color-picker">
          {TAB_GROUP_COLORS.map(c => (
            <button key={c.value} className="tab-group-color-dot"
              style={{ background: c.value }}
              onClick={() => { onChangeColor(c.value); setShowColors(false); }} />
          ))}
          <button className="tab-ctx-item text-xs mt-1" onClick={() => { onUngroup(); setShowColors(false); }}>
            Ungroup
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab Preview Tooltip ──
function TabPreview({ tab, position }) {
  if (!tab || !position) return null;
  return (
    <div className="tab-preview-tooltip" style={{ left: position.x, top: position.y }}>
      <div className="tab-preview-title">{tab.title}</div>
      <div className="tab-preview-url">{tab.url}</div>
      <div className="tab-preview-body">
        <div className="tab-preview-placeholder">
          <span style={{ fontSize: 24 }}>{tab.favicon || '🌐'}</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab Search Modal (Cmd+Shift+A) ──
function TabSearchModal({ tabs, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = tabs.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.url.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tab-search-modal" onClick={e => e.stopPropagation()}>
        <div className="tab-search-header">
          <Icon d={Icons.search} size={16} className="text-blue-400/60" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search open tabs..."
            className="tab-search-input"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) {
                onSelect(filtered[0].id);
                onClose();
              }
            }} />
          <span className="text-xs text-white/20 px-2">ESC</span>
        </div>
        <div className="tab-search-results">
          {filtered.map(tab => (
            <button key={tab.id} className="tab-search-item"
              onClick={() => { onSelect(tab.id); onClose(); }}>
              <span className="text-base mr-2">{tab.favicon || '🌐'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">{tab.title}</div>
                <div className="text-xs text-white/30 truncate">{tab.url}</div>
              </div>
              {tab.pinned && <span className="text-xs text-yellow-400/60 ml-2">Pinned</span>}
              {tab.muted && <span className="text-xs text-red-400/60 ml-2">Muted</span>}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-white/20 text-sm">No matching tabs</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Split View Manager ──
function SplitViewManager({ panes, onRemovePane, renderContent }) {
  if (!panes || panes.length <= 1) return null;

  return (
    <div className="split-view-container">
      {panes.map((pane, i) => (
        <React.Fragment key={pane.id}>
          {i > 0 && <div className="split-view-divider" />}
          <div className="split-view-pane" style={{ flex: pane.flex || 1 }}>
            <div className="split-pane-header">
              <span className="text-xs text-white/40 truncate flex-1">{pane.title}</span>
              <button className="nav-btn" onClick={() => onRemovePane(pane.id)}>
                <Icon d={Icons.x} size={12} />
              </button>
            </div>
            <div className="split-pane-content">
              {renderContent(pane)}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main Browser Tab Bar ──
export function BrowserTabBar({
  tabs, activeTab, tabGroups, splitPanes,
  onSelectTab, onCloseTab, onNewTab,
  onPinTab, onMuteTab, onDuplicateTab,
  onGroupTab, onReorderTab, onSplitTab,
  onCloseOtherTabs, onCloseRightTabs
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [previewTab, setPreviewTab] = useState(null);
  const [previewPos, setPreviewPos] = useState(null);
  const [showTabSearch, setShowTabSearch] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const previewTimer = useRef(null);

  // Keyboard shortcut for tab search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowTabSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleContextMenu = (e, tab, index) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tab, index });
  };

  const handleContextAction = (action) => {
    if (!contextMenu) return;
    const { tab, index } = contextMenu;
    switch (action) {
      case 'pin': onPinTab(index); break;
      case 'mute': onMuteTab(index); break;
      case 'duplicate': onDuplicateTab(index); break;
      case 'group': onGroupTab(index); break;
      case 'split': onSplitTab(index); break;
      case 'close': onCloseTab(index); break;
      case 'closeOthers': onCloseOtherTabs(index); break;
      case 'closeRight': onCloseRightTabs(index); break;
    }
  };

  const handleTabHover = (tab, e) => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPreviewTab(tab);
      setPreviewPos({ x: rect.left, y: rect.bottom + 8 });
    }, 600);
  };

  const handleTabLeave = () => {
    clearTimeout(previewTimer.current);
    setPreviewTab(null);
    setPreviewPos(null);
  };

  // Drag handlers for reorder
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      onReorderTab(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Group tabs together for rendering
  const groupedTabs = [];
  let currentGroupId = null;
  tabs.forEach((tab, i) => {
    if (tab.groupId && tab.groupId !== currentGroupId) {
      const group = tabGroups.find(g => g.id === tab.groupId);
      if (group) groupedTabs.push({ type: 'group-label', group });
      currentGroupId = tab.groupId;
    } else if (!tab.groupId) {
      currentGroupId = null;
    }
    groupedTabs.push({ type: 'tab', tab, index: i });
  });

  const handleSelectTabById = (id) => {
    const index = tabs.findIndex(t => t.id === id);
    if (index >= 0) onSelectTab(index);
  };

  return (
    <>
      <div className="tab-bar">
        {groupedTabs.map((item, gi) => {
          if (item.type === 'group-label') {
            return (
              <TabGroupLabel key={`grp-${item.group.id}`}
                group={item.group}
                onRename={(name) => {/* handled by parent */}}
                onChangeColor={(color) => {/* handled by parent */}}
                onUngroup={() => {/* handled by parent */}} />
            );
          }
          const { tab, index } = item;
          return (
            <div key={tab.id}
              className={`browser-tab ${activeTab === index ? 'active' : ''} ${tab.pinned ? 'pinned' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              style={tab.groupId ? { borderTopColor: tabGroups.find(g => g.id === tab.groupId)?.color || 'transparent', borderTopWidth: 2 } : {}}
              onClick={() => onSelectTab(index)}
              onContextMenu={(e) => handleContextMenu(e, tab, index)}
              onMouseEnter={(e) => handleTabHover(tab, e)}
              onMouseLeave={handleTabLeave}
              draggable={!tab.pinned}
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}>
              <span className="text-sm mr-1 flex-shrink-0">{tab.favicon || '🌐'}</span>
              {!tab.pinned && <span className="truncate flex-1 text-xs">{tab.title}</span>}
              {tab.muted && <Icon d={Icons.volumeX} size={10} className="text-red-400/60 flex-shrink-0 mx-0.5" />}
              {!tab.pinned && (
                <button className="tab-close" onClick={e => { e.stopPropagation(); onCloseTab(index); }}>
                  <Icon d={Icons.x} size={12} />
                </button>
              )}
            </div>
          );
        })}

        <button className="nav-btn ml-1" onClick={onNewTab} title="New Tab (Ctrl+T)">
          <Icon d={Icons.plus} size={14} />
        </button>

        <div className="flex-1 tab-drag-area" />

        <button className="nav-btn mr-1" onClick={() => setShowTabSearch(true)} title="Search Tabs (Ctrl+Shift+A)">
          <Icon d={Icons.search} size={14} />
        </button>
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x} y={contextMenu.y}
          tab={contextMenu.tab}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction} />
      )}

      <TabPreview tab={previewTab} position={previewPos} />

      {showTabSearch && (
        <TabSearchModal
          tabs={tabs}
          onSelect={handleSelectTabById}
          onClose={() => setShowTabSearch(false)} />
      )}
    </>
  );
}

export { SplitViewManager };
export default BrowserTabBar;
