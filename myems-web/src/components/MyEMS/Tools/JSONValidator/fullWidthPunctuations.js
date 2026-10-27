// Full-width / Chinese punctuation mapping table used by the JSON Validator tool.
// Data only (no logic) so the table can be extended without touching jsonUtils.
// All entries are BMP characters (single UTF-16 code unit).
// autoFixable: true means the character can be safely replaced in structural
// positions (outside JSON strings); false means it is reported as a hint only.

export const PUNCTUATION_MAP = {
  // Structural separators / brackets
  '\uFF0C': { suggestion: ',', codepoint: 'U+FF0C', autoFixable: true, kind: 'separator' }, // ，
  '\u3001': { suggestion: ',', codepoint: 'U+3001', autoFixable: true, kind: 'separator' }, // 、
  '\uFF1A': { suggestion: ':', codepoint: 'U+FF1A', autoFixable: true, kind: 'separator' }, // ：
  '\uFF1B': { suggestion: ';', codepoint: 'U+FF1B', autoFixable: false, kind: 'unsupported' }, // ；(JSON has no semicolon)
  '\uFF5B': { suggestion: '{', codepoint: 'U+FF5B', autoFixable: true, kind: 'bracket' }, // ｛
  '\uFF5D': { suggestion: '}', codepoint: 'U+FF5D', autoFixable: true, kind: 'bracket' }, // ｝
  '\uFF3B': { suggestion: '[', codepoint: 'U+FF3B', autoFixable: true, kind: 'bracket' }, // ［
  '\uFF3D': { suggestion: ']', codepoint: 'U+FF3D', autoFixable: true, kind: 'bracket' }, // ］
  '\uFF08': { suggestion: '(', codepoint: 'U+FF08', autoFixable: false, kind: 'unsupported' }, // （
  '\uFF09': { suggestion: ')', codepoint: 'U+FF09', autoFixable: false, kind: 'unsupported' }, // ）
  // Full-width space
  '\u3000': { suggestion: ' ', codepoint: 'U+3000', autoFixable: true, kind: 'space' },
  // Curly / Chinese quotation marks (often misused as string delimiters)
  '\u201C': { suggestion: '"', codepoint: 'U+201C', autoFixable: true, kind: 'quote' }, // “
  '\u201D': { suggestion: '"', codepoint: 'U+201D', autoFixable: true, kind: 'quote' }, // ”
  '\u201E': { suggestion: '"', codepoint: 'U+201E', autoFixable: true, kind: 'quote' }, // „
  '\u201F': { suggestion: '"', codepoint: 'U+201F', autoFixable: true, kind: 'quote' }, // ‟
  '\u2018': { suggestion: "'", codepoint: 'U+2018', autoFixable: false, kind: 'quote' }, // ‘
  '\u2019': { suggestion: "'", codepoint: 'U+2019', autoFixable: false, kind: 'quote' } // ’
};

// Human readable category labels (i18n keys) for the detail table.
export const PUNCTUATION_KIND_LABELS = {
  separator: 'Separator',
  bracket: 'Bracket',
  space: 'Full-width Space',
  quote: 'Quotation Mark',
  unsupported: 'Unsupported Token'
};

export const isChinesePunctuation = char => Object.prototype.hasOwnProperty.call(PUNCTUATION_MAP, char);
