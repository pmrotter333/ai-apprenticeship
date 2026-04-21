/* ============================================================
   Hora — Stage 4: Build Plan Generator (stage4.js)
   Reviews confirmed answers from Stages 1-2, loads Stage 3
   Architecture Document as primary context, generates a
   phased Build Plan via Tier 2 handoff (copy-only).
   ============================================================ */

/* ---- Review items pulled from prior stage answers ---- */

const STAGE4_REVIEW_ITEMS = [
  {
    key:        'goal',
    label:      'Your goal',
    stageBadge: 'Stage 1',
    question:   'What would solving this make possible for you?',
  },
  {
    key:        'constraints',
    label:      'Hard constraints',
    stageBadge: 'Stage 1',
    question:   'What are the hard limits on any solution?',
  },
  {
    key:        'mustHave',
    label:      'Must-have features',
    stageBadge: 'Stage 2',
    question:   'What does any solution absolutely have to do?',
  },
  {
    key:        'mustNot',
    label:      'Off-limits',
    stageBadge: 'Stage 2',
    question:   'What must any solution never do, cost, or require?',
  },
  {
    key:        'mvp',
    label:      'MVP',
    stageBadge: 'Stage 2',
    question:   'What core features are required to make this worthwhile?',
  },
  {
    key:        'fullProduct',
    label:      'Complete version',
    stageBadge: 'Stage 2',
    question:   'What does a complete, finished version look like?',
  },
];

/* ---- Build tool labels ---- */

const STAGE4_BUILD_TOOL_LABELS = {
  agent:  'Coding agent (Claude Code, Cursor, Windsurf)',
  vibe:   'Vibe coding platform (Bolt, Lovable, Replit)',
  chat:   'Chat AI (Claude, ChatGPT, Gemini)',
  nocode: 'No-code tools (Zapier, Notion, Airtable)',
  unsure: 'Chat AI (Claude, ChatGPT, Gemini)',
};

const STAGE4_BUILD_TOOL_PLAN_NOTES = {
  agent:  'Include a Phase 0 covering environment and repo setup. Structure phases as working sessions with file-level or component-level specificity where possible. The final document will serve as a briefing for Claude Code, Cursor, or a similar coding agent.',
  vibe:   'Include a Phase 0 covering platform setup (account, project creation, initial configuration). Structure phases as feature-by-feature or deliverable-by-deliverable sessions within the platform.',
  chat:   'Structure phases as conversation sessions with clear deliverables per session. Each phase should end with a concrete artifact or working output the user can verify.',
  nocode: 'Structure phases around platform-specific workflows and configuration steps. Note which platforms handle which parts of each phase.',
  unsure: 'Structure phases as conversation sessions with clear deliverables per session.',
};

const STAGE4_PROJECT_TYPE_PLAN_NOTES = {
  app:           'Each phase should produce a testable increment of the application. Define acceptance criteria in terms of working behavior, not code completion.',
  website:       'Structure phases around content sections and functional areas. Each phase should produce a viewable, shareable increment.',
  document:      'Structure phases around document sections and the system that produces them. Each phase should end with a draft or template section the user can evaluate.',
  workflow:      'Structure phases around workflow steps. Each phase should produce a runnable increment of the workflow — something the user can test end-to-end, even if only partially.',
  integration:   'Structure phases around integration layers: data access, transformation, delivery. Each phase should produce a testable connection or data flow.',
  'internal-tool': 'Structure phases around core user actions. Each phase should produce a usable increment of the tool with at least one working capability.',
};

/* ---- Main prompt template ---- */

