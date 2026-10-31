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

// ---------------------------------------------------------------------------
// Syntax repair engine (unquoted key/value, missing comma, trailing content,
// unterminated string / container). Purely additive: existing validate /
// format / punctuation APIs keep their behavior. Every candidate fix is
// trial-applied and only kept when parsing strictly progresses, so a wrong
// guess can never make the document worse.
// ---------------------------------------------------------------------------

// Characters that terminate a bare (unquoted) token.
const DELIMITERS = ',:[]{} \t\r\n';

// Cap repair iterations to bound worst-case work on pathological inputs.
const MAX_SYNTAX_FIXES = 100;

// Does this character legitimately start a JSON value?
const isValueStart = c =>
  c === '"' || c === '{' || c === '[' || c === 't' || c === 'f' || c === 'n' || c === '-' || (c >= '0' && c <= '9');

// Scan the text with a minimal recursive-descent tokenizer and return the
// first structural error, or null when the whole text tokenizes cleanly.
// error = { position, type, token, closers? }
const scanSyntax = text => {
  const n = text.length;
  if (n === 0) return { position: 0, type: 'unexpected', token: '' };
  let i = 0;
  const stack = [];
  let err = null;
  const fail = (position, type, token, ctx) => {
    if (!err) {
      err = {
        position,
        type,
        token: token || '',
        closers: (ctx && ctx.closers) || stack.slice().reverse().join(''),
        stack: (ctx && ctx.stack) || stack.slice(),
        keyStart: ctx && ctx.keyStart,
        keyEnd: ctx && ctx.keyEnd
      };
    }
    return false;
  };
  const skipWs = () => {
    while (i < n && (text[i] === ' ' || text[i] === '\t' || text[i] === '\n' || text[i] === '\r')) i += 1;
  };
  const scanBareToken = () => {
    const start = i;
    while (i < n && DELIMITERS.indexOf(text[i]) < 0) i += 1;
    return text.slice(start, i);
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
    i = start; // unterminated: point back at the opening quote
    return false;
  };
  const tryWord = word => {
    if (!text.startsWith(word, i)) return false;
    const j = i + word.length;
    if (j >= n || DELIMITERS.indexOf(text[j]) >= 0) {
      i = j;
      return true;
    }
    return false;
  };
  const parseValue = () => {
    skipWs();
    if (i >= n) return fail(n, stack.length ? 'unterminated-container' : 'unexpected', '');
    const c = text[i];
    if (c === '"') {
      if (!parseString()) return fail(i, 'unterminated-string', '', { closers: stack.slice().reverse().join(''), stack });
      return true;
    }
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === 't' && tryWord('true')) return true;
    if (c === 'f' && tryWord('false')) return true;
    if (c === 'n' && tryWord('null')) return true;
    const start = i;
    const token = scanBareToken();
    if (!token) return fail(start, 'unexpected', c);
    if (/^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(token)) return true;
    return fail(start, 'unquoted-value', token);
  };
  const parseObject = () => {
    i += 1; // {
    stack.push('}');
    skipWs();
    if (i >= n) return fail(n, 'unterminated-container', '');
    if (text[i] === '}') {
      stack.pop();
      i += 1;
      return true;
    }
    for (;;) {
      skipWs();
      if (i >= n) return fail(n, 'unterminated-container', '');
      let keyStart = -1;
      let keyEnd = -1;
      if (text[i] === '"') {
        keyStart = i;
        if (!parseString()) return fail(i, 'unterminated-string', '', { closers: stack.slice().reverse().join(''), stack });
        keyEnd = i;
      } else {
        // Bare token followed by ':' is an unquoted key; anything else is not
        // safely fixable (e.g. `{ invalid }`).
        const keyStart = i;
        const token = scanBareToken();
        const afterToken = i;
        skipWs();
        if (token && text[i] === ':') {
          i = afterToken;
          return fail(keyStart, 'unquoted-key', token);
        }
        i = keyStart;
        return fail(keyStart, 'unexpected', token);
      }
      skipWs();
      if (i >= n) return fail(n, 'unterminated-container', '');
      if (text[i] !== ':') {
        // A value starting right after the key means the separating colon is
        // missing, e.g. {"name" "MyEMS"}. Other tokens stay unfixable.
        if (isValueStart(text[i])) return fail(i, 'missing-colon', text[i]);
        // The closing quote was typed too late so the colon ended up INSIDE
        // the key, e.g. {"space: "BuildingA"} (meant: "space": "BuildingA").
        // Only handle it right after a quoted key whose text ends with ':'.
        if (keyStart >= 0 && text[i] !== ',' && text[i] !== '}' && text[i] !== ']') {
          const keyContent = text.slice(keyStart + 1, keyEnd - 1).replace(/\s+$/, '');
          if (keyContent.endsWith(':')) {
            return fail(i, 'colon-in-quotes', text.slice(i, Math.min(n, i + 20)), { keyStart, keyEnd });
          }
        }
        return fail(i, 'unexpected', text[i]);
      }
      i += 1;
      if (!parseValue()) return false;
      skipWs();
      if (i >= n) return fail(n, 'unterminated-container', '');
      if (text[i] === ',') {
        i += 1;
        continue;
      }
      if (text[i] === '}') {
        stack.pop();
        i += 1;
        return true;
      }
      if (text[i] === '"') return fail(i, 'missing-comma', '"'); // next key starts
      // `]` cannot close an object: the innermost open container is wrong.
      if (text[i] === ']') return fail(i, 'mismatched-closer', text[i]);
      // `}` here: the next member is simply missing its separating comma
      // (e.g. [1, 2} inside an object) or the text is broken beyond safe
      // repair; inserting a comma stays neutral — the next scan pass then
      // sees `}` after a value and reports the real mismatch/mismatched-closer.
      return fail(i, 'missing-comma', text[i]);
    }
  };
  const parseArray = () => {
    i += 1; // [
    stack.push(']');
    skipWs();
    if (i >= n) return fail(n, 'unterminated-container', '');
    if (text[i] === ']') {
      stack.pop();
      i += 1;
      return true;
    }
    for (;;) {
      skipWs();
      if (text[i] === ']' && stack[stack.length - 1] === ']') {
        // Empty container or trailing comma before the closer: not safely
        // fixable (JSON forbids trailing commas), report and let the gate stop.
        return fail(i, 'unexpected', text[i]);
      }
      if (!parseValue()) return false;
      skipWs();
      if (i >= n) return fail(n, 'unterminated-container', '');
      if (text[i] === ',') {
        i += 1;
        continue;
      }
      if (text[i] === ']') {
        stack.pop();
        i += 1;
        return true;
      }
      // Another value begins right here: missing comma (covers [1 2] too).
      // A closer of the wrong type: close the inner container first instead.
      // Note: `}` after a value inside an array reaches here and is reported
      // as missing-comma; the inserted comma lets the next pass convert it
      // into a precise mismatched-closer repair (`]` before the `}`).
      if (text[i] === '}' || text[i] === ']') {
        if (stack[stack.length - 1] !== text[i]) return fail(i, 'mismatched-closer', text[i]);
      }
      return fail(i, 'missing-comma', text[i]);
    }
  };
  const finalize = e => {
    if (e && e.type === 'unterminated-container') e.closers = stack.slice().reverse().join('');
    return e;
  };
  try {
    if (!parseValue()) return finalize(err);
    skipWs();
    if (i < n) return { position: i, type: 'trailing', token: text.slice(i, Math.min(n, i + 40)) };
    if (stack.length) return finalize({ position: n, type: 'unterminated-container', token: '' });
    return null;
  } catch (e) {
    // e.g. stack overflow on pathologically deep nesting
    return finalize(err);
  }
};

