/* ============================================================
   Hora — Stage 3: Architecture Design (stage3.js)
   Architecture and Tech Stack: dynamic steps per project type
   AND build tool (full matrix), soft gate for undecided users,
   copy-only Tier 2 handoff.
   ============================================================ */

/* ============================================================
   STEP DEFINITIONS — full matrix: projectType × buildTool
   Keys: app | website | document | workflow | integration | internal-tool
         × agent | vibe | chat | nocode
   ============================================================ */

/* ---- APP × AGENT ---- */
const STAGE3_STEPS_APP_AGENT = [
  {
    key:         'techStack',
    question:    'Are you leaning toward any specific language, framework, or stack?',
    hint:        'Give your best guess, even if you are not certain yet. (Examples: Python, because I have used it before. JavaScript, because I want it to run in a browser. No preference yet, open to whatever makes most sense.)',
    placeholder: 'My instinct is to use... / No preference yet...',
  },
  {
    key:         'entities',
    question:    'What are the main things this app needs to track or store?',
    hint:        'List them as nouns, not features. Think objects, not actions. (Examples: Accounts, Securities, Transactions, Prices, Reports. Students, Lessons, Sessions, Progress Records. Clients, Projects, Invoices, Time Entries.)',
    placeholder: 'The main things this app needs to track are...',
  },
  {
    key:         'access',
    question:    'Where will this run, and who needs to use it?',
    hint:        'Be specific about deployment and audience. (Examples: Only on my laptop, just for me. In a browser, shared with two or three people. Eventually accessible online by anyone who signs up.)',
    placeholder: 'This will run on... and be used by...',
  },
  {
    key:         'externalData',
    question:    'Does this need to connect to any external data sources or services?',
    hint:        'Name them if so. (Examples: Yahoo Finance for stock prices via the yfinance library. A bank CSV export. Google Calendar. A government data API. Nothing external, all data entered manually.)',
    placeholder: 'External connections needed: ... / No external connections needed...',
  },
  {
    key:         'existing',
    question:    'Are you replacing or importing from something that already exists?',
    hint:        'Name it and describe what you want to carry over. (Examples: A Google Sheet with three years of data to migrate. A CSV export from another app. Nothing, starting from scratch.)',
    placeholder: 'Starting from scratch. / I want to import from...',
  },
];

/* ---- APP × VIBE ---- */
const STAGE3_STEPS_APP_VIBE = [
  {
    key:         'platform',
    question:    'Which vibe coding platform are you planning to use?',
    hint:        'Name your preference or say you are open to a recommendation. (Examples: Bolt.new. Lovable. Replit. Not sure yet, open to whatever fits best.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'coreInteraction',
    question:    'How would you describe the core interaction in one sentence?',
    hint:        'What does a typical session with this app look like? (Examples: A form where I log entries and see a running dashboard. A list manager with filtering and tagging. A scheduling tool where I move items between statuses.)',
    placeholder: 'The core interaction is...',
  },
  {
    key:         'users',
    question:    'Does each user need their own account and private data, or is this shared data everyone sees?',
    hint:        'This shapes the data architecture significantly. (Examples: Just me, no login needed. Me and my spouse, same data, no separation needed. Each user sees only their own records. A team where a manager sees everything and individuals see only their own.)',
    placeholder: 'The access model is...',
  },
  {
    key:         'integrations',
    question:    'Does this need to connect to any outside services?',
    hint:        'Name anything the app needs to talk to. (Examples: Send email notifications. Pull data from a financial API. Take payments via Stripe. Connect to Google Calendar. Nothing external, fully self-contained.)',
    placeholder: 'Connections needed: ... / No external integrations...',
  },
  {
    key:         'existingData',
    question:    'Is there existing data to import, or does this start fresh?',
    hint:        'If you have data to migrate, describe its format and rough volume. (Examples: Six months of entries in a spreadsheet to upload. A CSV export from another tool. Starting completely fresh.)',
    placeholder: 'Starting fresh. / I have data in...',
  },
];

/* ---- APP × CHAT ---- */
const STAGE3_STEPS_APP_CHAT = [
  {
    key:         'deliverableFormat',
    question:    'What form will the finished app take?',
    hint:        'Be specific about what you are asking the AI to produce. (Examples: A set of Python scripts I run locally. A single HTML file I open in a browser. A structured prompt system that simulates app behavior. A series of AI conversations that produce a working prototype.)',
    placeholder: 'The finished app will be...',
  },
  {
    key:         'coreFeatures',
    question:    'What are the two or three features that make this worth building?',
    hint:        'Name the specific capabilities that matter most. (Examples: Automatically calculates my net worth from manual inputs. Shows a week-by-week schedule I can edit. Tracks my child\'s reading progress with a simple score each day.)',
    placeholder: 'The core features are...',
  },
  {
    key:         'dataAndState',
    question:    'What data does this app need to remember between sessions?',
    hint:        'Describe how persistence works. (Examples: All entries stored in a local CSV file I manage manually. A JSON file the AI writes and reads each session. Nothing, it recalculates from scratch every time I use it.)',
    placeholder: 'Between sessions, the app needs to remember...',
  },
  {
    key:         'users',
    question:    'Who will use this, and how much technical setup are they willing to do?',
    hint:        'This shapes what format the final output should take. (Examples: Just me, comfortable running a script. My family, needs to be a simple file they can double-click. A colleague who needs step-by-step instructions.)',
    placeholder: 'Users are... and their comfort level is...',
  },
  {
    key:         'longevity',
    question:    'What are the most likely ways this could break down or fall short?',
    hint:        'Think about real failure modes, whether this is a one-time build or something you plan to use repeatedly. (Examples: The AI-generated code breaks when I update a dependency. The scope creeps and it never gets finished. It works once but is too fragile to reuse. Nothing, it is simple enough to stay working.)',
    placeholder: 'The most likely failure mode is...',
  },
];

/* ---- APP × NOCODE ---- */
const STAGE3_STEPS_APP_NOCODE = [
  {
    key:         'platforms',
    question:    'Which platforms are you planning to use?',
    hint:        'Name your choices for data storage, automation, and interface separately if they differ. (Examples: Airtable for data, Zapier for automation, Glide for the mobile front end. Notion for everything. Not sure yet, open to recommendations.)',
    placeholder: 'I am planning to use...',
  },
  {
    key:         'dataStructure',
    question:    'What data needs to be structured and stored?',
    hint:        'List the main categories of records. Think in nouns. (Examples: Client records, project milestones, invoice history. Inventory items, suppliers, purchase orders. Employee requests, approval status, completion dates.)',
    placeholder: 'The main categories of data are...',
  },
  {
    key:         'automations',
    question:    'What repetitive tasks or handoffs do you want the app to handle automatically?',
    hint:        'Name the manual steps you want the system to eliminate. (Examples: Notify a Slack channel when a status field changes. Create a record automatically when a form is submitted. Send a weekly email summary of all open items.)',
    placeholder: 'I want to automate...',
  },
  {
    key:         'roles',
    question:    'Who takes what actions in this app?',
    hint:        'Walk through who does what. (Examples: I enter data and generate reports, my team updates status fields, clients submit forms. Only me. A manager approves, a team member enters, a client views read-only.)',
    placeholder: 'The roles and actions are...',
  },
  {
    key:         'successCriteria',
    question:    'What does a working version look like?',
    hint:        'Name the process this replaces and the one outcome that would make you say it worked. (Examples: This replaces a shared spreadsheet that required constant cleanup. It works when new requests appear in the queue automatically. It works when I can generate a weekly report in under five minutes.)',
    placeholder: 'A working version looks like...',
  },
];

