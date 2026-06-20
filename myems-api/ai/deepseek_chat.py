"""
DeepSeek chat proxy for report analysis (OpenAI-compatible API).

Configuration (config.py / .env):
  DEEPSEEK_API_KEY   Required for outbound calls (empty disables).
  DEEPSEEK_API_URL   Optional.
  DEEPSEEK_MODEL     Optional.
"""
import logging

import falcon
import requests
import simplejson as json
import config
from core.useractivity import access_control

logger = logging.getLogger(__name__)

_DEFAULT_URL = 'https://api.deepseek.com/v1/chat/completions'
_MAX_REPORT_CHARS = 120000
_MAX_MESSAGES = 5
_MAX_CONTENT_CHARS = 32000

_SYSTEM_EN = (
    'You are an expert energy and carbon management advisor. '
    'Base your answers only on the structured report JSON and the conversation. '
    'Do not invent numbers or facts not present in the data. '
    'Your reply must include: (1) analysis conclusions (2) energy-saving '
    'and O&M recommendations. If data is insufficient, state what is missing clearly. '
    'Write in plain text only: no Markdown (no # headings, **bold**, ``` fences, '
    '- or * list markers). Use short paragraphs; you may number sections as 1. 2. 3. '
    'or plain titles on their own line.'
)

_SYSTEM_ZH = (
    '你是资深能源与碳管理顾问。你只根据用户提供的报表结构化数据与对话内容进行分析，'
    '不得编造数据中不存在的数值或事实。'
    '输出必须包含两大部分：（一）分析结论（二）节能与运维优化建议。'
    '若使用「一、」「二、」作为小节标题，第二节须写作「二、节能与运维优化建议」。'
    '若数据不足以得出结论，请明确说明缺口。'
    '请一律使用纯文本表述：不要使用 Markdown（不要用 # 标题、**加粗**、``` 代码围栏、'
    '不要用 - 或 * 做列表符号）；可用分段空行，以及「一、」「二、」或 1. 2. 3. 编号。'
)


def _truncate_json(obj):
    raw = json.dumps(obj, ensure_ascii=False)
    if len(raw) <= _MAX_REPORT_CHARS:
        return raw
    return raw[:_MAX_REPORT_CHARS] + '\n...[truncated]'


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
        access_control(req)

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

        if report_context is None:
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

        system_content = _SYSTEM_ZH if str(language).lower().startswith('zh') else _SYSTEM_EN
        messages_out = [{'role': 'system', 'content': system_content}]

        ctx_str = _truncate_json(report_context)
        label = _report_intro_label(body, report_context)
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

        if len(messages_out) < 3:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_MESSAGES',
            )

        url = str(config.deepseek_api_url or _DEFAULT_URL).strip() or _DEFAULT_URL
        model = str(config.deepseek_model or 'deepseek-chat').strip() or 'deepseek-chat'

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
