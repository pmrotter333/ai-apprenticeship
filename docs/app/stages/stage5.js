/* ============================================================
   Hora — Stage 5: Build (stage5.js)
   Build Setup gate (one-time): tool confirmation, AI setup prompt,
   context document generation.
   Three sub-views: Plan View, Session View, Log View (Phase 7).
   Plan View: interactive checklist parsed from Stage 4 Build Plan.
   Session View: session start briefing + session end logging.
   Log View: placeholder for Phase 7.
   ============================================================ */

/* ---- Build tool labels ---- */

const STAGE5_BUILD_TOOL_LABELS = {
  agent:  'Coding agent (Claude Code, Cursor, Windsurf)',
  vibe:   'Vibe coding platform (Bolt, Lovable, Replit)',
  chat:   'Chat AI (Claude, ChatGPT, Gemini)',
  nocode: 'No-code tools (Zapier, Notion, Airtable)',
  unsure: 'Chat AI (Claude, ChatGPT, Gemini)',
};

/* ---- Build tool pre-session concerns (embedded in briefing prompt) ---- */

const STAGE5_BUILD_TOOL_CONCERNS = {
  agent:  'environment dependencies, structural decisions, or sequencing risks',
  vibe:   'platform constraints, structural decisions, or sequencing issues',
  chat:   'approach decisions, prompt design, or dependencies between conversation sessions',
  nocode: 'platform constraints, data flow decisions, or sequencing issues',
  unsure: 'approach decisions or dependencies that could affect how you proceed',
};

/* ---- Session briefing prompt template ---- */

const STAGE5_SESSION_BRIEFING_TEMPLATE =
`## Project: {{projectName}}
Build approach: {{buildToolLabel}}
{{agentNote}}
## Current Build Phase
Phase: {{phaseName}}
Items for this session:
{{featureList}}

## Session Goal
{{goal}}

---

Before we begin: what questions or recommendations do you have? Is there anything about this phase I have not considered, any risks I should address first, or any {{buildToolConcerns}} I should think through before starting?

At the end of this session, answer: what would take this to the next level? What is the one thing that would make this meaningfully better?`;

/* ---- Build Setup: tool suggestions by category ---- */

const STAGE5_TOOL_SUGGESTIONS = {
  agent:  ['Claude Code', 'Cursor', 'Windsurf', 'GitHub Copilot', 'Gemini Code Assist', 'OpenAI Codex'],
  vibe:   ['Lovable', 'Bolt', 'Replit', 'v0'],
  chat:   ['Claude', 'ChatGPT', 'Gemini'],
  nocode: ['Zapier', 'Bubble', 'Webflow', 'Glide', 'Notion'],
  unsure: ['Claude Code', 'Cursor', 'Lovable', 'Bolt', 'Claude', 'ChatGPT'],
};

/* ---- Build Setup: context document placement instructions ---- */

const STAGE5_CONTEXT_PLACEMENT = {
  agent_claude_code:       'Create a file called CLAUDE.md at the root of your project directory and paste this content. Claude Code loads it automatically every session — you will not need to re-paste it.',
  agent_cursor:            'Create a file called .cursorrules at the root of your project directory and paste this content. Cursor reads it in every conversation automatically.',
  agent_windsurf:          'Create a file called .windsurfrules at the root of your project directory and paste this content. Windsurf will load it each session.',
  agent_github_copilot:    'GitHub Copilot does not use a standard context file. Save this document somewhere accessible and share key sections at the start of relevant conversations. A copy is also saved in the Documents section of this app.',
  agent_gemini_code_assist:'Save this document in your project and reference it at the start of sessions. Gemini Code Assist works best when you paste the relevant sections into context. A copy is also saved in the Documents section of this app.',
  agent_openai_codex:      'Save this document in your project. Share it at the start of each Codex session by pasting it into the conversation or referencing it via your project setup. A copy is also saved in the Documents section of this app.',
  agent_default:           'Check your tool\'s documentation for how to add a persistent project context file (often placed at the project root). Paste this content there so your agent loads it automatically. A copy is also saved in the Documents section of this app.',
  stateless_default:       'Your Project Context Document is saved in the Documents section of this app and updates automatically after each session. It\'s pre-loaded into your session briefings, so you don\'t need to paste it manually.',
};

/* ---- Build Setup: AI setup prompt template ---- */

const STAGE5_SETUP_PROMPT_TEMPLATE =
`You are helping me set up my AI-assisted build environment for a project I have been planning.

## My Project
Name: {{projectName}}
Type: {{projectTypeLabel}}
Goal: {{projectGoal}}
Domain: {{projectDomain}}
Key constraints: {{projectConstraints}}
{{architectureSummary}}
Build approach: {{buildToolCategory}}
Specific tool I want to use: {{specificTool}}

## My Situation
Operating system: {{os}}
Have I used this tool before: {{experienced}}
{{apiCallsLine}}
## What I Need From You
{{setupRequest}}

Please walk me through everything step by step. Ask clarifying questions if you need more context about my environment.

At the end of our conversation, please give me a numbered list of any significant decisions we made together — for example: which tool I chose, which subscription or API plan I set up, any key configuration decisions, or anything else worth logging. Format it as a simple flat numbered list, one decision per line, starting each line with a number and period (e.g. "1. I decided to use..."). No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number. I will import that list directly into my project notes.`;

/* ---- Decision capture prompt ---- */

const STAGE5_DECISION_CAPTURE_PROMPT =
`We just completed a build session. Looking back at our conversation, list every significant decision that was made.

Format your response as a simple flat numbered list. One decision per line. Start each line with a number and period (e.g. "1. We decided to..."). No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number. Be specific about what was decided, not just what was considered.

Include decisions about:
- Technical choices (libraries, data structures, patterns, APIs)
- Scope changes (what was added, cut, or deferred)
- Design decisions (structure, naming, component organisation)
- Process decisions about how to approach remaining work

Only list decisions that were actually settled during this session.`;

/* ============================================================
   stage5() — Alpine component
   ============================================================ */

