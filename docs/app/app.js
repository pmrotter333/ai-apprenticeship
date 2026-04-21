/* ============================================================
   Hora — Root Alpine Component (app.js)
   Handles routing, global state, and project CRUD.
   All views live in index.html and are toggled via x-show.
   ============================================================ */

const STAGE_META = [
  null, // 1-indexed; index 0 unused
  { number: 1, name: 'Problem Definition',  desc: 'Articulate your frustrations and define precisely what is broken and why.' },
  { number: 2, name: 'Constraint Scoping',  desc: 'Define hard constraints, benchmark existing solutions, and tier your features.' },
  { number: 3, name: 'Architecture',        desc: 'Design your system with AI as advisor, retaining every decision yourself.' },
  { number: 4, name: 'Plan',                 desc: 'Generate your build plan with AI, then review and confirm before building.' },
  { number: 5, name: 'Build',                desc: 'Set up your build environment and execute your plan with AI guidance.' },
];

const DOCUMENT_META = [
  null,
  { title: 'Problem Definition Document',   filename: 'problem-definition',  desc: 'Your problem, goal, constraints, and stakeholders — the foundation for everything that follows.' },
  { title: 'Constraint and Scope Document', filename: 'constraint-scope',    desc: 'Hard limits, benchmarks, and feature priorities that bound your solution.' },
  { title: 'Architecture Design Document',  filename: 'architecture-design', desc: 'System design and technology decisions.' },
  { title: 'Build Plan',                    filename: 'build-plan',          desc: 'Phases, features, and build sequence.' },
  { title: 'Project Context Document',      filename: 'project-context',     desc: 'Full project context for your AI tool. Auto-refreshes after each session.' },
];

const PROJECT_TYPES = [
  { value: 'app',           label: 'App',           desc: 'A program, web app, script, or tool.' },
  { value: 'website',       label: 'Website',       desc: 'A public or internal site, landing page, or content hub.' },
  { value: 'document',      label: 'Document',      desc: 'A structured artifact: spec, playbook, framework, or guide.' },
  { value: 'workflow',      label: 'Workflow',       desc: 'A repeatable process, automation, or way of working.' },
  { value: 'integration',   label: 'Integration',   desc: 'Connecting two systems, an API bridge, or a sync job.' },
  { value: 'internal-tool', label: 'Internal tool', desc: 'An admin panel, dashboard, or operations utility.' },
];

const BUILD_TOOLS = [
  { value: 'chat',   label: 'Chat AI',             desc: 'Claude.ai, ChatGPT, Gemini — thinking, planning, and non-code projects.', showCallout: false },
  { value: 'vibe',   label: 'Vibe coding platform', desc: 'Bolt, Lovable, Replit — build in-browser, no setup required.',           showCallout: false },
  { value: 'agent',  label: 'Coding agent',         desc: 'Claude Code, Cursor, Windsurf, Gemini, Codex — works in your codebase via terminal or IDE extension.',       showCallout: true  },
  { value: 'nocode', label: 'No-code tools',        desc: 'Zapier, Notion, Airtable — automation and workflow tools.',               showCallout: false },
  { value: 'unsure', label: 'Not sure yet',         desc: "I haven't decided how I'll build this.",                                  showCallout: false },
];

