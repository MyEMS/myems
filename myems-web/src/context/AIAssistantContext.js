import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const AIAssistantContext = createContext(null);

const REPORT_API_MARK = '/reports/';

export const AIAssistantProvider = ({ children }) => {
  const [reportContextGetter, setReportContextGetter] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [reportQueried, setReportQueried] = useState(false);
  const reportQueriedRef = useRef(false);

  const registerReportContext = useCallback(getter => {
    setReportContextGetter(() => (typeof getter === 'function' ? getter : null));
  }, []);

  const markReportQueried = useCallback(() => {
    if (!reportQueriedRef.current) {
      reportQueriedRef.current = true;
      setReportQueried(true);
    }
  }, []);

  const resetReportQueried = useCallback(() => {
    if (reportQueriedRef.current) {
      reportQueriedRef.current = false;
      setReportQueried(false);
    }
  }, []);

  const getReportContext = useCallback(() => {
    if (typeof reportContextGetter !== 'function') {
      return null;
    }
    try {
      return reportContextGetter();
    } catch (e) {
      console.error('Failed to build AI assistant report context', e);
      return null;
    }
  }, [reportContextGetter]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
      return undefined;
    }
    const originalFetch = window.fetch;
    window.fetch = function patchedFetch(...args) {
      const input = args[0];
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const result = originalFetch.apply(window, args);
      if (typeof url === 'string' && url.indexOf(REPORT_API_MARK) !== -1) {
        return result.then(response => {
          if (response && response.ok) {
            markReportQueried();
          }
          return response;
        });
      }
      return result;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [markReportQueried]);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      hasReportContext: typeof reportContextGetter === 'function',
      reportQueried,
      registerReportContext,
      getReportContext,
      resetReportQueried
    }),
    [isOpen, reportQueried, registerReportContext, getReportContext, reportContextGetter, resetReportQueried]
  );

  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
};

AIAssistantProvider.propTypes = { children: PropTypes.node };

export const useAIAssistant = () => useContext(AIAssistantContext);

export const useAIAssistantReportContext = getter => {
  const assistant = useContext(AIAssistantContext);
  const register = assistant ? assistant.registerReportContext : null;
  const resetReportQueried = assistant ? assistant.resetReportQueried : null;

  useEffect(() => {
    if (resetReportQueried) {
      resetReportQueried();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!register) {
      return undefined;
    }
    register(getter);
    return () => register(null);
  }, [register, getter]);
};

export default AIAssistantContext;