function stage5(projectId, project) {
  return {

    /* --------------------------------------------------------
       Identity
    -------------------------------------------------------- */
    projectId,
    project,

    /* --------------------------------------------------------
       UI state
    -------------------------------------------------------- */
    loading: true,
    subView: 'plan',   // 'plan' | 'session' | 'log'

    /* --------------------------------------------------------
       Build Setup gate (one-time, before plan setup)
    -------------------------------------------------------- */
    buildSetupComplete:   false,
    buildSetupStep:       1,        // 1–4
    specificTool:         '',       // e.g. "Claude Code", "Lovable", "ChatGPT"
    buildSetupUnsure:     false,    // "not sure yet" checkbox in step 1
    buildSetupOs:         null,     // 'mac' | 'windows' | 'linux'
    buildSetupExperienced: null,    // true | false
    appNeedsApiCalls:     null,     // true | false | 'unsure'
    skipContextBlock:     false,    // true = omit project context from agent-fork briefings
    setupCopySuccess:     false,
    setupDecisionText:    '',       // paste-back area in step 3
    setupDecisionImported: false,

    /* --------------------------------------------------------
       Context document
    -------------------------------------------------------- */
    contextDocument:       '',
    contextUpdatedAt:      null,
    contextDecisionsCount: 0,
    contextSessionsCount:  0,
    contextCopySuccess:    false,
    contextExpanded:       false,
    contextStale:          false,   // set after session end / decision log

    /* --------------------------------------------------------
       Prior stage records (loaded on init for context generation)
    -------------------------------------------------------- */
    stage1Record: null,
    stage2Record: null,
    stage3Record: null,

    /* --------------------------------------------------------
       Plan — setup (first entry)
    -------------------------------------------------------- */
    setupComplete: false,
    parsedPhases:  [],     // holds parse result before user confirms

    /* --------------------------------------------------------
       Plan — live state
    -------------------------------------------------------- */
    plan: {
      phases: [],
      milestones: [
        { id: 'm-1', label: 'MVP',          markedAt: null },
        { id: 'm-2', label: 'Version 1.0',  markedAt: null },
        { id: 'm-3', label: '',             markedAt: null },
      ],
    },

    /* --------------------------------------------------------
       Plan — editing state
    -------------------------------------------------------- */
    addingFeatureToPhase:  null,   // phaseIndex or null
    newFeatureText:        '',
    addingPhase:           false,
    newPhaseName:          '',
    featureActionOpen:     null,   // 'pIdx-fIdx' string for open action panel
    changeNoteText:        '',
    removedReasonText:     '',
    editingMilestoneId:    null,
    editingMilestoneLabel: '',

    /* --------------------------------------------------------
       Session — start form
    -------------------------------------------------------- */
    sessionForm: {
      phaseIndex:     null,
      featureIndices: [],
      goal:           '',
    },

    /* --------------------------------------------------------
       Session — active state (persisted; survives page close)
    -------------------------------------------------------- */
    activeSession: null,  // { phaseIndex, phaseName, featureIndices, featureNames, goal, startedAt }

    /* --------------------------------------------------------
       Session — briefing
    -------------------------------------------------------- */
    sessionBriefingPrompt:      '',
    sessionBriefingCopySuccess: false,

    /* --------------------------------------------------------
       Session — end form
    -------------------------------------------------------- */
    sessionEndForm: {
      accomplishment: '',
      planChanged:    false,
      decisionText:   '',
    },
    sessionDecisionCopySuccess: false,
    sessionDecisionsCaptured:   [],
    sessionSaving:              false,
    sessionSaveError:           '',
    sessionSaveRetries:         0,

    /* --------------------------------------------------------
       Source docs
    -------------------------------------------------------- */
    stage4aiOutput: null,

    /* --------------------------------------------------------
       Log View
    -------------------------------------------------------- */
    logFeed:             [],
    logLoading:          false,

    /* --------------------------------------------------------
       Init
    -------------------------------------------------------- */
    async init() {
      const [record, stage4Record] = await Promise.all([
        DB.getStageRecord(Number(this.projectId), 5),
        DB.getStageRecord(Number(this.projectId), 4),
      ]);

      this.stage4aiOutput = stage4Record?.data?.aiOutput || null;

      /* Load prior stage records for context document generation */
      await this._loadPriorStageRecords();

      if (record?.data) {
        const d = record.data;

        /* Build Setup state */
        this.buildSetupComplete    = d.buildSetupComplete    || false;
        this.buildSetupStep        = d.buildSetupStep        || 1;
        this.specificTool          = d.specificTool          || '';
        this.buildSetupUnsure      = d.buildSetupUnsure      || false;
        this.buildSetupOs          = d.buildSetupOs          || null;
        this.buildSetupExperienced = d.buildSetupExperienced ?? null;
        this.appNeedsApiCalls      = d.appNeedsApiCalls      ?? null;
        this.skipContextBlock      = d.skipContextBlock      || false;

        /* Context document metadata (document itself is regenerated, not persisted) */
        this.contextUpdatedAt      = d.contextUpdatedAt      || null;
        this.contextDecisionsCount = d.contextDecisionsCount || 0;
        this.contextSessionsCount  = d.contextSessionsCount  || 0;
        this.contextExpanded       = d.contextExpanded       || false;

        /* Plan state */
        this.setupComplete = d.setupComplete || false;
        if (d.plan)          this.plan          = d.plan;
        if (d.subView)       this.subView       = d.subView;
        if (d.activeSession) this.activeSession = d.activeSession;
      }

      /* Ensure milestone slots always exist */
      if (!this.plan.milestones || this.plan.milestones.length === 0) {
        this.plan.milestones = [
          { id: 'm-1', label: 'MVP',         markedAt: null },
          { id: 'm-2', label: 'Version 1.0', markedAt: null },
          { id: 'm-3', label: '',            markedAt: null },
        ];
      }

      /* If plan not yet set up, try to pre-parse Stage 4 output */
      if (!this.setupComplete && this.stage4aiOutput) {
        this.parsedPhases = this._parseBuildPlan(this.stage4aiOutput);
      }

      /* If returning with an active session, rebuild the briefing prompt */
      if (this.activeSession) {
        this.sessionForm.phaseIndex     = this.activeSession.phaseIndex;
        this.sessionForm.featureIndices = [...(this.activeSession.featureIndices || [])];
        this.sessionForm.goal           = this.activeSession.goal;
        this.sessionBriefingPrompt      = this._buildSessionBriefing();
      }

      /* Context document is not persisted — regenerate on every load when setup is done.
         Also regenerate when on step 4 of Build Setup (so the preview is ready). */
      if (this.buildSetupComplete || this.buildSetupStep === 4) {
        await this.refreshContext();
      }

      /* Pre-load log feed if returning to log view */
      if (this.subView === 'log') {
        await this.loadLogFeed();
      }

      /* Cache recent decisions for condensed context in session briefings */
      if (this.buildSetupComplete) {
        const allDecisions = await DB.getDecisions(Number(this.projectId));
        this._cachedRecentDecisions = (allDecisions || []).slice().reverse();
      }

      this.loading = false;
    },

    /* --------------------------------------------------------
       Build Plan parser
    -------------------------------------------------------- */
    _parseBuildPlan(markdown) {
      const phases  = [];
      const idBase  = Date.now();
      const sectionRegex = /^## (.+)$/gm;
      const matches = [...markdown.matchAll(sectionRegex)];

      for (let si = 0; si < matches.length; si++) {
        const match       = matches[si];
        const name        = match[1].trim();
        const start       = match.index + match[0].length;
        const end         = si + 1 < matches.length ? matches[si + 1].index : markdown.length;
        const sectionText = markdown.slice(start, end);

        /* Find ### Features subsection */
        const featuresRegex = /^### Features?\s*$/im;
        const featuresMatch = featuresRegex.exec(sectionText);
        if (!featuresMatch) continue;

        const afterFeatures   = sectionText.slice(featuresMatch.index + featuresMatch[0].length);
        const nextSection     = /^### /m.exec(afterFeatures);
        const featuresText    = nextSection ? afterFeatures.slice(0, nextSection.index) : afterFeatures;

        const features = [];
        for (const line of featuresText.split('\n')) {
          const stripped     = line.trim();
          const bulletMatch  = stripped.match(/^[*\-]\s+(.+)/);
          if (!bulletMatch) continue;
          let text = bulletMatch[1].trim().replace(/:$/, '').trim();
          if (!text) continue;
          features.push({
            id:            `f-${idBase}-${phases.length}-${features.length}`,
            text,
            status:        'not_started',
            changeNote:    '',
            removedReason: '',
            history:       [],
          });
        }

        if (features.length === 0) continue;

        phases.push({
          id:       `p-${idBase}-${phases.length}`,
          name,
          features,
        });
      }

      if (phases.length === 0 && markdown.trim().length > 100) {
        console.warn('[Hora] Build plan parser found no phases. Expected format: "## Phase Name" with "### Features" subsection.');
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: {
          message: 'Could not parse build plan. Make sure each phase uses a "## Phase name" heading with a "### Features" subsection.',
          type: 'error',
        }}));
      }

      return phases;
    },

    /* --------------------------------------------------------
       Plan setup
    -------------------------------------------------------- */
    async confirmPlan() {
      /* Deep-copy parsedPhases into plan */
      this.plan.phases = this.parsedPhases.map(p => ({
        ...p,
        features: p.features.map(f => ({ ...f, history: [] })),
      }));
      this.setupComplete = true;
      await this._persist();
    },

    /* --------------------------------------------------------
       Plan — feature status
    -------------------------------------------------------- */
    setFeatureStatus(phaseIndex, featureIndex, status) {
      const feature = this.plan.phases[phaseIndex]?.features[featureIndex];
      if (!feature || feature.status === status) return;
      feature.history.push({ at: new Date().toISOString(), from: feature.status });
      feature.status = status;
      this.featureActionOpen = null;
      this._persist();
    },

    openFeatureAction(phaseIndex, featureIndex) {
      const key = `${phaseIndex}-${featureIndex}`;
      this.featureActionOpen = this.featureActionOpen === key ? null : key;
      this.changeNoteText    = '';
      this.removedReasonText = '';
    },

    saveFeatureChange(phaseIndex, featureIndex) {
      const feature = this.plan.phases[phaseIndex]?.features[featureIndex];
      if (!feature) return;
      feature.history.push({ at: new Date().toISOString(), from: feature.status });
      feature.status     = 'changed';
      feature.changeNote = this.changeNoteText.trim();
      this.featureActionOpen = null;
      this.changeNoteText    = '';
      this._persist();
    },

    saveFeatureRemoval(phaseIndex, featureIndex) {
      const feature = this.plan.phases[phaseIndex]?.features[featureIndex];
      if (!feature) return;
      feature.history.push({ at: new Date().toISOString(), from: feature.status });
      feature.status        = 'removed';
      feature.removedReason = this.removedReasonText.trim();
      this.featureActionOpen  = null;
      this.removedReasonText  = '';
      this._persist();
    },

    /* --------------------------------------------------------
       Plan — add feature / phase
    -------------------------------------------------------- */
    addFeature(phaseIndex) {
      const text = this.newFeatureText.trim();
      if (!text) return;
      this.plan.phases[phaseIndex].features.push({
        id:            `f-${Date.now()}-manual`,
        text,
        status:        'not_started',
        changeNote:    '',
        removedReason: '',
        history:       [],
      });
      this.newFeatureText       = '';
      this.addingFeatureToPhase = null;
      this._persist();
    },

    addPhase() {
      const name = this.newPhaseName.trim();
      if (!name) return;
      this.plan.phases.push({
        id:       `p-${Date.now()}-manual`,
        name,
        features: [],
      });
      this.newPhaseName = '';
      this.addingPhase  = false;
      this._persist();
    },

    /* --------------------------------------------------------
       Plan — milestones
    -------------------------------------------------------- */
    toggleMilestone(milestoneId) {
      const m = this.plan.milestones.find(m => m.id === milestoneId);
      if (!m) return;
      m.markedAt = m.markedAt ? null : new Date().toISOString();
      this._persist();
    },

    startEditMilestone(milestoneId) {
      const m = this.plan.milestones.find(m => m.id === milestoneId);
      if (!m) return;
      this.editingMilestoneId    = milestoneId;
      this.editingMilestoneLabel = m.label;
    },

    saveMilestoneLabel() {
      const m = this.plan.milestones.find(m => m.id === this.editingMilestoneId);
      if (m) m.label = this.editingMilestoneLabel.trim();
      this.editingMilestoneId    = null;
      this.editingMilestoneLabel = '';
      this._persist();
    },

    addMilestone() {
      this.plan.milestones.push({ id: `m-${Date.now()}`, label: '', markedAt: null });
      this._persist();
    },

    /* --------------------------------------------------------
       Session — build briefing
    -------------------------------------------------------- */
    _buildSessionBriefing() {
      const buildTool  = (this.project?.buildTool) || 'unsure';
      const toolLabel  = this.specificTool && !this.buildSetupUnsure
        ? this.specificTool
        : (STAGE5_BUILD_TOOL_LABELS[buildTool] || STAGE5_BUILD_TOOL_LABELS.unsure);
      const concerns   = STAGE5_BUILD_TOOL_CONCERNS[buildTool] || STAGE5_BUILD_TOOL_CONCERNS.unsure;
      const phaseIndex = this.sessionForm.phaseIndex;
      const phase      = phaseIndex !== null ? this.plan.phases[phaseIndex] : null;
      const phaseName  = phase ? phase.name : 'Unspecified phase';

      let featureList;
      if (this.sessionForm.featureIndices.length > 0 && phase) {
        const lines = this.sessionForm.featureIndices
          .map(fi => phase.features[fi]?.text)
          .filter(Boolean)
          .map(t => '- ' + t);
        featureList = lines.length > 0 ? lines.join('\n') : '(All items in this phase)';
      } else if (phase) {
        /* No items selected — include all non-removed items so AI has full context */
        const allLines = phase.features
          .filter(f => f.status !== 'removed')
          .map(f => '- ' + f.text);
        featureList = allLines.length > 0 ? allLines.join('\n') : '(All items in this phase)';
      } else {
        featureList = '(All items in this phase)';
      }

      const agentNote = buildTool === 'agent'
        ? `\nContext file: ${this._getContextFilename()} loaded automatically — your agent has full project context.\n`
        : '';

      const coreBriefing = STAGE5_SESSION_BRIEFING_TEMPLATE
        .replace('{{projectName}}',       this.project?.name || 'This project')
        .replace('{{buildToolLabel}}',    toolLabel)
        .replace('{{agentNote}}',         agentNote)
        .replace('{{phaseName}}',         phaseName)
        .replace('{{featureList}}',       featureList)
        .replace('{{goal}}',              this.sessionForm.goal.trim())
        .replace('{{buildToolConcerns}}', concerns);

      /* For stateless tools (chat/vibe/nocode), each conversation starts cold.
         Prepend the full project context document so the AI has complete project
         history without the user needing to navigate away and copy it manually.
         For agent tools, skip the context block if the user has indicated their
         tool already has project context (CLAUDE.md / .cursorrules / memory). */
      if (this._isStatelessTool) {
        const contextBlock = this.contextDocument || this._buildCondensedContext(phaseName);
        return contextBlock + '\n\n---\n\n' + coreBriefing;
      }

      if (!this.skipContextBlock) {
        const contextBlock = this.contextDocument || this._buildCondensedContext(phaseName);
        return contextBlock + '\n\n---\n\n' + coreBriefing;
      }

      return coreBriefing;
    },

    _getContextFilename() {
      const tool = (this.specificTool || '').toLowerCase();
      if (tool.includes('cursor'))   return '.cursorrules';
      if (tool.includes('windsurf')) return '.windsurfrules';
      return 'CLAUDE.md';
    },

    _buildCondensedContext(phaseName) {
      const s1data = this.stage1Record?.data || {};
      const s1 = s1data.answers || s1data;
      const s3 = this.stage3Record?.data || {};

      /* First sentence of architecture aiOutput */
      const archText   = s3.aiOutput || '';
      const archFirst  = archText.split(/[.\n]/)[0]?.trim() || this.specificTool || '';

      /* Constraints: first 200 chars */
      const constraints = (s1.constraints || '').slice(0, 200);

      /* Last 5 decisions */
      const decisions = this._cachedRecentDecisions || [];
      const decisionLines = decisions.slice(0, 5).map(d => `  - ${d.title}`).join('\n');

      /* Plan progress */
      const stats = this.planStats;
      const progressLine = stats.total > 0
        ? `${phaseName} — ${stats.complete}/${stats.total} features done`
        : phaseName;

      let block = `# PROJECT CONTEXT\nProject: ${this.project?.name || 'My project'}`;
      if (s1.goal)       block += `\nGoal: ${s1.goal}`;
      if (archFirst)     block += `\nArchitecture approach: ${archFirst}`;
      if (constraints)   block += `\nKey constraints: ${constraints}`;
      if (decisionLines) block += `\nRecent decisions:\n${decisionLines}`;
      block += `\nProgress: ${progressLine}`;

      return block;
    },

    /* --------------------------------------------------------
       Session — save confirmation
    -------------------------------------------------------- */
    sessionSavedConfirmation: false,

    /* --------------------------------------------------------
       Session — start
    -------------------------------------------------------- */
    startSession() {
      if (!this.sessionCanStart) return;
      const phase        = this.plan.phases[this.sessionForm.phaseIndex];
      const featureNames = this.sessionForm.featureIndices
        .map(fi => phase.features[fi]?.text)
        .filter(Boolean);

      this.sessionBriefingPrompt = this._buildSessionBriefing();

      this.activeSession = {
        phaseIndex:     this.sessionForm.phaseIndex,
        phaseName:      phase.name,
        featureIndices: [...this.sessionForm.featureIndices],
        featureNames,
        goal:           this.sessionForm.goal.trim(),
        startedAt:      new Date().toISOString(),
      };

      this._persist();
      this.$nextTick(() => {
        const main = document.getElementById('main');
        if (main) main.scrollTop = 0;
        else window.scrollTo({ top: 0, behavior: 'instant' });
      });
    },

    abandonSession() {
      this.activeSession         = null;
      this.sessionBriefingPrompt = '';
      this.sessionForm           = { phaseIndex: null, featureIndices: [], goal: '' };
      this.sessionEndForm        = { accomplishment: '', planChanged: false, decisionText: '' };
      this._persist();
    },

    async copySessionBriefing() {
      try {
        await navigator.clipboard.writeText(this.sessionBriefingPrompt);
        this.sessionBriefingCopySuccess = true;
        setTimeout(() => { this.sessionBriefingCopySuccess = false; }, 2000);
      } catch (e) {
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: { message: 'Clipboard access denied. Copy the briefing text manually.', type: 'error' } }));
      }
    },

    /* --------------------------------------------------------
       Session — decision capture
    -------------------------------------------------------- */
    async copyDecisionCapturePrompt() {
      try {
        await navigator.clipboard.writeText(STAGE5_DECISION_CAPTURE_PROMPT);
        this.sessionDecisionCopySuccess = true;
        setTimeout(() => { this.sessionDecisionCopySuccess = false; }, 2000);
      } catch (e) {
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: { message: 'Clipboard access denied. Copy the prompt text manually.', type: 'error' } }));
      }
    },

    _parseDecisions(text) {
      if (!text.trim()) return [];
      const lines = text.split('\n').filter(l => !/^\s/.test(l)).map(l => l.trim()).filter(Boolean);
      const items = lines
        .filter(l => /^[\d]+[.)]\s/.test(l) || /^[\-\*]\s/.test(l))
        .map(l => l.replace(/^[\d]+[.)]\s*/, '').replace(/^[\-\*]\s*/, '').trim())
        .filter(Boolean);
      return items.length >= 2 ? items : [];
    },

    /* --------------------------------------------------------
       Session — end
    -------------------------------------------------------- */
    async endSession() {
      if (!this.activeSession || this.sessionSaving) return;
      this.sessionSaving    = true;
      this.sessionSaveError = '';

      /* Strip Alpine reactive proxies so IndexedDB structured clone can serialize */
      const session     = JSON.parse(JSON.stringify(this.activeSession));
      const endForm     = JSON.parse(JSON.stringify(this.sessionEndForm));
      const decisionRaw = endForm.decisionText.trim();

      try {
        /* Parse and save decisions */
        const parsedItems = this._parseDecisions(decisionRaw);
        if (parsedItems.length >= 2) {
          for (const item of parsedItems) {
            await DB.addDecision(Number(this.projectId), 5, {
              title:    item.length > 60 ? item.slice(0, 57) + '...' : item,
              decision: item,
              context:  'Session: ' + session.phaseName,
            });
          }
          this.sessionDecisionsCaptured = parsedItems;
        } else if (decisionRaw) {
          await DB.addDecision(Number(this.projectId), 5, {
            title:    'Session decisions — ' + session.phaseName,
            decision: decisionRaw,
            context:  'Session (unstructured): ' + session.phaseName,
          });
          this.sessionDecisionsCaptured = [decisionRaw];
        }

        /* Write session record */
        await DB.addSession({
          projectId:         Number(this.projectId),
          phaseIndex:        session.phaseIndex,
          phaseName:         session.phaseName,
          featureIndices:    session.featureIndices,
          featureNames:      session.featureNames,
          goal:              session.goal,
          startedAt:         session.startedAt,
          completedAt:       new Date().toISOString(),
          accomplishment:    endForm.accomplishment.trim(),
          planChangeFlagged: endForm.planChanged,
          decisionsLogged:   this.sessionDecisionsCaptured.length,
        });

        /* Clear session state only after successful save */
        this.activeSession         = null;
        this.sessionBriefingPrompt = '';
        this.sessionForm           = { phaseIndex: null, featureIndices: [], goal: '' };
        this.sessionEndForm        = { accomplishment: '', planChanged: false, decisionText: '' };
        this.sessionSaveRetries    = 0;

        /* Auto-refresh context document — non-critical, don't fail the session save if it times out */
        if (this.buildSetupComplete) {
          try {
            await this.refreshContext();
            this._cachedRecentDecisions = (await DB.getDecisions(Number(this.projectId))).slice().reverse();
          } catch (e) {
            console.warn('[Hora] Context refresh after session end failed:', e.message);
            this.contextStale = true;
          }
        }

        await this._persist();

        /* Route to Plan View if user flagged a plan change, otherwise show confirmation */
        if (endForm.planChanged) {
          this.subView = 'plan';
          await this._persist();
        } else {
          this.sessionSavedConfirmation = true;
          setTimeout(() => { this.sessionSavedConfirmation = false; }, 4000);
        }

      } catch (e) {
        this.sessionSaveRetries++;
        console.error('[Hora] Session save failed (attempt ' + this.sessionSaveRetries + '):', e);
        if (this.sessionSaveRetries >= 3) {
          this.sessionSaveError = 'Session could not be saved after multiple attempts. Download a copy so your work is not lost, then try reloading the app.';
        } else {
          this.sessionSaveError = 'Session save failed. Please try again. (' + (e.message || 'storage error') + ')';
        }
      } finally {
        this.sessionSaving = false;
      }
    },

    downloadSessionData() {
      const session = this.activeSession || {};
      const endForm = this.sessionEndForm;
      const lines = [
        'HORA SESSION EXPORT',
        new Date().toLocaleString(),
        '',
        'Phase: ' + (session.phaseName || 'Unknown'),
        'Goal: '  + (session.goal      || ''),
        'Started: '+ (session.startedAt || ''),
        '',
        'Accomplishment:',
        endForm.accomplishment || '(none)',
        '',
        'Decisions:',
        endForm.decisionText   || '(none)',
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'hora-session-' + new Date().toISOString().slice(0, 10) + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    },

    toggleFeatureForSession(featureIndex) {
      const idx = this.sessionForm.featureIndices.indexOf(featureIndex);
      if (idx === -1) {
        this.sessionForm.featureIndices.push(featureIndex);
      } else {
        this.sessionForm.featureIndices.splice(idx, 1);
      }
    },

    /* --------------------------------------------------------
       Build Setup — helpers
    -------------------------------------------------------- */
    get _isStatelessTool() {
      const bt = this.project?.buildTool;
      return bt === 'chat' || bt === 'vibe' || bt === 'nocode' || bt === 'unsure' || !bt;
    },

    get buildSetupCanAdvanceStep1() {
      return this.buildSetupUnsure || this.specificTool.trim().length > 0;
    },

    get buildSetupToolSuggestions() {
      const bt = this.project?.buildTool || 'unsure';
      return STAGE5_TOOL_SUGGESTIONS[bt] || STAGE5_TOOL_SUGGESTIONS.unsure;
    },

    selectToolSuggestion(tool) {
      this.specificTool    = tool;
      this.buildSetupUnsure = false;
    },

    async goToSetupStep(n) {
      if (n < 1 || n > 4) return;
      if (n > 1 && !this.buildSetupCanAdvanceStep1) return;
      this.buildSetupStep = n;
      await this._persist();
      if (n === 4) {
        await this.refreshContext();
      }
    },

    _getContextPlacementInstructions() {
      const tool = (this.specificTool || '').toLowerCase().replace(/\s+/g, '_');
      const bt   = this.project?.buildTool || 'unsure';
      if (bt === 'agent') {
        if (tool.includes('claude_code')) return STAGE5_CONTEXT_PLACEMENT.agent_claude_code;
        if (tool.includes('cursor'))      return STAGE5_CONTEXT_PLACEMENT.agent_cursor;
        if (tool.includes('windsurf'))    return STAGE5_CONTEXT_PLACEMENT.agent_windsurf;
        if (tool.includes('github_copilot') || tool.includes('copilot')) return STAGE5_CONTEXT_PLACEMENT.agent_github_copilot;
        if (tool.includes('gemini_code_assist') || tool.includes('gemini_code')) return STAGE5_CONTEXT_PLACEMENT.agent_gemini_code_assist;
        if (tool.includes('codex') || tool.includes('openai_codex')) return STAGE5_CONTEXT_PLACEMENT.agent_openai_codex;
        return STAGE5_CONTEXT_PLACEMENT.agent_default;
      }
      return STAGE5_CONTEXT_PLACEMENT.stateless_default;
    },

    _buildSetupPrompt() {
      const s1data = this.stage1Record?.data || {};
      const s1 = s1data.answers || s1data;
      const s3 = this.stage3Record?.data || {};
      const bt = this.project?.buildTool || 'unsure';
      const toolCategoryLabel = STAGE5_BUILD_TOOL_LABELS[bt] || STAGE5_BUILD_TOOL_LABELS.unsure;

      const architectureSummary = s3.aiOutput
        ? `Architecture notes: ${s3.aiOutput.slice(0, 300).replace(/\n+/g, ' ')}...`
        : '';

      const specificToolLine = this.buildSetupUnsure || !this.specificTool.trim()
        ? `Not decided yet — I need help choosing within the "${toolCategoryLabel}" category`
        : this.specificTool.trim();

      const osLabels = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };
      const osLine = this.buildSetupOs ? (osLabels[this.buildSetupOs] || this.buildSetupOs) : 'Not specified';

      const expLine = this.buildSetupExperienced === true
        ? 'Yes, I have used it before'
        : this.buildSetupExperienced === false
          ? 'No, this will be my first time'
          : 'Not specified';

      const projectType = this.project?.projectType || 'app';
      const projectTypeLabels = {
        app:             'App',
        website:         'Website',
        document:        'Document',
        workflow:        'Workflow',
        integration:     'Integration',
        'internal-tool': 'Internal Tool',
      };
      const projectTypeLabel = projectTypeLabels[projectType] || 'Project';

      /* Only include the API calls question for project types where it is relevant */
      const apiCallsRelevant = ['app', 'website', 'internal-tool', 'integration'].includes(projectType);
      const apiCallsLine = apiCallsRelevant
        ? 'Will this project make AI API calls at runtime: ' + (
            this.appNeedsApiCalls === true  ? 'Yes' :
            this.appNeedsApiCalls === false ? 'No' : 'Not sure'
          ) + '\n'
        : '';

      const setupRequestMap = {
        agent:   this.buildSetupUnsure || !this.specificTool.trim()
          ? `Please help me choose the right specific tool within the "${toolCategoryLabel}" category for my situation, then walk me through getting set up.`
          : `Please walk me through installing and configuring ${this.specificTool.trim()} for my project.`,
        vibe:    this.buildSetupUnsure || !this.specificTool.trim()
          ? `Please help me choose the right platform within the "${toolCategoryLabel}" category for my situation, then walk me through getting started.`
          : `Please walk me through getting started with ${this.specificTool.trim()} for this project.`,
        chat:    this.buildSetupUnsure || !this.specificTool.trim()
          ? `Please help me choose the best AI tool within the "${toolCategoryLabel}" category for this project, and advise on how to set up my working approach.`
          : `Please advise on the best way to set up my working approach in ${this.specificTool.trim()} for this project — how to structure conversations, manage context, and get consistent results.`,
        nocode:  this.buildSetupUnsure || !this.specificTool.trim()
          ? `Please help me choose the right platform within the "${toolCategoryLabel}" category for my situation, then walk me through getting started.`
          : `Please walk me through getting started with ${this.specificTool.trim()} for this project — account setup, initial configuration, and any key decisions I should make before I start building.`,
      };
      const setupRequest = setupRequestMap[bt] || setupRequestMap.chat;

      return STAGE5_SETUP_PROMPT_TEMPLATE
        .replace('{{projectName}}',       this.project?.name || 'My project')
        .replace('{{projectTypeLabel}}',   projectTypeLabel)
        .replace('{{projectGoal}}',       s1.goal          || 'Not yet specified')
        .replace('{{projectDomain}}',     s1.domain        || 'Not yet specified')
        .replace('{{projectConstraints}}',s1.constraints   || 'Not yet specified')
        .replace('{{architectureSummary}}',architectureSummary ? architectureSummary + '\n' : '')
        .replace('{{buildToolCategory}}', toolCategoryLabel)
        .replace('{{specificTool}}',      specificToolLine)
        .replace('{{os}}',                osLine)
        .replace('{{experienced}}',       expLine)
        .replace('{{apiCallsLine}}',      apiCallsLine)
        .replace('{{setupRequest}}',      setupRequest);
    },

    async copySetupPrompt() {
      try {
        await navigator.clipboard.writeText(this._buildSetupPrompt());
        this.setupCopySuccess = true;
        setTimeout(() => { this.setupCopySuccess = false; }, 2000);
      } catch (e) {
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: { message: 'Clipboard access denied. Copy the prompt text manually.', type: 'error' } }));
      }
    },

    async importSetupDecisions() {
      const items = this._parseDecisions(this.setupDecisionText);
      if (items.length >= 2) {
        for (const item of items) {
          await DB.addDecision(Number(this.projectId), 5, {
            title:    item.length > 60 ? item.slice(0, 57) + '...' : item,
            decision: item,
            context:  'Build Setup',
          });
        }
      } else if (this.setupDecisionText.trim()) {
        await DB.addDecision(Number(this.projectId), 5, {
          title:    'Build setup decisions',
          decision: this.setupDecisionText.trim(),
          context:  'Build Setup (unstructured)',
        });
      }
      this.setupDecisionImported = true;
      this.contextStale = true;
    },

    async confirmBuildSetup() {
      this.buildSetupComplete = true;
      await this._persist();
      await this.refreshContext();
    },

    /* --------------------------------------------------------
       Context document
    -------------------------------------------------------- */
    contextGenerating: false,
    contextGenerateError: false,

    async _generateContextDocIfNeeded() {
      if (this.contextDocument) return;
      this.contextGenerating    = true;
      this.contextGenerateError = false;
      try {
        await this.refreshContext();
      } catch (e) {
        console.error('[Hora] Context document generation failed.');
        this.contextGenerateError = true;
      } finally {
        this.contextGenerating = false;
      }
    },

    async _loadPriorStageRecords() {
      const [s1, s2, s3] = await Promise.all([
        DB.getStageRecord(Number(this.projectId), 1),
        DB.getStageRecord(Number(this.projectId), 2),
        DB.getStageRecord(Number(this.projectId), 3),
      ]);
      this.stage1Record = s1 || null;
      this.stage2Record = s2 || null;
      this.stage3Record = s3 || null;
    },

    async _buildContextDocument() {
      const s1data = this.stage1Record?.data || {};
      const s1 = s1data.answers || s1data;
      const s2 = this.stage2Record?.data || {};
      const s3 = this.stage3Record?.data || {};
      const s4aiOutput = this.stage4aiOutput || '';

      const [allDecisions, allSessions] = await Promise.all([
        DB.getDecisions(Number(this.projectId)),
        DB.getSessions(Number(this.projectId)),
      ]);

      const toolLabel = this.specificTool && !this.buildSetupUnsure
        ? this.specificTool
        : (STAGE5_BUILD_TOOL_LABELS[this.project?.buildTool] || 'AI tool');

      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const sections = [];

      sections.push(`# Project Context: ${this.project?.name || 'My Project'}`);
      sections.push(`*Tool: ${toolLabel} | Updated: ${now}*`);
      sections.push('');

      /* Problem */
      sections.push('## Problem We\'re Solving');
      if (s1.goal)         sections.push(`**Goal:** ${s1.goal}`);
      if (s1.domain)       sections.push(`**Domain:** ${s1.domain}`);
      if (s1.frustrations) sections.push(`**Key frustrations:** ${s1.frustrations}`);
      if (s1.constraints)  sections.push(`**Constraints:** ${s1.constraints}`);
      if (s1.stakeholders) sections.push(`**Who is affected:** ${s1.stakeholders}`);
      if (!s1.goal && !s1.domain) sections.push('*(Stage 1 not yet completed)*');
      sections.push('');

      /* Problem Definition Document (Stage 1 AI output) */
      if (s1data.aiOutput) {
        sections.push('## Problem Definition Document');
        sections.push(s1data.aiOutput);
        sections.push('');
      }

      /* Scope and Constraints */
      sections.push('## Scope and Constraints');
      if (s2.aiOutput) {
        sections.push(s2.aiOutput);
      } else {
        sections.push('*(Stage 2 not yet completed)*');
      }
      sections.push('');

      /* Architecture */
      sections.push('## Architecture');
      if (s3.aiOutput) {
        sections.push(s3.aiOutput);
      } else {
        sections.push('*(Stage 3 not yet completed)*');
      }
      sections.push('');

      /* Build Plan */
      sections.push('## Build Plan');
      if (s4aiOutput) {
        sections.push(s4aiOutput);
      } else {
        sections.push('*(Stage 4 not yet completed)*');
      }
      sections.push('');

      /* Dynamic: decisions */
      sections.push('---');
      sections.push('');
      const allDecisionsSorted = (allDecisions || []).slice().reverse();
      const shownDecisions     = allDecisionsSorted.slice(0, 20);
      const hiddenDecisions    = allDecisionsSorted.length - shownDecisions.length;
      sections.push(`## Decisions (${(allDecisions || []).length} total)`);
      if (shownDecisions.length > 0) {
        for (const d of shownDecisions) {
          sections.push(`- ${d.title}${d.decision && d.decision !== d.title ? ': ' + d.decision : ''}`);
        }
        if (hiddenDecisions > 0) sections.push(`*(${hiddenDecisions} older decisions not shown)*`);
      } else {
        sections.push('*(No decisions logged yet)*');
      }
      sections.push('');

      /* Dynamic: sessions */
      const allSessionsSorted = (allSessions || []).slice().reverse();
      const shownSessions     = allSessionsSorted.slice(0, 15);
      const hiddenSessions    = allSessionsSorted.length - shownSessions.length;
      sections.push(`## Session Log (${(allSessions || []).length} sessions)`);
      if (shownSessions.length > 0) {
        for (const s of shownSessions) {
          const date = s.startedAt ? new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          const goal = s.goal ? ` Goal: ${s.goal}.` : '';
          sections.push(`- ${date} | ${s.phaseName || 'Unknown phase'} |${goal} ${s.accomplishment || 'No note'}`);
        }
        if (hiddenSessions > 0) sections.push(`*(${hiddenSessions} older sessions not shown)*`);
      } else {
        sections.push('*(No sessions completed yet)*');
      }
      sections.push('');

      /* Dynamic: build status */
      sections.push('## Current Build Status');
      const stats = this.planStats;
      sections.push(`Features complete: ${stats.complete} / ${stats.total}`);
      if (this.plan.phases.length > 0) {
        const inProgressPhase = this.plan.phases.find(ph =>
          ph.features.some(f => f.status === 'in_progress' || f.status === 'not_started')
        );
        if (inProgressPhase) sections.push(`Current phase: ${inProgressPhase.name}`);
      }

      return sections.join('\n');
    },

    async refreshContext() {
      const TIMEOUT_MS = 8000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Context generation timed out after 8 seconds')), TIMEOUT_MS)
      );
      const [allDecisions, allSessions] = await Promise.race([
        Promise.all([
          DB.getDecisions(Number(this.projectId)),
          DB.getSessions(Number(this.projectId)),
        ]),
        timeoutPromise,
      ]);
      this.contextDocument       = await this._buildContextDocument();
      this.contextUpdatedAt      = new Date().toISOString();
      this.contextDecisionsCount = (allDecisions || []).length;
      this.contextSessionsCount  = (allSessions  || []).length;
      this.contextStale          = false;
      await this._persist();
    },

    async checkContextStaleness() {
      const [allDecisions, allSessions] = await Promise.all([
        DB.getDecisions(Number(this.projectId)),
        DB.getSessions(Number(this.projectId)),
      ]);
      this.contextStale = (allDecisions || []).length !== this.contextDecisionsCount
                       || (allSessions  || []).length !== this.contextSessionsCount;
    },

    async copyContextDocument() {
      await this._generateContextDocIfNeeded();
      if (!this.contextDocument) return;
      try {
        await navigator.clipboard.writeText(this.contextDocument);
        this.contextCopySuccess = true;
        setTimeout(() => { this.contextCopySuccess = false; }, 2000);
      } catch (e) {
        window.dispatchEvent(new CustomEvent('hora:toast', { detail: { message: 'Clipboard access denied. Use the download button instead.', type: 'error' } }));
      }
    },

    async downloadContextDocument() {
      await this._generateContextDocIfNeeded();
      if (!this.contextDocument) return;
      const safeName = (this.project?.name || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `${safeName}-context.md`;
      const blob = new Blob([this.contextDocument], { type: 'text/markdown' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    _formatDate(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      const now = new Date();
      const opts = { month: 'short', day: 'numeric' };
      if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
      return d.toLocaleDateString('en-US', opts);
    },

    /* --------------------------------------------------------
       Log View — feed
    -------------------------------------------------------- */
    async loadLogFeed() {
      this.logLoading = true;
      const [allDecisions, allSessions] = await Promise.all([
        DB.getDecisions(Number(this.projectId)),
        DB.getSessions(Number(this.projectId)),
      ]);

      const feed = [];

      for (const s of (allSessions || [])) {
        feed.push({
          type:              'session',
          at:                s.completedAt || s.startedAt,
          id:                s.id,
          phaseName:         s.phaseName || '',
          goal:              s.goal || '',
          accomplishment:    s.accomplishment || '',
          decisionsLogged:   s.decisionsLogged || 0,
          planChangeFlagged: s.planChangeFlagged || false,
          startedAt:         s.startedAt,
        });
      }

      for (const d of (allDecisions || [])) {
        feed.push({
          type:        'decision',
          at:          d.createdAt,
          id:          d.id,
          title:       d.title,
          decision:    d.decision,
          context:     d.context || '',
          stageNumber: d.stageNumber,
        });
      }

      /* Plan revisions: each feature's history array records { at, from }.
         The "to" status is inferred from the next entry's "from", or the current status. */
      for (let pi = 0; pi < this.plan.phases.length; pi++) {
        const phase = this.plan.phases[pi];
        for (let fi = 0; fi < phase.features.length; fi++) {
          const feature = phase.features[fi];
          const history = feature.history || [];
          for (let hi = 0; hi < history.length; hi++) {
            const entry    = history[hi];
            const toStatus = hi < history.length - 1 ? history[hi + 1].from : feature.status;
            feed.push({
              type:          'planchange',
              at:            entry.at,
              phaseName:     phase.name,
              featureName:   feature.text,
              fromStatus:    entry.from,
              toStatus,
              changeNote:    toStatus === 'changed'  ? feature.changeNote    : '',
              removedReason: toStatus === 'removed'  ? feature.removedReason : '',
            });
          }
        }
      }

      feed.sort((a, b) => new Date(b.at) - new Date(a.at));
      this.logFeed   = feed;
      this.logLoading = false;
    },


    /* --------------------------------------------------------
       Persist
    -------------------------------------------------------- */
    _buildPersistData() {
      return {
        /* Build Setup */
        buildSetupComplete:    this.buildSetupComplete,
        buildSetupStep:        this.buildSetupStep,
        specificTool:          this.specificTool,
        buildSetupUnsure:      this.buildSetupUnsure,
        buildSetupOs:          this.buildSetupOs,
        buildSetupExperienced: this.buildSetupExperienced,
        appNeedsApiCalls:      this.appNeedsApiCalls,
        skipContextBlock:      this.skipContextBlock,
        /* Context document metadata (document itself is regenerated on load) */
        contextUpdatedAt:      this.contextUpdatedAt,
        contextDecisionsCount: this.contextDecisionsCount,
        contextSessionsCount:  this.contextSessionsCount,
        contextExpanded:       this.contextExpanded,
        /* Plan — serialise through JSON to strip any reactive proxy metadata */
        setupComplete: this.setupComplete,
        plan:          JSON.parse(JSON.stringify(this.plan)),
        subView:       this.subView,
        activeSession: this.activeSession ? JSON.parse(JSON.stringify(this.activeSession)) : null,
      };
    },

    async _persist() {
      try {
        await DB.saveStageRecord(Number(this.projectId), 5, this._buildPersistData(), 'in_progress');
      } catch (e) {
        console.error('[Hora] Stage 5 persist failed.');
        return;
      }
      window.dispatchEvent(new CustomEvent('hora:stage-saved', { detail: { projectId: Number(this.projectId) } }));
    },

    /* --------------------------------------------------------
       Computed helpers
    -------------------------------------------------------- */
    get sessionCanStart() {
      return this.sessionForm.phaseIndex !== null
          && this.sessionForm.goal.trim().length > 0
          && !this.activeSession;
    },

    get activePhaseFeaturesForSession() {
      const idx = this.sessionForm.phaseIndex;
      if (idx === null) return [];
      const phase = this.plan.phases[idx];
      if (!phase) return [];
      return phase.features
        .map((f, i) => ({ ...f, _index: i }))
        .filter(f => f.status !== 'removed' && f.status !== 'complete');
    },

    get planStats() {
      let total = 0, complete = 0;
      for (const phase of (this.plan.phases || [])) {
        for (const f of (phase.features || [])) {
          if (f.status !== 'removed') {
            total++;
            if (f.status === 'complete') complete++;
          }
        }
      }
      return { total, complete };
    },

    featureStatusLabel(status) {
      return {
        not_started: 'Not started',
        in_progress: 'In progress',
        complete:    'Complete',
        changed:     'Changed',
        removed:     'Removed',
      }[status] || status;
    },

    formatDateTime(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
           + ' at '
           + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    },

    renderMarkdown(text) {
      if (!text) return '';
      return DOMPurify.sanitize(marked.parse(text));
    },

  };
}