/* ---- WEBSITE × AGENT ---- */
const STAGE3_STEPS_WEBSITE_AGENT = [
  {
    key:         'techStack',
    question:    'Are you leaning toward any specific framework or stack for this site?',
    hint:        'Give your best guess. (Examples: Plain HTML and CSS, because I want full control and no build step. Next.js, because I need server-side rendering. Astro, because content is mostly static. No preference yet.)',
    placeholder: 'My instinct is to use... / No preference yet...',
  },
  {
    key:         'contentStructure',
    question:    'What are the main content types and sections this site needs?',
    hint:        'List them as nouns. Think pages and content objects, not features. (Examples: Home page, About page, Blog posts, Case studies, Contact form. Product pages, Category pages, Checkout flow. Landing page only.)',
    placeholder: 'The main sections and content types are...',
  },
  {
    key:         'access',
    question:    'Who is the audience, and does any part of the site require a login?',
    hint:        'Be specific. (Examples: Public-facing, anyone can view, no login. Public pages plus a members-only section. Internal only, accessible to employees with a company account.)',
    placeholder: 'The audience is... and login is required for...',
  },
  {
    key:         'cms',
    question:    'Will content need to change after the site is live, and if so, how?',
    hint:        'This shapes whether you need a CMS or can edit files directly. (Examples: No, this is essentially a one-time publication. Occasionally, and I am comfortable editing files directly. Regularly, I need a simple interface that does not require touching code. A non-technical teammate needs to be able to make updates.)',
    placeholder: 'Content will... / No ongoing updates expected...',
  },
  {
    key:         'existing',
    question:    'Are you migrating content from an existing site or starting fresh?',
    hint:        'Name what exists and what you want to carry over. (Examples: An old WordPress site with 50 posts to migrate. A Squarespace site I want to replace. Starting fresh, no existing content.)',
    placeholder: 'Starting fresh. / I am migrating from...',
  },
];

/* ---- WEBSITE × VIBE ---- */
const STAGE3_STEPS_WEBSITE_VIBE = [
  {
    key:         'platform',
    question:    'Which platform are you planning to use to build this site?',
    hint:        'Name your preference or say you are open to a recommendation. (Examples: Bolt.new for a custom site. Replit for something more interactive. Not sure yet.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'contentStructure',
    question:    'What are the main sections and pages this site needs?',
    hint:        'List what the site must contain. (Examples: Home, About, Services, Contact. A landing page plus a blog. A portfolio with project case studies and a contact form.)',
    placeholder: 'The main pages and sections are...',
  },
  {
    key:         'audience',
    question:    'Who is this site for, and what do you want them to do when they visit?',
    hint:        'Name the audience and the primary action. (Examples: Potential clients — I want them to book a call. Hiring managers — I want them to read my work and reach out. General public — I want them to read and share articles.)',
    placeholder: 'The audience is... and I want them to...',
  },
  {
    key:         'contentUpdates',
    question:    'Will this site need ongoing content updates, or is it essentially a one-time publication?',
    hint:        'This shapes whether you need a CMS built in. (Examples: One-time, I do not expect to update it. Rarely, I will make changes myself by asking the AI. Frequently, I need a simple interface to add content without touching code.)',
    placeholder: 'This is essentially a one-time publication. / Content will be updated...',
  },
  {
    key:         'existingAssets',
    question:    'Are there existing assets, copy, or content to work with?',
    hint:        'Name what you have. (Examples: A Figma design I want to match. Existing copy I want to reuse. Existing photos and brand assets. Starting from scratch on everything.)',
    placeholder: 'I have... / Starting from scratch...',
  },
];

/* ---- WEBSITE × CHAT ---- */
const STAGE3_STEPS_WEBSITE_CHAT = [
  {
    key:         'deliverableFormat',
    question:    'What will the AI actually produce — a complete file, a template, or structured content?',
    hint:        'Be specific. (Examples: A single HTML file I can open in a browser and host on GitHub Pages. A template with placeholder sections I fill in. Structured copy and layout instructions I hand to a developer.)',
    placeholder: 'The AI will produce...',
  },
  {
    key:         'contentStructure',
    question:    'What are the main sections and pages this site needs?',
    hint:        'List what the site must contain. (Examples: Home, About, Services, Contact. A single landing page only. A portfolio with project writeups and a contact section.)',
    placeholder: 'The main pages and sections are...',
  },
  {
    key:         'audience',
    question:    'Who is this site for, and what do you want them to do?',
    hint:        'Name the audience and the action you want them to take. (Examples: Potential clients — book a call. Hiring managers — read my work and reach out. Readers — subscribe to a newsletter.)',
    placeholder: 'The audience is... and I want them to...',
  },
  {
    key:         'copyAndAssets',
    question:    'What copy and assets do you already have, and what does the AI need to create?',
    hint:        'Be clear about what exists versus what needs to be generated. (Examples: I have all the copy and photos, the AI just needs to write the HTML. I have a rough outline, the AI needs to write the full copy and structure. Starting from scratch, the AI handles everything.)',
    placeholder: 'I have... The AI needs to create...',
  },
  {
    key:         'hosting',
    question:    'Where will this site live, and how will it get there?',
    hint:        'Even a rough plan helps. (Examples: GitHub Pages, I will push the HTML file myself. Netlify, drag and drop. I have not thought about this yet. A client will handle hosting.)',
    placeholder: 'This site will be hosted on... and published by...',
  },
];

/* ---- WEBSITE × NOCODE ---- */
const STAGE3_STEPS_WEBSITE_NOCODE = [
  {
    key:         'platform',
    question:    'Which no-code platform are you planning to use?',
    hint:        'Name your preference or say you are open to a recommendation. (Examples: Webflow, for design control. Framer, for interactive animations. Squarespace, for simplicity. Not sure yet.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'contentStructure',
    question:    'What are the main sections and pages this site needs?',
    hint:        'List what the site must contain. (Examples: Home, About, Services, Blog, Contact. A single landing page. A portfolio with case studies.)',
    placeholder: 'The main pages and sections are...',
  },
  {
    key:         'audience',
    question:    'Who is this site for, and what is the primary action you want them to take?',
    hint:        '(Examples: Potential clients — book a call via a Calendly embed. Readers — subscribe to a newsletter. General visitors — learn about our services and reach out.)',
    placeholder: 'The audience is... and I want them to...',
  },
  {
    key:         'contentUpdates',
    question:    'How often will you add or update content, and do you need a built-in CMS?',
    hint:        'No-code platforms vary in how easy ongoing updates are. (Examples: I will post new blog articles weekly and need a simple editor. The site is essentially static, I will update it a few times a year. A non-technical teammate needs to be able to update the content.)',
    placeholder: 'Content will be updated... by...',
  },
  {
    key:         'integrations',
    question:    'Does the site need to connect to any outside tools?',
    hint:        'Name anything it needs to talk to. (Examples: Mailchimp for email signups. Calendly for booking. A payment processor. A form tool like Typeform. Nothing external.)',
    placeholder: 'Integrations needed: ... / No integrations needed...',
  },
];

/* ---- DOCUMENT × AGENT ---- */
const STAGE3_STEPS_DOCUMENT_AGENT = [
  {
    key:         'format',
    question:    'What is the final format and structure of this document?',
    hint:        'Describe the artifact the agent will produce or help you produce. (Examples: A Markdown spec file with fixed sections I can commit to the repo. A templated framework stored as a set of files with consistent headings. A reusable prompt library organized in a folder structure.)',
    placeholder: 'The document will be...',
  },
  {
    key:         'sections',
    question:    'What are the required sections or components?',
    hint:        'Name the parts this document must always contain. (Examples: Problem statement, requirements, constraints, open questions. Executive summary, methodology, findings, recommendations. Context, decision, rationale, alternatives considered.)',
    placeholder: 'The required sections are...',
  },
  {
    key:         'generation',
    question:    'What inputs does the agent need to generate or populate this document?',
    hint:        'Describe what you will provide each time. (Examples: Raw notes I paste in, which the agent structures into the template. A set of answers to fixed questions that feed into each section. A conversation log the agent summarizes into the standard format.)',
    placeholder: 'To generate this document, the agent will need...',
  },
  {
    key:         'audience',
    question:    'Who reads this document, and what do they need from it?',
    hint:        'Audience shapes format, depth, and language. (Examples: Just me — dense and technical is fine. My manager — needs an executive summary up front. External clients — must be clear to non-experts.)',
    placeholder: 'The audience is... and they need...',
  },
  {
    key:         'updateCadence',
    question:    'Is this a one-time document or something you will create repeatedly?',
    hint:        'This shapes how much the agent workflow is worth investing in. (Examples: One-time — I just need to produce it once. Occasional — a few times a year. Recurring — weekly or after every meeting, so speed and repeatability matter a lot.)',
    placeholder: 'This is a one-time document. / I will create this...',
  },
];

