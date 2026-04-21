/* ============================================================
   Systems Thinking with AI — Tool Interaction Mechanics
   toolkit.js
   ============================================================
   Shared module for all interactive tools. Handles:
   - Prompt assembly (Tier 2: Prompt Generation)
   - Copy-to-clipboard with visual confirmation
   - BYOK API key management (in-memory only, never persisted)
   - BYOK API calls (Tier 3: direct browser → AI provider)
   - Markdown output rendering via Marked.js
   - Mode switching between Tier 2 and Tier 3
   ============================================================ */

const Toolkit = (() => {

  /* ----------------------------------------------------------
     API Key Management (Tier 3 — BYOK)
     Key held in module-scoped variable only.
     Never written to localStorage, sessionStorage, or cookies.
     Cleared when page closes (variable goes out of scope).
  ---------------------------------------------------------- */
  let _apiKey = null;
  let _apiProvider = null; // 'anthropic' | 'openai'

  /* The input field that collects this key must use type="password" to prevent
     shoulder-surfing and autocomplete leaks. Clear via clearApiKey() on session end. */
  function setApiKey(key, provider = 'anthropic') {
    _apiKey = key;
    _apiProvider = provider;
  }

  function clearApiKey() {
    _apiKey = null;
    _apiProvider = null;
  }

  function hasApiKey() {
    return !!_apiKey;
  }

  /* ----------------------------------------------------------
     Prompt Assembly (Tier 2)
     Takes a template string and a data object.
     Replaces {{key}} placeholders with values from data.
  ---------------------------------------------------------- */
  function assemblePrompt(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
  }

  /* ----------------------------------------------------------
     Copy to Clipboard
     Copies text and briefly shows a confirmation message
     on the element with the given buttonId.
  ---------------------------------------------------------- */
  function copyToClipboard(text, buttonEl) {
    navigator.clipboard.writeText(text).then(() => {
      if (!buttonEl) return;
      const original = buttonEl.textContent;
      buttonEl.textContent = 'Copied!';
      buttonEl.disabled = true;
      setTimeout(() => {
        buttonEl.textContent = original;
        buttonEl.disabled = false;
      }, 2000);
    });
  }

  /* ----------------------------------------------------------
     Markdown Rendering
     Renders a markdown string into a target DOM element.
     Requires Marked.js to be loaded on the page.
  ---------------------------------------------------------- */
  function renderMarkdown(markdown, targetEl) {
    if (typeof marked === 'undefined') {
      console.error('toolkit.js: marked.min.js is not loaded.');
      return;
    }
    const html = marked.parse(markdown);
    targetEl.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
  }

  /* ----------------------------------------------------------
     BYOK API Call (Tier 3)
     Calls Anthropic or OpenAI directly from the browser.
     Streams the response and renders it as markdown.

     options: {
       prompt: string,
       systemPrompt: string,
       model: string,          // optional, provider default used if omitted
       onChunk: fn(text),      // called with each streamed chunk
       onComplete: fn(fullText),
       onError: fn(error),
     }
  ---------------------------------------------------------- */
  async function callAI(options) {
    if (!_apiKey) {
      options.onError?.('No API key set. Call Toolkit.setApiKey() first.');
      return;
    }

    if (_apiProvider === 'anthropic') {
      await _callAnthropic(options);
    } else if (_apiProvider === 'openai') {
      await _callOpenAI(options);
    } else {
      options.onError?.(`Unknown provider: ${_apiProvider}`);
    }
  }

  async function _callAnthropic({ prompt, systemPrompt, model, onChunk, onComplete, onError }) {
    const body = {
      model: model || 'claude-sonnet-4-6',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    };
    if (systemPrompt) body.system = systemPrompt;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': _apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        onError?.(_friendlyApiError(res.status));
        return;
      }

      let fullText = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const json = line.slice(6);
          if (json === '[DONE]') continue;
          try {
            const evt = JSON.parse(json);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              fullText += evt.delta.text;
              onChunk?.(evt.delta.text);
            }
          } catch {}
        }
      }
      onComplete?.(fullText);
    } catch (e) {
      onError?.('Request failed. Check your connection and try again.');
    }
  }

  async function _callOpenAI({ prompt, systemPrompt, model, onChunk, onComplete, onError }) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${_apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages,
          stream: true,
        }),
      });

      if (!res.ok) {
        onError?.(_friendlyApiError(res.status));
        return;
      }

      let fullText = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const json = line.slice(6);
          if (json === '[DONE]') continue;
          try {
            const evt = JSON.parse(json);
            const text = evt.choices?.[0]?.delta?.content;
            if (text) {
              fullText += text;
              onChunk?.(text);
            }
          } catch {}
        }
      }
      onComplete?.(fullText);
    } catch (e) {
      onError?.('Request failed. Check your connection and try again.');
    }
  }

  function _friendlyApiError(status) {
    if (status === 401) return 'Invalid API key. Check your key and try again.';
    if (status === 429) return 'Rate limit reached. Wait a moment and try again.';
    if (status === 500 || status === 503) return 'The AI provider is temporarily unavailable. Try again shortly.';
    return `Request failed (HTTP ${status}). Check your API key and try again.`;
  }

  /* ----------------------------------------------------------
     Public API
  ---------------------------------------------------------- */
  return {
    setApiKey,
    clearApiKey,
    hasApiKey,
    assemblePrompt,
    copyToClipboard,
    renderMarkdown,
    callAI,
  };
})();
