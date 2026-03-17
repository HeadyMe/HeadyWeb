import React, { useState, useEffect } from 'react';

const Icon = ({ d, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const DL = {
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  play: 'M5 3l14 9-14 9V3z',
  x: 'M18 6L6 18M6 6l12 12',
  trash: 'M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  check: 'M20 6L9 17l-5-5',
  search: 'M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
};

const FILE_ICONS = {
  pdf: '📕', zip: '📦', dmg: '💿', exe: '⚙️', app: '📱',
  jpg: '🖼️', png: '🖼️', gif: '🎞️', svg: '🎨', webp: '🖼️',
  mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
  mp3: '🎵', wav: '🎵', flac: '🎵',
  doc: '📄', docx: '📄', txt: '📝', csv: '📊',
  js: '📜', py: '🐍', html: '🌐', css: '🎨', json: '📋',
  default: '📄',
};

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatSpeed(bytesPerSec) {
  if (bytesPerSec < 1024) return bytesPerSec + ' B/s';
  if (bytesPerSec < 1024 * 1024) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
  return (bytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s';
}

function formatTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Download Item Component ──
function DownloadItem({ download, onPause, onResume, onCancel, onRemove, onOpen }) {
  const isActive = download.status === 'downloading' || download.status === 'paused';
  const isComplete = download.status === 'complete';
  const isCancelled = download.status === 'cancelled';
  const isFailed = download.status === 'failed';

  return (
    <div className={`dl-item ${download.status}`}>
      <div className="dl-icon">{getFileIcon(download.filename)}</div>
      <div className="dl-info">
        <div className="dl-filename">{download.filename}</div>
        <div className="dl-meta">
          {isActive && (
            <>
              <span>{formatSize(download.downloaded)} / {formatSize(download.totalSize)}</span>
              {download.status === 'downloading' && (
                <>
                  <span className="dl-dot">·</span>
                  <span>{formatSpeed(download.speed)}</span>
                  <span className="dl-dot">·</span>
                  <span>{download.eta}s remaining</span>
                </>
              )}
              {download.status === 'paused' && <span className="text-yellow-400/60 ml-1">Paused</span>}
            </>
          )}
          {isComplete && (
            <>
              <span>{formatSize(download.totalSize)}</span>
              <span className="dl-dot">·</span>
              <span>{formatTimeAgo(download.completedAt)}</span>
            </>
          )}
          {isCancelled && <span className="text-red-400/60">Cancelled</span>}
          {isFailed && <span className="text-red-400/60">Failed — {download.error}</span>}
        </div>
        {isActive && (
          <div className="dl-progress-track">
            <div className="dl-progress-fill" style={{
              width: `${download.progress}%`,
              background: download.status === 'paused'
                ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            }} />
          </div>
        )}
        <div className="dl-source">{download.url}</div>
      </div>
      <div className="dl-actions">
        {download.status === 'downloading' && (
          <button className="dl-action-btn" onClick={() => onPause(download.id)} title="Pause">
            <Icon d={DL.pause} size={14} />
          </button>
        )}
        {download.status === 'paused' && (
          <button className="dl-action-btn" onClick={() => onResume(download.id)} title="Resume">
            <Icon d={DL.play} size={14} />
          </button>
        )}
        {isActive && (
          <button className="dl-action-btn danger" onClick={() => onCancel(download.id)} title="Cancel">
            <Icon d={DL.x} size={14} />
          </button>
        )}
        {isComplete && (
          <button className="dl-action-btn" onClick={() => onOpen(download.id)} title="Open File">
            <Icon d={DL.folder} size={14} />
          </button>
        )}
        {!isActive && (
          <button className="dl-action-btn" onClick={() => onRemove(download.id)} title="Remove">
            <Icon d={DL.trash} size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Download Manager ──
export default function DownloadManager() {
  const [downloads, setDownloads] = useState([
    {
      id: 1, filename: 'HeadyBrain-SDK-v2.1.0.zip', url: 'https://cdn.headysystems.com/sdk/v2.1.0/brain-sdk.zip',
      status: 'downloading', totalSize: 45 * 1024 * 1024, downloaded: 32 * 1024 * 1024, progress: 71,
      speed: 2.4 * 1024 * 1024, eta: 6, startedAt: new Date(),
    },
    {
      id: 2, filename: 'heady-config.json', url: 'https://manager.headysystems.com/config/export',
      status: 'complete', totalSize: 4096, downloaded: 4096, progress: 100,
      speed: 0, eta: 0, completedAt: new Date(Date.now() - 300000),
    },
    {
      id: 3, filename: 'sacred-geometry-wallpaper-4k.png', url: 'https://headysystems.com/assets/wallpapers/sacred-4k.png',
      status: 'paused', totalSize: 12 * 1024 * 1024, downloaded: 5.2 * 1024 * 1024, progress: 43,
      speed: 0, eta: 0, startedAt: new Date(Date.now() - 600000),
    },
    {
      id: 4, filename: 'HeadyMCP-Docs.pdf', url: 'https://headymcp.com/docs/api-reference.pdf',
      status: 'complete', totalSize: 2.3 * 1024 * 1024, downloaded: 2.3 * 1024 * 1024, progress: 100,
      speed: 0, eta: 0, completedAt: new Date(Date.now() - 3600000),
    },
    {
      id: 5, filename: 'heady-extension-pack.zip', url: 'https://extensions.headyweb.com/pack/essential.zip',
      status: 'complete', totalSize: 890 * 1024, downloaded: 890 * 1024, progress: 100,
      speed: 0, eta: 0, completedAt: new Date(Date.now() - 86400000),
    },
  ]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(dl => {
        if (dl.status !== 'downloading') return dl;
        const newDownloaded = Math.min(dl.totalSize, dl.downloaded + dl.speed / 10);
        const newProgress = Math.round((newDownloaded / dl.totalSize) * 100);
        if (newProgress >= 100) {
          return { ...dl, downloaded: dl.totalSize, progress: 100, status: 'complete', completedAt: new Date(), speed: 0 };
        }
        return { ...dl, downloaded: newDownloaded, progress: newProgress };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const pauseDownload = (id) => {
    setDownloads(prev => prev.map(dl => dl.id === id ? { ...dl, status: 'paused', speed: 0 } : dl));
  };

  const resumeDownload = (id) => {
    setDownloads(prev => prev.map(dl => dl.id === id ? { ...dl, status: 'downloading', speed: 1.8 * 1024 * 1024 } : dl));
  };

  const cancelDownload = (id) => {
    setDownloads(prev => prev.map(dl => dl.id === id ? { ...dl, status: 'cancelled', speed: 0 } : dl));
  };

  const removeDownload = (id) => {
    setDownloads(prev => prev.filter(dl => dl.id !== id));
  };

  const clearCompleted = () => {
    setDownloads(prev => prev.filter(dl => dl.status === 'downloading' || dl.status === 'paused'));
  };

  const filtered = downloads.filter(dl => {
    if (filter !== 'all' && dl.status !== filter) return false;
    if (searchQuery && !dl.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeCount = downloads.filter(d => d.status === 'downloading').length;
  const completedCount = downloads.filter(d => d.status === 'complete').length;

  return (
    <div className="internal-page">
      <div className="internal-page-header">
        <h1 className="internal-page-title">
          <span className="text-2xl mr-3">📥</span>
          Downloads
        </h1>
        <p className="internal-page-subtitle">
          {activeCount > 0 ? `${activeCount} active download${activeCount > 1 ? 's' : ''}` : 'No active downloads'}
          {completedCount > 0 && ` · ${completedCount} completed`}
        </p>
      </div>

      <div className="dl-toolbar">
        <div className="dl-filters">
          {[
            { id: 'all', label: 'All' },
            { id: 'downloading', label: 'Active' },
            { id: 'complete', label: 'Completed' },
            { id: 'paused', label: 'Paused' },
          ].map(f => (
            <button key={f.id} className={`dl-filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="dl-search-wrap">
          <Icon d={DL.search} size={14} className="text-white/30" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search downloads..." className="dl-search-input" />
        </div>
        <button className="dl-clear-btn" onClick={clearCompleted}>
          <Icon d={DL.trash} size={12} /> Clear Completed
        </button>
      </div>

      <div className="dl-list">
        {filtered.map(dl => (
          <DownloadItem key={dl.id} download={dl}
            onPause={pauseDownload}
            onResume={resumeDownload}
            onCancel={cancelDownload}
            onRemove={removeDownload}
            onOpen={() => {}} />
        ))}
        {filtered.length === 0 && (
          <div className="dl-empty">
            <Icon d={DL.download} size={40} className="text-white/10 mb-3" />
            <div className="text-white/20 text-sm">No downloads to show</div>
          </div>
        )}
      </div>
    </div>
  );
}
