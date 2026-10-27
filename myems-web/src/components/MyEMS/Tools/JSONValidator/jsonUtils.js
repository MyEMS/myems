// Pure JSON validation / transformation helpers for the JSON Validator tool.
// No UI or i18n dependencies so this module stays unit-testable and reusable.
import { PUNCTUATION_MAP, isChinesePunctuation } from './fullWidthPunctuations';

// Reject inputs above this size to keep the UI responsive (see dev plan).
export const MAX_INPUT_SIZE = 2 * 1024 * 1024; // ~2MB

// Cap the issue list handed to the UI: a ~2MB input full of full-width
// punctuation could otherwise produce tens of thousands of table rows and
// freeze the browser. The one-click fix below still scans the FULL text.
export const MAX_ISSUES = 500;

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

// Deterministic fallback scanner. Newer V8 drops the offset for
// "Unexpected token 'X', ..." messages, so locate the first syntax error
// with a minimal recursive-descent JSON tokenizer instead.
// Returns a 0-based position, or null when the text tokenizes cleanly or the
// scanner overflows on pathologically deep input (never crash the UI).
const findSyntaxErrorPosition = text => {
  let i = 0;
  const n = text.length;
  const skipWs = () => {
    while (i < n && (text[i] === ' ' || text[i] === '\t' || text[i] === '\n' || text[i] === '\r')) i += 1;
  };
  const parseString = () => {
    const start = i;
    i += 1; // opening quote
    while (i < n) {
      if (text[i] === '\\') {
        i += 2;
        continue;
      }
      if (text[i] === '"') {
        i += 1;
        return true;
      }
      i += 1;
    }
    i = start; // unterminated string: point at the opening quote
    return false;
  };
  const parseNumber = () => {
    const start = i;
    while (i < n && '0123456789eE+-.'.indexOf(text[i]) >= 0) i += 1;
    return i > start;
  };
  const parseWord = word => {
    if (text.startsWith(word, i)) {
      i += word.length;
      return true;
    }
    return false;
  };
  const parseValue = () => {
    skipWs();
    if (i >= n) return false;
    const c = text[i];
    if (c === '"') return parseString();
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === '-' || (c >= '0' && c <= '9')) return parseNumber();
    if (c === 't') return parseWord('true');
    if (c === 'f') return parseWord('false');
    if (c === 'n') return parseWord('null');
    return false; // unexpected token at i
  };
  const parseObject = () => {
    i += 1; // {
    skipWs();
    if (text[i] === '}') {
      i += 1;
      return true;
    }
    while (i < n) {
      skipWs();
      if (text[i] !== '"') return false; // keys must be double quoted
      if (!parseString()) return false;
      skipWs();
      if (text[i] !== ':') return false;
      i += 1;
      if (!parseValue()) return false;
      skipWs();
      if (text[i] === ',') {
        i += 1;
        continue;
      }
      if (text[i] === '}') {
        i += 1;
        return true;
      }
      return false;
    }
    return false; // unterminated object
  };
  const parseArray = () => {
    i += 1; // [
    skipWs();
    if (text[i] === ']') {
      i += 1;
      return true;
    }
    while (i < n) {
      if (!parseValue()) return false;
      skipWs();
      if (text[i] === ',') {
        i += 1;
        continue;
      }
      if (text[i] === ']') {
        i += 1;
        return true;
      }
      return false;
    }
    return false; // unterminated array
  };
  try {
    if (!parseValue()) return Math.min(i, n);
    skipWs();
    if (i < n) return i; // trailing non-whitespace content
    return null;
  } catch (e) {
    return null;
  }
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
    // Prefer the engine-reported location; when the message format exposes no
    // offset (newer V8 "Unexpected token" errors), fall back to our scanner.
    let location = extractErrorLocation(message, raw);
    if (!location) {
      const position = findSyntaxErrorPosition(raw);
      if (position !== null) {
        const { line, column } = lineColAt(raw, position);
        location = { line, column, position };
      }
    }
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
// Returns at most MAX_ISSUES items; `truncated` tells the UI to show a notice.
export const detectFullWidthPunctuation = text => {
  const raw = typeof text === 'string' ? text : '';
  if (raw.length > MAX_INPUT_SIZE) return { oversized: true, truncated: false, issues: [] };
  const all = collectOutsideStringPunctuation(raw);
  return { oversized: false, truncated: all.length > MAX_ISSUES, issues: all.slice(0, MAX_ISSUES) };
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
