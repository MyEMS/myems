import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ color: [] }, { background: [] }, { align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }, { font: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: { matchVisual: false }
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'color',
  'background',
  'code-block',
  'align'
];

const getContent = value => (value === '<p><br></p>' ? '' : value);
const QuillEditor = ({ value, onChange, ...rest }) => (
  <ReactQuill value={getContent(value)} onChange={value => onChange(value)} {...rest} />
);

QuillEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

QuillEditor.defaultProps = { modules, formats };

export default QuillEditor;
