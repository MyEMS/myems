import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import FalconCardHeader from '../../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty } from '../../../../helpers/utils';
import withRedirect from '../../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../../config';
import { validate, format, minify, detectFullWidthPunctuation, convertFullWidthToHalfWidth } from './jsonUtils';
import JsonInputArea from './components/JsonInputArea';
import ResultPanel from './components/ResultPanel';

// Built-in samples cycled by the "Load Sample" button:
// a valid meter payload, a payload with legal Chinese text inside strings,
// and an invalid payload containing full-width punctuation in structural positions.
const SAMPLES = [
  JSON.stringify(
    {
      space: 'Building_1',
      meter: { id: 1, name: 'MeterA', manufacturer: 'Siemens' },
      values: [12.5, 33.75, 8.25],
      unit: 'kWh',
      enabled: true
    },
    null,
    2
  ),
  '{\n  "space": "\u5199\u5b57\u697cA",\n  "\u8bbe\u5907": "\u7535\u8868\uff0c1\u53f7\u697c",\n  "value": 123.45\n}',
  '{\u201cname\u201d\uff1a\u201cMyEMS\u201d\uff0c\u201cversion\u201d\uff1a6}'
];

const INDENT_VALUES = { 2: 2, 4: 4, tab: '\t' };

const JSONValidator = ({ setRedirect, setRedirectUrl, t }) => {
  const [inputText, setInputText] = useState('');
  const [indent, setIndent] = useState('2');
  const [checkResult, setCheckResult] = useState(null);
  const [punctuationIssues, setPunctuationIssues] = useState([]);
  const [issuesTruncated, setIssuesTruncated] = useState(false);
  const [output, setOutput] = useState(null);
  const [autoFixInfo, setAutoFixInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const sampleIndex = useRef(0);
  const copyTimer = useRef(null);

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  }, [setRedirect, setRedirectUrl]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  // Shared runner: refresh the verdict and the punctuation issue list together.
  const runCheck = text => {
    const check = validate(text);
    setCheckResult(check);
    const detection = detectFullWidthPunctuation(text);
    setPunctuationIssues(detection.issues);
    setIssuesTruncated(detection.truncated);
    return check;
  };

  const handleInputChange = value => {
    setInputText(value);
    // Drop stale results so the panel never refers to a previous input.
    setCheckResult(null);
    setPunctuationIssues([]);
    setIssuesTruncated(false);
    setOutput(null);
    setAutoFixInfo(null);
  };

  const handleValidate = () => {
    setOutput(null);
    setAutoFixInfo(null);
    runCheck(inputText);
  };

  const handleTransform = transformFn => {
    const res = transformFn(inputText, INDENT_VALUES[indent]);
    if (res.valid) {
      setCheckResult({ valid: true });
      setPunctuationIssues([]);
      setOutput({ type: transformFn === minify ? 'minify' : 'format', text: res.output });
    } else {
      setCheckResult(res);
      const detection = detectFullWidthPunctuation(inputText);
      setPunctuationIssues(detection.issues);
      setIssuesTruncated(detection.truncated);
      setOutput(null);
    }
    setAutoFixInfo(null);
  };

  const handleClear = () => {
    setInputText('');
    setCheckResult(null);
    setPunctuationIssues([]);
    setIssuesTruncated(false);
    setOutput(null);
    setAutoFixInfo(null);
  };

  const handleLoadSample = () => {
    const text = SAMPLES[sampleIndex.current % SAMPLES.length];
    sampleIndex.current += 1;
    setInputText(text);
    setCheckResult(null);
    setPunctuationIssues([]);
    setIssuesTruncated(false);
    setOutput(null);
    setAutoFixInfo(null);
  };

  // One-click fix: replace safe full-width punctuation, then re-validate.
  const handleAutoFix = () => {
    const { text, changedCount } = convertFullWidthToHalfWidth(inputText);
    if (changedCount === 0) return;
    setInputText(text);
    const check = runCheck(text);
    setAutoFixInfo({ changedCount, validAfterFix: check.valid });
    setOutput(null);
  };

  const handleCopy = () => {
    if (!output || !output.text) return;
    const fallback = () => {
      // execCommand fallback for non secure contexts (plain http dev).
      const ta = document.createElement('textarea');
      ta.value = output.text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output.text).catch(fallback);
    } else {
      fallback();
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wrapper-content">
      <Row className="mb-3">
        <Col lg={6}>
          <Card>
            <FalconCardHeader title={t('Input JSON Data')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <JsonInputArea
                t={t}
                value={inputText}
                onChange={handleInputChange}
                indent={indent}
                onIndentChange={setIndent}
                onValidate={handleValidate}
                onFormat={() => handleTransform(format)}
                onMinify={() => handleTransform(minify)}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <FalconCardHeader title={t('Result')} titleClass="text-lightSlateGray mb-0" />
            <CardBody>
              <ResultPanel
                t={t}
                checkResult={checkResult}
                punctuationIssues={punctuationIssues}
                truncated={issuesTruncated}
                output={output}
                autoFixInfo={autoFixInfo}
                onAutoFix={handleAutoFix}
                onCopy={handleCopy}
                copied={copied}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withTranslation()(withRedirect(JSONValidator));
