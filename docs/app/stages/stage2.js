/* ============================================================
   Hora — Stage 2: Constraint-Driven Scoping (stage2.js)
   Constraint Builder: 8 guided steps, Stage 1 context,
   Tier 2 prompt handoff, AI response import, completion gate.
   ============================================================ */

const STAGE2_STEPS = [
  {
    key: 'mustHave',
    question: 'What does any solution absolutely have to do?',
    hint: 'Name the non-negotiable outcomes. If a solution does not do these things, it does not solve the problem. Be specific — "it should be easy to use" is not a requirement. "It must calculate my portfolio return in under five seconds without me entering data manually" is.',
    placeholder: 'Any solution must be able to...',
  },
  {
    key: 'mustNot',
    question: 'What must any solution never do, cost, or require?',
    hint: 'These are your dealbreakers. Monthly fees, third-party account access, cloud storage of sensitive data, requiring technical knowledge to operate, depending on a service that could shut down. Name what is off the table.',
    placeholder: 'No acceptable solution will ever... / I will not use anything that...',
  },
  {
    key: 'skills',
    question: 'What is your current skill level with the tools you plan to use to build this?',
    hint: 'Be honest. Your experience level directly shapes what is realistic in scope. There is no wrong answer — the point is to design a scope you can actually execute.',
    placeholder: 'My experience with the relevant tools and technologies is...',
  },
  {
    key: 'existingTools',
    question: 'What tools or solutions already exist for this problem?',
    hint: 'Think broadly: commercial software, free tools, spreadsheets, manual processes, competitors, workarounds others use. You do not need to have tried them all — just name what exists.',
    placeholder: 'Tools and solutions that already address this problem include...',
  },
  {
    key: 'auditResults',
    question: 'What do those existing solutions do well, and where do they fall short?',
    hint: 'Be specific. "It is expensive" or "it does not do what I need" is a start, but dig into the specifics. What exactly does not work? What does work that you want to preserve? The gaps you name become your design targets.',
    placeholder: 'They do well at... but they fall short on...',
  },
  {
    key: 'mvp',
    question: 'What core features are absolutely required to make this project worthwhile? What would make it a failure if they were missing or ineffective?',
    hint: 'Strip away everything that would be nice to have. What is the smallest set of features that, if working well, would actually solve your problem? If any of these fail, the whole project fails. Name them.',
    placeholder: 'The core features that make this worth building are... Without these, the project fails...',
  },
  {
    key: 'fullProduct',
    question: 'What does a complete, finished version of this solution look like?',
    hint: 'Now think past the minimum. A complete product is not the most ambitious version — it is the version you would consider "done." What features does it have? What does a successful outcome look like?',
    placeholder: 'A complete version of this solution would include...',
  },
  {
    key: 'bestInClass',
    question: 'What would make this genuinely best-in-class compared to every alternative?',
    hint: 'This tier is aspirational, not required. What would make someone who tried every other option say "nothing else does this"? Think about the one or two things that could be uniquely yours.',
    placeholder: 'What would make this stand out from every alternative is...',
  },
];

const STAGE2_DECISION_CAPTURE_PROMPT =
`I just finished a Constraint and Scope conversation with an AI tool. Please summarize the key decisions we made during this conversation.

Format your response as a simple flat numbered list. One decision per line. Each line should state the decision and the reason for it in one sentence. No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number.

Example format:
1. Limit the scope to a single user — multi-user would require authentication and data separation that adds significant complexity
2. Exclude mobile from the initial build — the primary use case is desktop and mobile adds layout and testing overhead

Only include decisions we actually settled. Do not include things that were discussed but not resolved.`;