const STAGE4_PROMPT_TEMPLATE =
`You are helping me create a Build Plan before I begin building. You have the full context from my earlier planning stages. Your job is to help me sequence the build into logical phases with clear feature lists and acceptance criteria.

Important: treat this as a conversation, not a single response. After your initial plan, flag sequencing decisions that carry risk, phases that seem too large or too small, and dependencies I may have missed. We will iterate before producing the final document.

## Project: {{projectName}}
Type: {{projectTypeLabel}}
Build approach: {{buildToolLabel}}
{{projectDesc}}

---

## Project Background

Goal: {{reviewGoal}}

Hard constraints: {{reviewConstraints}}

---

## Stage 2: Constraint and Scope Document

{{stage2Context}}

---

## Stage 3: Design Document

{{stage3Context}}

---
{{collaborationNote}}
## Confirmed Scope for Build Planning

Must-have outcomes: {{reviewMustHave}}

Off-limits (must never do, cost, or require): {{reviewMustNot}}

MVP (minimum version that makes this worthwhile): {{reviewMvp}}

Complete finished version: {{reviewFullProduct}}

---

## Build approach notes

{{buildToolPlanNote}}

{{projectTypePlanNote}}

---

Please produce an initial Build Plan. Work through it phase by phase. Flag risky sequencing decisions and any dependencies I may have overlooked.

The final document (produced separately using the finalization prompt after we have iterated) must include:
1. Phase breakdown with a deliverable list and acceptance criteria per phase
2. Build dependencies and sequencing rationale
3. Risk callouts and mitigation notes
4. Any setup or environment requirements before Phase 1`;

/* ---- Finalization prompt ---- */

const STAGE4_FINALIZATION_PROMPT =
`We have been working through a Build Plan. Produce the final, clean Build Plan now.

Write only the document. No preamble, no commentary, no explanation of changes.

Use this exact structure for each phase — the formatting is required for import:

## Phase Name

### Features
- Feature one
- Feature two
- Feature three

### Acceptance Criteria
How I will know this phase is complete.

Repeat this structure for every phase. Then add:

## Build Dependencies and Sequencing Rationale
Why phases are in this order.

## Risk Callouts
The riskiest pieces and what to do if they go wrong.

## Setup and Environment Notes
Any prerequisites before Phase 1 begins.

Important formatting rules:
- Use ## for phase names and section headings only
- Use ### Features and ### Acceptance Criteria as subsection headings within each phase
- List features as flat bullet points starting with - (no sub-bullets, no nested lists)
- Write in plain, direct language. No filler.`;

/* ---- Decision capture prompt ---- */

const STAGE4_DECISION_CAPTURE_PROMPT =
`I just finished a Build Planning conversation with an AI tool. Please summarize the key decisions we made during this conversation.

Format your response as a simple flat numbered list. One decision per line. Each line should state the decision and the reason for it in one sentence. No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number.

Example format:
1. Build the data layer before the UI — the UI depends on knowing what data is available
2. Defer user authentication to Phase 2 — single-user local access is sufficient for the MVP

Only include decisions we actually settled. Do not include things that were discussed but not resolved.`;

/* ============================================================
   stage4() — Alpine component
   ============================================================ */
