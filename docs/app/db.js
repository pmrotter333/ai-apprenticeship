/* ============================================================
   Hora — Database Layer (db.js)
   Dexie.js wrapper around IndexedDB.
   All project data lives on the user's device — no server.
   ============================================================ */

const DB = (() => {

  const db = new Dexie('hora');

  db.version(1).stores({
    projects:      '++id, name, status, currentStage, createdAt, updatedAt',
    stageRecords:  '++id, [projectId+stageNumber], projectId, stageNumber, status, updatedAt',
    decisions:     '++id, projectId, stageNumber, createdAt',
    notes:         '++id, projectId, stageNumber, createdAt, updatedAt',
    attachments:   '++id, projectId, stageNumber, name, createdAt',
    conversations: '++id, projectId, stageNumber, updatedAt',
  });

  /* Version 2: add sessions table for Stage 5 execution tracking */
  db.version(2).stores({
    sessions: '++id, projectId, startedAt',
  });

  /* Surface IndexedDB-level errors (quota exceeded, blocked open, etc.) to the app */
  db.on('error', err => {
    console.error('[Hora] IndexedDB error:', err);
    window.dispatchEvent(new CustomEvent('hora:db-error', { detail: { message: err.message || String(err) } }));
  });

  /* ----------------------------------------------------------
     Projects
  ---------------------------------------------------------- */

  async function getAllProjects() {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  }

  async function getProject(id) {
    return db.projects.get(Number(id));
  }

  async function createProject({ name, description, projectType, buildTool }) {
    const now = new Date().toISOString();
    return db.projects.add({
      name,
      description,
      projectType,
      buildTool: buildTool || 'unsure',
      status: 'active',
      currentStage: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateProject(id, changes) {
    return db.projects.update(Number(id), {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteProject(id) {
    const numId = Number(id);
    await db.transaction('rw', db.projects, db.stageRecords, db.decisions, db.notes, db.attachments, db.conversations, db.sessions, async () => {
      await db.projects.delete(numId);
      await db.stageRecords.where({ projectId: numId }).delete();
      await db.decisions.where({ projectId: numId }).delete();
      await db.notes.where({ projectId: numId }).delete();
      await db.attachments.where({ projectId: numId }).delete();
      await db.conversations.where({ projectId: numId }).delete();
      await db.sessions.where({ projectId: numId }).delete();
    });
  }

  /* ----------------------------------------------------------
     Stage Records
  ---------------------------------------------------------- */

  async function getAllStageRecords(projectId) {
    return db.stageRecords.where({ projectId: Number(projectId) }).toArray();
  }

  async function getStageRecord(projectId, stageNumber) {
    return db.stageRecords
      .where('[projectId+stageNumber]')
      .equals([Number(projectId), Number(stageNumber)])
      .first();
  }

  async function saveStageRecord(projectId, stageNumber, data, status = 'in_progress') {
    const now = new Date().toISOString();
    const existing = await getStageRecord(projectId, stageNumber);
    if (existing) {
      return db.stageRecords.update(existing.id, { data, status, updatedAt: now });
    }
    return db.stageRecords.add({
      projectId: Number(projectId),
      stageNumber: Number(stageNumber),
      data,
      status,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function completeStage(projectId, stageNumber) {
    const now = new Date().toISOString();
    const existing = await getStageRecord(projectId, stageNumber);
    if (existing) {
      await db.stageRecords.update(existing.id, { status: 'complete', completedAt: now, updatedAt: now });
    }
    /* Advance project's currentStage if this is the current one */
    const project = await getProject(projectId);
    if (project && project.currentStage === Number(stageNumber) && stageNumber < 5) {
      await updateProject(projectId, { currentStage: Number(stageNumber) + 1 });
    }
  }

  /* ----------------------------------------------------------
     Decisions
  ---------------------------------------------------------- */

  async function getDecisions(projectId) {
    return db.decisions.where({ projectId: Number(projectId) }).sortBy('createdAt');
  }

  async function addDecision(projectId, stageNumber, { title, context, decision, alternatives, rationale }) {
    return db.decisions.add({
      projectId: Number(projectId),
      stageNumber: Number(stageNumber),
      title,
      context: context || '',
      decision,
      alternatives: alternatives || '',
      rationale: rationale || '',
      createdAt: new Date().toISOString(),
    });
  }

  async function updateDecision(id, { title, decision, context }) {
    return db.decisions.update(Number(id), { title, decision, context });
  }

  async function deleteDecision(id) {
    return db.decisions.delete(Number(id));
  }

  /* ----------------------------------------------------------
     Notes
  ---------------------------------------------------------- */

  async function getNotes(projectId) {
    return db.notes.where({ projectId: Number(projectId) }).sortBy('createdAt');
  }

  async function addNote(projectId, { stageNumber = null, title, content }) {
    const now = new Date().toISOString();
    return db.notes.add({
      projectId: Number(projectId),
      stageNumber: stageNumber ? Number(stageNumber) : null,
      title: title || '',
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateNote(id, { title, content }) {
    return db.notes.update(Number(id), {
      title: title || '',
      content,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteNote(id) {
    return db.notes.delete(Number(id));
  }

  /* ----------------------------------------------------------
     Sessions (Stage 5 build session log)
  ---------------------------------------------------------- */

  async function getSessions(projectId) {
    return db.sessions.where({ projectId: Number(projectId) }).sortBy('startedAt');
  }

  async function addSession({ projectId, phaseIndex, phaseName, featureIndices, featureNames, goal, startedAt, completedAt, accomplishment, planChangeFlagged, decisionsLogged }) {
    return db.sessions.add({
      projectId:         Number(projectId),
      phaseIndex:        phaseIndex ?? null,
      phaseName:         phaseName  || '',
      featureIndices:    featureIndices || [],
      featureNames:      featureNames   || [],
      goal:              goal           || '',
      startedAt:         startedAt      || new Date().toISOString(),
      completedAt:       completedAt    || new Date().toISOString(),
      accomplishment:    accomplishment || '',
      planChangeFlagged: planChangeFlagged || false,
      decisionsLogged:   decisionsLogged   || 0,
    });
  }

  async function updateSession(id, changes) {
    return db.sessions.update(Number(id), changes);
  }

  async function deleteSession(id) {
    return db.sessions.delete(Number(id));
  }

  /* ----------------------------------------------------------
     Attachments (user-uploaded reference documents)
  ---------------------------------------------------------- */

  async function getAttachments(projectId) {
    return db.attachments.where({ projectId: Number(projectId) }).sortBy('createdAt');
  }

  async function addAttachment(projectId, { name, content, mimeType, size }) {
    return db.attachments.add({
      projectId: Number(projectId),
      stageNumber: null,
      name,
      content,
      mimeType: mimeType || 'text/plain',
      size: size || 0,
      createdAt: new Date().toISOString(),
    });
  }

  async function deleteAttachment(id) {
    return db.attachments.delete(Number(id));
  }

  /* ----------------------------------------------------------
     Conversations (AI session history for Tier 3)
  ---------------------------------------------------------- */

  async function getConversation(projectId, stageNumber) {
    return db.conversations
      .where({ projectId: Number(projectId), stageNumber: Number(stageNumber) })
      .first();
  }

  async function saveConversation(projectId, stageNumber, messages) {
    const now = new Date().toISOString();
    const existing = await getConversation(projectId, stageNumber);
    if (existing) {
      return db.conversations.update(existing.id, { messages, updatedAt: now });
    }
    return db.conversations.add({
      projectId: Number(projectId),
      stageNumber: Number(stageNumber),
      messages,
      createdAt: now,
      updatedAt: now,
    });
  }

  /* ----------------------------------------------------------
     Export / Backup
  ---------------------------------------------------------- */

  async function exportProject(projectId) {
    const id = Number(projectId);
    const [project, stageRecords, decisions, notes] = await Promise.all([
      getProject(id),
      getAllStageRecords(id),
      getDecisions(id),
      getNotes(id),
    ]);
    return { project, stageRecords, decisions, notes, exportedAt: new Date().toISOString() };
  }

  async function exportAll() {
    const [projects, stageRecords, decisions, notes, conversations, sessions] = await Promise.all([
      db.projects.toArray(),
      db.stageRecords.toArray(),
      db.decisions.toArray(),
      db.notes.toArray(),
      db.conversations.toArray(),
      db.sessions.toArray(),
    ]);
    /* Attachments excluded from export (binary data — too large for JSON) */
    return { projects, stageRecords, decisions, notes, conversations, sessions, exportedAt: new Date().toISOString(), version: 2 };
  }

  function _isPlainObjectArray(val) {
    return Array.isArray(val) && val.every(item => item !== null && typeof item === 'object' && !Array.isArray(item));
  }

  async function importAll(data) {
    if (!data || (data.version !== 1 && data.version !== 2)) throw new Error('Unrecognised backup format.');
    const arrays = ['projects', 'stageRecords', 'decisions', 'notes', 'conversations', 'sessions'];
    for (const key of arrays) {
      if (data[key] !== undefined && data[key] !== null && !_isPlainObjectArray(data[key])) {
        throw new Error(`Invalid backup: "${key}" must be an array of objects.`);
      }
    }

    let skipped = 0;
    const tables = [
      ['projects',      db.projects],
      ['stageRecords',  db.stageRecords],
      ['decisions',     db.decisions],
      ['notes',         db.notes],
      ['conversations', db.conversations],
      ['sessions',      db.sessions],
    ];

    /* Clear all tables first in one transaction, then import per-table so bad
       records can be skipped without rolling back the entire restore. */
    await db.transaction('rw', db.projects, db.stageRecords, db.decisions, db.notes, db.conversations, db.sessions, async () => {
      for (const [, table] of tables) await table.clear();
    });

    for (const [key, table] of tables) {
      for (const record of (data[key] || [])) {
        try {
          await table.add(record);
        } catch (e) {
          skipped++;
          console.warn(`[Hora] Skipped malformed "${key}" record during restore:`, e.message);
        }
      }
    }

    return skipped;
  }

  /* ----------------------------------------------------------
     Public API
  ---------------------------------------------------------- */
  return {
    getAllProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getAllStageRecords,
    getStageRecord,
    saveStageRecord,
    completeStage,
    getDecisions,
    addDecision,
    updateDecision,
    deleteDecision,
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    getConversation,
    saveConversation,
    getSessions,
    addSession,
    updateSession,
    deleteSession,
    getAttachments,
    addAttachment,
    deleteAttachment,
    exportProject,
    exportAll,
    importAll,
  };

})();