const STAGE2_PROMPT_TEMPLATE =
`You are helping me scope a solution before I begin building it. Your job is to take my inputs, the problem context from Stage 1, and produce a structured Constraint and Scope Document.

## Project: {{projectName}}{{projectDesc}}

---

## Context from Stage 1: Problem Definition

{{stage1Context}}

---

## Stage 2 Inputs

**What any solution absolutely must do:**
{{mustHave}}

**What any solution must never do, cost, or require:**
{{mustNot}}

**My current skill level with the tools I plan to use:**
{{skills}}

**Existing tools and solutions for this problem:**
{{existingTools}}

**What those solutions do well, and where they fall short:**
{{auditResults}}

**Core features required for this to be worthwhile (MVP):**
{{mvp}}

**What a complete, finished version looks like:**
{{fullProduct}}

**What would make this genuinely best-in-class:**
{{bestInClass}}

---

Using these inputs and the Stage 1 problem context, produce a **Constraint and Scope Document** with the following sections:

**1. Hard Requirements**
A precise list of what any solution must do. Reframe my must-haves as measurable requirements where possible. If I was vague, sharpen the language without changing the intent.

**2. Hard Constraints**
A precise list of what is off the table. Include constraints surfaced in Stage 1 and any additional constraints I named here. Frame each as a design parameter, not a limitation.

**3. Skill and Resource Reality**
An honest summary of what my current skill level means for scope. What is realistic to build given what I described? What would require learning or outside help? Flag any meaningful gaps between my skill level and my stated scope.

**4. Existing Solution Landscape**
A brief summary of what already exists and what the gap is. What do existing solutions get right that I should not try to reinvent? What specifically do they fail at that my solution must address?

**5. Feature Scope: Three Tiers**

- **MVP (Minimum Viable Product):** The smallest version that actually solves the core problem. List the specific features that belong here. Be ruthless — if a feature does not directly address a must-have requirement, it does not belong in the MVP.

- **Complete Product:** The version you would call "done." What gets added beyond the MVP?

- **Best-in-Class:** The aspirational tier. What makes this uniquely valuable compared to everything else?

**6. Recommended MVP Definition**
Based on everything above: a concrete, specific description of the first version to build. Name the features, state what each one must do to count as working, and flag any scope items that carry significant risk given my skill level or constraints.

Write in plain, direct language. No filler. No encouragement. Treat me as capable of handling precision. If something I described in my inputs is inconsistent or unrealistic given my constraints or skill level, say so directly.`;

const STAGE2_FINALIZATION_PROMPT =
`We've been refining a Constraint and Scope Document through our conversation. Please produce the final, clean version now.

Write only the document — no preamble, no commentary, no explanation of changes.

The document must include these sections:
1. Hard Requirements
2. Hard Constraints
3. Skill and Resource Reality
4. Existing Solution Landscape
5. Feature Scope (MVP / Complete / Best-in-Class)
6. Recommended MVP Definition

Incorporate everything we discussed. Write in plain, direct language. No filler.`;