function app() {
  return {

    /* --------------------------------------------------------
       Routing
    -------------------------------------------------------- */
    view: 'home',
    projectId: null,
    stageNumber: null,

    /* --------------------------------------------------------
       Data
    -------------------------------------------------------- */
    projects: [],
    activeProject: null,
    activeStageRecords: [],

    /* --------------------------------------------------------
       New project form
    -------------------------------------------------------- */
    wizard: { name: '', description: '', projectType: 'app', buildTool: 'unsure' },
    wizardErrors: {},
    wizardSaving: false,

    /* --------------------------------------------------------
       Project settings (rename / delete)
    -------------------------------------------------------- */
    editingProjectName: false,
    editProjectName: '',
    confirmDelete: false,

    /* --------------------------------------------------------
       Project settings form
    -------------------------------------------------------- */
    settingsForm:   { name: '', description: '', projectType: 'app', buildTool: 'unsure' },
    settingsSaving: false,
    settingsSaved:  false,
    settingsErrors: {},

    /* --------------------------------------------------------
       UI state
    -------------------------------------------------------- */
    sidebarOpen: false,
    toast: { visible: false, message: '', type: 'success' },
    _toastTimer: null,
    swUpdateAvailable: false,
    backupNudgeVisible: false,
    _activeTimer: null,
    _activeMinutesSinceBackup: 0,
    installCalloutVisible: false,
    faqOpenItem: null,
    onboardingVisible: false,

    /* --------------------------------------------------------
       Decision modal
    -------------------------------------------------------- */
    decisionModal: { open: false, text: '', category: null, saving: false, saved: false },

    /* Restore confirmation modal */
    restoreConfirmModal: { open: false, file: null, projectCount: 0 },

    /* Documents view */
    documentCopySuccess:   null,
    documentsContextDoc:   null,
    documentsLoading:      false,
    attachmentEntries:     [],
    attachmentUploading:   false,
    attachmentDeleteConfirm: null,
    attachmentCopySuccess: null,

    /* Home dashboard card data */
    projectCardData: {},

    /* Decisions view */
    journalEntries:        [],
    journalLoading:        false,
    journalDeleteConfirm:  null,
    journalEditId:         null,
    journalEditForm:       { decision: '', category: null },
    journalFilterStage:    null,
    journalFilterCategory: null,
    journalSearch:         '',

    /* Notes view */
    noteEntries:       [],
    noteLoading:       false,
    noteFormVisible:   false,
    noteForm:          { title: '', content: '' },
    noteFormSaving:    false,
    noteDeleteConfirm: null,
    noteEditId:        null,
    noteEditForm:      { title: '', content: '' },
    noteSearch:        '',

    /* --------------------------------------------------------
       Constants exposed to templates
    -------------------------------------------------------- */
    stageMeta: STAGE_META,
    documentMeta: DOCUMENT_META,
    projectTypes: PROJECT_TYPES,
    buildTools: BUILD_TOOLS,

    /* --------------------------------------------------------
       Init
    -------------------------------------------------------- */
    async init() {
      /* Register service worker and listen for updates */
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.swUpdateAvailable = true;
              }
            });
          });
        }).catch(() => {/* non-fatal */});

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }

      /* Load all projects */
      this.projects = await DB.getAllProjects();

      /* First-run onboarding */
      if (!localStorage.getItem('hora_onboardingDismissed') && this.projects.length === 0) {
        this.onboardingVisible = true;
      }

      /* Handle initial route and listen for hash changes */
      await this.handleRoute();
      window.addEventListener('hashchange', () => this.handleRoute());

      /* PWA install prompt */
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        this._installPrompt = e;
      });

      /* Show toasts dispatched by stage components or the DB error handler */
      window.addEventListener('hora:toast', e => {
        this.showToast(e.detail.message, e.detail.type || 'success');
      });
      window.addEventListener('hora:db-error', e => {
        this.showToast('Storage error: ' + e.detail.message, 'error');
      });

      /* Refresh stage records when a stage component saves */
      window.addEventListener('hora:stage-saved', async (e) => {
        if (this.activeProject && e.detail.projectId === this.projectId) {
          this.activeStageRecords = await DB.getAllStageRecords(this.projectId);
        }
      });

      /* Active-time tracking for backup nudge */
      try { this._activeMinutesSinceBackup = parseInt(localStorage.getItem('hora_totalActiveMinutes') || '0', 10); } catch (_) {}
      this._startActiveTimer();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this._stopActiveTimer();
        } else {
          this._startActiveTimer();
        }
      });
    },

    _startActiveTimer() {
      if (this._activeTimer) return;
      this._activeTimer = setInterval(() => {
        this._activeMinutesSinceBackup++;
        try { localStorage.setItem('hora_totalActiveMinutes', String(this._activeMinutesSinceBackup)); } catch (_) {}
        if (this._activeMinutesSinceBackup >= 180 && !this.backupNudgeVisible) {
          /* Don't show mid-session in Stage 5 */
          const inActiveSession = this.view === 'stage' && this.stageNumber === 5;
          if (!inActiveSession) this.backupNudgeVisible = true;
        }
      }, 60000);
    },

    _stopActiveTimer() {
      if (this._activeTimer) {
        clearInterval(this._activeTimer);
        this._activeTimer = null;
      }
    },

    dismissOnboarding() {
      this.onboardingVisible = false;
      try { localStorage.setItem('hora_onboardingDismissed', '1'); } catch (_) {}
    },

    startFirstProject() {
      this.dismissOnboarding();
      this.go('project/new');
    },

    dismissBackupNudge() {
      this.backupNudgeVisible = false;
      this._activeMinutesSinceBackup = 0;
      try { localStorage.setItem('hora_totalActiveMinutes', '0'); } catch (_) {}
    },

    /* --------------------------------------------------------
       Router
    -------------------------------------------------------- */
    async handleRoute() {
      const hash  = window.location.hash.replace(/^#\/?/, '');
      const parts = hash.split('/').filter(Boolean);

      this.sidebarOpen = false;

      if (parts.length === 0) {
        this.view = 'home';
        this.projectId = null;
        this.activeProject = null;
        this.activeStageRecords = [];
        await this.loadHomeCardData();
        return;
      }

      if (parts[0] === 'project' && parts[1] === 'new') {
        this.view = 'project-new';
        this.wizard = { name: '', description: '', projectType: 'app', buildTool: 'unsure' };
        this.wizardErrors = {};
        return;
      }

      if (parts[0] === 'settings') {
        this.view = 'settings';
        return;
      }

      if (parts[0] === 'guide' && parts[1] === 'build-tools') {
        this.view = 'guide-build-tools';
        return;
      }

      if (parts[0] === 'help') {
        this.view = 'help';
        return;
      }

      if (parts[0] === 'project' && parts[1]) {
        this.projectId = Number(parts[1]);
        await this._loadActiveProject();

        if (!this.activeProject) {
          this.view = 'home';
          this.go('');
          return;
        }

        if (parts[2] === 'stage' && parts[3]) {
          this.stageNumber = Number(parts[3]);
          this.view = 'stage';
        } else if (parts[2] === 'documents') {
          this.view = 'documents';
          await this.loadDocuments();
        } else if (parts[2] === 'decisions') {
          this.view = 'decisions';
          await this.loadJournal();
        } else if (parts[2] === 'notes') {
          this.view = 'notes';
          await this.loadNotes();
        } else if (parts[2] === 'settings') {
          this.view = 'project-settings';
          this.initSettingsForm();
        } else {
          this.view = 'project-home';
        }
      }
    },

    async _loadActiveProject() {
      this.activeProject = await DB.getProject(this.projectId);
      this.activeStageRecords = this.activeProject
        ? await DB.getAllStageRecords(this.projectId)
        : [];
    },

    go(path) {
      window.location.hash = path ? '/' + path : '/';
    },

    /* --------------------------------------------------------
       Project CRUD
    -------------------------------------------------------- */
    async createProject() {
      this.wizardErrors = {};
      if (!this.wizard.name.trim()) {
        this.wizardErrors.name = 'A project name is required.';
        return;
      }
      this.wizardSaving = true;
      try {
        const id = await DB.createProject({
          name:        this.wizard.name.trim(),
          description: this.wizard.description.trim(),
          projectType: this.wizard.projectType,
          buildTool:   this.wizard.buildTool,
        });
        this.projects = await DB.getAllProjects();
        this.showToast('Project created');
        this.go('project/' + id);
      } finally {
        this.wizardSaving = false;
      }
    },

    async renameProject() {
      const name = this.editProjectName.trim();
      if (!name || !this.activeProject) return;
      try {
        await DB.updateProject(this.activeProject.id, { name });
        this.activeProject.name = name;
        this.projects = await DB.getAllProjects();
        this.editingProjectName = false;
        this.showToast('Project renamed');
      } catch (e) {
        this.showToast('Could not rename project: ' + e.message, 'error');
      }
    },

    async deleteProject() {
      if (!this.activeProject) return;
      try {
        await DB.deleteProject(this.activeProject.id);
        this.projects = await DB.getAllProjects();
        this.confirmDelete = false;
        this.showToast('Project deleted');
        this.go('');
      } catch (e) {
        this.showToast('Could not delete project: ' + e.message, 'error');
      }
    },

    /* --------------------------------------------------------
       Project settings
    -------------------------------------------------------- */
    initSettingsForm() {
      if (!this.activeProject) return;
      this.settingsForm = {
        name:        this.activeProject.name,
        description: this.activeProject.description || '',
        projectType: this.activeProject.projectType || 'software',
        buildTool:   this.activeProject.buildTool   || 'unsure',
      };
      this.settingsErrors = {};
      this.settingsSaved  = false;
    },

    async saveProjectSettings() {
      this.settingsErrors = {};
      const name = this.settingsForm.name.trim();
      if (!name) {
        this.settingsErrors.name = 'A project name is required.';
        return;
      }
      this.settingsSaving = true;
      try {
        const updates = {
          name,
          description: this.settingsForm.description.trim(),
          projectType: this.settingsForm.projectType,
          buildTool:   this.settingsForm.buildTool,
        };
        await DB.updateProject(this.activeProject.id, updates);
        Object.assign(this.activeProject, updates);
        this.projects = await DB.getAllProjects();
        this.settingsSaved = true;
        this.showToast('Settings saved');
        setTimeout(() => { this.settingsSaved = false; }, 3000);
      } finally {
        this.settingsSaving = false;
      }
    },

    /* --------------------------------------------------------
       Decision modal
    -------------------------------------------------------- */
    openDecisionModal() {
      this.decisionModal = { open: true, text: '', category: null, saving: false, saved: false };
    },

    async saveDecision() {
      const text = this.decisionModal.text.trim();
      if (!text || !this.activeProject) return;
      this.decisionModal.saving = true;
      try {
        const stageNum = (this.view === 'stage' && this.stageNumber) ? this.stageNumber : null;
        const titlePreview = text.length > 60 ? text.substring(0, 57) + '...' : text;
        const ctx = this.decisionModal.category ? 'Category: ' + this.decisionModal.category : '';
        await DB.addDecision(this.activeProject.id, stageNum, {
          title:    titlePreview,
          decision: text,
          context:  ctx,
        });
        this.decisionModal.saved = true;
        setTimeout(() => { this.decisionModal.open = false; }, 1500);
      } finally {
        this.decisionModal.saving = false;
      }
    },

    /* --------------------------------------------------------
       Documents
    -------------------------------------------------------- */
    async loadDocuments() {
      if (!this.activeProject) return;
      this.documentsLoading = true;
      const [doc, attachments] = await Promise.all([
        this._buildContextDoc(),
        DB.getAttachments(this.projectId),
      ]);
      this.documentsContextDoc = doc;
      this.attachmentEntries   = (attachments || []).slice().reverse();
      this.documentsLoading    = false;
    },

    async _buildContextDoc() {
      const s1 = this.stageRecord(1)?.data || {};
      const s2 = this.stageRecord(2)?.data || {};
      const s3 = this.stageRecord(3)?.data || {};
      const s4 = this.stageRecord(4)?.data || {};
      const s5 = this.stageRecord(5)?.data || {};

      const [allDecisions, allSessions] = await Promise.all([
        DB.getDecisions(Number(this.projectId)),
        DB.getSessions(Number(this.projectId)),
      ]);

      const TOOL_LABELS = { chat: 'Chat AI', vibe: 'Vibe coding platform', agent: 'Coding agent', nocode: 'No-code tools', unsure: 'Not decided' };
      const toolLabel = s5.specificTool && !s5.buildSetupUnsure
        ? s5.specificTool
        : (TOOL_LABELS[this.activeProject?.buildTool] || 'AI tool');

      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const lines = [];

      lines.push(`# Project Context: ${this.activeProject?.name || 'My Project'}`);
      lines.push(`*Tool: ${toolLabel} | Updated: ${now}*`);
      lines.push('');

      lines.push("## Problem We're Solving");
      if (s1.answers?.goal)         lines.push(`**Goal:** ${s1.answers.goal}`);
      if (s1.answers?.domain)       lines.push(`**Domain:** ${s1.answers.domain}`);
      if (s1.answers?.frustrations) lines.push(`**Key frustrations:** ${s1.answers.frustrations}`);
      if (s1.answers?.constraints)  lines.push(`**Constraints:** ${s1.answers.constraints}`);
      if (s1.answers?.stakeholders) lines.push(`**Who is affected:** ${s1.answers.stakeholders}`);
      if (!s1.answers?.goal && !s1.answers?.domain) lines.push('*(Stage 1 not yet completed)*');
      lines.push('');

      if (s1.aiOutput) {
        lines.push('## Problem Definition Document');
        lines.push(s1.aiOutput);
        lines.push('');
      }

      lines.push('## Scope and Constraints');
      lines.push(s2.aiOutput || '*(Stage 2 not yet completed)*');
      lines.push('');

      lines.push('## Architecture');
      lines.push(s3.aiOutput || '*(Stage 3 not yet completed)*');
      lines.push('');

      lines.push('## Build Plan');
      lines.push(s4.aiOutput || '*(Stage 4 not yet completed)*');
      lines.push('');

      lines.push('---');
      lines.push('');
      const allDecisionsSorted = (allDecisions || []).slice().reverse();
      const shownDecisions     = allDecisionsSorted.slice(0, 20);
      const hiddenDecisions    = allDecisionsSorted.length - shownDecisions.length;
      lines.push(`## Decisions (${(allDecisions || []).length} total)`);
      if (shownDecisions.length > 0) {
        for (const d of shownDecisions) {
          lines.push(`- ${d.title}${d.decision && d.decision !== d.title ? ': ' + d.decision : ''}`);
        }
        if (hiddenDecisions > 0) lines.push(`*(${hiddenDecisions} older decisions not shown)*`);
      } else {
        lines.push('*(No decisions logged yet)*');
      }
      lines.push('');

      const allSessionsSorted = (allSessions || []).slice().reverse();
      const shownSessions     = allSessionsSorted.slice(0, 15);
      const hiddenSessions    = allSessionsSorted.length - shownSessions.length;
      lines.push(`## Session Log (${(allSessions || []).length} sessions)`);
      if (shownSessions.length > 0) {
        for (const s of shownSessions) {
          const date = s.startedAt ? new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          const goal = s.goal ? ` Goal: ${s.goal}.` : '';
          lines.push(`- ${date} | ${s.phaseName || 'Unknown phase'} |${goal} ${s.accomplishment || 'No note'}`);
        }
        if (hiddenSessions > 0) lines.push(`*(${hiddenSessions} older sessions not shown)*`);
      } else {
        lines.push('*(No sessions completed yet)*');
      }
      lines.push('');

      const plan = s5.plan;
      if (plan?.phases?.length > 0) {
        let complete = 0, total = 0;
        plan.phases.forEach(ph => (ph.features || []).forEach(f => {
          if (f.status !== 'removed') total++;
          if (f.status === 'complete') complete++;
        }));
        lines.push('## Current Build Status');
        lines.push(`Features complete: ${complete} / ${total}`);
        const active = plan.phases.find(ph => (ph.features || []).some(f => f.status === 'in_progress' || f.status === 'not_started'));
        if (active) lines.push(`Current phase: ${active.name}`);
      }

      return lines.join('\n');
    },

    _getDocumentContent(stageNum) {
      if (stageNum === 5) return this.documentsContextDoc || this.stageRecord(5)?.data?.contextDocument || null;
      const r = this.stageRecord(stageNum);
      if (!r?.data) return null;
      return r.data.aiOutput || null;
    },

    _formatDocDate(iso) {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    async copyDocument(stageNum) {
      const content = this._getDocumentContent(stageNum);
      if (!content) return;
      try {
        await navigator.clipboard.writeText(content);
        this.documentCopySuccess = stageNum;
        setTimeout(() => { if (this.documentCopySuccess === stageNum) this.documentCopySuccess = null; }, 2000);
      } catch (e) { /* clipboard unavailable */ }
    },

    downloadDocument(stageNum) {
      const content = this._getDocumentContent(stageNum);
      if (!content) return;
      const meta = DOCUMENT_META[stageNum];
      const projectName = (this.activeProject?.name || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `${projectName}-${meta.filename}.md`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    async handleAttachmentUpload(event) {
      const file = event.target.files?.[0];
      if (!file || !this.activeProject) return;
      const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
      if (file.size > MAX_BYTES) {
        this.showToast('File too large. Maximum size is 50 MB.', 'error');
        event.target.value = '';
        return;
      }
      this.attachmentUploading = true;
      try {
        const content = await file.text();
        await DB.addAttachment(this.activeProject.id, {
          name: file.name,
          content,
          mimeType: file.type || 'text/plain',
          size: file.size,
        });
        this.attachmentEntries = (await DB.getAttachments(this.projectId)).slice().reverse();
      } catch (e) {
        this.showToast('Could not upload file: ' + (e.message || 'unknown error'), 'error');
      }
      this.attachmentUploading = false;
      event.target.value = '';
    },

    async copyAttachment(id) {
      const entry = this.attachmentEntries.find(a => a.id === id);
      if (!entry?.content) return;
      try {
        await navigator.clipboard.writeText(entry.content);
        this.attachmentCopySuccess = id;
        setTimeout(() => { if (this.attachmentCopySuccess === id) this.attachmentCopySuccess = null; }, 2000);
      } catch (e) { /* ignore */ }
    },

    downloadAttachment(id) {
      const entry = this.attachmentEntries.find(a => a.id === id);
      if (!entry?.content) return;
      const blob = new Blob([entry.content], { type: entry.mimeType || 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = entry.name;
      a.click();
      URL.revokeObjectURL(url);
    },

    async confirmDeleteAttachment(id) {
      if (this.attachmentDeleteConfirm === id) {
        await DB.deleteAttachment(id);
        this.attachmentEntries      = this.attachmentEntries.filter(a => a.id !== id);
        this.attachmentDeleteConfirm = null;
      } else {
        this.attachmentDeleteConfirm = id;
        setTimeout(() => { if (this.attachmentDeleteConfirm === id) this.attachmentDeleteConfirm = null; }, 3000);
      }
    },

    /* --------------------------------------------------------
       Decision Journal
    -------------------------------------------------------- */
    async loadJournal() {
      if (!this.activeProject) return;
      this.journalLoading       = true;
      this.journalDeleteConfirm = null;
      const all = await DB.getDecisions(this.activeProject.id);
      this.journalEntries = (all || []).slice().reverse();
      this.journalLoading = false;
    },

    async confirmDeleteDecision(id) {
      if (this.journalDeleteConfirm === id) {
        try {
          await DB.deleteDecision(id);
          this.journalEntries       = this.journalEntries.filter(e => e.id !== id);
          this.journalDeleteConfirm = null;
        } catch (e) {
          this.showToast('Could not delete decision: ' + e.message, 'error');
        }
      } else {
        this.journalDeleteConfirm = id;
        setTimeout(() => {
          if (this.journalDeleteConfirm === id) this.journalDeleteConfirm = null;
        }, 3000);
      }
    },

    startEditDecision(entry) {
      this.journalEditId   = entry.id;
      this.journalEditForm = {
        decision: entry.decision || entry.title || '',
        category: entry.context?.startsWith('Category: ') ? entry.context.replace('Category: ', '') : null,
      };
    },

    cancelEditDecision() {
      this.journalEditId = null;
    },

    async saveEditDecision(id) {
      const decision = this.journalEditForm.decision.trim();
      if (!decision) return;
      const title   = decision.length > 60 ? decision.substring(0, 57) + '...' : decision;
      const context = this.journalEditForm.category ? 'Category: ' + this.journalEditForm.category : '';
      try {
        await DB.updateDecision(id, { title, decision, context });
        const entry = this.journalEntries.find(e => e.id === id);
        if (entry) { entry.title = title; entry.decision = decision; entry.context = context; }
        this.journalEditId = null;
        this.showToast('Decision updated');
      } catch (e) {
        this.showToast('Could not save decision: ' + e.message, 'error');
      }
    },

    get filteredJournalEntries() {
      return this.journalEntries.filter(e => {
        if (this.journalFilterStage !== null && e.stageNumber !== this.journalFilterStage) return false;
        if (this.journalFilterCategory !== null) {
          const cat = e.context?.startsWith('Category: ') ? e.context.replace('Category: ', '') : null;
          if (cat !== this.journalFilterCategory) return false;
        }
        if (this.journalSearch) {
          const q = this.journalSearch.toLowerCase();
          if (!e.decision?.toLowerCase().includes(q) && !e.title?.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    },

    /* --------------------------------------------------------
       Notes
    -------------------------------------------------------- */
    async loadNotes() {
      if (!this.activeProject) return;
      this.noteLoading       = true;
      this.noteDeleteConfirm = null;
      const all = await DB.getNotes(this.activeProject.id);
      this.noteEntries = (all || []).slice().reverse();
      this.noteLoading = false;
    },

    async saveNote() {
      const content = this.noteForm.content.trim();
      if (!content || !this.activeProject) return;
      this.noteFormSaving = true;
      try {
        await DB.addNote(this.activeProject.id, {
          title:       this.noteForm.title.trim(),
          content,
          stageNumber: null,
        });
        this.noteForm        = { title: '', content: '' };
        this.noteFormVisible = false;
        await this.loadNotes();
        this.showToast('Note saved');
      } finally {
        this.noteFormSaving = false;
      }
    },

    async confirmDeleteNote(id) {
      if (this.noteDeleteConfirm === id) {
        try {
          await DB.deleteNote(id);
          this.noteEntries       = this.noteEntries.filter(e => e.id !== id);
          this.noteDeleteConfirm = null;
        } catch (e) {
          this.showToast('Could not delete note: ' + e.message, 'error');
        }
      } else {
        this.noteDeleteConfirm = id;
        setTimeout(() => {
          if (this.noteDeleteConfirm === id) this.noteDeleteConfirm = null;
        }, 3000);
      }
    },

    startEditNote(entry) {
      this.noteEditId   = entry.id;
      this.noteEditForm = { title: entry.title || '', content: entry.content || '' };
    },

    cancelEditNote() {
      this.noteEditId = null;
    },

    async saveEditNote(id) {
      const content = this.noteEditForm.content.trim();
      if (!content) return;
      try {
        await DB.updateNote(id, { title: this.noteEditForm.title.trim(), content });
        const entry = this.noteEntries.find(e => e.id === id);
        if (entry) { entry.title = this.noteEditForm.title.trim(); entry.content = content; }
        this.noteEditId = null;
        this.showToast('Note updated');
      } catch (e) {
        this.showToast('Could not save note: ' + e.message, 'error');
      }
    },

    get filteredNoteEntries() {
      if (!this.noteSearch) return this.noteEntries;
      const q = this.noteSearch.toLowerCase();
      return this.noteEntries.filter(e =>
        e.content?.toLowerCase().includes(q) || e.title?.toLowerCase().includes(q)
      );
    },

    /* --------------------------------------------------------
       Home dashboard card data
    -------------------------------------------------------- */
    async loadHomeCardData() {
      if (!this.projects.length) return;
      const results = await Promise.all(
        this.projects.map(async p => {
          const [stages, decisions, sessions] = await Promise.all([
            DB.getAllStageRecords(p.id),
            DB.getDecisions(p.id),
            DB.getSessions(p.id),
          ]);
          let lastActivity = p.updatedAt || p.createdAt;
          if (decisions.length > 0) {
            const d = decisions[decisions.length - 1].createdAt;
            if (d > lastActivity) lastActivity = d;
          }
          if (sessions.length > 0) {
            const s = sessions[sessions.length - 1].completedAt;
            if (s > lastActivity) lastActivity = s;
          }
          return [p.id, { stages, decisionCount: decisions.length, sessionCount: sessions.length, lastActivity }];
        })
      );
      const data = {};
      for (const [id, val] of results) data[id] = val;
      this.projectCardData = data;
    },

    cardStageStatus(projectId, stageNum) {
      const d = this.projectCardData[projectId];
      if (!d) return 'not_started';
      return d.stages.find(s => s.stageNumber === stageNum)?.status || 'not_started';
    },

    cardCurrentStageLabel(projectId) {
      const d = this.projectCardData[projectId];
      if (!d) return null;
      for (let s = 1; s <= 5; s++) {
        const r = d.stages.find(st => st.stageNumber === s);
        if (r?.status === 'in_progress') return 'Stage ' + s + ': ' + STAGE_META[s].name;
      }
      const allDone = [1,2,3,4,5].every(s => d.stages.find(st => st.stageNumber === s)?.status === 'complete');
      if (allDone) return 'All stages complete';
      for (let s = 1; s <= 5; s++) {
        const r = d.stages.find(st => st.stageNumber === s);
        if (!r || r.status === 'not_started') return 'Stage ' + s + ': ' + STAGE_META[s].name;
      }
      return null;
    },

    cardLastActivity(projectId) {
      const d = this.projectCardData[projectId];
      if (!d?.lastActivity) return null;
      const days = Math.floor((Date.now() - new Date(d.lastActivity).getTime()) / 86400000);
      if (days === 0) return 'Active today';
      if (days === 1) return 'Active yesterday';
      if (days < 30)  return days + 'd ago';
      return Math.floor(days / 30) + 'mo ago';
    },

    /* --------------------------------------------------------
       Stage helpers
    -------------------------------------------------------- */
    stageRecord(number) {
      return this.activeStageRecords.find(r => r.stageNumber === Number(number)) || null;
    },

    stageStatus(number) {
      return this.stageRecord(number)?.status || 'not_started';
    },

    stageStatusLabel(status) {
      return { not_started: 'Not started', in_progress: 'In progress', complete: 'Complete' }[status] || '';
    },

    isStageAccessible(number) {
      /* Stage 1 always accessible. Others require previous stage to be complete. */
      if (number === 1) return true;
      const prev = this.stageRecord(number - 1);
      return prev?.status === 'complete';
    },

    /* --------------------------------------------------------
       SW update
    -------------------------------------------------------- */
    async applyUpdate() {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage('SKIP_WAITING');
      }
    },

    dismissUpdate() {
      this.swUpdateAvailable = false;
    },

    /* --------------------------------------------------------
       PWA install
    -------------------------------------------------------- */
    get canInstall() {
      return !!this._installPrompt;
    },

    installApp() {
      if (!this._installPrompt) return;
      this.installCalloutVisible = true;
    },

    async confirmInstall() {
      if (!this._installPrompt) return;
      this.installCalloutVisible = false;
      this._installPrompt.prompt();
      const { outcome } = await this._installPrompt.userChoice;
      if (outcome === 'accepted') this._installPrompt = null;
    },

    cancelInstall() {
      this.installCalloutVisible = false;
    },

    /* --------------------------------------------------------
       Toast notifications
    -------------------------------------------------------- */
    showToast(message, type = 'success') {
      if (this._toastTimer) clearTimeout(this._toastTimer);
      this.toast = { visible: true, message, type };
      this._toastTimer = setTimeout(() => { this.toast.visible = false; }, 3000);
    },

    /* --------------------------------------------------------
       Formatting helpers
    -------------------------------------------------------- */
    formatDate(iso) {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    daysSince(iso) {
      if (!iso) return null;
      const diff = Date.now() - new Date(iso).getTime();
      return Math.floor(diff / 86400000);
    },

    projectTypeLabel(type) {
      return PROJECT_TYPES.find(t => t.value === type)?.label || type;
    },

    buildToolLabel(value) {
      return BUILD_TOOLS.find(t => t.value === value)?.label || value;
    },

    /* --------------------------------------------------------
       Data export / backup
    -------------------------------------------------------- */
    async downloadBackup() {
      const data = await DB.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `hora-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      try { localStorage.setItem('hora_lastBackupDate', now); } catch (_) {}
      try { localStorage.setItem('hora_totalActiveMinutes', '0'); } catch (_) {}
      this._activeMinutesSinceBackup = 0;
      this.backupNudgeVisible = false;
      this.showToast('Backup downloaded');
    },

    get lastBackupDate() {
      return localStorage.getItem('hora_lastBackupDate') || null;
    },

    async prepareRestore(file) {
      if (!file) return;
      let data;
      try {
        const text = await file.text();
        try {
          data = JSON.parse(text);
        } catch (_) {
          this.showToast('The backup file is corrupted or not a valid JSON file.', 'error');
          return;
        }
        this.restoreConfirmModal = {
          open: true,
          file,
          projectCount: (data.projects || []).length,
        };
      } catch (e) {
        this.showToast('Could not read backup file: ' + e.message, 'error');
      }
    },

    async confirmRestore() {
      const file = this.restoreConfirmModal.file;
      this.restoreConfirmModal = { open: false, file: null, projectCount: 0 };
      await this.restoreBackup(file);
    },

    async restoreBackup(file) {
      let data;
      try {
        const text = await file.text();
        try {
          data = JSON.parse(text);
        } catch (_) {
          this.showToast('The backup file is corrupted or not a valid JSON file.', 'error');
          return;
        }
        const skipped = await DB.importAll(data);
        this.projects = await DB.getAllProjects();
        const projectCount = (data.projects || []).length;
        const msg = skipped > 0
          ? `Backup restored — ${projectCount} project(s) loaded, ${skipped} malformed record(s) skipped`
          : `Backup restored — ${projectCount} project(s) loaded`;
        this.showToast(msg);
        this.go('');
      } catch (e) {
        this.showToast('Could not restore backup: ' + e.message, 'error');
      }
    },

  };
}
