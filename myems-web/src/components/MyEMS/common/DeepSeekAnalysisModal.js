import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCookieValue, handleAPIError } from '../../../helpers/utils';
import { APIBaseURL } from '../../../config';
import { useAIAssistant } from '../../../context/AIAssistantContext';
import withRedirect from '../../../hoc/withRedirect';

const MAX_CLIENT_MESSAGES = 5;

const DeepSeekAnalysisModal = ({ setRedirect, setRedirectUrl, t, i18n }) => {
  const assistant = useAIAssistant();
  const isOpen = assistant ? assistant.isOpen : false;
  const setIsOpen = assistant ? assistant.setIsOpen : null;
  const getReportContext = assistant ? assistant.getReportContext : null;
  const hasReportContext = assistant ? assistant.hasReportContext : false;
  const reportQueried = assistant ? assistant.reportQueried : false;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyShowsCheck, setCopyShowsCheck] = useState(false);

  const messagesRef = useRef([]);
  const apiMessagesRef = useRef([]);
  const copyTimerRef = useRef(null);
  const bodyRef = useRef(null);

  const language = (i18n && i18n.language) || 'zh_CN';

  const updateMessages = useCallback(updater => {
    const next = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    messagesRef.current = next;
    setMessages(next);
    return next;
  }, []);

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
      setInput('');
      updateMessages([...prior, { role: 'user', content: trimmed }]);
      const content = await sendToApi(nextApi);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNewChat = () => {
    apiMessagesRef.current = [];
    updateMessages([{ role: 'assistant', content: t('AI assistant welcome'), local: true }]);
    setInput('');
    setCopyShowsCheck(false);
  };

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

  if (!assistant) {
    return null;
  }

  const atLimit = apiMessagesRef.current.length >= MAX_CLIENT_MESSAGES;

  if (!isOpen) {
    return (
      <button
        type="button"
        title={t('AI Assistant')}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          color: '#fff',
          backgroundColor: '#2a7be4',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          zIndex: 1050
        }}
      >
        <FontAwesomeIcon icon="comments" size="lg" />
      </button>
    );
  }

  return (
    <div
      className="card shadow-lg"
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        width: '380px',
        height: '560px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1050
      }}
    >
      <style>{`
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
          background-image: linear-gradient(135deg, #4a97ff 0%, #2a7be4 100%);
          box-shadow: 0 4px 12px rgba(42, 123, 228, 0.35);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }
        .ai-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.07);
          box-shadow: 0 6px 16px rgba(42, 123, 228, 0.45);
        }
        .ai-send-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(42, 123, 228, 0.4);
        }
        .ai-send-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(42, 123, 228, 0.28);
        }
        .ai-send-btn:disabled {
          background-image: none;
          background-color: #c8d0db;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.85;
        }
      `}</style>
      <div className="card-header d-flex align-items-center justify-content-between py-2">
        <span className="d-flex align-items-center font-weight-bold">
          <FontAwesomeIcon icon="comments" className="mr-2 text-primary" />
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
            onClick={handleNewChat}
            disabled={loading}
          >
            <FontAwesomeIcon icon="redo" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-falcon-default"
            title={t('AI assistant close')}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </span>
      </div>

      <div ref={bodyRef} className="card-body p-3" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === 'user'
                  ? 'align-self-end bg-light rounded p-2 px-3'
                  : 'align-self-start border rounded p-2 px-3'
              }
              style={{ maxWidth: '92%', whiteSpace: 'pre-wrap' }}
            >
              {m.content}
            </div>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-2 text-muted small">
            <FontAwesomeIcon icon="circle-notch" spin className="mr-1" />
            {t('AI assistant thinking')}
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
              className="btn btn-sm btn-outline-primary"
              disabled={loading || atLimit}
              onClick={() => send(t('AI analysis initial prompt'), { requireReportData: true })}
            >
              {t('AI assistant analyze report')}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={loading || atLimit}
            onClick={() => send(t('AI assistant usage prompt'))}
          >
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
            className="form-control form-control-sm mr-2"
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