// Wrap a bare token in quotes; reuse a dangling trailing quote as the closer
// when present (covers the common "missing opening quote" typo). If the raw
// token swallowed the following } or ] (structural, not part of the value),
// keep that closer outside the inserted quotes.
const quoteBareToken = token => {
  let core = token;
  let tail = '';
  if (core.length > 1 && (core.endsWith('}') || core.endsWith(']'))) {
    tail = core[core.length - 1];
    core = core.slice(0, -1);
  }
  if (core.length > 1 && core.endsWith('"')) {
    // The dangling trailing quote is reused as the closing quote.
    if (tail) return `"${core.slice(0, -1)}${tail}`;
    return `"${core}`;
  }
  return `"${core}"${tail}`;
};

// Index of the last non-whitespace character, or -1 for a blank text.
const lastNonWhitespaceIndex = text => {
  for (let i = text.length - 1; i >= 0; i -= 1) {
    const ch = text[i];
    if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') return i;
  }
  return -1;
};

// Turn a scan error into a concrete edit, or null when the type is not
// safely fixable.
const buildSyntaxFix = (text, err) => {
  switch (err.type) {
    case 'unquoted-key':
    case 'unquoted-value': {
      if (!err.token) return null;
      const quoted = quoteBareToken(err.token);
      const end = Math.min(err.position + err.token.length, text.length);
      return { start: err.position, end, replacement: quoted, type: err.type, detail: `${err.token} -> ${quoted}` };
    }
    case 'missing-comma':
      return { start: err.position, end: err.position, replacement: ',', type: err.type, detail: '+ ","' };
    case 'missing-colon':
      return { start: err.position, end: err.position, replacement: ':', type: err.type, detail: '+ ":"' };
    case 'colon-in-quotes': {
      // Move the trailing colon out of the key and open the value quote:
      // "space: "  ->  "space": "
      const { keyStart, keyEnd } = err;
      if (typeof keyStart !== 'number' || typeof keyEnd !== 'number' || keyEnd <= keyStart + 2) return null;
      const keyContent = text.slice(keyStart + 1, keyEnd - 1).replace(/\s+$/, '');
      if (!keyContent.endsWith(':')) return null;
      const core = keyContent.slice(0, -1).replace(/\s+$/, '');
      if (!core) return null;
      const quoted = `"${core}"`;
      const replacement = `${quoted}: "`;
      return { start: keyStart, end: keyEnd, replacement, type: err.type, detail: `${text.slice(keyStart, keyEnd)} -> ${replacement}` };
    }
    case 'mismatched-closer': {
      // The stack holds the EXPECTED closers (one per open container).
      // Insert the innermost expected closer right before the wrong one,
      // e.g. [1 2}  ->  [1 2]}
      const closers = err.stack || [];
      const needed = closers[closers.length - 1] || '';
      if (needed !== ']' && needed !== '}') return null;
      return { start: err.position, end: err.position, replacement: needed, type: err.type, detail: '+ "' + needed + '"' };
    }
    case 'trailing':
      return { start: err.position, end: text.length, replacement: '', type: err.type, detail: `- "${err.token}"` };
    case 'unterminated-string': {
      // Close the string plus any containers still open around it, e.g.
      // {"name":"MyEMS}  ->  append "} in one edit.
      const closers = err.closers || '';
      const add = '"' + closers;
      return { start: text.length, end: text.length, replacement: add, type: err.type, detail: '+ "' + add + '"' };
    }
    case 'unterminated-container': {
      // `{"a": 1,` cannot be repaired by appending closers: that just trades
      // the error for a trailing comma. Drop the dangling comma first, the
      // closers follow on the next pass.
      const last = lastNonWhitespaceIndex(text);
      if (err.position >= text.length && last >= 0 && text[last] === ',') {
        return { start: last, end: last + 1, replacement: '', type: err.type, detail: '- ","' };
      }
      const closers = err.closers || '';
      if (!closers) return null;
      return { start: text.length, end: text.length, replacement: closers, type: err.type, detail: `+ "${closers}"` };
    }
    default:
      return null;
  }
};