function stage2(projectId, project) {
  return {

    /* --------------------------------------------------------
       Identity
    -------------------------------------------------------- */
    projectId,
    project,

    /* --------------------------------------------------------
       Step state
    -------------------------------------------------------- */
    steps: STAGE2_STEPS.map(s => ({ ...s })), /* shallow copy so hint patches don't affect const */
    answers: {
      mustHave:     '',
      mustNot:      '',
      skills:       '',
      existingTools:'',
      auditResults: '',
      mvp:          '',
      fullProduct:  '',
      bestInClass:  '',
    },
    currentStep: 0,
    MIN_CHARS: 20,

    /* --------------------------------------------------------
       Stage 1 context (loaded in init)
    -------------------------------------------------------- */
    stage1Output: '',
    stage1Constraints: '',
    stage1CollaborationDepth: null,

    /* --------------------------------------------------------
       AI output
    -------------------------------------------------------- */
    aiOutput: '',

    /* --------------------------------------------------------
       UI state
    -------------------------------------------------------- */
    loading: true,
    macroStep: 1,
    isCompleted: false,
    showUrlOptions: false,
    copySuccess: false,
    finalizationCopySuccess: false,
    collaborationDepth: null,
    reflectionText: '',
    reflectionSaved: false,
    pasteContent: '',
    fileLabel: '',
    completionGateMsg: '',
    decisionCaptureCopySuccess: false,
    decisionPasteContent:       '',
    decisionSaveMsg:            '',

    _saveTimer: null,

    /* --------------------------------------------------------
       Computed helpers
    -------------------------------------------------------- */
    get stepCount() {
      return this.steps.length;
    },

    isStepDone(index) {
      return (this.answers[this.steps[index].key] || '').trim().length >= this.MIN_CHARS;
    },

    get allStepsComplete() {
      return this.steps.every((_, i) => this.isStepDone(i));
    },

    get currentAnswer() {
      return this.answers[this.steps[this.currentStep].key] || '';
    },

    set currentAnswer(v) {
      this.answers[this.steps[this.currentStep].key] = v;
    },

    get currentAnswerLength() {
      return this.currentAnswer.trim().length;
    },

    get isCurrentValid() {
      return this.currentAnswerLength >= this.MIN_CHARS;
    },

    get isStageComplete() {
      return this.allStepsComplete && !!this.aiOutput.trim();
    },

    get stepsCompletedCount() {
      return this.steps.filter((_, i) => this.isStepDone(i)).length;
    },

    get generatedPrompt() {
      const a = this.answers;
      const p = this.project || {};
      const desc = p.description ? '\n' + p.description : '';

      /* Build the Stage 1 context block */
      let stage1Context = '';
      if (this.stage1Output && this.stage1Output.trim()) {
        stage1Context = this.stage1Output.trim();
      } else if (this.stage1Constraints && this.stage1Constraints.trim()) {
        stage1Context = 'Problem Definition Document not yet available.\n\nHard constraints identified in Stage 1: ' + this.stage1Constraints.trim();
      } else {
        stage1Context = 'Stage 1 not yet completed. No prior context available.';
      }

      return STAGE2_PROMPT_TEMPLATE
        .replace('{{projectName}}',  p.name || 'Untitled Project')
        .replace('{{projectDesc}}',  desc)
        .replace('{{stage1Context}}',stage1Context)
        .replace('{{mustHave}}',     a.mustHave      || '(not answered)')
        .replace('{{mustNot}}',      a.mustNot       || '(not answered)')
        .replace('{{skills}}',       a.skills        || '(not answered)')
        .replace('{{existingTools}}',a.existingTools || '(not answered)')
        .replace('{{auditResults}}', a.auditResults  || '(not answered)')
        .replace('{{mvp}}',          a.mvp           || '(not answered)')
        .replace('{{fullProduct}}',  a.fullProduct   || '(not answered)')
        .replace('{{bestInClass}}',  a.bestInClass   || '(not answered)');
    },

    /* --------------------------------------------------------
       Init (called automatically by Alpine)
    -------------------------------------------------------- */
    async init() {
      /* Load Stage 1 context */
      const stage1Record = await DB.getStageRecord(this.projectId, 1);
      if (stage1Record && stage1Record.data) {
        if (stage1Record.data.aiOutput) {
          this.stage1Output = stage1Record.data.aiOutput;
        }
        if (stage1Record.data.answers && stage1Record.data.answers.constraints) {
          this.stage1Constraints = stage1Record.data.answers.constraints;
        }
        if (stage1Record.data.collaborationDepth !== undefined) {
          this.stage1CollaborationDepth = stage1Record.data.collaborationDepth;
        }
      }

      /* Patch skills step hint based on project.buildTool */
      const buildTool = (this.project || {}).buildTool || 'unsure';
      const skillsHints = {
        agent:  'Coding agents (Claude Code, Cursor, Windsurf) work directly in your codebase through a terminal or IDE. Have you used a terminal before? Written any code? Used a coding agent? Be honest — your experience level shapes what scope is realistic and what constraints matter most.',
        vibe:   'Vibe coding platforms (Bolt, Lovable, Replit) run in the browser with no local setup required. Have you used any of these before? How comfortable are you with iterating in a browser-based editor and configuring app logic without writing code?',
        chat:   "You're planning to use AI chat tools (Claude, ChatGPT, Gemini) to build this. What's your experience directing AI to produce structured outputs? Have you built something like this before with AI assistance, or is this your first attempt?",
        nocode: "You're using no-code tools. Which platforms have you worked with before? How comfortable are you configuring logic, automations, or data structures without writing code? Are there parts of this project that may require capabilities your no-code platform does not have?",
        unsure: "You haven't decided how you'll build this yet. Describe your general skill level: what tools and technologies are you comfortable with today? What would require learning or outside help? This will shape what scope is realistic.",
      };
      const skillsStep = this.steps.find(s => s.key === 'skills');
      if (skillsStep) {
        skillsStep.hint = skillsHints[buildTool] || skillsHints.unsure;
      }

      /* Load existing Stage 2 record */
      const record = await DB.getStageRecord(this.projectId, 2);
      if (record && record.data) {
        const d = record.data;
        if (d.answers) {
          Object.keys(d.answers).forEach(k => {
            if (k in this.answers) this.answers[k] = d.answers[k];
          });
        }
        if (typeof d.currentStep === 'number') this.currentStep = d.currentStep;
        if (d.aiOutput) this.aiOutput = d.aiOutput;
        if (d.collaborationDepth !== undefined) this.collaborationDepth = d.collaborationDepth;
        if (typeof d.macroStep === 'number') this.macroStep = d.macroStep;
        if (record.status === 'complete') this.isCompleted = true;
      }
      if (!this.allStepsComplete && this.macroStep > 1) this.macroStep = 1;

      this.loading = false;
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
        answers:            { ...this.answers },
        currentStep:        this.currentStep,
        macroStep:          this.macroStep,
        aiOutput:           this.aiOutput,
        collaborationDepth: this.collaborationDepth,
      };
      const status = this.isCompleted ? 'complete' : 'in_progress';
      await DB.saveStageRecord(this.projectId, 2, data, status);
      window.dispatchEvent(new CustomEvent('hora:stage-saved', {
        detail: { projectId: this.projectId },
      }));
    },

    /* --------------------------------------------------------
       Step navigation
    -------------------------------------------------------- */
    goToMacroStep(n) {
      if (n < 1 || n > 4) return;
      if (n > 1 && !this.allStepsComplete) return;
      this.macroStep = n;
      this.scheduleAutoSave();
    },

    goToStep(i) {
      if (i < 0 || i >= this.stepCount) return;
      this.currentStep = i;
      this.scheduleAutoSave();
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.scheduleAutoSave();
      }
    },

    nextStep() {
      if (!this.isCurrentValid) return;
      if (this.currentStep < this.stepCount - 1) {
        this.currentStep++;
        this.scheduleAutoSave();
      }
    },

    /* --------------------------------------------------------
       Prompt / Tier 2 handoff
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
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
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

    async openInAI(provider) {
      await this.copyPrompt();
      const urls = {
        claude:  'https://claude.ai/new',
        chatgpt: 'https://chatgpt.com/',
        gemini:  'https://gemini.google.com/app',
      };
      window.open(urls[provider], '_blank', 'noopener,noreferrer');
    },

    async copyFinalizationPrompt() {
      const text = STAGE2_FINALIZATION_PROMPT;
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (__) { /* silent */ }
        document.body.removeChild(ta);
      }
      this.finalizationCopySuccess = true;
      setTimeout(() => { this.finalizationCopySuccess = false; }, 2500);
    },

    setCollaborationDepth(value) {
      this.collaborationDepth = this.collaborationDepth === value ? null : value;
      this.scheduleAutoSave();
    },

    async saveReflection() {
      const text = this.reflectionText.trim();
      if (!text) return;
      await DB.addNote(this.projectId, {
        stageNumber: 2,
        title: 'Stage 2 Reflection',
        content: text,
      });
      this.reflectionText = '';
      this.reflectionSaved = true;
      setTimeout(() => { this.reflectionSaved = false; }, 3000);
    },

    /* --------------------------------------------------------
       AI output import
    -------------------------------------------------------- */
    saveAiOutput() {
      const txt = this.pasteContent.trim();
      if (!txt) return;
      this.aiOutput = txt;
      this.pasteContent = '';
      this._persist();
    },

    async handleFileUpload(file) {
      if (!file) return;
      try {
        const text = await file.text();
        if (!text.trim()) {
          this.fileLabel = 'File appears to be empty.';
          return;
        }
        this.aiOutput = text.trim();
        this.fileLabel = 'Loaded: ' + file.name;
        await this._persist();
        setTimeout(() => { this.fileLabel = ''; }, 3000);
      } catch (e) {
        this.fileLabel = 'Could not read file.';
      }
    },

    clearAiOutput() {
      this.aiOutput = '';
      this.pasteContent = '';
      this._persist();
    },

    /* --------------------------------------------------------
       Markdown rendering helper
    -------------------------------------------------------- */
    renderMarkdown(text) {
      if (typeof marked !== 'undefined') {
        return DOMPurify.sanitize(marked.parse(text));
      }
      return '<pre style="white-space:pre-wrap;">' +
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>';
    },

    /* --------------------------------------------------------
       Decision capture
    -------------------------------------------------------- */
    async copyDecisionCapturePrompt() {
      const text = STAGE2_DECISION_CAPTURE_PROMPT;
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
          await DB.addDecision(this.projectId, 2, {
            title,
            decision,
            context: 'Captured via Stage 2 session summary',
          });
        }
        this.decisionSaveMsg = parsed.length + ' decision' + (parsed.length !== 1 ? 's' : '') + ' saved to your Decision Journal.';
      } else {
        await DB.addDecision(this.projectId, 2, {
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
       Completion gate
    -------------------------------------------------------- */
    async markComplete() {
      if (!this.allStepsComplete) {
        this.completionGateMsg =
          'Please complete all eight steps first. Each answer needs at least ' +
          this.MIN_CHARS + ' characters.';
        return;
      }
      if (!this.aiOutput.trim()) {
        this.completionGateMsg =
          'Stage 2 is complete when you have a Constraint and Scope Document. ' +
          'Paste your AI output below, upload a file, or use Tier 3 to generate one here.';
        return;
      }
      this.completionGateMsg = '';
      this.isCompleted = true;
      await this._persist();
      await DB.completeStage(this.projectId, 2);
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