/* ---- DOCUMENT × VIBE ---- */
const STAGE3_STEPS_DOCUMENT_VIBE = [
  {
    key:         'appPurpose',
    question:    'What does the app do — generate, manage, or display documents?',
    hint:        'Be specific about the app\'s role. (Examples: A form-based generator that produces a formatted PDF from user inputs. A library where I store and browse reference documents. An editor with a fixed template structure that enforces consistent formatting.)',
    placeholder: 'The app...',
  },
  {
    key:         'sections',
    question:    'What are the required sections or components of each document?',
    hint:        'Name the parts every document must contain. (Examples: Problem statement, requirements, decision log. Brief, strategy, execution plan, measurement. Background, options considered, recommendation.)',
    placeholder: 'Each document contains...',
  },
  {
    key:         'generation',
    question:    'How does a document get created — from a form, from AI output, or manually?',
    hint:        'Describe the creation flow. (Examples: User fills out a structured form, the app formats it into the document. User pastes AI output, the app parses it into sections. User writes directly in the app using the template structure.)',
    placeholder: 'A document is created by...',
  },
  {
    key:         'users',
    question:    'Who creates documents and who reads them?',
    hint:        '(Examples: Just me for both. I create, my team reads. Multiple people create, a manager reviews and approves.)',
    placeholder: 'Documents are created by... and read by...',
  },
  {
    key:         'outputFormat',
    question:    'What format does the finished document need to be in?',
    hint:        'Consider downstream use. (Examples: Displayed in the app only. Exportable as a PDF. Exportable as a Markdown file. Shareable via a link. Copied to a doc or email.)',
    placeholder: 'The finished document needs to be...',
  },
];

/* ---- DOCUMENT × CHAT ---- */
const STAGE3_STEPS_DOCUMENT_CHAT = [
  {
    key:         'format',
    question:    'What is the final format and structure of this document?',
    hint:        'Describe the artifact precisely. (Examples: A two-page strategy brief with four fixed sections. A reusable prompt template I copy and paste each time. A structured decision record with a consistent format across all decisions.)',
    placeholder: 'The finished document is...',
  },
  {
    key:         'sections',
    question:    'What sections must every version of this document contain?',
    hint:        'Name them. (Examples: Problem statement, context, recommendation, open questions. Executive summary, findings, implications, next steps. Situation, complication, resolution.)',
    placeholder: 'Every version must contain...',
  },
  {
    key:         'generation',
    question:    'What are you working from to create this document?',
    hint:        'Describe the inputs. This could be a one-time creation or something you will repeat. (Examples: Raw notes from a meeting. A rough outline I want fleshed out. Source material I want synthesized. A prior version I want updated. Nothing yet, the AI will help me build it from scratch.)',
    placeholder: 'I am working from...',
  },
  {
    key:         'audience',
    question:    'Who reads this document, and what do they need from it?',
    hint:        '(Examples: Just me — shorthand and density are fine. My manager — needs a clear recommendation up front. External clients — must be jargon-free.)',
    placeholder: 'The audience is... and they need...',
  },
  {
    key:         'longevity',
    question:    'What are the most likely ways this could break down or fall short?',
    hint:        'Think about real failure modes, whether this is a one-time document or a repeatable system. (Examples: The prompt gets stale as my needs change and I stop maintaining it. It takes too long per use and I revert to writing from scratch. The format is too rigid for the variety of situations I encounter. Nothing, it is simple enough to work as-is.)',
    placeholder: 'The most likely failure mode is...',
  },
];

/* ---- DOCUMENT × NOCODE ---- */
const STAGE3_STEPS_DOCUMENT_NOCODE = [
  {
    key:         'platform',
    question:    'Which platform will house and manage these documents?',
    hint:        '(Examples: Notion — flexible pages with database properties. Airtable — records with attachments and linked fields. A combination: Airtable for metadata, Google Docs for the content itself.)',
    placeholder: 'I am planning to use...',
  },
  {
    key:         'sections',
    question:    'What sections or fields must every document contain?',
    hint:        'Name the structure. (Examples: Title, status, owner, date, and a long-form body. Problem, decision, rationale, and outcome. Brief, strategy, execution notes.)',
    placeholder: 'Every document must contain...',
  },
  {
    key:         'creation',
    question:    'How does a new document get created — manually, from a form, or via automation?',
    hint:        '(Examples: I create a new Notion page from a template manually. A Typeform submission triggers a new record in Airtable. A Zapier workflow creates a draft from a calendar event.)',
    placeholder: 'A new document is created by...',
  },
  {
    key:         'roles',
    question:    'Who creates documents, who reviews them, and who has read-only access?',
    hint:        '(Examples: I create, my manager reviews, clients see a read-only view. Everyone on the team creates, no formal review. Only me.)',
    placeholder: 'Creators: ... Reviewers: ... Readers: ...',
  },
  {
    key:         'outputFormat',
    question:    'Does the document need to leave the platform — as a PDF, email, or export?',
    hint:        '(Examples: Lives in Notion only, never exported. Exported as PDF for client delivery. Sent as a formatted email via automation. Pushed to Google Drive as a doc.)',
    placeholder: 'Documents stay in the platform. / They also need to be exported as...',
  },
];

/* ---- WORKFLOW × AGENT ---- */
const STAGE3_STEPS_WORKFLOW_AGENT = [
  {
    key:         'steps',
    question:    'What are the steps in this workflow, in order?',
    hint:        'Walk through the process from trigger to completion. (Examples: 1. Raw data arrives via CSV. 2. Script validates and cleans it. 3. Output is written to a new file. 4. Summary email is sent. Or: 1. I enter inputs. 2. Script calculates results. 3. Report is generated.)',
    placeholder: 'The steps are: 1. ... 2. ... 3. ...',
  },
  {
    key:         'trigger',
    question:    'What starts this workflow, and how often does it run?',
    hint:        '(Examples: I run it manually whenever I need it. It runs on a schedule — every Monday morning. It triggers automatically when a file lands in a folder. It runs when I press a button in a UI.)',
    placeholder: 'This workflow is triggered by... and runs...',
  },
  {
    key:         'dataFlow',
    question:    'What data goes in, what gets transformed, and what comes out?',
    hint:        'Trace the data through the process. (Examples: In: a CSV of transactions. Transformed: filtered, categorized, and totaled. Out: a summary report and an updated ledger file. In: a list of tasks. Out: a prioritized schedule.)',
    placeholder: 'Input: ... Transformation: ... Output: ...',
  },
  {
    key:         'errorHandling',
    question:    'What should happen when something goes wrong?',
    hint:        'Name the failure modes and how you want them handled. (Examples: If the input file is missing, log an error and stop. If a calculation fails, flag the row and continue. I just want the script to crash loudly so I notice — I will fix it manually.)',
    placeholder: 'When something goes wrong...',
  },
  {
    key:         'existing',
    question:    'Is this replacing a manual process or an existing script?',
    hint:        'Describe what exists today. (Examples: A manual process I do in Excel every week. A fragile Python script I want to rewrite properly. An entirely new capability with nothing to replace.)',
    placeholder: 'This replaces... / This is a new capability...',
  },
];

