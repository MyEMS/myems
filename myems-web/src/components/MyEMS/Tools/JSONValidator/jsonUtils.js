// Pure JSON validation / transformation helpers for the JSON Validator tool.
// No UI or i18n dependencies so this module stays unit-testable and reusable.
import { PUNCTUATION_MAP, isChinesePunctuation } from './fullWidthPunctuations';

// Reject inputs above this size to keep the UI responsive (see dev plan).
export const MAX_INPUT_SIZE = 2 * 1024 * 1024; // ~2MB

// Number of characters shown before/after the error position in the snippet.
const SNIPPET_RADIUS = 40;

// Convert a flat character offset into 1-based line/column numbers.
const lineColAt = (text, position) => {
  let line = 1;
  let column = 1;
  const limit = Math.min(position, text.length);
  for (let i = 0; i < limit; i += 1) {
    if (text[i] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
};

// Build a short context snippet around the error position.
// Returns { before, errorChar, after } so the UI can highlight the offset char.
const snippetAt = (text, position) => {
  if (position < 0 || position > text.length) return null;
  const start = Math.max(0, position - SNIPPET_RADIUS);
  const end = Math.min(text.length, position + SNIPPET_RADIUS);
  return {
    before: text.slice(start, position),
    errorChar: position < text.length ? text[position] : '',
    after: text.slice(position + 1, end)
  };
};

// Extract an error position from a native JSON.parse error message.
// Supported formats:
//   V8 (older):  "... in JSON at position 123"
//   V8 (newer):  "Unexpected token '}', ..."a"}}..." is not valid JSON" (no offset)
//   SpiderMonkey: "... line 3 column 10 ..."
//   Safari:      "JSON Parse error: ... Line: 3 Column: 10"
// Returns { line, column, position } or null when extraction fails.
const extractErrorLocation = (message, text) => {
  if (!message) return null;
  let m = message.match(/at position (\d+)/i);
  if (m) {
    const position = parseInt(m[1], 10);
    const { line, column } = lineColAt(text, position);
    return { line, column, position };
  }
  m = message.match(/line (\d+) column (\d+)/i);
  if (m) {
    const line = parseInt(m[1], 10);
    const column = parseInt(m[2], 10);
    // Derive the flat position from line/column for the snippet view.
    let position = 0;
    let currentLine = 1;
    while (currentLine < line && position < text.length) {
      if (text[position] === '\n') currentLine += 1;
      position += 1;
    }
    position += Math.max(0, column - 1);
    return { line, column, position };
  }
  return null;
};

// Validate a JSON text. Result:
// { valid: true }
// { valid: false, empty: true }
// { valid: false, oversized: true }
// { valid: false, error: { message, location, snippet } }
export const validate = text => {
  const raw = typeof text === 'string' ? text : '';
  if (raw.length > MAX_INPUT_SIZE) return { valid: false, oversized: true };
  if (!raw.trim()) return { valid: false, empty: true };
  try {
    JSON.parse(raw);
    return { valid: true };
  } catch (e) {
    const message = e && e.message ? e.message : String(e);
    const location = extractErrorLocation(message, raw);
    const snippet = location ? snippetAt(raw, location.position) : null;
    return { valid: false, error: { message, location, snippet } };
  }
};

// Pretty print with the given indent (2, 4 or '\t'). Reuses validate() error shape.
export const format = (text, indent) => {
  const check = validate(text);
  if (!check.valid) return check;
  try {
    return { valid: true, output: JSON.stringify(JSON.parse(text), null, indent) };
  } catch (e) {
    const message = e && e.message ? e.message : String(e);
    return { valid: false, error: { message, location: null, snippet: null } };
  }
};

// Minify to a single line.
export const minify = text => format(text, undefined);

// Single pass scanner over the text with a small state machine that tracks
// whether the cursor is inside a double quoted JSON string (" and escapes
// \" / \\ are recognized). Full-width punctuation INSIDE strings is legal
// Chinese content and is intentionally never reported or modified.
const collectOutsideStringPunctuation = text => {
  const issues = [];
  let inString = false;
  let escaped = false;
  let line = 1;
  let column = 1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (!inString && isChinesePunctuation(ch)) {
      const info = PUNCTUATION_MAP[ch];
      issues.push({
        index: i,
        line,
        column,
        char: ch,
        codepoint: info.codepoint,
        suggestion: info.suggestion,
        autoFixable: info.autoFixable,
        kind: info.kind
      });
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    }
    if (ch === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return issues;
};

// Detect full-width / Chinese punctuation in structural positions.
export const detectFullWidthPunctuation = text => {
  const raw = typeof text === 'string' ? text : '';
  if (raw.length > MAX_INPUT_SIZE) return { oversized: true, issues: [] };
  return { oversized: false, issues: collectOutsideStringPunctuation(raw) };
};

// Replace auto-fixable punctuation found outside strings with its half-width
// counterpart. Non-fixable characters and string contents are left untouched.
export const convertFullWidthToHalfWidth = text => {
  const raw = typeof text === 'string' ? text : '';
  const issues = collectOutsideStringPunctuation(raw);
  const fixable = issues.filter(item => item.autoFixable);
  if (fixable.length === 0) return { text: raw, changedCount: 0 };
  let out = '';
  let last = 0;
  fixable.forEach(item => {
    out += raw.slice(last, item.index) + item.suggestion;
    last = item.index + 1;
  });
  out += raw.slice(last);
  return { text: out, changedCount: fixable.length };
};
