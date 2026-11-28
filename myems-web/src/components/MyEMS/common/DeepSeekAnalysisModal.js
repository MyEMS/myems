import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCookieValue, handleAPIError } from '../../../helpers/utils';
import { APIBaseURL } from '../../../config';
import { useAIAssistant } from '../../../context/AIAssistantContext';
import AppContext from '../../../context/Context';
import withRedirect from '../../../hoc/withRedirect';
import aiRobot from '../../../assets/img/ai-assistant/myems-ai-robot.svg';

const MAX_CLIENT_MESSAGES = 5;
const FAB_SIZE = 112;
const FAB_MARGIN = 24;
const VIEWPORT_MARGIN = 8;
const DRAG_THRESHOLD = 4;
const DIALOG_DEFAULT_WIDTH = 380;
const DIALOG_DEFAULT_HEIGHT = 560;
const DIALOG_MIN_WIDTH = 300;
const DIALOG_MIN_HEIGHT = 320;
const FAB_POS_KEY = 'myems_ai_assistant_fab_pos';
const DIALOG_SIZE_KEY = 'myems_ai_assistant_dialog_size';

const readStoredJSON = key => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const writeStoredJSON = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    return;
  }
};

const DeepSeekAnalysisModal = ({ setRedirect, setRedirectUrl, t, i18n }) => {
  const assistant = useAIAssistant();
  const isOpen = assistant ? assistant.isOpen : false;
  const setIsOpen = assistant ? assistant.setIsOpen : null;
  const getReportContext = assistant ? assistant.getReportContext : null;
  const hasReportContext = assistant ? assistant.hasReportContext : false;
  const reportQueried = assistant ? assistant.reportQueried : false;
  const reportQueryToken = assistant ? assistant.reportQueryToken : 0;

  const location = useLocation();
  const { isDark } = useContext(AppContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyShowsCheck, setCopyShowsCheck] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [fabPos, setFabPos] = useState(() => readStoredJSON(FAB_POS_KEY));
  const [dialogPos, setDialogPos] = useState(null);
  const [dialogSize, setDialogSize] = useState(() => {
    const stored = readStoredJSON(DIALOG_SIZE_KEY);
    if (stored && typeof stored.width === 'number' && typeof stored.height === 'number') {
      return stored;
    }
    return { width: DIALOG_DEFAULT_WIDTH, height: DIALOG_DEFAULT_HEIGHT };
  });

  const messagesRef = useRef([]);
  const apiMessagesRef = useRef([]);
  const copyTimerRef = useRef(null);
  const bodyRef = useRef(null);
  const sessionRef = useRef(0);
  const reportQueryTokenRef = useRef(reportQueryToken);
  const dialogSizeRef = useRef(dialogSize);
  const dialogPosRef = useRef(null);

  useEffect(() => {
    dialogSizeRef.current = dialogSize;
  }, [dialogSize]);

  useEffect(() => {
    dialogPosRef.current = dialogPos;
  }, [dialogPos]);

  const language = (i18n && i18n.language) || 'zh_CN';

  const updateMessages = useCallback(updater => {
    const next = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    messagesRef.current = next;
    setMessages(next);
    return next;
  }, []);

  const computeDialogPos = useCallback(
    (width, height) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fabLeft = fabPos ? fabPos.left : vw - FAB_MARGIN - FAB_SIZE;
      const fabTop = fabPos ? fabPos.top : vh - FAB_MARGIN - FAB_SIZE;
      const anchorRight = fabLeft + FAB_SIZE / 2 >= vw / 2;
      const anchorBottom = fabTop + FAB_SIZE / 2 >= vh / 2;
      let left = anchorRight ? fabLeft + FAB_SIZE - width : fabLeft;
      let top = anchorBottom ? fabTop + FAB_SIZE - height : fabTop;
      const maxLeft = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);
      const maxTop = Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN);
      left = Math.min(Math.max(VIEWPORT_MARGIN, left), maxLeft);
      top = Math.min(Math.max(VIEWPORT_MARGIN, top), maxTop);
      return { left, top };
    },
    [fabPos]
  );

  const sendToApi = useCallback(
    async nextMessages => {
      setLoading(true);
      try {
        const reportContext = typeof getReportContext === 'function' ? getReportContext() : null;
        const response = await fetch(APIBaseURL + '/ai/deepseek/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: JSON.stringify({
            language,
            report_context: reportContext,
            messages: nextMessages
          })
        });
        const json = await response.json();
        if (!response.ok) {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
          return null;
        }
        if (!json.message || !json.message.content) {
          toast.error(t('API.DEEPSEEK_INVALID_RESPONSE'));
          return null;
        }
        return json.message.content;
      } catch (e) {
        console.error(e);
        toast.error(t('API.DEEPSEEK_REQUEST_FAILED'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getReportContext, language, setRedirect, setRedirectUrl, t]
  );

  const send = useCallback(
    async (text, options) => {
      const opts = options || {};
      const trimmed = (text || '').trim();
      if (!trimmed || loading) {
        return;
      }
      if (apiMessagesRef.current.length >= MAX_CLIENT_MESSAGES) {
        return;
      }
      const prior = messagesRef.current;
      if (opts.requireReportData) {
        const context = typeof getReportContext === 'function' ? getReportContext() : null;
        if (!reportQueried || !context) {
          updateMessages([
            ...prior,
            { role: 'assistant', content: t('AI assistant need data'), local: true }
          ]);
          return;
        }
      }
      const nextApi = [...apiMessagesRef.current, { role: 'user', content: trimmed }];
      const sessionAtStart = sessionRef.current;
      setInput('');
      updateMessages([...prior, { role: 'user', content: trimmed }]);
      const content = await sendToApi(nextApi);
      if (sessionRef.current !== sessionAtStart) {
        return;
      }
      if (content == null) {
        updateMessages(prior);
        return;
      }
      apiMessagesRef.current = [...nextApi, { role: 'assistant', content }];
      updateMessages([...prior, { role: 'user', content: trimmed }, { role: 'assistant', content }]);
    },
    [getReportContext, loading, reportQueried, sendToApi, t, updateMessages]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (messagesRef.current.length > 0) {
      return;
    }
    updateMessages([{ role: 'assistant', content: t('AI assistant welcome'), local: true }]);
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  const startNewSession = useCallback(() => {
    sessionRef.current += 1;
    apiMessagesRef.current = [];
    setInput('');
    setCopyShowsCheck(false);
    setSessionTick(tick => tick + 1);
    updateMessages([{ role: 'assistant', content: t('AI assistant welcome'), local: true }]);
  }, [t, updateMessages]);

  useEffect(() => {
    startNewSession();
  }, [location.pathname]);

  useEffect(() => {
    if (reportQueryToken !== reportQueryTokenRef.current) {
      reportQueryTokenRef.current = reportQueryToken;
      startNewSession();
    }
  }, [reportQueryToken]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const pos = computeDialogPos(dialogSizeRef.current.width, dialogSizeRef.current.height);
    dialogPosRef.current = pos;
    setDialogPos(pos);
  }, [isOpen, computeDialogPos]);

  const handleRefresh = useCallback(() => {
    setRefreshCount(count => count + 1);
    startNewSession();
  }, [startNewSession]);

  const handleCopyConversation = useCallback(async () => {
    const text = messagesRef.current.map(m => m.content).join('\n\n');
    if (!text.trim()) {
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      setCopyShowsCheck(true);
      copyTimerRef.current = setTimeout(() => {
        setCopyShowsCheck(false);
        copyTimerRef.current = null;
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFabPointerDown = useCallback(
    e => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = e.currentTarget.getBoundingClientRect();
      const originLeft = rect.left;
      const originTop = rect.top;
      let moved = false;
      let last = { left: originLeft, top: originTop };

      const onMove = ev => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
          return;
        }
        moved = true;
        const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - FAB_SIZE - VIEWPORT_MARGIN);
        const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - FAB_SIZE - VIEWPORT_MARGIN);
        const left = Math.min(Math.max(VIEWPORT_MARGIN, originLeft + dx), maxLeft);
        const top = Math.min(Math.max(VIEWPORT_MARGIN, originTop + dy), maxTop);
        last = { left, top };
        setFabPos(last);
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        if (moved) {
          writeStoredJSON(FAB_POS_KEY, last);
        } else {
          setIsOpen(true);
        }
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    },
    [setIsOpen]
  );

  const handleResizePointerDown = useCallback(
    direction => e => {
      e.preventDefault();
      e.stopPropagation();
      const startWidth = dialogSizeRef.current.width;
      const startHeight = dialogSizeRef.current.height;
      const startPos = dialogPosRef.current || { left: 0, top: 0 };
      const rightEdge = startPos.left + startWidth;
      const bottomEdge = startPos.top + startHeight;
      let lastSize = { width: startWidth, height: startHeight };
      let lastPos = { left: startPos.left, top: startPos.top };

      const onMove = ev => {
        let width = startWidth;
        let height = startHeight;
        let left = startPos.left;
        let top = startPos.top;
        const maxRight = window.innerWidth - VIEWPORT_MARGIN;
        const maxBottom = window.innerHeight - VIEWPORT_MARGIN;
        if (direction.indexOf('left') !== -1) {
          left = Math.min(Math.max(VIEWPORT_MARGIN, ev.clientX), rightEdge - DIALOG_MIN_WIDTH);
          width = rightEdge - left;
        } else if (direction.indexOf('right') !== -1) {
          width = Math.min(Math.max(left + DIALOG_MIN_WIDTH, ev.clientX), maxRight) - left;
        }
        if (direction.indexOf('top') !== -1) {
          top = Math.min(Math.max(VIEWPORT_MARGIN, ev.clientY), bottomEdge - DIALOG_MIN_HEIGHT);
          height = bottomEdge - top;
        } else if (direction.indexOf('bottom') !== -1) {
          height = Math.min(Math.max(top + DIALOG_MIN_HEIGHT, ev.clientY), maxBottom) - top;
        }
        lastSize = { width, height };
        lastPos = { left, top };
        setDialogSize(lastSize);
        setDialogPos(lastPos);
        dialogPosRef.current = lastPos;
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        writeStoredJSON(DIALOG_SIZE_KEY, lastSize);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    },
    []
  );

  const handleHeaderPointerDown = useCallback(
    e => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      const target = e.target;
      if (target && typeof target.closest === 'function' && target.closest('button')) {
        return;
      }
      const startX = e.clientX;
      const startY = e.clientY;
      const startPos =
        dialogPosRef.current ||
        computeDialogPos(dialogSizeRef.current.width, dialogSizeRef.current.height);

      const onMove = ev => {
        const maxLeft = Math.max(
          VIEWPORT_MARGIN,
          window.innerWidth - dialogSizeRef.current.width - VIEWPORT_MARGIN
        );
        const maxTop = Math.max(
          VIEWPORT_MARGIN,
          window.innerHeight - dialogSizeRef.current.height - VIEWPORT_MARGIN
        );
        const left = Math.min(
          Math.max(VIEWPORT_MARGIN, startPos.left + ev.clientX - startX),
          maxLeft
        );
        const top = Math.min(Math.max(VIEWPORT_MARGIN, startPos.top + ev.clientY - startY), maxTop);
        const pos = { left, top };
        dialogPosRef.current = pos;
        setDialogPos(pos);
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    },
    [computeDialogPos]
  );

  if (!assistant) {
    return null;
  }

  const atLimit = apiMessagesRef.current.length >= MAX_CLIENT_MESSAGES;

  const darkOverrides = isDark
    ? `
    .ai-msg-assistant {
      background-color: #22314a;
      border-color: #31465f;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .ai-msg-flash::after { background-color: #4cc6f0; }
    .ai-send-btn:disabled { background-color: #3b4759; }
  `
    : '';

  const aiStyles = `
    @keyframes ai-fab-in {
      0% { transform: scale(0.4); opacity: 0; }
      60% { transform: scale(1.12); opacity: 1; }
      100% { transform: scale(1); }
    }
    @keyframes ai-dialog-in {
      from { transform: translateY(14px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes ai-dot {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes ai-refresh-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes ai-msg-in-right {
      0% { transform: translate(18px, 6px) scale(0.94); opacity: 0; }
      70% { transform: translate(-2px, 0) scale(1.015); opacity: 1; }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes ai-msg-in-left {
      0% { transform: translate(-18px, 6px) scale(0.94); opacity: 0; }
      70% { transform: translate(2px, 0) scale(1.015); opacity: 1; }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes ai-flash-fade {
      from { opacity: 0.28; }
      to { opacity: 0; }
    }
    .ai-fab {
      background-image: none;
      background-color: transparent;
      animation: ai-fab-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.18s ease, filter 0.18s ease;
    }
    .ai-fab-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }
    .ai-fab:hover { transform: scale(1.08) rotate(-4deg); filter: brightness(1.06); }
    .ai-fab:active { transform: scale(0.95) rotate(0deg); }
    .ai-fab:focus { outline: none; }
    .ai-fab:focus-visible { outline: 3px solid rgba(0, 154, 227, 0.75); outline-offset: 3px; }
    .ai-dialog { animation: ai-dialog-in 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
    .ai-dialog-header {
      background-image: linear-gradient(135deg, #35b4ee 0%, #009ae3 55%, #0078ca 100%);
      color: #fff;
      border-bottom: none;
      cursor: move;
      touch-action: none;
      user-select: none;
    }
    .ai-dialog-header .btn {
      border: none;
      border-radius: 10px;
      color: #fff;
      background-color: rgba(255, 255, 255, 0.18);
      transition: background-color 0.15s ease, transform 0.15s ease;
    }
    .ai-dialog-header .btn:hover:not(:disabled) {
      color: #fff;
      background-color: rgba(255, 255, 255, 0.32);
      transform: translateY(-1px);
    }
    .ai-dialog-header .btn:disabled { color: rgba(255, 255, 255, 0.6); }
    .ai-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(15, 42, 66, 0.2);
    }
    .ai-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .ai-msg-user {
      position: relative;
      align-self: flex-end;
      color: #fff;
      background-image: linear-gradient(135deg, #35b4ee 0%, #009ae3 55%, #0078ca 100%);
      border-radius: 14px 14px 2px 14px;
      box-shadow: 0 3px 10px rgba(0, 154, 227, 0.24);
      animation: ai-msg-in-right 0.36s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ai-msg-user::after {
      content: '';
      position: absolute;
      right: -5px;
      bottom: 5px;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 6px solid #0089cc;
    }
    .ai-msg-assistant {
      position: relative;
      z-index: 0;
      align-self: flex-start;
      background-color: #f2f9fd;
      border: 1px solid #dceef8;
      border-radius: 14px 14px 14px 2px;
      box-shadow: 0 2px 8px rgba(15, 42, 66, 0.05);
      animation: ai-msg-in-left 0.36s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ai-msg-flash::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -1;
      border-radius: inherit;
      background-color: #009ae3;
      pointer-events: none;
      animation: ai-flash-fade 0.9s ease-out forwards;
    }
    .ai-chip { border-radius: 999px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .ai-chip:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 154, 227, 0.2); }
    .ai-chip:active:not(:disabled) { transform: translateY(0) scale(0.95); }
    .ai-input:focus { border-color: #009ae3; box-shadow: 0 0 0 3px rgba(0, 154, 227, 0.16); }
    .ai-typing { display: inline-flex; align-items: center; }
    .ai-dot {
      width: 6px;
      height: 6px;
      margin: 0 2px;
      border-radius: 50%;
      background-color: #009ae3;
      display: inline-block;
      animation: ai-dot 1.2s infinite ease-in-out;
    }
    .ai-dot:nth-child(2) { animation-delay: 0.15s; }
    .ai-dot:nth-child(3) { animation-delay: 0.3s; }
    .ai-refresh-spin { display: inline-block; animation: ai-refresh-spin 0.5s ease; }
    .ai-resize-handle { position: absolute; z-index: 3; touch-action: none; user-select: none; }
    .ai-resize-handle-top { top: 0; left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
    .ai-resize-handle-bottom { bottom: 0; left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
    .ai-resize-handle-left { left: 0; top: 14px; bottom: 14px; width: 6px; cursor: ew-resize; }
    .ai-resize-handle-right { right: 0; top: 14px; bottom: 14px; width: 6px; cursor: ew-resize; }
    .ai-resize-handle-corner-tl { top: 0; left: 0; width: 14px; height: 14px; cursor: nwse-resize; }
    .ai-resize-handle-corner-tr { top: 0; right: 0; width: 14px; height: 14px; cursor: nesw-resize; }
    .ai-resize-handle-corner-bl { bottom: 0; left: 0; width: 14px; height: 14px; cursor: nesw-resize; }
    .ai-resize-handle-corner-br { bottom: 0; right: 0; width: 14px; height: 14px; cursor: nwse-resize; }
    .ai-send-btn {
      flex: 0 0 42px;
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.95rem;
      background-image: linear-gradient(135deg, #35b4ee 0%, #009ae3 55%, #0078ca 100%);
      box-shadow: 0 4px 12px rgba(0, 154, 227, 0.35);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    }
    .ai-send-btn svg { transition: transform 0.18s ease; }
    .ai-send-btn:hover:not(:disabled) {
      transform: translateY(-1px) scale(1.05);
      filter: brightness(1.07);
      box-shadow: 0 6px 16px rgba(0, 154, 227, 0.45);
    }
    .ai-send-btn:hover:not(:disabled) svg { transform: rotate(-14deg) scale(1.08); }
    .ai-send-btn:active:not(:disabled) {
      transform: translateY(0) scale(0.96);
      box-shadow: 0 2px 8px rgba(0, 154, 227, 0.4);
    }
    .ai-send-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(0, 154, 227, 0.28); }
    .ai-send-btn:disabled {
      background-image: none;
      background-color: #c8d0db;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.85;
    }
    @media (prefers-reduced-motion: reduce) {
      .ai-fab, .ai-dialog, .ai-dot, .ai-send-btn, .ai-chip, .ai-msg-user, .ai-msg-assistant {
        animation: none !important;
        transition: none !important;
      }
    }
    ${darkOverrides}
  `;

  if (!isOpen) {
    const fabStyle = {
      position: 'fixed',
      width: `${FAB_SIZE}px`,
      height: `${FAB_SIZE}px`,
      borderRadius: '50%',
      border: 'none',
      padding: 0,
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'none',
      cursor: 'grab',
      touchAction: 'none',
      userSelect: 'none',
      zIndex: 1050
    };
    if (fabPos) {
      fabStyle.left = `${fabPos.left}px`;
      fabStyle.top = `${fabPos.top}px`;
    } else {
      fabStyle.right = `${FAB_MARGIN}px`;
      fabStyle.bottom = `${FAB_MARGIN}px`;
    }
    return (
      <>
        <style>{aiStyles}</style>
        <button
          type="button"
          className="ai-fab"
          title={t('AI Assistant')}
          aria-label={t('AI Assistant')}
          style={fabStyle}
          onPointerDown={handleFabPointerDown}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <img className="ai-fab-img" src={aiRobot} alt="" aria-hidden="true" />
        </button>
      </>
    );
  }

  const dialogStyle = {
    position: 'fixed',
    width: `${dialogSize.width}px`,
    height: `${dialogSize.height}px`,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 32px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '18px',
    zIndex: 1050
  };
  if (dialogPos) {
    dialogStyle.left = `${dialogPos.left}px`;
    dialogStyle.top = `${dialogPos.top}px`;
  } else {
    dialogStyle.right = `${FAB_MARGIN}px`;
    dialogStyle.bottom = `${FAB_MARGIN}px`;
  }

  return (
    <div className="card shadow-lg ai-dialog" style={dialogStyle}>
      <style>{aiStyles}</style>
      <div
        className="ai-resize-handle ai-resize-handle-top"
        onPointerDown={handleResizePointerDown('top')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-bottom"
        onPointerDown={handleResizePointerDown('bottom')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-left"
        onPointerDown={handleResizePointerDown('left')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-right"
        onPointerDown={handleResizePointerDown('right')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-corner-tl"
        onPointerDown={handleResizePointerDown('top-left')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-corner-tr"
        onPointerDown={handleResizePointerDown('top-right')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-corner-bl"
        onPointerDown={handleResizePointerDown('bottom-left')}
      />
      <div
        className="ai-resize-handle ai-resize-handle-corner-br"
        onPointerDown={handleResizePointerDown('bottom-right')}
      />
      <div
        className="card-header ai-dialog-header d-flex align-items-center justify-content-between py-2"
        onPointerDown={handleHeaderPointerDown}
      >
        <span className="d-flex align-items-center font-weight-bold">
          <span className="ai-avatar mr-2">
            <img className="ai-avatar-img" src={aiRobot} alt="" aria-hidden="true" />
          </span>
          {t('AI Assistant')}
        </span>
        <span className="d-flex align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-falcon-default mr-1"
            title={t('AI assistant copy')}
            onClick={handleCopyConversation}
            disabled={loading || messages.length === 0}
          >
            <FontAwesomeIcon icon={copyShowsCheck ? 'check' : 'copy'} />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-falcon-default mr-1"
            title={t('AI assistant new chat')}
            onClick={handleRefresh}
            disabled={loading}
          >
            <span key={refreshCount} className={refreshCount > 0 ? 'ai-refresh-spin' : ''}>
              <FontAwesomeIcon icon="redo" />
            </span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-falcon-default"
            title={t('AI assistant close')}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon="minus" />
          </button>
        </span>
      </div>

      <div ref={bodyRef} className="card-body p-3" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
          {messages.map((m, idx) => (
            <div
              key={`${sessionTick}-${idx}`}
              className={`${m.role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant'}${
                m.role !== 'user' && !m.local && idx === messages.length - 1 ? ' ai-msg-flash' : ''
              } p-2 px-3`}
              style={{ maxWidth: '92%', whiteSpace: 'pre-wrap' }}
            >
              {m.content}
            </div>
          ))}
        </div>
        {loading ? (
          <div className="ai-msg-assistant ai-typing p-2 px-3 mt-2" style={{ width: 'fit-content' }}>
            <span className="ai-dot" />
            <span className="ai-dot" />
            <span className="ai-dot" />
          </div>
        ) : null}
      </div>

      <div className="card-footer p-2">
        {atLimit && messages.length > 0 ? (
          <small className="text-muted d-block mb-1">{t('AI analysis max messages hint')}</small>
        ) : null}
        <div className="d-flex flex-wrap mb-2" style={{ gap: '0.5rem' }}>
          {hasReportContext ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary ai-chip"
              disabled={loading || atLimit}
              onClick={() => send(t('AI analysis initial prompt'), { requireReportData: true })}
            >
              <FontAwesomeIcon icon="chart-pie" className="mr-1" />
              {t('AI assistant analyze report')}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary ai-chip"
            disabled={loading || atLimit}
            onClick={() => send(t('AI assistant usage prompt'))}
          >
            <FontAwesomeIcon icon="question-circle" className="mr-1" />
            {t('AI assistant ask usage')}
          </button>
        </div>
        <form
          className="d-flex align-items-end"
          onSubmit={e => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            className="form-control form-control-sm mr-2 ai-input"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('AI assistant placeholder')}
            disabled={loading || atLimit}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button
            type="submit"
            className="ai-send-btn"
            title={t('AI Assistant')}
            aria-label={t('AI Assistant')}
            disabled={loading || atLimit}
          >
            <FontAwesomeIcon icon={loading ? 'circle-notch' : 'paper-plane'} spin={loading} />
          </button>
        </form>
      </div>
    </div>
  );
};

DeepSeekAnalysisModal.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired
};

export default withTranslation()(withRedirect(DeepSeekAnalysisModal));