/* ---- WORKFLOW × VIBE ---- */
const STAGE3_STEPS_WORKFLOW_VIBE = [
  {
    key:         'platform',
    question:    'Which platform are you using to build this workflow interface?',
    hint:        '(Examples: Bolt.new or Lovable for a custom UI that runs the workflow. Replit for something more scripted. Not sure — I know what the workflow does but not how to build the interface yet.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'steps',
    question:    'What are the steps in this workflow, in order?',
    hint:        'Walk through from start to finish. (Examples: 1. User enters inputs via a form. 2. The app processes or calculates. 3. Results are displayed. 4. User can export or act on the results.)',
    placeholder: 'The steps are: 1. ... 2. ... 3. ...',
  },
  {
    key:         'trigger',
    question:    'What starts this workflow, and how often does a user run it?',
    hint:        '(Examples: User clicks a button. User submits a form. It runs automatically on a timer. It is triggered by an external event.)',
    placeholder: 'This workflow starts when...',
  },
  {
    key:         'dataFlow',
    question:    'What data goes in, what happens to it, and what comes out?',
    hint:        'Trace the data through. (Examples: In: form inputs. Processed: validated and calculated. Out: a formatted result displayed on screen. In: a file upload. Out: a transformed file to download.)',
    placeholder: 'Input: ... Processing: ... Output: ...',
  },
  {
    key:         'users',
    question:    'Who runs this workflow, and how often?',
    hint:        '(Examples: Just me, a few times a week. My team of three, daily. Anyone who visits the link, infrequently.)',
    placeholder: 'This workflow is run by... roughly...',
  },
];

/* ---- WORKFLOW × CHAT ---- */
const STAGE3_STEPS_WORKFLOW_CHAT = [
  {
    key:         'steps',
    question:    'What are the steps in this workflow, in order?',
    hint:        'Walk through from trigger to completion. Be specific enough that someone could follow it without asking questions. (Examples: 1. I paste this week\'s project updates. 2. I run the status prompt. 3. AI produces a formatted summary. 4. I review and paste into the team email.)',
    placeholder: 'The steps are: 1. ... 2. ... 3. ...',
  },
  {
    key:         'trigger',
    question:    'What starts this workflow, and how often does it run?',
    hint:        '(Examples: Every Monday morning before my team standup. Whenever a project milestone is reached. Each time I finish a client meeting. Ad hoc, whenever I need it.)',
    placeholder: 'This workflow runs... triggered by...',
  },
  {
    key:         'aiVsManual',
    question:    'Which steps involve AI, and which are manual?',
    hint:        'Map the division clearly. (Examples: Steps 1 and 2 are manual inputs. Step 3 is an AI prompt. Step 4 is manual review and delivery. AI handles all synthesis; I handle all inputs and decisions.)',
    placeholder: 'Manual steps: ... AI steps: ...',
  },
  {
    key:         'prompts',
    question:    'Describe the key prompt or prompts this workflow depends on.',
    hint:        'Even a rough draft helps. What does the AI need to know, and what are you asking it to produce? (Examples: "Given these project updates, produce a three-sentence summary of status, blockers, and next steps." "Analyze these transactions and categorize each one as business or personal.")',
    placeholder: 'The core prompt is...',
  },
  {
    key:         'longevity',
    question:    'What are the most likely ways this could break down or fall short?',
    hint:        'Think about real failure modes, whether this is a one-time run or an ongoing process. (Examples: The prompt stops producing useful output as context changes. It takes too many steps and I revert to doing it manually. The AI output is too inconsistent to rely on. Nothing, it is simple enough to work as-is.)',
    placeholder: 'The most likely failure mode is...',
  },
];

/* ---- WORKFLOW × NOCODE ---- */
const STAGE3_STEPS_WORKFLOW_NOCODE = [
  {
    key:         'platforms',
    question:    'Which platforms are you planning to use?',
    hint:        'Name your choices for triggers, logic, and outputs separately if they differ. (Examples: Zapier to trigger and route, Google Sheets to store results, Slack to deliver notifications. Notion for everything. Make for complex multi-step logic.)',
    placeholder: 'I am planning to use...',
  },
  {
    key:         'steps',
    question:    'What are the steps in this workflow, in order?',
    hint:        'Walk through from trigger to completion in platform terms. (Examples: 1. New row added to Google Sheet. 2. Zapier triggers. 3. Data is formatted and sent to Slack. 4. Record is updated with "notified" status.)',
    placeholder: 'The steps are: 1. ... 2. ... 3. ...',
  },
  {
    key:         'trigger',
    question:    'What starts this workflow?',
    hint:        'Name the trigger precisely. (Examples: A form submission. A new record in Airtable. A scheduled time — every day at 8am. A webhook from an external service. A manual button press.)',
    placeholder: 'This workflow is triggered by...',
  },
  {
    key:         'dataFlow',
    question:    'What data flows through this workflow, and where does it end up?',
    hint:        'Trace the data from input to output. (Examples: Form data flows to Airtable, then a filtered view goes to a Slack message, then a confirmation email is sent to the submitter.)',
    placeholder: 'Data starts at... flows through... and ends up at...',
  },
  {
    key:         'errorHandling',
    question:    'What should happen when a step fails or data is missing?',
    hint:        '(Examples: Send me an email alert so I can fix it manually. Skip the step and continue. Log the error to a spreadsheet. I have not thought about this yet — help me think through it.)',
    placeholder: 'When something fails...',
  },
];

/* ---- INTEGRATION × AGENT ---- */
const STAGE3_STEPS_INTEGRATION_AGENT = [
  {
    key:         'systems',
    question:    'What are the two (or more) systems this integration connects?',
    hint:        'Name each system and describe what it does. (Examples: Salesforce (CRM) and Zendesk (support tickets). A REST API from a vendor and our internal PostgreSQL database. A Google Sheet and a Slack channel.)',
    placeholder: 'This integration connects... and...',
  },
  {
    key:         'dataFlow',
    question:    'What data moves, in which direction, and what triggers the movement?',
    hint:        'Be precise. (Examples: When a deal is marked "closed won" in Salesforce, create a new project record in our internal system with the client name and contract value. Every hour, pull new support tickets from Zendesk and update their status in the CRM.)',
    placeholder: 'When... happens, ... data moves from... to...',
  },
  {
    key:         'techStack',
    question:    'What languages or tools are you planning to use to build this?',
    hint:        '(Examples: Python, because we use it for all internal tooling. Node.js, because the source API has a good JS SDK. No preference yet — open to whatever fits the APIs involved.)',
    placeholder: 'Planning to use... / No preference yet...',
  },
  {
    key:         'auth',
    question:    'How do each of the connected systems handle authentication?',
    hint:        'Name the auth mechanism for each. (Examples: Salesforce uses OAuth 2.0. Our internal system uses an API key stored in environment variables. The vendor API uses basic auth with a username and password.)',
    placeholder: 'System A uses... System B uses...',
  },
  {
    key:         'errorHandling',
    question:    'What should happen when something goes wrong — a failed request, missing data, or an outage?',
    hint:        '(Examples: Log the error and retry up to three times. Send an alert to Slack and stop. Write failed records to a dead-letter queue for manual review. Fail silently — this is non-critical.)',
    placeholder: 'When something fails...',
  },
];

