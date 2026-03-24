/**
 * HeadyBuddy Universal Chat Widget v1.0.0
 * Drop-in chat widget with Firebase Auth, real backend, vector memory.
 * Usage: <script src="/buddy-widget.js"></script>
 */
(function () {
  'use strict';

  /* ───────────────────────── Configuration ───────────────────────── */

  var API_BASE = (window.HEADY_API || 'https://api.headysystems.com').replace(/\/+$/, '');
  var AUTH_BASE = (window.HEADY_AUTH || 'https://auth.headysystems.com').replace(/\/+$/, '');
  var FIREBASE_CONFIG = {
    apiKey: window.HEADY_FIREBASE_API_KEY || '',
    authDomain: 'gen-lang-client-0920560496.firebaseapp.com',
    projectId: 'gen-lang-client-0920560496'
  };
  var MAX_HISTORY = 6;

  /* ───────────────────────── State ───────────────────────── */

  var state = {
    open: false,
    user: null,         // { uid, email, displayName }
    messages: [],       // { role: 'user'|'bot'|'system', text: string }
    sending: false,
    firebaseReady: false,
    authChecked: false
  };

  /* ───────────────────────── DOM references (set after inject) ─── */

  var els = {};

  /* ───────────────────────── Firebase SDK loader ─────────────── */

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function initFirebase() {
    return loadScript('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js')
      .then(function () {
        return loadScript('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth-compat.js');
      })
      .then(function () {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        state.firebaseReady = true;
      });
  }

  /* ───────────────────────── Auth helpers ─────────────────────── */

  function signInWithGoogle() {
    if (!state.firebaseReady) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(function (result) {
        var user = result.user;
        return user.getIdToken().then(function (idToken) {
          return exchangeToken(idToken).then(function () {
            setUser(user);
            loadHistory();
          });
        });
      })
      .catch(function (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
          addMessage('system', 'Sign-in failed: ' + err.message);
        }
      });
  }

  function exchangeToken(idToken) {
    return fetch(AUTH_BASE + '/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: idToken })
    }).then(function (r) {
      if (!r.ok) throw new Error('Session exchange failed (' + r.status + ')');
      return r.json();
    });
  }

  function checkSession() {
    return fetch(AUTH_BASE + '/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    }).then(function (r) {
      if (!r.ok) throw new Error('No session');
      return r.json();
    });
  }

  function signOut() {
    fetch(AUTH_BASE + '/api/auth/session', {
      method: 'DELETE',
      credentials: 'include'
    }).catch(function () { /* best effort */ });

    if (state.firebaseReady && firebase.auth().currentUser) {
      firebase.auth().signOut().catch(function () {});
    }
    state.user = null;
    state.messages = [];
    renderAuth();
    renderMessages();
  }

  function setUser(firebaseUser) {
    state.user = {
      uid: firebaseUser.uid || firebaseUser.user_id || '',
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.name || firebaseUser.email || ''
    };
    state.authChecked = true;
    renderAuth();
  }

  /* ───────────────────────── Chat API ────────────────────────── */

  function sendMessage(text) {
    if (!text.trim() || state.sending) return;

    addMessage('user', text);
    state.sending = true;
    showTyping(true);

    var history = state.messages
      .filter(function (m) { return m.role !== 'system'; })
      .slice(-MAX_HISTORY)
      .map(function (m) { return { role: m.role, content: m.text }; });

    fetch(API_BASE + '/api/brain/chat', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        user: state.user ? state.user.uid : 'anonymous',
        history: history
      })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var reply = data.response || data.reply || data.message || data.answer || '';
        if (!reply) throw new Error('Empty response');
        addMessage('bot', reply);
        storeVector(text, reply);
      })
      .catch(function () {
        addMessage('bot', 'HeadyBuddy is currently connecting to the neural network. Try again in a moment.');
      })
      .then(function () {
        state.sending = false;
        showTyping(false);
      });
  }

  /* ───────────────────────── History ──────────────────────────── */

  function loadHistory() {
    if (!state.user) return;
    fetch(API_BASE + '/api/buddy/history', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: state.user.uid })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('History ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var items = data.messages || data.history || data || [];
        if (!Array.isArray(items)) return;
        items.forEach(function (m) {
          var role = m.role === 'assistant' ? 'bot' : (m.role || 'bot');
          var text = m.content || m.text || m.message || '';
          if (text) state.messages.push({ role: role, text: text });
        });
        renderMessages();
      })
      .catch(function () { /* no history available */ });
  }

  /* ───────────────────────── Vector storage ──────────────────── */

  function storeVector(question, answer) {
    if (!state.user) return;
    fetch(API_BASE + '/api/vector/store', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: state.user.uid,
        question: question,
        answer: answer
      })
    }).catch(function () { /* fire and forget */ });
  }

  /* ───────────────────────── Markdown renderer ───────────────── */

  function renderMarkdown(text) {
    var s = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks (```)
    s = s.replace(/```([\s\S]*?)```/g, function (_, code) {
      return '<pre class="hb-code-block">' + code.trim() + '</pre>';
    });
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code class="hb-inline-code">$1</code>');
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Links
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="hb-link">$1</a>');
    // Line breaks
    s = s.replace(/\n/g, '<br>');

    return s;
  }

  /* ───────────────────────── UI helpers ───────────────────────── */

  function addMessage(role, text) {
    state.messages.push({ role: role, text: text });
    renderMessages();
  }

  function renderMessages() {
    if (!els.messages) return;
    var html = '';
    state.messages.forEach(function (m) {
      var cls = 'hb-msg hb-msg-' + m.role;
      var content = m.role === 'bot' ? renderMarkdown(m.text) : escapeHtml(m.text);
      html += '<div class="' + cls + '">' + content + '</div>';
    });
    els.messages.innerHTML = html;
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  function showTyping(show) {
    if (!els.typing) return;
    els.typing.style.display = show ? 'flex' : 'none';
    if (show && els.messages) {
      els.messages.scrollTop = els.messages.scrollHeight;
    }
  }

  function renderAuth() {
    if (!els.auth) return;
    if (state.user) {
      els.auth.innerHTML =
        '<div class="hb-user-info">' +
          '<span class="hb-user-name">' + escapeHtml(state.user.displayName || state.user.email) + '</span>' +
          '<button class="hb-sign-out" id="hb-sign-out">Sign Out</button>' +
        '</div>';
      document.getElementById('hb-sign-out').addEventListener('click', signOut);
      els.inputRow.style.display = 'flex';
    } else {
      els.auth.innerHTML =
        '<button class="hb-google-btn" id="hb-google-signin">' +
          '<svg class="hb-google-icon" viewBox="0 0 24 24" width="18" height="18">' +
            '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
            '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
            '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
            '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
          '</svg>' +
          'Sign in with Google' +
        '</button>';
      document.getElementById('hb-google-signin').addEventListener('click', signInWithGoogle);
      els.inputRow.style.display = 'none';
    }
  }

  function togglePanel() {
    state.open = !state.open;
    els.panel.style.display = state.open ? 'flex' : 'none';
    if (state.open && els.input) {
      setTimeout(function () { els.input.focus(); }, 100);
    }
  }

  /* ───────────────────────── CSS ──────────────────────────────── */

  function injectStyles() {
    var css = [
      /* Reset scoping */
      '#heady-buddy-root, #heady-buddy-root * {',
      '  box-sizing: border-box;',
      '  margin: 0;',
      '  padding: 0;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
      '  line-height: 1.5;',
      '}',

      /* FAB */
      '.hb-fab {',
      '  position: fixed;',
      '  bottom: 24px;',
      '  right: 24px;',
      '  width: 60px;',
      '  height: 60px;',
      '  border-radius: 50%;',
      '  border: none;',
      '  cursor: pointer;',
      '  background: linear-gradient(135deg, #7c3aed, #06b6d4);',
      '  color: #fff;',
      '  font-size: 28px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4), 0 2px 8px rgba(0,0,0,0.3);',
      '  z-index: 2147483646;',
      '  transition: transform 0.2s ease, box-shadow 0.2s ease;',
      '}',
      '.hb-fab:hover {',
      '  transform: scale(1.08);',
      '  box-shadow: 0 6px 28px rgba(124, 58, 237, 0.55), 0 4px 12px rgba(0,0,0,0.4);',
      '}',
      '.hb-fab:active {',
      '  transform: scale(0.95);',
      '}',

      /* Panel */
      '.hb-panel {',
      '  position: fixed;',
      '  bottom: 96px;',
      '  right: 24px;',
      '  width: 380px;',
      '  height: 520px;',
      '  display: none;',
      '  flex-direction: column;',
      '  border-radius: 16px;',
      '  overflow: hidden;',
      '  z-index: 2147483647;',
      '  background: rgba(15, 15, 25, 0.88);',
      '  backdrop-filter: blur(20px);',
      '  -webkit-backdrop-filter: blur(20px);',
      '  border: 1px solid rgba(124, 58, 237, 0.25);',
      '  box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(124, 58, 237, 0.12);',
      '}',

      /* Header */
      '.hb-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 14px 16px;',
      '  background: rgba(124, 58, 237, 0.1);',
      '  border-bottom: 1px solid rgba(124, 58, 237, 0.15);',
      '  flex-shrink: 0;',
      '}',
      '.hb-title {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  background: linear-gradient(90deg, #a78bfa, #06b6d4);',
      '  -webkit-background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '  background-clip: text;',
      '}',
      '.hb-close {',
      '  background: none;',
      '  border: none;',
      '  color: rgba(255,255,255,0.5);',
      '  font-size: 20px;',
      '  cursor: pointer;',
      '  width: 32px;',
      '  height: 32px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  border-radius: 8px;',
      '  transition: background 0.15s, color 0.15s;',
      '}',
      '.hb-close:hover {',
      '  background: rgba(255,255,255,0.08);',
      '  color: rgba(255,255,255,0.9);',
      '}',

      /* Auth section */
      '.hb-auth {',
      '  padding: 10px 16px;',
      '  border-bottom: 1px solid rgba(255,255,255,0.06);',
      '  flex-shrink: 0;',
      '}',
      '.hb-google-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  width: 100%;',
      '  padding: 10px 16px;',
      '  border: 1px solid rgba(255,255,255,0.12);',
      '  border-radius: 8px;',
      '  background: rgba(255,255,255,0.04);',
      '  color: #e2e8f0;',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  transition: background 0.15s, border-color 0.15s;',
      '}',
      '.hb-google-btn:hover {',
      '  background: rgba(255,255,255,0.08);',
      '  border-color: rgba(255,255,255,0.2);',
      '}',
      '.hb-google-icon {',
      '  flex-shrink: 0;',
      '}',
      '.hb-user-info {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 8px;',
      '}',
      '.hb-user-name {',
      '  color: #a78bfa;',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  white-space: nowrap;',
      '  flex: 1;',
      '  min-width: 0;',
      '}',
      '.hb-sign-out {',
      '  background: none;',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  color: rgba(255,255,255,0.45);',
      '  font-size: 12px;',
      '  padding: 4px 10px;',
      '  border-radius: 6px;',
      '  cursor: pointer;',
      '  flex-shrink: 0;',
      '  transition: color 0.15s, border-color 0.15s;',
      '}',
      '.hb-sign-out:hover {',
      '  color: rgba(255,255,255,0.8);',
      '  border-color: rgba(255,255,255,0.25);',
      '}',

      /* Messages area */
      '.hb-messages {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  padding: 12px 16px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 8px;',
      '  scrollbar-width: thin;',
      '  scrollbar-color: rgba(124,58,237,0.3) transparent;',
      '}',
      '.hb-messages::-webkit-scrollbar { width: 6px; }',
      '.hb-messages::-webkit-scrollbar-track { background: transparent; }',
      '.hb-messages::-webkit-scrollbar-thumb {',
      '  background: rgba(124,58,237,0.3);',
      '  border-radius: 3px;',
      '}',
      '.hb-msg {',
      '  max-width: 85%;',
      '  padding: 10px 14px;',
      '  border-radius: 12px;',
      '  font-size: 14px;',
      '  word-wrap: break-word;',
      '  overflow-wrap: break-word;',
      '}',
      '.hb-msg-user {',
      '  align-self: flex-end;',
      '  background: linear-gradient(135deg, rgba(124,58,237,0.5), rgba(124,58,237,0.3));',
      '  color: #f1f5f9;',
      '  border-bottom-right-radius: 4px;',
      '}',
      '.hb-msg-bot {',
      '  align-self: flex-start;',
      '  background: rgba(255,255,255,0.06);',
      '  color: #e2e8f0;',
      '  border-bottom-left-radius: 4px;',
      '}',
      '.hb-msg-system {',
      '  align-self: center;',
      '  background: none;',
      '  color: rgba(255,255,255,0.35);',
      '  font-size: 12px;',
      '  text-align: center;',
      '  padding: 4px 8px;',
      '}',

      /* Markdown elements */
      '.hb-code-block {',
      '  background: rgba(0,0,0,0.35);',
      '  border: 1px solid rgba(255,255,255,0.08);',
      '  border-radius: 8px;',
      '  padding: 10px 12px;',
      '  margin: 6px 0;',
      '  font-family: "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace;',
      '  font-size: 13px;',
      '  overflow-x: auto;',
      '  white-space: pre-wrap;',
      '  color: #a5f3fc;',
      '}',
      '.hb-inline-code {',
      '  background: rgba(0,0,0,0.3);',
      '  padding: 2px 6px;',
      '  border-radius: 4px;',
      '  font-family: "SF Mono", "Fira Code", Consolas, monospace;',
      '  font-size: 13px;',
      '  color: #a5f3fc;',
      '}',
      '.hb-link {',
      '  color: #67e8f9;',
      '  text-decoration: underline;',
      '  text-decoration-color: rgba(103,232,249,0.3);',
      '  transition: text-decoration-color 0.15s;',
      '}',
      '.hb-link:hover {',
      '  text-decoration-color: rgba(103,232,249,0.8);',
      '}',
      '.hb-msg-bot strong { color: #c4b5fd; }',

      /* Typing indicator */
      '.hb-typing {',
      '  display: none;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 0 16px 8px;',
      '  flex-shrink: 0;',
      '}',
      '.hb-typing-dot {',
      '  width: 7px;',
      '  height: 7px;',
      '  border-radius: 50%;',
      '  background: rgba(124,58,237,0.5);',
      '  animation: hb-bounce 1.4s infinite ease-in-out both;',
      '}',
      '.hb-typing-dot:nth-child(1) { animation-delay: -0.32s; }',
      '.hb-typing-dot:nth-child(2) { animation-delay: -0.16s; }',
      '@keyframes hb-bounce {',
      '  0%, 80%, 100% { transform: scale(0); }',
      '  40% { transform: scale(1); }',
      '}',

      /* Input row */
      '.hb-input-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 12px 16px;',
      '  border-top: 1px solid rgba(255,255,255,0.06);',
      '  flex-shrink: 0;',
      '  background: rgba(0,0,0,0.15);',
      '}',
      '.hb-input {',
      '  flex: 1;',
      '  background: rgba(255,255,255,0.06);',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  border-radius: 10px;',
      '  padding: 10px 14px;',
      '  color: #f1f5f9;',
      '  font-size: 14px;',
      '  outline: none;',
      '  transition: border-color 0.2s;',
      '}',
      '.hb-input::placeholder {',
      '  color: rgba(255,255,255,0.25);',
      '}',
      '.hb-input:focus {',
      '  border-color: rgba(124,58,237,0.45);',
      '}',
      '.hb-send {',
      '  width: 40px;',
      '  height: 40px;',
      '  border: none;',
      '  border-radius: 10px;',
      '  background: linear-gradient(135deg, #7c3aed, #06b6d4);',
      '  color: #fff;',
      '  font-size: 18px;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex-shrink: 0;',
      '  transition: opacity 0.15s, transform 0.15s;',
      '}',
      '.hb-send:hover { opacity: 0.85; }',
      '.hb-send:active { transform: scale(0.92); }',
      '.hb-send:disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '  transform: none;',
      '}',

      /* Mobile responsive */
      '@media (max-width: 480px) {',
      '  .hb-panel {',
      '    width: calc(100vw - 16px);',
      '    height: calc(100vh - 100px);',
      '    right: 8px;',
      '    bottom: 88px;',
      '    border-radius: 14px;',
      '  }',
      '  .hb-fab {',
      '    bottom: 16px;',
      '    right: 16px;',
      '  }',
      '}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'heady-buddy-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ───────────────────────── DOM construction ─────────────────── */

  function injectDOM() {
    var root = document.createElement('div');
    root.id = 'heady-buddy-root';

    root.innerHTML = [
      /* FAB */
      '<button class="hb-fab" id="hb-fab" aria-label="Open HeadyBuddy chat">\uD83E\uDDE0</button>',

      /* Panel */
      '<div class="hb-panel" id="hb-panel">',
        /* Header */
        '<div class="hb-header">',
          '<span class="hb-title">\uD83E\uDDE0 HeadyBuddy</span>',
          '<button class="hb-close" id="hb-close" aria-label="Close chat">\u2715</button>',
        '</div>',
        /* Auth */
        '<div class="hb-auth" id="hb-auth"></div>',
        /* Messages */
        '<div class="hb-messages" id="hb-messages"></div>',
        /* Typing indicator */
        '<div class="hb-typing" id="hb-typing">',
          '<div class="hb-typing-dot"></div>',
          '<div class="hb-typing-dot"></div>',
          '<div class="hb-typing-dot"></div>',
        '</div>',
        /* Input row */
        '<div class="hb-input-row" id="hb-input-row" style="display:none;">',
          '<input class="hb-input" id="hb-input" type="text" placeholder="Ask HeadyBuddy..." autocomplete="off">',
          '<button class="hb-send" id="hb-send" aria-label="Send message">',
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
              '<line x1="22" y1="2" x2="11" y2="13"></line>',
              '<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
            '</svg>',
          '</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(root);

    /* Cache references */
    els.fab = document.getElementById('hb-fab');
    els.panel = document.getElementById('hb-panel');
    els.close = document.getElementById('hb-close');
    els.auth = document.getElementById('hb-auth');
    els.messages = document.getElementById('hb-messages');
    els.typing = document.getElementById('hb-typing');
    els.inputRow = document.getElementById('hb-input-row');
    els.input = document.getElementById('hb-input');
    els.send = document.getElementById('hb-send');
  }

  /* ───────────────────────── Event binding ────────────────────── */

  function bindEvents() {
    els.fab.addEventListener('click', togglePanel);
    els.close.addEventListener('click', togglePanel);

    els.send.addEventListener('click', function () {
      var text = els.input.value.trim();
      if (text) {
        sendMessage(text);
        els.input.value = '';
      }
    });

    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        els.send.click();
      }
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (state.open &&
          !els.panel.contains(e.target) &&
          !els.fab.contains(e.target)) {
        state.open = false;
        els.panel.style.display = 'none';
      }
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) {
        state.open = false;
        els.panel.style.display = 'none';
      }
    });
  }

  /* ───────────────────────── Boot sequence ────────────────────── */

  function boot() {
    injectStyles();
    injectDOM();
    bindEvents();
    renderAuth();

    /* Load Firebase then check existing session */
    initFirebase()
      .then(function () {
        return checkSession();
      })
      .then(function (sessionData) {
        /* Session cookie is valid — restore user from session data */
        var u = sessionData.user || sessionData;
        state.user = {
          uid: u.uid || u.user_id || '',
          email: u.email || '',
          displayName: u.displayName || u.display_name || u.name || u.email || ''
        };
        state.authChecked = true;
        renderAuth();
        loadHistory();
      })
      .catch(function () {
        /* No valid session — listen for Firebase auth state changes */
        state.authChecked = true;
        if (state.firebaseReady) {
          firebase.auth().onAuthStateChanged(function (fbUser) {
            if (fbUser && !state.user) {
              fbUser.getIdToken().then(function (idToken) {
                return exchangeToken(idToken);
              }).then(function () {
                setUser(fbUser);
                loadHistory();
              }).catch(function () {
                /* Token exchange failed — need fresh sign-in */
              });
            }
          });
        }
      });
  }

  /* ───────────────────────── Init ─────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
