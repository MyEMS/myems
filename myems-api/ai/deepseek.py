"""
DeepSeek chat proxy for report analysis (OpenAI-compatible API).

Configuration (config.py / .env):
  DEEPSEEK_API_KEY   Required for outbound calls (empty disables).
  DEEPSEEK_API_URL   Optional.
  DEEPSEEK_MODEL     Optional.
"""
import logging
import os

import falcon
import requests
import simplejson as json
import config
from core.useractivity import access_control, api_key_control

logger = logging.getLogger(__name__)

_MAX_REPORT_CHARS = 120000
_MAX_MESSAGES = 5
_MAX_CONTENT_CHARS = 32000
_MIN_REPORT_CHARS = 40000

_GUIDE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docs')
_GUIDE_FILES = {'zh': 'system_guide.zh_CN.md'}
_MAX_GUIDE_CHARS = 40000

_guide_cache = {}


def _load_guide(language):
    lang = str(language or '').lower()
    filename = _GUIDE_FILES.get('zh') if lang.startswith('zh') else None
    if not filename:
        return ''
    path = os.path.join(_GUIDE_DIR, filename)
    try:
        mtime = os.path.getmtime(path)
    except OSError:
        logger.warning('System guide not found: %s', path)
        return ''
    cached = _guide_cache.get(path)
    if cached is None or cached[0] != mtime:
        try:
            with open(path, 'r', encoding='utf-8') as file:
                text = file.read()
        except OSError:
            logger.warning('Failed to read system guide: %s', path)
            return ''
        if len(text) > _MAX_GUIDE_CHARS:
            text = text[:_MAX_GUIDE_CHARS] + '\n...[truncated]'
        cached = (mtime, text)
        _guide_cache[path] = cached
    return cached[1]

_SYSTEM_EN = (
    'You are the intelligent assistant of MyEMS (an open-source energy management system). '
    'You handle two kinds of tasks:\n'
    '1) Report analysis: when structured report JSON is provided in the conversation and the '
    'user asks for analysis, analyze only that data. Never invent numbers or facts not present '
    'in the data. Before analyzing, first check whether the data is empty or every value is 0: '
    'if the data is empty or all values are 0, do not produce any analysis; instead remind the '
    'user that the current report has no usable data and ask them to adjust the query conditions '
    'and resubmit the data. Your reply must include: (1) analysis conclusions (2) energy-saving '
    'and O&M recommendations. If data is insufficient, state what is missing clearly.\n'
    '2) System usage guidance: when the user asks about features, menu locations or operation '
    'steps, answer only from the attached "MyEMS System User Guide"; never fabricate features, '
    'paths or button names not covered by the guide. This assistant only explains HOW TO USE '
    'the system (how to operate the web UI and what each page or area does); it does not '
    'explain backend configuration, deployment or parameter setup, and should not treat '
    'configuration as a prerequisite.\n'
    'For "how do I use / operate a page or feature" questions, output only two parts: '
    '(1) what the page or feature is for (1-3 sentences); (2) operation steps (numbered 1. 2. 3.). '
    'Do not add "prerequisites", "configuration steps", "pitfalls / FAQ", "page detail '
    'disclaimers" or any caveat section unless the user explicitly asks for them.\n'
    'Decide which kind applies from the user question; the two may be combined.\n'
    'Write in plain text only: no Markdown (no # headings, **bold**, ``` fences, - or * list '
    'markers). Use short paragraphs; you may number sections as 1. 2. 3. or plain titles on '
    'their own line.'
)

_SYSTEM_ZH = (
    '你是 MyEMS（开源能源管理系统）的智能助手，可完成两类任务：\n'
    '1）报表数据分析：当对话中提供了报表结构化数据（JSON）且用户需要分析时，'
    '你只根据该数据进行分析，不得编造数据中不存在的数值或事实。'
    '分析前请先判断数据是否为空、或所有数值是否均为 0：'
    '若数据为空或全部为 0，则不要输出任何分析结论，'
    '直接提醒用户当前报表没有可用数据，请其重新选择查询条件并重新提交数据。'
    '分析结论须包含两大部分：（一）分析结论（二）节能与运维优化建议；'
    '若使用「一、」「二、」作为小节标题，第二节须写作「二、节能与运维优化建议」。'
    '若数据不足以得出结论，请明确说明缺口。\n'
    '2）系统使用指导：当用户询问系统功能、菜单位置或操作步骤时，'
    '你只依据后面附带的《MyEMS 系统使用指南》回答；'
    '指南中未涵盖的内容，不得凭空编造功能、路径或按钮名称。'
    '本助手只讲「怎么使用系统」——即如何操作网页、各页面与各部分的功能含义；'
    '不讲解后台配置、部署或参数设置，也不要把配置当作使用前提。\n'
    '回答「如何使用/怎么操作某页面或功能」这类问题时，只输出两部分：'
    '（1）该页面/功能是做什么的（1-3 句）；（2）操作步骤（用 1. 2. 3. 编号）。'
    '不要主动追加「使用前提」「配置步骤」「注意事项/常见问题」「页面细节说明」'
    '或任何免责声明，除非用户明确要求。\n'
    '请根据用户的问题判断属于哪一类；若同时涉及两者，可结合数据与指南回答。\n'
    '请一律使用纯文本表述：不要使用 Markdown（不要用 # 标题、**加粗**、``` 代码围栏、'
    '不要用 - 或 * 做列表符号）；可用分段空行，以及「一、」「二、」或 1. 2. 3. 编号。'
)

_GUIDE_HEADER_ZH = '\n\n以下是《MyEMS 系统使用指南》，供你回答系统使用相关问题时参考：\n\n'
_GUIDE_HEADER_EN = '\n\nBelow is the "MyEMS System User Guide" for answering usage questions:\n\n'


