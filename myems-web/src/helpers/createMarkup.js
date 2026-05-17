import DOMPurify from 'dompurify';

// Strip every legacy DOM event-handler attribute. DOMPurify already removes
// `on*` handlers by default, but listing them keeps the intent explicit and
// guards against bypasses such as CVE-2021-3163 (Quill < 1.3.7,
// `<img onloadstart=...>` injected via the rich-text editor).
const FORBID_ATTR = [
  'onabort', 'onafterprint', 'onanimationend', 'onanimationiteration', 'onanimationstart',
  'onauxclick', 'onbeforeinput', 'onbeforeprint', 'onbeforeunload', 'onblur',
  'oncancel', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick',
  'onclose', 'oncontextmenu', 'oncopy', 'oncuechange', 'oncut',
  'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragexit',
  'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange',
  'onemptied', 'onended', 'onerror', 'onfocus', 'onfocusin',
  'onfocusout', 'onformdata', 'ongotpointercapture', 'onhashchange', 'oninput',
  'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload',
  'onloadeddata', 'onloadedmetadata', 'onloadend', 'onloadstart', 'onlostpointercapture',
  'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove',
  'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onoffline',
  'ononline', 'onpagehide', 'onpageshow', 'onpaste', 'onpause',
  'onplay', 'onplaying', 'onpointercancel', 'onpointerdown', 'onpointerenter',
  'onpointerleave', 'onpointermove', 'onpointerout', 'onpointerover', 'onpointerrawupdate',
  'onpointerup', 'onpopstate', 'onprogress', 'onratechange', 'onreset',
  'onresize', 'onscroll', 'onsearch', 'onseeked', 'onseeking',
  'onselect', 'onselectionchange', 'onselectstart', 'onshow', 'onstalled',
  'onstorage', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle',
  'ontouchcancel', 'ontouchend', 'ontouchmove', 'ontouchstart', 'ontransitioncancel',
  'ontransitionend', 'ontransitionrun', 'ontransitionstart', 'onunload', 'onvolumechange',
  'onwaiting', 'onwheel', 'formaction', 'srcdoc', 'xlink:href'
];

const sanitize = html => {
  if (html == null) return '';
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'meta', 'base'],
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true
  });
};

// SVG diagrams (microgrid, PV, ESS, distribution) come from the API as
// inline <svg> markup. Use the SVG profile so legitimate SVG/xlink attributes
// survive, while still stripping <script> and on* handlers.
const sanitizeSVG = html => {
  if (html == null) return '';
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR
  });
};

const createMarkup = html => ({ __html: sanitize(html) });

export { sanitize, sanitizeSVG };
export default createMarkup;
