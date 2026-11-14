'use strict';

// Rebuild stored SVG as DOM nodes. Never assign source_code to innerHTML:
// markup kept in the library can carry onload/onerror, and that script runs
// for every admin who opens the preview.
(function (global) {
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var XLINK_NS = 'http://www.w3.org/1999/xlink';
    var XML_NS = 'http://www.w3.org/XML/1998/namespace';
    var XMLNS_NS = 'http://www.w3.org/2000/xmlns/';

    var BLOCKED_ELEMENTS = {
        animate: true,
        animatemotion: true,
        animatetransform: true,
        annotationxml: true,
        applet: true,
        audio: true,
        base: true,
        body: true,
        button: true,
        canvas: true,
        discard: true,
        embed: true,
        foreignobject: true,
        form: true,
        frame: true,
        frameset: true,
        handler: true,
        head: true,
        html: true,
        iframe: true,
        img: true,
        input: true,
        link: true,
        math: true,
        meta: true,
        noscript: true,
        object: true,
        option: true,
        script: true,
        select: true,
        set: true,
        slot: true,
        template: true,
        textarea: true,
        video: true
    };

    var BLOCKED_ATTRIBUTES = {
        archive: true,
        code: true,
        codebase: true,
        event: true,
        formaction: true,
        ping: true,
        srcdoc: true
    };

    var URL_ATTRIBUTES = {
        action: true,
        data: true,
        formaction: true,
        href: true,
        icon: true,
        ping: true,
        poster: true,
        profile: true,
        src: true,
        srcset: true
    };

    function compact(value) {
        return String(value).replace(/[\u0000-\u0020\u007f\u2028\u2029\ufeff]+/g, '').toLowerCase();
    }

    function isDangerousUrl(value) {
        var url = compact(value);
        if (url.indexOf('javascript:') === 0 || url.indexOf('vbscript:') === 0) {
            return true;
        }
        if (url.indexOf('data:') === 0) {
            if (url.indexOf('data:image/') !== 0 || url.indexOf('data:image/svg') === 0) {
                return true;
            }
        }
        return false;
    }

    function containsDangerousUrl(value) {
        var parts = String(value).split(/[\s,]+/);
        var i;
        for (i = 0; i < parts.length; i++) {
            if (parts[i] && isDangerousUrl(parts[i])) {
                return true;
            }
        }
        return isDangerousUrl(value);
    }

    function cssHasDangerousUrl(value) {
        var packed = compact(value);
        if (packed.indexOf('javascript:') !== -1 ||
                packed.indexOf('vbscript:') !== -1 ||
                packed.indexOf('expression(') !== -1 ||
                packed.indexOf('behavior:') !== -1 ||
                packed.indexOf('-moz-binding') !== -1 ||
                packed.indexOf('data:text/html') !== -1 ||
                packed.indexOf('data:image/svg') !== -1 ||
                packed.indexOf('@import') !== -1) {
            return true;
        }
        var re = /url\s*\(\s*(['"]?)([^)'"]*)\1\s*\)/gi;
        var match;
        while ((match = re.exec(String(value))) !== null) {
            if (compact(match[2]).charAt(0) !== '#') {
                return true;
            }
        }
        return false;
    }

    function attributeValueBlocked(localName, value) {
        var text = value == null ? '' : String(value);
        if (URL_ATTRIBUTES[localName] && containsDangerousUrl(text)) {
            return true;
        }
        if (localName === 'style' || /url\s*\(|javascript\s*:|vbscript\s*:/i.test(text)) {
            return cssHasDangerousUrl(text);
        }
        return false;
    }

    function isBlockedElement(node) {
        var name = (node.localName || '').toLowerCase().replace(/-/g, '');
        if (!name || BLOCKED_ELEMENTS[name]) {
            return true;
        }
        return !!(node.namespaceURI && node.namespaceURI !== SVG_NS);
    }

    function copyAttributes(sourceNode, target) {
        var attrs = sourceNode.attributes;
        var i, attr, rawLocal, local, name, value, nsVal;
        if (!attrs) {
            return;
        }
        for (i = 0; i < attrs.length; i++) {
            attr = attrs[i];
            rawLocal = attr.localName || '';
            local = rawLocal.toLowerCase();
            name = attr.name || rawLocal;
            value = attr.value;
            if (!local || local.indexOf('on') === 0 || name.toLowerCase().indexOf('on') === 0) {
                continue;
            }
            if (BLOCKED_ATTRIBUTES[local]) {
                continue;
            }
            if (attr.namespaceURI === XMLNS_NS || local === 'xmlns') {
                nsVal = compact(value);
                if (nsVal !== compact(SVG_NS) && nsVal !== compact(XLINK_NS) && nsVal !== compact(XML_NS)) {
                    continue;
                }
            }
            if (attributeValueBlocked(local, value)) {
                continue;
            }
            if (attr.namespaceURI) {
                target.setAttributeNS(attr.namespaceURI, name, value);
            } else {
                target.setAttribute(rawLocal, value);
            }
        }
    }

    function cloneSvgNode(sourceNode) {
        var name, clean, css, child, i, cloned;
        if (!sourceNode || sourceNode.nodeType !== 1 || isBlockedElement(sourceNode)) {
            return null;
        }
        name = (sourceNode.localName || '').toLowerCase();
        if (name === 'style') {
            css = sourceNode.textContent || '';
            if (cssHasDangerousUrl(css)) {
                return null;
            }
            clean = document.createElementNS(SVG_NS, 'style');
            clean.textContent = css;
            return clean;
        }
        clean = document.createElementNS(SVG_NS, sourceNode.localName);
        copyAttributes(sourceNode, clean);
        for (i = 0; i < sourceNode.childNodes.length; i++) {
            child = sourceNode.childNodes[i];
            if (child.nodeType === 1) {
                cloned = cloneSvgNode(child);
                if (cloned) {
                    clean.appendChild(cloned);
                }
            } else if (child.nodeType === 3 || child.nodeType === 4) {
                clean.appendChild(document.createTextNode(child.nodeValue));
            }
        }
        return clean;
    }

    function clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    function renderSanitizedSvgPreview(container, sourceCode) {
        var parsed, root, clean;
        if (!container) {
            return;
        }
        clearContainer(container);
        if (typeof sourceCode !== 'string' || sourceCode.trim() === '') {
            return;
        }
        try {
            parsed = new DOMParser().parseFromString(sourceCode, 'image/svg+xml');
        } catch (ignore) {
            return;
        }
        root = parsed && parsed.documentElement;
        if (!root || root.nodeType !== 1 || (root.localName || '').toLowerCase() !== 'svg') {
            return;
        }
        try {
            clean = cloneSvgNode(root);
        } catch (ignore) {
            clearContainer(container);
            return;
        }
        if (clean) {
            container.appendChild(clean);
        }
    }

    global.renderSanitizedSvgPreview = renderSanitizedSvgPreview;
}(window));
