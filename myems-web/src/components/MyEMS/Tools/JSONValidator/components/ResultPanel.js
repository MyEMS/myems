import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Button, Table } from 'reactstrap';
import { PUNCTUATION_KIND_LABELS } from '../fullWidthPunctuations';

// Renders the validation verdict, parse error details, the full-width
// punctuation issue table (with one-click fix) and the format/minify output.
const ResultPanel = ({ t, checkResult, punctuationIssues, output, autoFixInfo, onAutoFix, onCopy, copied }) => {
  if (!checkResult) {
    return <p className="text-muted fs--1 mb-0">{t('Click Validate to check the JSON data.')}</p>;
  }

  const renderVerdict = () => {
    if (checkResult.valid) {
      return <Alert color="success" className="mb-3">{t('Valid JSON')}</Alert>;
    }
    if (checkResult.oversized) {
      return <Alert color="warning" className="mb-3">{t('Input exceeds the maximum allowed size (2MB)')}</Alert>;
    }
    if (checkResult.empty) {
      return <Alert color="warning" className="mb-3">{t('Please input JSON data')}</Alert>;
    }
    return <Alert color="danger" className="mb-3">{t('Invalid JSON')}</Alert>;
  };

  const renderErrorDetails = () => {
    const { error } = checkResult;
    if (!error) return null;
    return (
      <div className="mb-3">
        <div className="text-800 fs--1 text-uppercase mb-2">{t('Error Details')}</div>
        {error.location && (
          <div className="fs--1 mb-1">
            <Badge color="light" className="mr-2">
              {t('Line')} {error.location.line}
            </Badge>
            <Badge color="light" className="mr-2">
              {t('Column')} {error.location.column}
            </Badge>
            <Badge color="light">{t('Position')} {error.location.position}</Badge>
          </div>
        )}
        {error.snippet && (
          <pre className="bg-light border rounded p-2 mb-1 fs--1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.snippet.before}
            <mark>{error.snippet.errorChar || t('(end of input)')}</mark>
            {error.snippet.after}
          </pre>
        )}
        <div className="text-muted fs--1">
          {t('Parser Message')}: <code>{error.message}</code>
        </div>
      </div>
    );
  };

  const renderPunctuationTable = () => {
    if (!punctuationIssues || punctuationIssues.length === 0) return null;
    const fixableCount = punctuationIssues.filter(item => item.autoFixable).length;
    return (
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="text-800 fs--1 text-uppercase">{t('Full-width Punctuation Detection')}</div>
          {fixableCount > 0 && (
            <Button color="primary" size="sm" onClick={onAutoFix}>
              {t('Fix and Re-validate')} ({fixableCount})
            </Button>
          )}
        </div>
        <Table size="sm" responsive className="mb-1">
          <thead>
            <tr>
              <th>{t('Line')}</th>
              <th>{t('Column')}</th>
              <th>{t('Char')}</th>
              <th>{t('Codepoint')}</th>
              <th>{t('Type')}</th>
              <th>{t('Suggestion')}</th>
              <th>{t('Status')}</th>
            </tr>
          </thead>
          <tbody>
            {punctuationIssues.map(item => (
              <tr key={`${item.index}-${item.char}`}>
                <td>{item.line}</td>
                <td>{item.column}</td>
                <td>
                  <code>{item.char}</code>
                </td>
                <td>{item.codepoint}</td>
                <td>{t(PUNCTUATION_KIND_LABELS[item.kind])}</td>
                <td>
                  <code>{item.suggestion}</code>
                </td>
                <td>
                  <Badge color={item.autoFixable ? 'warning' : 'light'}>
                    {item.autoFixable ? t('Fixable') : t('Suggestion Only')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="text-muted fs--1">{t('Punctuation inside strings is treated as valid text and is not reported.')}</div>
      </div>
    );
  };

  const renderOutput = () => {
    if (!output || !output.text) return null;
    return (
      <div>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="text-800 fs--1 text-uppercase">{output.type === 'minify' ? t('Minified Result') : t('Formatted Result')}</div>
          <Button color="soft-primary" size="sm" onClick={onCopy}>
            {copied ? t('Copied') : t('Copy Result')}
          </Button>
        </div>
        <pre
          className="bg-light border rounded p-2 mb-0 fs--1"
          style={{ whiteSpace: output.type === 'minify' ? 'pre-wrap' : 'pre', wordBreak: 'break-all', maxHeight: '420px', overflowY: 'auto' }}
        >
          {output.text}
        </pre>
      </div>
    );
  };

  return (
    <div>
      {renderVerdict()}
      {autoFixInfo && (
        <Alert color="info" className="mb-3">
          {t('Converted characters')}: {autoFixInfo.changedCount} - {autoFixInfo.validAfterFix ? t('Re-validated: Valid JSON') : t('Re-validated: still invalid, see details below')}
        </Alert>
      )}
      {renderErrorDetails()}
      {renderPunctuationTable()}
      {renderOutput()}
    </div>
  );
};

ResultPanel.propTypes = {
  t: PropTypes.func.isRequired,
  checkResult: PropTypes.object,
  punctuationIssues: PropTypes.array,
  output: PropTypes.object,
  autoFixInfo: PropTypes.object,
  onAutoFix: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  copied: PropTypes.bool.isRequired
};

export default ResultPanel;