/* ---- INTEGRATION × VIBE ---- */
const STAGE3_STEPS_INTEGRATION_VIBE = [
  {
    key:         'systems',
    question:    'What are the systems this integration connects, and what does each one do?',
    hint:        '(Examples: My Airtable base (project tracking) and Slack (team notifications). A public API that provides data and a dashboard I am building to display it.)',
    placeholder: 'This connects... and...',
  },
  {
    key:         'dataFlow',
    question:    'What data moves, in which direction, and what triggers it?',
    hint:        'Be specific. (Examples: When a row status changes to "Ready for review" in Airtable, post a message in the #reviews Slack channel with the record name and a link. Every time I load the dashboard, it fetches the latest data from the API.)',
    placeholder: 'When... happens, ... moves from... to...',
  },
  {
    key:         'platform',
    question:    'Which vibe coding platform are you planning to use?',
    hint:        '(Examples: Bolt.new or Lovable if you need a visual interface on top of the integration. Replit if you want a lightweight script with a simple UI. Not sure yet.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'auth',
    question:    'How do the connected systems handle authentication?',
    hint:        'Name the auth mechanism for each. (Examples: Airtable uses a personal access token. Slack uses a webhook URL. The API requires an API key I pass as a header.)',
    placeholder: 'System A uses... System B uses...',
  },
  {
    key:         'errorHandling',
    question:    'What should happen when the integration fails or returns unexpected data?',
    hint:        '(Examples: Show an error message in the UI. Retry automatically. Log it and move on. I just need it to not crash silently.)',
    placeholder: 'When something fails...',
  },
];

/* ---- INTEGRATION × CHAT ---- */
const STAGE3_STEPS_INTEGRATION_CHAT = [
  {
    key:         'systems',
    question:    'What are the systems this integration connects?',
    hint:        'Name each system and what it does in this context. (Examples: My email client and a spreadsheet I use to track leads. A vendor\'s data export and my internal reporting tool. Two tools I use daily that do not talk to each other.)',
    placeholder: 'This connects... and...',
  },
  {
    key:         'dataFlow',
    question:    'What data moves, in which direction, and how often?',
    hint:        '(Examples: Once a week, I export data from Tool A and want the AI to reformat it for Tool B. Every time I get a new email from a client, I want the key details captured in my tracking sheet. Whenever a status changes in one place, I want it reflected somewhere else.)',
    placeholder: 'Data moves from... to... when...',
  },
  {
    key:         'manualVsAuto',
    question:    'Is this integration fully manual, semi-automated, or something the AI runs on your behalf?',
    hint:        '(Examples: Fully manual — the AI helps me transform a data export each time I paste it in. Semi-automated — the AI produces a script or formula I run myself. Automated — the AI writes something that runs without me once it is set up.)',
    placeholder: 'This integration is...',
  },
  {
    key:         'format',
    question:    'What format does the data need to be in on each end?',
    hint:        'Describe the input and output formats. (Examples: Input: a CSV with specific columns. Output: a JSON payload the target system accepts. Input: plain text copied from an email. Output: a formatted row in a Google Sheet.)',
    placeholder: 'Input format: ... Output format: ...',
  },
  {
    key:         'longevity',
    question:    'What are the most likely ways this could break down or fall short?',
    hint:        'Think about this whether it is a one-time data move or an ongoing connection. (Examples: The source format changes and the prompt no longer handles it. It takes too many manual steps and I revert to doing it by hand. The AI output is not reliable enough to trust. Nothing, it is simple enough to work as-is.)',
    placeholder: 'The most likely failure mode is...',
  },
];

/* ---- INTEGRATION × NOCODE ---- */
const STAGE3_STEPS_INTEGRATION_NOCODE = [
  {
    key:         'systems',
    question:    'What are the systems this integration connects?',
    hint:        'Name each system. (Examples: Google Forms and Airtable. Shopify and Mailchimp. A Typeform survey and a Slack channel.)',
    placeholder: 'This connects... and...',
  },
  {
    key:         'dataFlow',
    question:    'What data moves, in which direction, and what triggers it?',
    hint:        'Be specific about the trigger and the data. (Examples: When a Google Form is submitted, a new record is created in Airtable with the form responses. Every night at midnight, new Shopify orders are added to a Google Sheet. When a deal closes in the CRM, a welcome email is sent via Mailchimp.)',
    placeholder: 'When... happens, ... data moves from... to...',
  },
  {
    key:         'platform',
    question:    'Which automation platform are you planning to use?',
    hint:        '(Examples: Zapier — straightforward trigger-action flows. Make (Integromat) — complex multi-step logic with branching. Notion automations — for flows that stay within Notion. Native integrations — some tools connect directly without a middleware.)',
    placeholder: 'I am planning to use...',
  },
  {
    key:         'dataTransformation',
    question:    'Does the data need to be transformed, filtered, or formatted as it moves between systems?',
    hint:        '(Examples: The date format needs to change from MM/DD to YYYY-MM-DD. Only records with status "approved" should be synced. The first and last name fields need to be merged into one. No transformation needed, the data passes through as-is.)',
    placeholder: 'The data needs to be... / No transformation needed...',
  },
  {
    key:         'errorHandling',
    question:    'What should happen when a step fails or data is missing?',
    hint:        '(Examples: Send me an email alert. Log the error to a spreadsheet. Skip and continue. I have not thought about this yet.)',
    placeholder: 'When something fails...',
  },
];

/* ---- INTERNAL-TOOL × AGENT ---- */
const STAGE3_STEPS_INTERNAL_TOOL_AGENT = [
  {
    key:         'techStack',
    question:    'Are you leaning toward any specific language, framework, or stack?',
    hint:        'Give your best guess. (Examples: Python with a simple Flask UI, because our team already uses Python. A lightweight HTML dashboard, because it just needs to display data. Node.js with a local Express server. No preference yet.)',
    placeholder: 'My instinct is to use... / No preference yet...',
  },
  {
    key:         'dataSource',
    question:    'Where does the data come from that this tool needs to display or act on?',
    hint:        'Name the source(s). (Examples: A PostgreSQL database our team already maintains. CSV exports from our project management tool. An internal API. Data I enter manually into the tool itself.)',
    placeholder: 'The data comes from...',
  },
  {
    key:         'coreActions',
    question:    'What are the key actions a user takes in this tool?',
    hint:        'List the core interactions. (Examples: View a dashboard of current project statuses. Mark a task complete and leave a note. Search for a record by name and export it. Approve or reject a request with a comment.)',
    placeholder: 'The key actions are...',
  },
  {
    key:         'access',
    question:    'Who uses this tool, and does access need to be controlled?',
    hint:        '(Examples: Only me — no access control needed. My team of five, all with equal access. Admins see everything, regular users see only their own records. External contractors need limited read-only access.)',
    placeholder: 'Users: ... Access model: ...',
  },
  {
    key:         'existing',
    question:    'What does this replace or improve on?',
    hint:        'Name what exists today. (Examples: A shared Google Sheet that has become unmanageable. A manual process we run from the command line. Nothing — this is a new capability.)',
    placeholder: 'This replaces... / This is new because...',
  },
];

/* ---- INTERNAL-TOOL × VIBE ---- */
const STAGE3_STEPS_INTERNAL_TOOL_VIBE = [
  {
    key:         'platform',
    question:    'Which vibe coding platform are you planning to use?',
    hint:        '(Examples: Bolt.new or Lovable for a polished admin interface. Replit for a lighter-weight utility. Not sure yet.)',
    placeholder: 'I am planning to use... / Open to a recommendation...',
  },
  {
    key:         'dataSource',
    question:    'Where does the data come from that this tool needs to work with?',
    hint:        'Name the source(s). (Examples: A Google Sheet our team already maintains. A CSV I upload manually. An Airtable base. Data entered directly into this tool.)',
    placeholder: 'The data comes from...',
  },
  {
    key:         'coreActions',
    question:    'What are the key actions a user takes in this tool?',
    hint:        '(Examples: View a filterable list of records. Update a status field. Run a calculation and see the result. Approve or flag an item. Download a report.)',
    placeholder: 'The key actions are...',
  },
  {
    key:         'users',
    question:    'Who uses this tool, and do different users need different levels of access?',
    hint:        '(Examples: Just me — no access control needed. A small team, everyone sees everything. Managers see all records, team members see only their own.)',
    placeholder: 'Users: ... Access: ...',
  },
  {
    key:         'existing',
    question:    'What does this replace or improve on?',
    hint:        '(Examples: A shared spreadsheet that has become too complex to maintain. A manual process that takes too long. Nothing — this is a new capability.)',
    placeholder: 'This replaces... / This is a new capability because...',
  },
];

