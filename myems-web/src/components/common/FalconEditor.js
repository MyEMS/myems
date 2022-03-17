import React from 'react';
import PropTypes from 'prop-types';
import * as reactStrap from 'reactstrap';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/dracula';
import 'echarts/map/js/world';

const FalconEditor = ({ code, scope, language, hidePreview }) => {
  return (
    <LiveProvider
      {...defaultProps}
      theme={theme}
      language={language}
      scope={{ ...reactStrap, ...React, PropTypes, ...scope }}
      code={code}
      disabled={hidePreview}
    >
      {!hidePreview && <LivePreview className="mb-3" />}
      <LiveEditor dir="ltr" className="rounded" />
      <LiveError />
    </LiveProvider>
  );
};

FalconEditor.propTypes = {
  code: PropTypes.string.isRequired,
  scope: PropTypes.object,
  language: PropTypes.string,
  hidePreview: PropTypes.bool
};

FalconEditor.defaultProps = {
  language: 'markup',
  hidePreview: false
};

export default FalconEditor;
