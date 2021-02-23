import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Highlight, { defaultProps } from 'prism-react-renderer';
import lightTheme from 'prism-react-renderer/themes/duotoneLight';
import darkTheme from 'prism-react-renderer/themes/dracula';

// eslint-disable-next-line import/no-extraneous-dependencies
import prettier from 'prettier/standalone';
// eslint-disable-next-line import/no-extraneous-dependencies
import parserHtml from 'prettier/parser-html';

import AppContext from '../../context/Context';

const getFormattedCode = (code, language) =>
  prettier.format(code, {
    parser: language,
    plugins: [parserHtml]
  });

const CodeHighlight = ({ code, language }) => {
  const { isDark } = useContext(AppContext);
  return (
    <Highlight
      {...defaultProps}
      code={language === 'html' ? getFormattedCode(code, language) : code}
      language={language}
      theme={isDark ? darkTheme : lightTheme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className}`}
          style={{
            ...style,
            padding: '10px',
            borderRadius: '4px',
            border: 0
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
CodeHighlight.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string
};

CodeHighlight.defaultProps = { language: 'html' };

export default CodeHighlight;
