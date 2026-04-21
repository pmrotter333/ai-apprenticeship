/* ============================================================
   Hora — Stage 1: Problem Definition (stage1.js)
   Frustration Audit: 6 guided steps, Tier 2 prompt handoff,
   AI response import, and completion gate.
   ============================================================ */

const STAGE1_STEPS = [
  {
    key: 'goal',
    question: 'What would solving this make possible for you?',
    hint: 'Think past the immediate problem. A working tool is a task. What does it enable — a promotion, more time, a better outcome for people you care about?',
    placeholder: 'If I could solve this, I would be able to...',
  },
  {
    key: 'domain',
    question: 'What area of work or life are you trying to improve?',
    hint: 'Be specific about context. "Work" is too broad. Name the team, the process, the workflow, or the domain you are operating in.',
    placeholder: 'I work in... / I am trying to improve...',
  },
  {
    key: 'frustrations',
    question: 'What specifically frustrates you about how this works today?',
    hint: 'Be concrete. Describe the moments that do not work. Vague frustrations produce vague definitions. Name what actually breaks down.',
    placeholder: 'The specific things that do not work are...',
  },
  {
    key: 'attempts',
    question: 'What have you already tried? Why did it not work?',
    hint: 'Failed attempts are among the most valuable inputs. They reveal the constraints your solution must respect and the assumptions worth questioning.',
    placeholder: 'I have tried... but it did not work because...',
  },
  {
    key: 'constraints',
    question: 'What are the hard limits on any solution?',
    hint: 'Constraints are design parameters, not obstacles. Budget, time, tools, privacy requirements, stakeholder relationships, things you are not willing to change.',
    placeholder: 'Any solution must work within... I cannot change... I will not use...',
  },
  {
    key: 'stakeholders',
    question: 'Who else is affected by this problem?',
    hint: 'Family members, teammates, clients, anyone who would notice a change. Understanding who is affected shapes what a solution must do.',
    placeholder: 'The people affected by this include...',
  },
];

const STAGE1_DECISION_CAPTURE_PROMPT =
`I just finished a Problem Definition conversation with an AI tool. Please summarize the key decisions we made during this conversation.

Format your response as a simple flat numbered list. One decision per line. Each line should state the decision and the reason for it in one sentence. No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number.

Example format:
1. Frame this as a data organization problem, not a reporting problem — the frustration is in finding information, not in presenting it
2. Scope to personal use only — adding a team dimension would require a different set of constraints

Only include decisions we actually settled. Do not include things that were discussed but not resolved.`;

const STAGE1_PROMPT_TEMPLATE =
`You are helping me define a problem clearly before I begin building a solution. Your job is not to solve the problem. It is to help me define it precisely.

## Project: {{projectName}}{{projectDesc}}

---

**What I want this to make possible:**
{{goal}}

**Area of work or life:**
{{domain}}

**What frustrates me about how this works today:**
{{frustrations}}

**What I have already tried, and why it did not work:**
{{attempts}}

**Hard limits on any solution:**
{{constraints}}

**Who else is affected by this problem:**
{{stakeholders}}

---

Using these inputs, produce a **Problem Definition Document** with the following sections:

**1. Problem Statement**
One clear paragraph. Name the specific problem, why it matters in the context of my goal, and what makes it genuinely difficult. Do not restate my frustrations. Synthesize them into a precise description of the underlying problem.

**2. Key Problem Dimensions**
3 to 5 bullet points identifying the distinct dimensions of the problem. Each should name something specific and non-obvious — something I may not have explicitly named but would immediately recognize as true.

**3. What the Solution Must Respect**
A concise list drawn from my constraints and failed attempts. Frame each item as a requirement, not a limitation. These are design parameters.

**4. Stakeholder Considerations**
How the people I named are affected, and what their needs imply for any solution.

**5. Open Questions**
3 to 5 questions that would meaningfully advance my thinking if answered. These should challenge the initial definition, not confirm it. They are the questions that separate a clear problem definition from a complete one.

Write in plain, direct language. No filler. No encouragement. No hedging. Treat me as intelligent and capable of handling precision.`;