def _truncate_json(obj, max_chars=None):
    limit = _MAX_REPORT_CHARS if max_chars is None else max_chars
    raw = json.dumps(obj, ensure_ascii=False)
    if len(raw) <= limit:
        return raw
    return raw[:limit] + '\n...[truncated]'


def _report_intro_label(body, report_context):
    """Optional human-readable report name for the user prompt (any language)."""
    if isinstance(body, dict):
        raw = body.get('report_title')
        if isinstance(raw, str) and raw.strip():
            return raw.strip()
    if isinstance(report_context, dict):
        raw = report_context.get('reportTitle') or report_context.get('report_title')
        if isinstance(raw, str) and raw.strip():
            return raw.strip()
    return None


def _build_report_data_user_message(ctx_str, language, label):
    lang = str(language or '').lower()
    if lang.startswith('zh'):
        if label:
            intro = (
                f'以下为「{label}」报表结构化数据（JSON）。请仅依据该数据分析：\n```json\n'
            )
        else:
            intro = (
                '以下为能源管理相关报表的结构化数据（JSON）。请仅依据该数据分析：\n```json\n'
            )
    else:
        if label:
            intro = (
                f'Below is structured JSON data for report "{label}". '
                'Base your analysis only on this data:\n```json\n'
            )
        else:
            intro = (
                'Below is structured JSON report data from the energy management system. '
                'Base your analysis only on this data:\n```json\n'
            )
    return intro + ctx_str + '\n```'


class DeepSeekChat:
    def __init__(self):
        pass

    @staticmethod
    def on_post(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        api_key = str(config.deepseek_api_key or '').strip()
        if not api_key:
            raise falcon.HTTPError(
                status=falcon.HTTP_503,
                title='API.SERVICE_UNAVAILABLE',
                description='API.DEEPSEEK_NOT_CONFIGURED',
            )

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.FAILED_TO_READ_REQUEST_STREAM',
            )

        try:
            body = json.loads(raw_json)
        except json.JSONDecodeError:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_JSON',
            )

        language = body.get('language') or 'zh_CN'
        report_context = body.get('report_context')
        client_messages = body.get('messages')

        if not isinstance(client_messages, list):
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_MESSAGES',
            )

        if report_context is not None and not isinstance(report_context, (dict, list)):
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_REPORT_CONTEXT',
            )

        if len(client_messages) > _MAX_MESSAGES:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.DEEPSEEK_TOO_MANY_MESSAGES',
            )

        is_zh = str(language).lower().startswith('zh')
        system_content = _SYSTEM_ZH if is_zh else _SYSTEM_EN

        guide = _load_guide(language)
        if guide:
            header = _GUIDE_HEADER_ZH if is_zh else _GUIDE_HEADER_EN
            system_content = system_content + header + guide
        messages_out = [{'role': 'system', 'content': system_content}]

        report_budget = _MAX_REPORT_CHARS
        if guide:
            report_budget = max(_MIN_REPORT_CHARS, _MAX_REPORT_CHARS - len(guide))
        ctx_str = _truncate_json(report_context, report_budget) if report_context is not None else None
        label = _report_intro_label(body, report_context) if report_context is not None else None
        if ctx_str is not None:
            messages_out.append({
                'role': 'user',
                'content': _build_report_data_user_message(ctx_str, language, label),
            })

        allowed_roles = {'user', 'assistant'}
        for m in client_messages:
            if not isinstance(m, dict):
                continue
            role = m.get('role')
            content = m.get('content')
            if role not in allowed_roles:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.INVALID_MESSAGE_ROLE',
                )
            if not isinstance(content, str) or len(str.strip(content)) == 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.INVALID_MESSAGE_CONTENT',
                )
            if len(content) > _MAX_CONTENT_CHARS:
                content = content[:_MAX_CONTENT_CHARS]
            messages_out.append({'role': role, 'content': content})

        if len(messages_out) < 2:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_MESSAGES',
            )

        url = str(config.deepseek_api_url).strip()
        model = str(config.deepseek_model or 'deepseek-v4-flash').strip() or 'deepseek-v4-flash'

        payload = {
            'model': model,
            'messages': messages_out,
            'temperature': 0.4,
        }

        try:
            r = requests.post(
                url,
                headers={
                    'Authorization': 'Bearer ' + api_key,
                    'Content-Type': 'application/json',
                },
                json=payload,
                timeout=120,
            )
        except requests.RequestException as ex:
            logger.exception('DeepSeek request failed: %s', ex)
            raise falcon.HTTPError(
                status=falcon.HTTP_502,
                title='API.BAD_GATEWAY',
                description='API.DEEPSEEK_REQUEST_FAILED',
            )

        if not r.ok:
            logger.warning('DeepSeek HTTP %s: %s', r.status_code, r.text[:500])
            raise falcon.HTTPError(
                status=falcon.HTTP_502,
                title='API.BAD_GATEWAY',
                description='API.DEEPSEEK_UPSTREAM_ERROR',
            )

        try:
            result = r.json()
        except json.JSONDecodeError:
            raise falcon.HTTPError(
                status=falcon.HTTP_502,
                title='API.BAD_GATEWAY',
                description='API.DEEPSEEK_INVALID_RESPONSE',
            )

        try:
            choice = result['choices'][0]
            msg = choice['message']
            content = msg['content']
        except (KeyError, IndexError, TypeError):
            raise falcon.HTTPError(
                status=falcon.HTTP_502,
                title='API.BAD_GATEWAY',
                description='API.DEEPSEEK_INVALID_RESPONSE',
            )

        resp.text = json.dumps({
            'message': {'role': 'assistant', 'content': content},
        })
        resp.content_type = 'application/json'
