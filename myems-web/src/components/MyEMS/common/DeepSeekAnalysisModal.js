import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner
} from 'reactstrap';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getCookieValue, handleAPIError } from '../../../helpers/utils';
import { APIBaseURL } from '../../../config';
import ButtonIcon from '../../common/ButtonIcon';

/** Normalize legacy model wording in displayed/copied analysis text. */
function normalizeAnalysisDisplayText(text) {
  if (typeof text !== 'string') {
    return text;
  }
  return text.replace(/二、可落地的节能与运维优化建议/g, '二、节能与运维优化建议');
}

/** Max messages in API `messages` array (user/assistant turns); reduces token cost and abuse. */
const MAX_CLIENT_MESSAGES = 5;

const DeepSeekAnalysisModal = ({
  isOpen,
  toggle,
  language,
  reportContext,
  setRedirect,
  setRedirectUrl,
  t
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const openedRef = useRef(false);
  /** Full thread sent to API (includes hidden first user prompt). */
  const fullApiMessagesRef = useRef([]);
  const copyFeedbackTimerRef = useRef(null);
  const [copyShowsCheck, setCopyShowsCheck] = useState(false);
  const [apiThreadLength, setApiThreadLength] = useState(0);

  const sendToApi = useCallback(
    async nextMessages => {
      setLoading(true);
      try {
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
    [language, reportContext, setRedirect, setRedirectUrl, t]
  );

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      openedRef.current = false;
      fullApiMessagesRef.current = [];
      setMessages([]);
      setInput('');
      setCopyShowsCheck(false);
      setApiThreadLength(0);
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
      return;
    }

    if (!reportContext || openedRef.current) {
      return;
    }

    openedRef.current = true;

    const initialUser = t('AI analysis initial prompt');
    const run = async () => {
      const firstBatch = [{ role: 'user', content: initialUser }];
      const content = await sendToApi(firstBatch);
      if (content == null) {
        return;
      }
      fullApiMessagesRef.current = [
        { role: 'user', content: initialUser },
        { role: 'assistant', content }
      ];
      setApiThreadLength(fullApiMessagesRef.current.length);
      setMessages([{ role: 'assistant', content }]);
    };
    run();
  }, [isOpen, reportContext, sendToApi, t]);

  const handleSendFollowUp = async e => {
    e.preventDefault();
    const text = (input || '').trim();
    if (!text || loading) {
      return;
    }
    if (fullApiMessagesRef.current.length >= MAX_CLIENT_MESSAGES) {
      return;
    }
    const prior = messages;
    const nextApiThread = [...fullApiMessagesRef.current, { role: 'user', content: text }];
    setInput('');
    setMessages([...prior, { role: 'user', content: text }]);
    const content = await sendToApi(nextApiThread);
    if (content == null) {
      setMessages(prior);
      return;
    }
    fullApiMessagesRef.current = [...nextApiThread, { role: 'assistant', content }];
    setApiThreadLength(fullApiMessagesRef.current.length);
    setMessages([...prior, { role: 'user', content: text }, { role: 'assistant', content }]);
  };

  const handleCopyConversation = useCallback(async () => {
    const text = messages.map(m => normalizeAnalysisDisplayText(m.content)).join('\n\n');
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
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
      setCopyShowsCheck(true);
      copyFeedbackTimerRef.current = setTimeout(() => {
        setCopyShowsCheck(false);
        copyFeedbackTimerRef.current = null;
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" scrollable>
      <ModalHeader toggle={toggle}>{t('AI Analysis')}</ModalHeader>
      <ModalBody style={{ minHeight: 280 }}>
        {loading && messages.length === 0 ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2 mb-0 text-muted">{t('AI analysis loading')}</p>
          </div>
        ) : null}
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
              {normalizeAnalysisDisplayText(m.content)}
            </div>
          ))}
        </div>
        {messages.length > 0 ? (
          <div className="d-flex justify-content-start align-items-center mt-2 pt-2 border-top border-200">
            <ButtonIcon
              icon={copyShowsCheck ? 'check' : 'copy'}
              transform="shrink-3 down-2"
              color="falcon-default"
              size="sm"
              onClick={handleCopyConversation}
              disabled={loading}
              title={t('AI analysis copy')}
            />
          </div>
        ) : null}
        {loading && messages.length > 0 ? (
          <div className="text-center py-2">
            <Spinner color="primary" size="sm" />
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter className="flex-column align-items-stretch">
        <form onSubmit={handleSendFollowUp}>
          <Input
            type="textarea"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('AI analysis follow up placeholder')}
            disabled={loading || apiThreadLength >= MAX_CLIENT_MESSAGES}
          />
          {apiThreadLength >= MAX_CLIENT_MESSAGES && messages.length > 0 ? (
            <small className="text-muted d-block mt-1">{t('AI analysis max messages hint')}</small>
          ) : null}
          <div className="d-flex justify-content-end mt-2">
            <Button
              color="primary"
              type="submit"
              size="sm"
              disabled={loading || apiThreadLength >= MAX_CLIENT_MESSAGES}
            >
              {t('Send')}
            </Button>
          </div>
        </form>
      </ModalFooter>
    </Modal>
  );
};

DeepSeekAnalysisModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  reportContext: PropTypes.object,
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(DeepSeekAnalysisModal);
