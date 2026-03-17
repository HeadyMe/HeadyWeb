import React, { useState, useMemo } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const BI = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01z',
  folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  folderOpen: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v1',
  plus: 'M12 5v14M5 12h14',
  x: 'M18 6L6 18M6 6l12 12',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  chevRight: 'M9 6l6 6-6 6',
  chevDown: 'M6 9l6 6 6-6',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  sort: 'M3 6h18M6 12h12M9 18h6',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20',
};

const DEFAULT_BOOKMARKS = {
  id: 'root',
  name: 'Bookmarks',
  type: 'folder',
  children: [
    {
      id: 'bar',
      name: 'Bookmarks Bar',
      type: 'folder',
      children: [
        { id: 'b1', name: 'HeadySystems', url: 'https://headysystems.com', favicon: '⚙️', type: 'bookmark', addedAt: Date.now() - 86400000 * 5 },
        { id: 'b2', name: 'HeadyMe', url: 'https://headyme.com', favicon: '👤', type: 'bookmark', addedAt: Date.now() - 86400000 * 4 },
        { id: 'b3', name: 'HeadyBuddy', url: 'https://headybuddy.org', favicon: '🤖', type: 'bookmark', addedAt: Date.now() - 86400000 * 3 },
        { id: 'b4', name: 'HeadyMCP', url: 'https://headymcp.com', favicon: '🔌', type: 'bookmark', addedAt: Date.now() - 86400000 * 2 },
        { id: 'b5', name: 'GitHub', url: 'https://github.com', favicon: '🐙', type: 'bookmark', addedAt: Date.now() - 86400000 },
      ],
    },
    {
      id: 'dev',
      name: 'Development',
      type: 'folder',
      children: [
        { id: 'b6', name: 'MDN Web Docs', url: 'https://developer.mozilla.org', favicon: '📚', type: 'bookmark', addedAt: Date.now() - 86400000 * 10 },
        { id: 'b7', name: 'React Docs', url: 'https://react.dev', favicon: '⚛️', type: 'bookmark', addedAt: Date.now() - 86400000 * 8 },
        { id: 'b8', name: 'Tailwind CSS', url: 'https://tailwindcss.com', favicon: '🎨', type: 'bookmark', addedAt: Date.now() - 86400000 * 7 },
        { id: 'b9', name: 'Vite', url: 'https://vitejs.dev', favicon: '⚡', type: 'bookmark', addedAt: Date.now() - 86400000 * 6 },
        {
          id: 'apis',
          name: 'APIs',
          type: 'folder',
          children: [
            { id: 'b10', name: 'HeadyBrain API', url: 'https://manager.headysystems.com/api', favicon: '🧠', type: 'bookmark', addedAt: Date.now() - 86400000 * 12 },
            { id: 'b11', name: 'Firebase Console', url: 'https://console.firebase.google.com', favicon: '🔥', type: 'bookmark', addedAt: Date.now() - 86400000 * 11 },
          ],
        },
      ],
    },
    {
      id: 'social',
      name: 'Social',
      type: 'folder',
      children: [
        { id: 'b12', name: 'HeadyConnection', url: 'https://headyconnection.org', favicon: '🤝', type: 'bookmark', addedAt: Date.now() - 86400000 * 15 },
        { id: 'b13', name: 'Twitter', url: 'https://twitter.com', favicon: '🐦', type: 'bookmark', addedAt: Date.now() - 86400000 * 14 },
      ],
    },
  ],
};