/* ---- INTERNAL-TOOL × CHAT ---- */
const STAGE3_STEPS_INTERNAL_TOOL_CHAT = [
  {
    key:         'deliverableFormat',
    question:    'What will the AI produce — a script, a template, a dashboard in a doc, or something else?',
    hint:        'Be specific about the output format. (Examples: A Python script I run locally to query and display data. A Google Sheets formula set that turns our data into a functional dashboard. A structured prompt I run against data I paste in to get an operational summary.)',
    placeholder: 'The AI will produce...',
  },
  {
    key:         'dataSource',
    question:    'Where does the data come from that this tool needs to work with?',
    hint:        '(Examples: A CSV export I generate from our project tool. Data I paste in from our internal systems. A Google Sheet I share with the AI. Data I enter manually each time I run this.)',
    placeholder: 'The data comes from...',
  },
  {
    key:         'coreActions',
    question:    'What does someone need to be able to do with this tool?',
    hint:        'List the core capabilities. (Examples: See a summary of current project statuses. Identify which items are overdue. Generate a weekly report without manual formatting. Filter and search records.)',
    placeholder: 'The key capabilities are...',
  },
  {
    key:         'users',
    question:    'Who uses this tool, and how technically comfortable are they?',
    hint:        '(Examples: Just me — comfortable running a script or copy-pasting prompts. My team of three, who use basic tools but not code. A non-technical colleague who needs clear step-by-step instructions.)',
    placeholder: 'Users are... with a comfort level of...',
  },
  {
    key:         'longevity',
    question:    'What are the most likely ways this could break down or fall short?',
    hint:        'Think about real failure modes, whether this is a one-time use or something you plan to return to. (Examples: It requires manual data prep each time and I stop doing it. The output is close but not quite right and I never fix the prompt. It gets replaced by a proper tool once the budget exists. Nothing, it is simple enough to work as-is.)',
    placeholder: 'The most likely failure mode is...',
  },
];

/* ---- INTERNAL-TOOL × NOCODE ---- */
const STAGE3_STEPS_INTERNAL_TOOL_NOCODE = [
  {
    key:         'platforms',
    question:    'Which platforms are you planning to use?',
    hint:        '(Examples: Airtable for data and a custom interface. Notion for a knowledge base with a structured database. Retool or Internal.io for a more powerful admin panel. A combination: Airtable for data, Zapier for automation, Glide for the mobile interface.)',
    placeholder: 'I am planning to use...',
  },
  {
    key:         'dataSource',
    question:    'Where does the data come from?',
    hint:        'Name the source(s). (Examples: Data entered directly into this tool. Synced from another platform via Zapier. Imported from a CSV. Connected to an external service via API.)',
    placeholder: 'The data comes from...',
  },
  {
    key:         'coreActions',
    question:    'What are the key actions a user takes in this tool?',
    hint:        '(Examples: View and filter a list of records. Update a status field. Submit a form. Run an automated action. Generate and download a report.)',
    placeholder: 'The key actions are...',
  },
  {
    key:         'roles',
    question:    'Who uses this tool, and do different people need different access?',
    hint:        '(Examples: Just me. My whole team equally. Admins can edit, others can only view. Submitters enter requests, approvers review and act on them.)',
    placeholder: 'Roles: ... Access model: ...',
  },
  {
    key:         'existing',
    question:    'What does this replace or improve on?',
    hint:        '(Examples: A shared spreadsheet that people have stopped maintaining. A manual process that takes too long. A tool we pay for but barely use. Nothing — this fills a gap.)',
    placeholder: 'This replaces... / This is a new capability...',
  },
];

/* ============================================================
   Lookup function — projectType × buildTool
   ============================================================ */

function getStage3Steps(buildTool, projectType) {
  const key = (projectType || 'app') + '_' + (buildTool || 'chat');
  const map = {
    app_agent:           STAGE3_STEPS_APP_AGENT,
    app_vibe:            STAGE3_STEPS_APP_VIBE,
    app_chat:            STAGE3_STEPS_APP_CHAT,
    app_nocode:          STAGE3_STEPS_APP_NOCODE,
    website_agent:       STAGE3_STEPS_WEBSITE_AGENT,
    website_vibe:        STAGE3_STEPS_WEBSITE_VIBE,
    website_chat:        STAGE3_STEPS_WEBSITE_CHAT,
    website_nocode:      STAGE3_STEPS_WEBSITE_NOCODE,
    document_agent:      STAGE3_STEPS_DOCUMENT_AGENT,
    document_vibe:       STAGE3_STEPS_DOCUMENT_VIBE,
    document_chat:       STAGE3_STEPS_DOCUMENT_CHAT,
    document_nocode:     STAGE3_STEPS_DOCUMENT_NOCODE,
    workflow_agent:      STAGE3_STEPS_WORKFLOW_AGENT,
    workflow_vibe:       STAGE3_STEPS_WORKFLOW_VIBE,
    workflow_chat:       STAGE3_STEPS_WORKFLOW_CHAT,
    workflow_nocode:     STAGE3_STEPS_WORKFLOW_NOCODE,
    integration_agent:   STAGE3_STEPS_INTEGRATION_AGENT,
    integration_vibe:    STAGE3_STEPS_INTEGRATION_VIBE,
    integration_chat:    STAGE3_STEPS_INTEGRATION_CHAT,
    integration_nocode:  STAGE3_STEPS_INTEGRATION_NOCODE,
    'internal-tool_agent':   STAGE3_STEPS_INTERNAL_TOOL_AGENT,
    'internal-tool_vibe':    STAGE3_STEPS_INTERNAL_TOOL_VIBE,
    'internal-tool_chat':    STAGE3_STEPS_INTERNAL_TOOL_CHAT,
    'internal-tool_nocode':  STAGE3_STEPS_INTERNAL_TOOL_NOCODE,
  };
  return map[key] || STAGE3_STEPS_APP_CHAT;
}

/* ---- Build tool labels ---- */
const STAGE3_BUILD_TOOL_LABELS = {
  agent:  'Coding agent (Claude Code, Cursor, Windsurf)',
  vibe:   'Vibe coding platform (Bolt, Lovable, Replit)',
  chat:   'Chat AI (Claude, ChatGPT, Gemini)',
  nocode: 'No-code tools (Zapier, Notion, Airtable)',
  unsure: 'Not decided yet',
};

/* ---- Gate tool options ---- */
const STAGE3_GATE_TOOLS = [
  {
    value:  'chat',
    label:  'Chat AI',
    detail: 'Claude.ai, ChatGPT, Gemini',
    desc:   'No setup, no code. For workflows, structured documents, prompt systems, and processes that do not require a running application.',
  },
  {
    value:  'vibe',
    label:  'Vibe coding platform',
    detail: 'Bolt, Lovable, Replit',
    desc:   'Browser-based, no local setup. For web apps with a real interface, built without working in a terminal.',
  },
  {
    value:  'agent',
    label:  'Coding agent',
    detail: 'Claude Code, Cursor, Windsurf',
    desc:   'Works in a local code editor. For custom applications that need full control over data, logic, and architecture.',
  },
  {
    value:  'nocode',
    label:  'No-code tools',
    detail: 'Airtable, Notion, Zapier',
    desc:   'No code at all. For structured data, automation, and workflows using existing platforms.',
  },
];