// Candidate texts for one scan error. For an unterminated string whose
// content swallowed a trailing closer (e.g. {"a":"x}) two candidates are
// tried: recover the closer, or plain append a quote.
const candidatesFor = (text, err, fix) => {
  if (err.type === 'unterminated-string') {
    const last = text[text.length - 1];
    const stack = err.stack || [];
    if ((last === '}' || last === ']') && stack.indexOf(last) >= 0) {
      const base = text.slice(0, text.length - 1) + '"';
      const tail = stack[stack.length - 1] === last ? last : '';
      return [base + tail, base + last];
    }
  }
  return [text.slice(0, fix.start) + fix.replacement + text.slice(fix.end)];
};

// Text length up to which accepted candidates are remembered for cycle
// detection; keeps the guard cheap for the large inputs allowed above.
const MAX_TRACKED_TEXT = 64 * 1024;

const parsesStrict = text => {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
};

// Progress gate: does the candidate's first error actually sit after the
// repaired region? The edit shifts positions, so the old error position is
// mapped into the candidate text before comparing. A length-changing edit is
// also accepted when the scanner no longer stops before the edit point, which
// covers deletions such as dropping `{"a": 1,`'s dangling comma.
const movesForward = (err, fix, nextErr) => {
  const delta = fix.replacement.length - (fix.end - fix.start);
  const mapped = err.position > fix.end ? err.position + delta : fix.start + fix.replacement.length;
  if (nextErr.position > mapped) return true;
  return delta !== 0 && nextErr.position >= fix.start;
};