const STAGE1_FINALIZATION_PROMPT =
`We've been refining a Problem Definition Document through our conversation. Please produce the final, clean version now.

Write only the document — no preamble, no commentary, no explanation of changes.

The document must include these sections:
1. Problem Statement
2. Key Problem Dimensions
3. What the Solution Must Respect
4. Stakeholder Considerations
5. Open Questions

Incorporate everything we discussed. Write in plain, direct language. No filler.`;

function stage1(projectId, project) {
  return {

    /* --------------------------------------------------------
       Identity
    -------------------------------------------------------- */
    projectId,
    project,

    /* --------------------------------------------------------
       Step state
    -------------------------------------------------------- */
    steps: STAGE1_STEPS,
    answers: { goal: '', domain: '', frustrations: '', attempts: '', constraints: '', stakeholders: '' },
    currentStep: 0,
    MIN_CHARS: 20,

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
    showBuildToolNudge: false,
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
      return STAGE1_PROMPT_TEMPLATE
        .replace('{{projectName}}', p.name || 'Untitled Project')
        .replace('{{projectDesc}}', desc)
        .replace('{{goal}}',         a.goal         || '(not answered)')
        .replace('{{domain}}',       a.domain       || '(not answered)')
        .replace('{{frustrations}}', a.frustrations || '(not answered)')
        .replace('{{attempts}}',     a.attempts     || '(not answered)')
        .replace('{{constraints}}',  a.constraints  || '(not answered)')
        .replace('{{stakeholders}}', a.stakeholders || '(not answered)');
    },

    /* --------------------------------------------------------
       Init (called automatically by Alpine)
    -------------------------------------------------------- */
    async init() {
      const record = await DB.getStageRecord(this.projectId, 1);
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
      /* Safety: can't be on a post-question step without completed questions */
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
      await DB.saveStageRecord(this.projectId, 1, data, status);
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
        /* Fallback for non-HTTPS or unsupported browsers */
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
      const text = STAGE1_FINALIZATION_PROMPT;
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
        stageNumber: 1,
        title: 'Stage 1 Reflection',
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
      /* Fallback: escaped plain text */
      return '<pre style="white-space:pre-wrap;">' +
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>';
    },

    /* --------------------------------------------------------
       Decision capture
    -------------------------------------------------------- */
    async copyDecisionCapturePrompt() {
      const text = STAGE1_DECISION_CAPTURE_PROMPT;
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
          await DB.addDecision(this.projectId, 1, {
            title,
            decision,
            context: 'Captured via Stage 1 session summary',
          });
        }
        this.decisionSaveMsg = parsed.length + ' decision' + (parsed.length !== 1 ? 's' : '') + ' saved to your Decision Journal.';
      } else {
        await DB.addDecision(this.projectId, 1, {
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
          'Please complete all six steps first. Each answer needs at least ' +
          this.MIN_CHARS + ' characters.';
        return;
      }
      if (!this.aiOutput.trim()) {
        this.completionGateMsg =
          'Stage 1 is complete when you have a Problem Definition Document. ' +
          'Paste your AI output below, upload a file, or use Tier 3 to generate one here.';
        return;
      }
      this.completionGateMsg = '';
      this.isCompleted = true;
      await this._persist();
      await DB.completeStage(this.projectId, 1);
      window.dispatchEvent(new CustomEvent('hora:stage-saved', {
        detail: { projectId: this.projectId },
      }));
      if ((this.project || {}).buildTool === 'unsure') {
        this.showBuildToolNudge = true;
      }
    },

    /* --------------------------------------------------------
       Navigate (avoids needing $root access)
    -------------------------------------------------------- */
    navigate(path) {
      window.location.hash = path ? '/' + path : '/';
    },

  };
}