/* ---- Gate decision prompt ---- */
const STAGE3_GATE_PROMPT_TEMPLATE =
`I am deciding how to build a project and need a recommendation on the best approach.

## Project
Name: {{projectName}}
Type: {{projectTypeLabel}}
Description: {{projectDesc}}

## My answers

More detail on what I am building:
{{projectDetail}}

My comfort working in a code editor or terminal:
{{techComfort}}

What matters most to me about how this gets built:
{{priority}}

---

Based on this, recommend ONE of the following approaches and explain why it fits my situation:

- Chat AI (Claude, ChatGPT, Gemini): No coding, no setup. For workflows, prompt systems, structured documents, or processes that do not require a running application.
- Vibe coding platform (Bolt, Lovable, Replit): Browser-based, no local setup. For web apps with a real interface, built without working in a terminal.
- Coding agent (Claude Code, Cursor, Windsurf): Works in a local code editor. For custom applications that need full control over data, logic, and architecture.
- No-code platform (Airtable, Notion, Zapier): No code at all. For structured data, automation, and workflows using existing platforms.

Name one. Explain the match in three to four sentences. If a second option is a close fit, note when I might choose it instead.`;

/* ---- Per-type document title and final section list ---- */
const STAGE3_TYPE_META = {
  app: {
    docTitle:  'Project Architecture and Tech Stack Document',
    sections:  '1. Recommended tech stack, with rationale for each choice\n2. System architecture overview\n3. Core components or modules\n4. Data structure or schema overview\n5. External dependencies and integrations\n6. Key architectural decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'architecture assessment',
  },
  website: {
    docTitle:  'Site Architecture and Tech Stack Document',
    sections:  '1. Recommended stack or platform, with rationale\n2. Site structure and page map\n3. Content management approach\n4. External integrations and dependencies\n5. Deployment and hosting plan\n6. Key decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'site architecture assessment',
  },
  document: {
    docTitle:  'Document System Design',
    sections:  '1. Document format and structure specification\n2. Required sections and their purpose\n3. Creation and generation process\n4. Audience and distribution approach\n5. Maintenance and update cadence\n6. Key design decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'document system design assessment',
  },
  workflow: {
    docTitle:  'Workflow Design Document',
    sections:  '1. Workflow steps and sequence\n2. Triggers, inputs, and outputs\n3. AI versus manual step breakdown\n4. Tools and platforms involved\n5. Error handling and failure modes\n6. Key design decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'workflow design assessment',
  },
  integration: {
    docTitle:  'Integration Design Document',
    sections:  '1. Systems being connected and their roles\n2. Data flow and trigger mapping\n3. Authentication and access approach\n4. Error handling and reliability design\n5. Tools and platforms involved\n6. Key design decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'integration design assessment',
  },
  'internal-tool': {
    docTitle:  'Internal Tool Design Document',
    sections:  '1. Recommended stack or platform, with rationale\n2. Data sources and structure\n3. Core actions and interface design\n4. Access model and roles\n5. External dependencies and integrations\n6. Key design decisions and their tradeoffs\n7. Risks and open questions',
    focus:     'tool design assessment',
  },
};

const STAGE3_DECISION_CAPTURE_PROMPT =
`I just finished an Architecture and Tech Stack conversation with an AI tool. Please summarize the key decisions we made during this conversation.

Format your response as a simple flat numbered list. One decision per line. Each line should state the decision and the reason for it in one sentence. No sub-bullets. No nested lists. Every item must start at the beginning of the line with its number.

Example format:
1. Use Python with Flask for the backend — lightweight, I already know Python, and this app has no real-time requirements
2. Store data in SQLite locally — no need for a server database given the single-user, local-only scope

Only include decisions we actually settled. Do not include things that were discussed but not resolved.`;

/* ---- Main prompt template ---- */
const STAGE3_PROMPT_TEMPLATE =
`You are helping me design {{docTitle}} before I begin building. Your job is to take my inputs and the full context from Stages 1 and 2 and help me work toward a finished design document.

Important: treat this as a conversation, not a monologue. After your initial response, point out assumptions that carry real risk, raise questions I have not considered, and offer alternatives where tradeoffs matter. We will iterate before producing the final document.

## Project: {{projectName}}
Type: {{projectTypeLabel}}
Build approach: {{buildToolLabel}}
{{projectDesc}}

---

## Stage 1: Problem Definition Document

{{stage1Context}}

---

## Stage 2: Constraint and Scope Document

{{stage2Context}}

---
{{collaborationNote}}
## Stage 3 Inputs

{{stageInputs}}

---

After reviewing everything above, give me your initial {{focus}}. Work through it section by section. Raise questions, flag risks, and push back where you see gaps. We will refine before producing the final document.

The final document (produced separately using the finalization prompt after we have iterated) must include:
{{sections}}`;

/* ---- Finalization prompt (generated per project type) ---- */
function getStage3FinalizationPrompt(projectType) {
  const meta = STAGE3_TYPE_META[projectType] || STAGE3_TYPE_META.app;
  return `We have been working through a design. Produce the final, clean ${meta.docTitle} now.\n\nWrite only the document. No preamble, no commentary, no explanation of changes.\n\nThe document must include these sections:\n${meta.sections}\n\nWrite in plain, direct language. No filler.`;
}

/* ============================================================
   stage3() — Alpine component
   ============================================================ */