// Work out the next repair step: the scan error, its concrete edit and the
// candidate text that survives the progress gate. Returns null when nothing
// can be safely applied. detectSyntaxIssue() and repairSyntax() both go
// through here, so the UI never offers a fix that the engine refuses to apply.
const planSyntaxFix = (text, seen) => {
  const err = scanSyntax(text);
  if (!err) return null;
  const fix = buildSyntaxFix(text, err);
  if (!fix) return null;
  if (fix.start === fix.end && !fix.replacement) return null;
  const candidates = candidatesFor(text, err, fix);
  for (let c = 0; c < candidates.length; c += 1) {
    const cand = candidates[c];
    if (cand === text) continue;
    if (seen && seen.has(cand)) continue;
    if (parsesStrict(cand)) return { err, fix, candidate: cand };
    const nextErr = scanSyntax(cand);
    if (nextErr && movesForward(err, fix, nextErr)) return { err, fix, candidate: cand };
  }
  return null;
};

// Iteratively apply safe syntax repairs until the text parses, no further
// progress is possible, or the iteration cap is hit.
// Returns { text, fixes: [{ line, column, type, detail }], valid }.
export const repairSyntax = text => {
  const raw = typeof text === 'string' ? text : '';
  if (raw.length > MAX_INPUT_SIZE) return { text: raw, fixes: [], oversized: true, valid: false };
  let current = raw;
  const fixes = [];
  const seen = current.length <= MAX_TRACKED_TEXT ? new Set([current]) : null;
  for (let guard = 0; guard < MAX_SYNTAX_FIXES; guard += 1) {
    if (parsesStrict(current)) return { text: current, fixes, valid: true };
    const plan = planSyntaxFix(current, seen);
    if (!plan) return { text: current, fixes, valid: false };
    const { fix, candidate } = plan;
    const { line, column } = lineColAt(current, Math.min(fix.start, current.length));
    fixes.push({ line, column, type: fix.type, detail: fix.detail });
    current = candidate;
    if (seen && current.length <= MAX_TRACKED_TEXT) seen.add(current);
  }
  return { text: current, fixes, valid: parsesStrict(current) };
};

// Detect the first repairable structural error for the UI (so the one-click
// fix button can appear even when there is no full-width punctuation issue).
// Shares planSyntaxFix() with repairSyntax(), so an issue is only reported when
// the one-click fix really has a candidate to apply.
export const detectSyntaxIssue = text => {
  const raw = typeof text === 'string' ? text : '';
  if (raw.length > MAX_INPUT_SIZE) return { oversized: true, issue: null };
  if (!raw.trim()) return { oversized: false, issue: null };
  if (parsesStrict(raw)) return { oversized: false, issue: null };
  const plan = planSyntaxFix(raw);
  if (!plan) return { oversized: false, issue: null };
  const { err } = plan;
  const { line, column } = lineColAt(raw, Math.min(err.position, raw.length));
  return { oversized: false, issue: { position: err.position, line, column, type: err.type, token: err.token, closers: err.closers || '' } };
};