// ── Folder Tree Sidebar ──
function FolderTree({ tree, selectedFolder, onSelectFolder, depth = 0 }) {
  const [expanded, setExpanded] = useState(new Set(['root', 'bar', 'dev']));

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderFolder = (node, d = 0) => {
    if (node.type !== 'folder') return null;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedFolder === node.id;
    const childFolders = (node.children || []).filter(c => c.type === 'folder');

    return (
      <div key={node.id}>
        <div className={`bm-folder-item ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: d * 16 + 8 }}
          onClick={() => { onSelectFolder(node.id); toggleExpand(node.id); }}>
          {childFolders.length > 0 ? (
            <Icon d={isExpanded ? BI.chevDown : BI.chevRight} size={10} className="text-white/30 mr-1 flex-shrink-0" />
          ) : (
            <span style={{ width: 14 }} className="flex-shrink-0" />
          )}
          <span className="text-sm mr-1.5">{isExpanded ? '📂' : '📁'}</span>
          <span className="bm-folder-name">{node.name}</span>
          <span className="bm-folder-count">{(node.children || []).filter(c => c.type === 'bookmark').length}</span>
        </div>
        {isExpanded && childFolders.map(child => renderFolder(child, d + 1))}
      </div>
    );
  };

  return (
    <div className="bm-folder-tree">
      <div className="bm-tree-header">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Folders</span>
        <button className="ide-tree-btn" title="New Folder">
          <Icon d={BI.plus} size={12} />
        </button>
      </div>
      {renderFolder(tree)}
    </div>
  );
}

// ── Bookmark Item ──
function BookmarkItem({ bookmark, onEdit, onDelete, onNavigate }) {
  return (
    <div className="bm-item" onClick={() => onNavigate && onNavigate(bookmark.url)}>
      <span className="bm-favicon">{bookmark.favicon || '🌐'}</span>
      <div className="bm-info">
        <div className="bm-name">{bookmark.name}</div>
        <div className="bm-url">{bookmark.url}</div>
      </div>
      <div className="bm-actions">
        <button className="bm-action-btn" onClick={e => { e.stopPropagation(); onEdit(bookmark); }} title="Edit">
          <Icon d={BI.edit} size={12} />
        </button>
        <button className="bm-action-btn" onClick={e => { e.stopPropagation(); onDelete(bookmark.id); }} title="Delete">
          <Icon d={BI.trash} size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Edit Bookmark Modal ──
function EditBookmarkModal({ bookmark, onSave, onClose }) {
  const [name, setName] = useState(bookmark?.name || '');
  const [url, setUrl] = useState(bookmark?.url || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bm-edit-modal" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-sm mb-3">
          {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="bm-edit-input" placeholder="Bookmark name" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              className="bm-edit-input" placeholder="https://..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button className="settings-button" onClick={onClose}>Cancel</button>
          <button className="settings-button primary" onClick={() => { onSave({ ...bookmark, name, url }); onClose(); }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Find folder by id helper ──
function findFolder(node, id) {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findFolder(child, id);
      if (found) return found;
    }
  }
  return null;
}

function removeBookmark(node, id) {
  if (!node.children) return node;
  return {
    ...node,
    children: node.children
      .filter(c => c.id !== id)
      .map(c => c.type === 'folder' ? removeBookmark(c, id) : c),
  };
}

// ── Main Bookmarks Component ──
export default function Bookmarks({ onNavigate }) {
  const [bookmarkTree, setBookmarkTree] = useState(DEFAULT_BOOKMARKS);
  const [selectedFolder, setSelectedFolder] = useState('bar');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'date' | 'url'
  const [editingBookmark, setEditingBookmark] = useState(null);

  const currentFolder = useMemo(() => findFolder(bookmarkTree, selectedFolder), [bookmarkTree, selectedFolder]);

  const bookmarks = useMemo(() => {
    let items = currentFolder?.children?.filter(c => c.type === 'bookmark') || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Search all bookmarks recursively
      const allBookmarks = [];
      const collect = (node) => {
        if (node.type === 'bookmark' && (node.name.toLowerCase().includes(q) || node.url.toLowerCase().includes(q))) {
          allBookmarks.push(node);
        }
        if (node.children) node.children.forEach(collect);
      };
      collect(bookmarkTree);
      items = allBookmarks;
    }
    // Sort
    return [...items].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return (b.addedAt || 0) - (a.addedAt || 0);
      if (sortBy === 'url') return a.url.localeCompare(b.url);
      return 0;
    });
  }, [currentFolder, searchQuery, sortBy, bookmarkTree]);

  const subfolders = useMemo(() => {
    return currentFolder?.children?.filter(c => c.type === 'folder') || [];
  }, [currentFolder]);

  const deleteBookmark = (id) => {
    setBookmarkTree(prev => removeBookmark(prev, id));
  };

  const handleExport = () => {
    const data = JSON.stringify(bookmarkTree, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'headyweb-bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="internal-page">
      <div className="internal-page-header">
        <h1 className="internal-page-title">
          <span className="text-2xl mr-3">⭐</span>
          Bookmarks
        </h1>
        <p className="internal-page-subtitle">{bookmarks.length} bookmarks in {currentFolder?.name || 'All'}</p>
      </div>

      <div className="bm-layout">
        <FolderTree tree={bookmarkTree} selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />

        <div className="bm-content">
          <div className="bm-toolbar">
            <div className="bm-search-wrap">
              <Icon d={BI.search} size={14} className="text-white/30" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search all bookmarks..." className="bm-search-input" />
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-xs text-white/25 mr-1">Sort:</span>
              <select className="bm-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="date">Date Added</option>
                <option value="url">URL</option>
              </select>
            </div>
            <button className="dl-clear-btn" onClick={handleExport}>
              <Icon d={BI.download} size={12} /> Export
            </button>
            <button className="dl-clear-btn">
              <Icon d={BI.upload} size={12} /> Import
            </button>
          </div>

          {/* Subfolders */}
          {subfolders.length > 0 && !searchQuery && (
            <div className="bm-subfolders">
              {subfolders.map(folder => (
                <button key={folder.id} className="bm-subfolder-card"
                  onClick={() => setSelectedFolder(folder.id)}>
                  <span className="text-lg mb-1">📁</span>
                  <span className="text-xs text-white/60">{folder.name}</span>
                  <span className="text-[10px] text-white/25">{(folder.children || []).length} items</span>
                </button>
              ))}
            </div>
          )}

          {/* Bookmark List */}
          <div className="bm-list">
            {bookmarks.map(bm => (
              <BookmarkItem key={bm.id} bookmark={bm}
                onEdit={setEditingBookmark}
                onDelete={deleteBookmark}
                onNavigate={onNavigate} />
            ))}
            {bookmarks.length === 0 && (
              <div className="text-center py-12 text-white/20">
                <Icon d={BI.star} size={40} className="mx-auto mb-3 opacity-20" />
                <p>No bookmarks found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          onSave={() => {}}
          onClose={() => setEditingBookmark(null)} />
      )}
    </div>
  );
}