function stage3(projectId, project) {
  return {

    /* --------------------------------------------------------
       Identity
    -------------------------------------------------------- */
    projectId,
    project,

    /* --------------------------------------------------------
       Gate state
    -------------------------------------------------------- */
    showGate:        false,
    gateTools:       STAGE3_GATE_TOOLS,
    gateAnswers:     { projectDetail: '', techComfort: '', priority: '' },
    showGateDecide:  false,
    gateCopySuccess: false,

    /* --------------------------------------------------------
       Resolved build tool
    -------------------------------------------------------- */
    resolvedBuildTool: '',

    /* --------------------------------------------------------
       Step state
    -------------------------------------------------------- */
    steps:       [],
    answers:     {},
    currentStep: 0,
    MIN_CHARS:   20,

    /* --------------------------------------------------------
       Prior stage context
    -------------------------------------------------------- */
    stage1Output:             '',
    stage2Output:             '',
    stage1CollaborationDepth: null,
    stage2CollaborationDepth: null,

    /* --------------------------------------------------------
       AI output
    -------------------------------------------------------- */
    aiOutput: '',

    /* --------------------------------------------------------
       UI state
    -------------------------------------------------------- */
    loading:                 true,
    macroStep:               1,
    isCompleted:             false,
    copySuccess:             false,
    finalizationCopySuccess: false,
    collaborationDepth:      null,
    reflectionText:          '',
    reflectionSaved:         false,
    pasteContent:            '',
    fileLabel:               '',
    completionGateMsg:          '',
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
      const step = this.steps[index];
      if (!step) return false;
      return (this.answers[step.key] || '').trim().length >= this.MIN_CHARS;
    },

    get allStepsComplete() {
      return this.steps.length > 0 && this.steps.every((_, i) => this.isStepDone(i));
    },

    get currentAnswer() {
      if (!this.steps[this.currentStep]) return '';
      return this.answers[this.steps[this.currentStep].key] || '';
    },

    set currentAnswer(v) {
      if (!this.steps[this.currentStep]) return;
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

    get buildToolLabel() {
      return STAGE3_BUILD_TOOL_LABELS[this.resolvedBuildTool] || '';
    },

    get projectTypeLabel() {
      const map = {
        app:           'App',
        website:       'Website',
        document:      'Document',
        workflow:      'Workflow',
        integration:   'Integration',
        'internal-tool': 'Internal Tool',
      };
      return map[(this.project || {}).projectType] || 'Project';
    },

    /* --------------------------------------------------------
       Gate prompt
    -------------------------------------------------------- */
    get generatedGatePrompt() {
      const p    = this.project || {};
      const desc = (p.description || '').trim() || '(no description provided)';
      return STAGE3_GATE_PROMPT_TEMPLATE
        .replace('{{projectName}}',     p.name || 'Untitled Project')
        .replace('{{projectTypeLabel}}',this.projectTypeLabel)
        .replace('{{projectDesc}}',     desc)
        .replace('{{projectDetail}}',   this.gateAnswers.projectDetail || '(not answered)')
        .replace('{{techComfort}}',     this.gateAnswers.techComfort   || '(not answered)')
        .replace('{{priority}}',        this.gateAnswers.priority      || '(not answered)');
    },

    /* --------------------------------------------------------
       Main prompt
    -------------------------------------------------------- */
    get generatedPrompt() {
      const a = this.answers;
      const p = this.project || {};
      const desc = p.description ? '\n' + p.description : '';

      const stage1Context = (this.stage1Output || '').trim()
        ? this.stage1Output.trim()
        : 'Stage 1 not yet completed. No problem definition available.';

      const stage2Context = (this.stage2Output || '').trim()
        ? this.stage2Output.trim()
        : 'Stage 2 not yet completed. No constraint and scope document available.';

      const depthMap = {
        first:    'Note: the Stage 2 Constraint and Scope Document was accepted on first AI response.',
        few:      'Note: the Stage 2 Constraint and Scope Document was refined through a few exchanges.',
        extended: 'Note: the Stage 2 Constraint and Scope Document was refined through extended conversation.',
      };
      const collaborationNote = this.stage2CollaborationDepth
        ? depthMap[this.stage2CollaborationDepth] + '\n\n'
        : '';

      const stageInputs = this.steps.map(step => {
        const val = (a[step.key] || '').trim() || '(not answered)';
        return '**' + step.question + '**\n' + val;
      }).join('\n\n');

      const typeMeta = STAGE3_TYPE_META[(p.projectType) || 'app'] || STAGE3_TYPE_META.app;

      return STAGE3_PROMPT_TEMPLATE
        .replace('{{docTitle}}',         typeMeta.docTitle)
        .replace('{{focus}}',            typeMeta.focus)
        .replace('{{sections}}',         typeMeta.sections)
        .replace('{{projectName}}',      p.name || 'Untitled Project')
        .replace('{{projectTypeLabel}}', this.projectTypeLabel)
        .replace('{{buildToolLabel}}',   this.buildToolLabel)
        .replace('{{projectDesc}}',      desc)
        .replace('{{stage1Context}}',    stage1Context)
        .replace('{{stage2Context}}',    stage2Context)
        .replace('{{collaborationNote}}',collaborationNote)
        .replace('{{stageInputs}}',      stageInputs);
    },

    /* --------------------------------------------------------
       Init
    -------------------------------------------------------- */
    async init() {
      /* Load Stage 1 context */
      const s1 = await DB.getStageRecord(this.projectId, 1);
      if (s1 && s1.data) {
        if (s1.data.aiOutput)                     this.stage1Output             = s1.data.aiOutput;
        if (s1.data.collaborationDepth !== undefined) this.stage1CollaborationDepth = s1.data.collaborationDepth;
      }

      /* Load Stage 2 context */
      const s2 = await DB.getStageRecord(this.projectId, 2);
      if (s2 && s2.data) {
        if (s2.data.aiOutput)                     this.stage2Output             = s2.data.aiOutput;
        if (s2.data.collaborationDepth !== undefined) this.stage2CollaborationDepth = s2.data.collaborationDepth;
      }

      /* Determine build tool */
      const buildTool = (this.project || {}).buildTool || 'unsure';
      if (buildTool === 'unsure') {
        this.resolvedBuildTool = 'chat'; /* fallback until gate selection */
        this.showGate = true;
      } else {
        this.resolvedBuildTool = buildTool;
      }

      /* Initialize steps */
      this._initSteps(this.resolvedBuildTool);

      /* Load existing Stage 3 record */
      const record = await DB.getStageRecord(this.projectId, 3);
      if (record && record.data) {
        const d = record.data;
        if (d.answers) {
          Object.keys(d.answers).forEach(k => {
            if (k in this.answers) this.answers[k] = d.answers[k];
          });
        }
        if (typeof d.currentStep    === 'number') this.currentStep    = d.currentStep;
        if (typeof d.macroStep      === 'number') this.macroStep      = d.macroStep;
        if (d.aiOutput)                           this.aiOutput       = d.aiOutput;
        if (d.collaborationDepth !== undefined)   this.collaborationDepth = d.collaborationDepth;
        if (d.gateAnswers)                        this.gateAnswers    = { ...this.gateAnswers, ...d.gateAnswers };
        if (record.status === 'complete')         this.isCompleted    = true;
      }

      /* Safety: if questions not complete, cannot be past step 1 */
      if (!this.allStepsComplete && this.macroStep > 1) this.macroStep = 1;

      this.loading = false;
    },

    /* --------------------------------------------------------
       Init steps for a given build tool
    -------------------------------------------------------- */
    _initSteps(buildTool) {
      const projectType = (this.project || {}).projectType || 'app';
      this.steps = getStage3Steps(buildTool, projectType).map(s => ({ ...s }));
      this.steps.forEach(s => {
        if (!(s.key in this.answers)) this.answers[s.key] = '';
      });
    },

    /* --------------------------------------------------------
       Gate: select build tool
    -------------------------------------------------------- */
    async selectBuildTool(value) {
      await DB.updateProject(this.projectId, { buildTool: value });
      this.project          = { ...this.project, buildTool: value };
      this.resolvedBuildTool = value;
      /* Re-init steps; preserve any answers already keyed to matching keys */
      this._initSteps(value);
      this.showGate = false;
      await this._persist();
      window.dispatchEvent(new CustomEvent('hora:stage-saved', {
        detail: { projectId: this.projectId },
      }));
    },

    /* --------------------------------------------------------
       Gate: copy decision prompt
    -------------------------------------------------------- */
    async copyGatePrompt() {
      const text = this.generatedGatePrompt;
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
      this.gateCopySuccess = true;
      setTimeout(() => { this.gateCopySuccess = false; }, 2500);
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
        gateAnswers:        { ...this.gateAnswers },
      };
      const status = this.isCompleted ? 'complete' : 'in_progress';
      await DB.saveStageRecord(this.projectId, 3, data, status);
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
       Stage 3 always includes full Stage 1 + Stage 2 documents.
       copyPrompt() is the only path. openAITab() opens a blank
       tab; it does not attempt to pre-populate the prompt.
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
      const projectType = (this.project || {}).projectType || 'app';
      const text = getStage3FinalizationPrompt(projectType);
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

    setCollaborationDepth(value) {
      this.collaborationDepth = this.collaborationDepth === value ? null : value;
      this.scheduleAutoSave();
    },

    async saveReflection() {
      const text = this.reflectionText.trim();
      if (!text) return;
      await DB.addNote(this.projectId, {
        stageNumber: 3,
        title:       'Stage 3 Reflection',
        content:     text,
      });
      this.reflectionText  = '';
      this.reflectionSaved = true;
      setTimeout(() => { this.reflectionSaved = false; }, 3000);
    },

    /* --------------------------------------------------------
       AI output import
    -------------------------------------------------------- */
    saveAiOutput() {
      const txt = this.pasteContent.trim();
      if (!txt) return;
      this.aiOutput    = txt;
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
      this.aiOutput    = '';
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
       Decision capture
    -------------------------------------------------------- */
    async copyDecisionCapturePrompt() {
      const text = STAGE3_DECISION_CAPTURE_PROMPT;
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
          await DB.addDecision(this.projectId, 3, {
            title,
            decision,
            context: 'Captured via Stage 3 session summary',
          });
        }
        this.decisionSaveMsg = parsed.length + ' decision' + (parsed.length !== 1 ? 's' : '') + ' saved to your Decision Journal.';
      } else {
        await DB.addDecision(this.projectId, 3, {
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
          'Please complete all ' + this.stepCount + ' steps first. Each answer needs at least ' +
          this.MIN_CHARS + ' characters.';
        return;
      }
      if (!this.aiOutput.trim()) {
        this.completionGateMsg =
          'Stage 3 is complete when you have an Architecture and Tech Stack Document. ' +
          'Paste your AI output below or upload a file.';
        return;
      }
      this.completionGateMsg = '';
      this.isCompleted = true;
      await this._persist();
      await DB.completeStage(this.projectId, 3);
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