function stage4(projectId, project) {
  return {

    /* --------------------------------------------------------
       Identity
    -------------------------------------------------------- */
    projectId,
    project,

    /* --------------------------------------------------------
       Review state (macro step 1)
    -------------------------------------------------------- */
    reviewItems:     STAGE4_REVIEW_ITEMS,
    reviewAnswers:   {},
    editingKey:      null,
    reviewConfirmed: false,

    /* --------------------------------------------------------
       Prior stage context
    -------------------------------------------------------- */
    stage2Output:             '',
    stage3Output:             '',
    stage2CollaborationDepth: null,
    stage3CollaborationDepth: null,

    /* --------------------------------------------------------
       AI output
    -------------------------------------------------------- */
    aiOutput: '',

    /* --------------------------------------------------------
       UI state
    -------------------------------------------------------- */
    loading:                    true,
    macroStep:                  1,
    isCompleted:                false,
    copySuccess:                false,
    finalizationCopySuccess:    false,
    decisionCaptureCopySuccess: false,
    collaborationDepth:         null,
    reflectionText:             '',
    reflectionSaved:            false,
    pasteContent:               '',
    fileLabel:                  '',
    completionGateMsg:          '',
    decisionPasteContent:       '',
    decisionSaveMsg:            '',
    _saveTimer:                 null,

    /* --------------------------------------------------------
       Computed helpers
    -------------------------------------------------------- */
    get allStepsComplete() {
      return this.reviewConfirmed;
    },

    get isStageComplete() {
      return this.reviewConfirmed && !!this.aiOutput.trim();
    },

    get buildToolLabel() {
      return STAGE4_BUILD_TOOL_LABELS[(this.project || {}).buildTool] || STAGE4_BUILD_TOOL_LABELS.chat;
    },

    get projectTypeLabel() {
      const map = {
        app:             'App',
        website:         'Website',
        document:        'Document',
        workflow:        'Workflow',
        integration:     'Integration',
        'internal-tool': 'Internal Tool',
      };
      return map[(this.project || {}).projectType] || 'Project';
    },

    /* --------------------------------------------------------
       Prompt generation
    -------------------------------------------------------- */
    get generatedPrompt() {
      const p   = this.project || {};
      const desc = p.description ? '\n' + p.description : '';

      const stage2Context = (this.stage2Output || '').trim()
        ? this.stage2Output.trim()
        : 'Stage 2 not yet completed. No constraint and scope document available.';

      const stage3Context = (this.stage3Output || '').trim()
        ? this.stage3Output.trim()
        : 'Stage 3 not yet completed. No architecture document available.';

      const depthMap = {
        first:    'Note: the Stage 3 Architecture Document was accepted on first AI response.',
        few:      'Note: the Stage 3 Architecture Document was refined through a few exchanges.',
        extended: 'Note: the Stage 3 Architecture Document was refined through extended conversation.',
      };
      const collaborationNote = this.stage3CollaborationDepth
        ? depthMap[this.stage3CollaborationDepth] + '\n\n'
        : '';

      const buildTool = (p.buildTool || 'chat');
      const buildToolPlanNote    = STAGE4_BUILD_TOOL_PLAN_NOTES[buildTool] || STAGE4_BUILD_TOOL_PLAN_NOTES.chat;
      const projectTypePlanNote  = STAGE4_PROJECT_TYPE_PLAN_NOTES[(p.projectType) || 'app'] || '';

      const r = this.reviewAnswers;
      return STAGE4_PROMPT_TEMPLATE
        .replace('{{projectName}}',       p.name || 'Untitled Project')
        .replace('{{projectTypeLabel}}',  this.projectTypeLabel)
        .replace('{{buildToolLabel}}',    this.buildToolLabel)
        .replace('{{projectDesc}}',       desc)
        .replace('{{reviewGoal}}',        (r.goal        || '').trim() || '(not provided)')
        .replace('{{reviewConstraints}}', (r.constraints || '').trim() || '(not provided)')
        .replace('{{stage2Context}}',     stage2Context)
        .replace('{{stage3Context}}',     stage3Context)
        .replace('{{collaborationNote}}', collaborationNote)
        .replace('{{reviewMustHave}}',    (r.mustHave    || '').trim() || '(not provided)')
        .replace('{{reviewMustNot}}',     (r.mustNot     || '').trim() || '(not provided)')
        .replace('{{reviewMvp}}',         (r.mvp         || '').trim() || '(not provided)')
        .replace('{{reviewFullProduct}}', (r.fullProduct || '').trim() || '(not provided)')
        .replace('{{buildToolPlanNote}}',   buildToolPlanNote)
        .replace('{{projectTypePlanNote}}', projectTypePlanNote);
    },

    /* --------------------------------------------------------
       Init
    -------------------------------------------------------- */
    async init() {
      /* Load Stage 1 answers for review panel */
      const s1 = await DB.getStageRecord(this.projectId, 1);
      const s1answers = (s1 && s1.data && s1.data.answers) ? s1.data.answers : {};

      /* Load Stage 2 answers + output */
      const s2 = await DB.getStageRecord(this.projectId, 2);
      const s2answers = (s2 && s2.data && s2.data.answers) ? s2.data.answers : {};
      if (s2 && s2.data) {
        if (s2.data.aiOutput)                         this.stage2Output             = s2.data.aiOutput;
        if (s2.data.collaborationDepth !== undefined) this.stage2CollaborationDepth = s2.data.collaborationDepth;
      }

      /* Load Stage 3 output */
      const s3 = await DB.getStageRecord(this.projectId, 3);
      if (s3 && s3.data) {
        if (s3.data.aiOutput)                         this.stage3Output             = s3.data.aiOutput;
        if (s3.data.collaborationDepth !== undefined) this.stage3CollaborationDepth = s3.data.collaborationDepth;
      }

      /* Seed review answers from prior stages */
      this.reviewAnswers = {
        goal:        s1answers.goal        || '',
        constraints: s1answers.constraints || '',
        mustHave:    s2answers.mustHave    || '',
        mustNot:     s2answers.mustNot     || '',
        mvp:         s2answers.mvp         || '',
        fullProduct: s2answers.fullProduct || '',
      };

      /* Load existing Stage 4 record */
      const record = await DB.getStageRecord(this.projectId, 4);
      if (record && record.data) {
        const d = record.data;
        if (d.reviewAnswers) {
          Object.keys(d.reviewAnswers).forEach(k => {
            if (k in this.reviewAnswers) this.reviewAnswers[k] = d.reviewAnswers[k];
          });
        }
        if (d.reviewConfirmed)                      this.reviewConfirmed    = d.reviewConfirmed;
        if (typeof d.macroStep     === 'number')    this.macroStep          = d.macroStep;
        if (d.aiOutput)                             this.aiOutput           = d.aiOutput;
        if (d.collaborationDepth !== undefined)     this.collaborationDepth = d.collaborationDepth;
        if (record.status === 'complete')           this.isCompleted        = true;
      }

      /* Safety: cannot be past step 1 if not confirmed */
      if (!this.allStepsComplete && this.macroStep > 1) this.macroStep = 1;

      this.loading = false;
    },

    /* --------------------------------------------------------
       Review panel
    -------------------------------------------------------- */
    startEditing(key) {
      this.editingKey = key;
    },

    stopEditing() {
      this.editingKey = null;
      this.scheduleAutoSave();
    },

    confirmReview() {
      this.reviewConfirmed = true;
      this.editingKey = null;
      this._persist();
    },

    /* --------------------------------------------------------
       Auto-save
    -------------------------------------------------------- */
    scheduleAutoSave() {
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this._persist(), 800);
    },

    async _persist() {
      const data = {
        reviewAnswers:      { ...this.reviewAnswers },
        reviewConfirmed:    this.reviewConfirmed,
        macroStep:          this.macroStep,
        aiOutput:           this.aiOutput,
        collaborationDepth: this.collaborationDepth,
      };
      const status = this.isCompleted ? 'complete' : 'in_progress';
      await DB.saveStageRecord(this.projectId, 4, data, status);
      window.dispatchEvent(new CustomEvent('hora:stage-saved', {
        detail: { projectId: this.projectId },
      }));
    },

    /* --------------------------------------------------------
       Macro step navigation
    -------------------------------------------------------- */
    goToMacroStep(n) {
      if (n < 1 || n > 4) return;
      if (n > 1 && !this.allStepsComplete) return;
      this.macroStep = n;
      this.scheduleAutoSave();
    },

    /* --------------------------------------------------------
       Prompt / Tier 2 handoff (copy-only)
    -------------------------------------------------------- */
    async copyPrompt() {
      const text = this.generatedPrompt;
      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { copied = document.execCommand('copy') !== false; } catch (__) { copied = false; }
        document.body.removeChild(ta);
      }
      if (copied) {
        this.copySuccess = true;
        setTimeout(() => { this.copySuccess = false; }, 2500);
      } else {
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: { message: 'Clipboard access denied. Copy the prompt text manually.', type: 'error' } }));
      }
    },

    openAITab(provider) {
      const urls = {
        claude:  'https://claude.ai/new',
        chatgpt: 'https://chatgpt.com/',
        gemini:  'https://gemini.google.com/app',
      };
      window.open(urls[provider], '_blank', 'noopener,noreferrer');
    },

    async copyFinalizationPrompt() {
      const text = STAGE4_FINALIZATION_PROMPT;
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch (__) { /* silent */ }
        document.body.removeChild(ta);
      }
      this.finalizationCopySuccess = true;
      setTimeout(() => { this.finalizationCopySuccess = false; }, 2500);
    },

    async copyDecisionCapturePrompt() {
      const text = STAGE4_DECISION_CAPTURE_PROMPT;
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch (__) { /* silent */ }
        document.body.removeChild(ta);
      }
      this.decisionCaptureCopySuccess = true;
      setTimeout(() => { this.decisionCaptureCopySuccess = false; }, 2500);
    },

    setCollaborationDepth(value) {
      this.collaborationDepth = this.collaborationDepth === value ? null : value;
      this.scheduleAutoSave();
    },

    async saveReflection() {
      const text = this.reflectionText.trim();
      if (!text) return;
      await DB.addNote(this.projectId, {
        stageNumber: 4,
        title:       'Stage 4 Reflection',
        content:     text,
      });
      this.reflectionText  = '';
      this.reflectionSaved = true;
      setTimeout(() => { this.reflectionSaved = false; }, 3000);
    },

    /* --------------------------------------------------------
       Decision capture paste-back (macro step 3)
    -------------------------------------------------------- */
    async parseAndSaveDecisions() {
      const raw = this.decisionPasteContent.trim();
      if (!raw) return;

      const lines  = raw.split('\n').filter(l => !/^\s/.test(l)).map(l => l.trim()).filter(Boolean);
      const parsed = lines
        .filter(l => /^[\d\-\*\u2022]/.test(l))
        .map(l => l.replace(/^[\d]+[.):\s]+/, '').replace(/^[\-\*\u2022]\s*/, '').trim())
        .filter(l => l.length > 10);

      if (parsed.length >= 2) {
        for (const decision of parsed) {
          const title = decision.length > 60 ? decision.substring(0, 57) + '...' : decision;
          await DB.addDecision(this.projectId, 4, {
            title,
            decision,
            context: 'Captured via Stage 4 session summary',
          });
        }
        this.decisionSaveMsg = parsed.length + ' decision' + (parsed.length !== 1 ? 's' : '') + ' saved to your Decision Journal.';
      } else {
        await DB.addDecision(this.projectId, 4, {
          title:    'Session decisions (unstructured)',
          decision: raw,
          context:  'Stored as block — could not parse individual items. Edit in Decision Journal.',
        });
        this.decisionSaveMsg = 'Saved as a single block. You can split individual decisions in the Decision Journal.';
      }

      this.decisionPasteContent = '';
      setTimeout(() => { this.decisionSaveMsg = ''; }, 6000);
    },

    /* --------------------------------------------------------
       AI output import
    -------------------------------------------------------- */
    saveAiOutput() {
      const txt = this.pasteContent.trim();
      if (!txt) return;
      this.aiOutput     = txt;
      this.pasteContent = '';
      this._persist();
    },

    async handleFileUpload(file) {
      if (!file) return;
      try {
        const text = await file.text();
        if (!text.trim()) { this.fileLabel = 'File appears to be empty.'; return; }
        this.aiOutput  = text.trim();
        this.fileLabel = 'Loaded: ' + file.name;
        await this._persist();
        setTimeout(() => { this.fileLabel = ''; }, 3000);
      } catch (e) {
        this.fileLabel = 'Could not read file.';
      }
    },

    clearAiOutput() {
      this.aiOutput     = '';
      this.pasteContent = '';
      this._persist();
    },

    /* --------------------------------------------------------
       Markdown rendering
    -------------------------------------------------------- */
    renderMarkdown(text) {
      if (typeof marked !== 'undefined') return DOMPurify.sanitize(marked.parse(text));
      return '<pre style="white-space:pre-wrap;">' +
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>';
    },

    /* --------------------------------------------------------
       Completion gate
    -------------------------------------------------------- */
    async markComplete() {
      if (!this.reviewConfirmed) {
        this.completionGateMsg = 'Please confirm your review answers in Step 1 before marking Stage 4 complete.';
        return;
      }
      if (!this.aiOutput.trim()) {
        this.completionGateMsg = 'Stage 4 is complete when you have a Build Plan. Paste your AI output below or upload a file.';
        return;
      }
      this.completionGateMsg = '';
      this.isCompleted = true;
      await this._persist();
      await DB.completeStage(this.projectId, 4);
      window.dispatchEvent(new CustomEvent('hora:stage-saved', {
        detail: { projectId: this.projectId },
      }));
    },

    /* --------------------------------------------------------
       Navigate
    -------------------------------------------------------- */
    navigate(path) {
      window.location.hash = path ? '/' + path : '/';
    },

  };
}
