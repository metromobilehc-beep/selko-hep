/* ═══════════════════════════════════════════════════════════════
   SELKO HEP BUILDER — App Logic
   
   Dependencies:
     - selko-hep-data.js   (EXERCISE_LIBRARY array)
     - selko-hep-styles.css
     - Supabase JS v2 CDN  (loaded in index.html before this file)
     - SortableJS CDN      (loaded in index.html before this file)

   Supabase tables (selko-prod, shared multi-tenant project):
     hep_programs    - clinician-built programs, company_id-scoped RLS
                       (see 001_hep_programs_migration.sql)
     profiles        - existing table, used to resolve company_id
     companies       - existing table, has_hep feature flag gates access
     storage: hep-media bucket - patient photo/video uploads
                       (replaces the original base64-in-jsonb approach)

   Exercise library (EXERCISE_LIBRARY in selko-hep-data.js) stays a
   static JS array, not a DB table — matches Evan's original design
   and is fine since it's shared across all companies with no
   per-tenant data in it.

   ─── CONFIGURATION ────────────────────────────────────────────
   Just paste in the anon key below (URL is already filled in —
   same selko-prod project as Cred/Comply/Billing):
     SUPABASE_ANON → Project Settings → API → anon / public key
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://zxserlkhwkfoqiepurdr.supabase.co'; // selko-prod, shared with Cred/Comply/Billing
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4c2VybGtod2tmb3FpZXB1cmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDM1NDIsImV4cCI6MjA5NjAxOTU0Mn0.cA9LJSn5t4sIbIemdQGQsdwtQFwb-6Q9xIZi48UYq34'; // grab from Project Settings → API (same anon key Cred/Comply use)

/* ── Supabase client ──────────────────────────────────────────── */
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
const state = {
  user:            null,        // Supabase auth user
  companyId:       null,        // from profiles table — required for every insert
  currentSession:  [],          // [{exerciseId, sets, reps, freq, comment, patientPhoto, patientVideo}]
  programs:        [],          // clinician's saved programs from DB
  activeProgram:   null,        // program object currently open in detail view
  pendingExId:     null,        // exercise id waiting for popup action
  lang:            'en',        // 'en' | 'es'
  patientProgram:  null,        // program loaded in patient view
  completedToday:  {},          // { exerciseId: true } for patient daily tracking
};

/** Load the logged-in clinician's company_id + has_hep flag from profiles/companies.
 *  Every other Selko module (Cred, Comply) follows this same lookup. */
async function loadCompanyContext() {
  const { data: profile, error: profErr } = await db
    .from('profiles')
    .select('company_id')
    .eq('id', state.user.id)
    .single();

  if (profErr || !profile) {
    showToast('Could not load your profile — contact your admin');
    console.error(profErr);
    return false;
  }
  state.companyId = profile.company_id;

  const { data: company, error: compErr } = await db
    .from('companies')
    .select('has_hep')
    .eq('id', state.companyId)
    .single();

  if (compErr || !company?.has_hep) {
    showToast('HEP is not enabled for your company yet — contact your admin');
    return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS  (static UI strings only — exercise text uses
   Google Translate API on the fly for ES)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  en: {
    welcome:     'Welcome!',
    programReady:'Your personalized exercise program is ready.',
    viewProgram: 'View my program',
    footer:      'Reach out to your provider with any questions or concerns.',
    myExercises: 'My exercises',
    markDone:    '✓ Mark as done',
    completed:   '✓ Completed today',
    back:        '← Back',
  },
  es: {
    welcome:     '¡Bienvenido!',
    programReady:'Su programa de ejercicios personalizado está listo.',
    viewProgram: 'Ver mi programa',
    footer:      'Comuníquese con su proveedor si tiene preguntas o inquietudes.',
    myExercises: 'Mis ejercicios',
    markDone:    '✓ Marcar como hecho',
    completed:   '✓ Completado hoy',
    back:        '← Atrás',
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

/** Show a single screen, hide all others */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.style.display = 'flex';
    el.classList.add('active');
  }
  // header visible only on authenticated app screens
  const appScreens = [
    'screen-home','screen-exercises','screen-current',
    'screen-programs','screen-program-detail'
  ];
  const header = document.getElementById('app-header');
  if (appScreens.includes(id)) {
    header.classList.remove('hidden');
    header.style.display = 'flex';
  } else {
    header.classList.add('hidden');
    header.style.display = 'none';
  }
}

/** Show a temporary toast message */
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden', 'fade-out');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.classList.add('hidden'), 320);
  }, duration);
}

/** Generate a random 4-digit code (string) */
function makeCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Update the current-program badge count everywhere */
function updateBadges() {
  const n = state.currentSession.length;
  document.querySelectorAll('.badge').forEach(b => {
    b.textContent = n;
    b.dataset.count = n;
  });
  document.getElementById('current-hint').textContent =
    `${n} exercise${n !== 1 ? 's' : ''} selected this session. Adjust parameters below.`;
}

/** Open or close a modal */
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/** Format expiry date from ISO string */
function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
}

/** Find an exercise in EXERCISE_LIBRARY by id */
function getExercise(id) {
  return EXERCISE_LIBRARY.find(e => e.id === id) || null;
}

/** Upload a patient photo/video to the hep-media bucket and return its public URL.
 *  Path: hep-media/{company_id}/{clinician_id}/{exerciseId}_{kind}_{timestamp}.{ext}
 *  Replaces the old base64-in-jsonb approach, which would bloat rows and
 *  hit payload-size limits fast once a few programs had photos/videos. */
async function uploadPatientMedia(file, exerciseId, kind /* 'photo' | 'video' */) {
  const ext  = (file.name.split('.').pop() || (kind === 'photo' ? 'jpg' : 'mp4')).toLowerCase();
  const path = `${state.companyId}/${state.user.id}/${exerciseId}_${kind}_${Date.now()}.${ext}`;

  const { error } = await db.storage.from('hep-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    console.error(error);
    showToast(`Error uploading ${kind} — try again`);
    return null;
  }

  const { data } = db.storage.from('hep-media').getPublicUrl(path);
  return data.publicUrl;
}

/* ═══════════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════════ */

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  if (!email || !pw) {
    errEl.textContent = 'Please enter your email and password.';
    errEl.classList.remove('hidden');
    return;
  }

  const { data, error } = await db.auth.signInWithPassword({ email, password: pw });
  if (error) {
    errEl.textContent = error.message;
    errEl.classList.remove('hidden');
    return;
  }
  state.user = data.user;
  onLoginSuccess();
}

async function handleForgotPassword() {
  const email  = document.getElementById('forgot-email').value.trim();
  const msgEl  = document.getElementById('forgot-msg');
  msgEl.classList.add('hidden');

  if (!email) {
    msgEl.textContent = 'Please enter your email address.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/?reset=true',
  });

  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'alert alert-error';
  } else {
    msgEl.textContent = 'Reset link sent! Check your email inbox.';
    msgEl.className = 'alert alert-success';
  }
  msgEl.classList.remove('hidden');
}

async function handleSetNewPassword() {
  const pw      = document.getElementById('new-password').value;
  const pwConf  = document.getElementById('new-password-confirm').value;
  const msgEl   = document.getElementById('new-password-msg');
  msgEl.classList.add('hidden');

  if (pw.length < 8) {
    msgEl.textContent = 'Password must be at least 8 characters.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }
  if (pw !== pwConf) {
    msgEl.textContent = 'Passwords do not match.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  const { error } = await db.auth.updateUser({ password: pw });

  if (error) {
    msgEl.textContent = error.message;
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  // Password is set — now log them into the app properly.
  const { data: { session } } = await db.auth.getSession();
  state.user = session.user;
  await onLoginSuccess();
}

async function handleLogout() {
  await db.auth.signOut();
  state.user = null;
  state.currentSession = [];
  state.programs = [];
  closeNav();
  showScreen('screen-login');
}

async function onLoginSuccess() {
  document.getElementById('nav-user-email').textContent = state.user.email || '';
  const ok = await loadCompanyContext();
  if (!ok) {
    await handleLogout();
    return;
  }
  loadPrograms();
  showScreen('screen-home');
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */

function openNav() {
  const nav = document.getElementById('side-nav');
  nav.classList.remove('hidden');
  // trigger animation on next frame
  requestAnimationFrame(() => nav.classList.add('open'));
  nav.setAttribute('aria-hidden','false');
}

function closeNav() {
  const nav = document.getElementById('side-nav');
  nav.classList.remove('open');
  setTimeout(() => nav.classList.add('hidden'), 260);
  nav.setAttribute('aria-hidden','true');
}

/* ═══════════════════════════════════════════════════════════════
   EXERCISES SCREEN
   ═══════════════════════════════════════════════════════════════ */

function renderExerciseGrid(filter = '') {
  const grid = document.getElementById('exercise-grid');
  const term = filter.toLowerCase().trim();

  const filtered = EXERCISE_LIBRARY.filter(ex => {
    if (!term) return true;
    const haystack = [ex.name, ...(ex.keywords || [])].join(' ').toLowerCase();
    return haystack.includes(term);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div>
      <p>No exercises match "${filter}".</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(ex => {
    const inSession = state.currentSession.some(s => s.exerciseId === ex.id);
    return `
      <div class="ex-card ${inSession ? 'selected' : ''}" data-id="${ex.id}">
        <span class="ex-card-check" aria-hidden="true">✓</span>
        ${ex.image
          ? `<img class="ex-card-img" src="${ex.image}" alt="${ex.name}" loading="lazy">`
          : `<div class="ex-card-img-placeholder">🏋️</div>`}
        <div class="ex-card-label">${ex.name}</div>
      </div>`;
  }).join('');

  // click handlers
  grid.querySelectorAll('.ex-card').forEach(card => {
    card.addEventListener('click', () => onExerciseCardClick(card.dataset.id));
  });
}

function onExerciseCardClick(exId) {
  state.pendingExId = exId;
  const ex = getExercise(exId);
  document.getElementById('popup-ex-name').textContent = ex ? ex.name : '';
  openModal('exercise-popup');
}

/* ═══════════════════════════════════════════════════════════════
   CURRENT PROGRAM (in-session)
   ═══════════════════════════════════════════════════════════════ */

function addToCurrentSession(exId) {
  if (state.currentSession.some(s => s.exerciseId === exId)) {
    showToast('Already in current program');
    return;
  }
  state.currentSession.push({
    exerciseId:   exId,
    sets:         '',
    reps:         '',
    freq:         '',
    comment:      '',
    patientPhoto: null,
    patientVideo: null,
  });
  updateBadges();
  renderExerciseGrid(document.getElementById('exercise-search').value);
  showToast('Added to current program');
}

function removeFromSession(exId) {
  state.currentSession = state.currentSession.filter(s => s.exerciseId !== exId);
  updateBadges();
  renderExerciseGrid(document.getElementById('exercise-search').value);
  renderCurrentProgram();
}

function renderCurrentProgram() {
  const list    = document.getElementById('current-list');
  const empty   = document.getElementById('current-empty');
  const sendArea= document.getElementById('current-send-area');

  if (state.currentSession.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    sendArea.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  sendArea.classList.remove('hidden');

  list.innerHTML = state.currentSession.map((s, idx) => {
    const ex = getExercise(s.exerciseId);
    if (!ex) return '';
    return `
      <div class="ex-list-item" data-id="${s.exerciseId}" data-idx="${idx}">
        <div class="ex-list-item-header">
          <span class="drag-handle" title="Drag to reorder">⠿</span>
          ${ex.image
            ? `<img class="ex-list-thumb" src="${ex.image}" alt="${ex.name}">`
            : `<div class="ex-list-thumb-placeholder">🏋️</div>`}
          <div class="ex-list-info">
            <div class="ex-list-name">${ex.name}</div>
          </div>
          <button class="ex-list-remove" data-id="${s.exerciseId}" aria-label="Remove ${ex.name}">✕</button>
        </div>
        <div class="ex-list-params-row">
          <select class="param-select" data-id="${s.exerciseId}" data-field="sets" aria-label="Sets">
            <option value="">— Sets —</option>
            ${[1,2,3,4,5].map(n => `<option value="${n} set${n>1?'s':''}" ${s.sets===`${n} set${n>1?'s':''}`?'selected':''}>${n} set${n>1?'s':''}</option>`).join('')}
          </select>
          <select class="param-select" data-id="${s.exerciseId}" data-field="reps" aria-label="Reps">
            <option value="">— Reps —</option>
            ${[5,8,10,12,15,20,25,30].map(n => `<option value="${n} reps" ${s.reps===`${n} reps`?'selected':''}>${n} reps</option>`).join('')}
          </select>
          <select class="param-select" data-id="${s.exerciseId}" data-field="freq" aria-label="Frequency">
            <option value="">— /day —</option>
            ${[1,2,3,4].map(n => `<option value="${n}x/day" ${s.freq===`${n}x/day`?'selected':''}>${n}x/day</option>`).join('')}
          </select>
        </div>
        <div class="ex-list-comment">
          <textarea data-id="${s.exerciseId}" placeholder="Add a note or instruction for this exercise (optional)…" rows="2">${s.comment || ''}</textarea>
        </div>
        <!-- patient-specific photo/video upload -->
        <div style="padding:0 14px 12px;display:flex;gap:8px;flex-wrap:wrap;">
          <label style="font-size:12px;color:var(--text-muted);cursor:pointer;">
            📷 Patient photo
            <input type="file" accept="image/*" capture="environment" class="pt-photo-input" data-id="${s.exerciseId}" style="display:none">
          </label>
          <label style="font-size:12px;color:var(--text-muted);cursor:pointer;">
            🎥 Patient video
            <input type="file" accept="video/*" capture="environment" class="pt-video-input" data-id="${s.exerciseId}" style="display:none">
          </label>
          ${s.patientPhoto ? `<span style="font-size:12px;color:var(--teal-dark);">✓ Photo added</span>` : ''}
          ${s.patientVideo ? `<span style="font-size:12px;color:var(--teal-dark);">✓ Video added</span>` : ''}
        </div>
      </div>`;
  }).join('');

  // remove buttons
  list.querySelectorAll('.ex-list-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeFromSession(btn.dataset.id);
    });
  });

  // dropdown changes
  list.querySelectorAll('.param-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const item = state.currentSession.find(s => s.exerciseId === sel.dataset.id);
      if (item) item[sel.dataset.field] = sel.value;
    });
  });

  // comment boxes
  list.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      const item = state.currentSession.find(s => s.exerciseId === ta.dataset.id);
      if (item) item.comment = ta.value;
    });
  });

  // patient photo upload
  list.querySelectorAll('.pt-photo-input').forEach(inp => {
    inp.addEventListener('change', async () => {
      if (!inp.files[0]) return;
      showToast('Uploading photo…');
      const url = await uploadPatientMedia(inp.files[0], inp.dataset.id, 'photo');
      if (!url) return;
      const item = state.currentSession.find(s => s.exerciseId === inp.dataset.id);
      if (item) { item.patientPhoto = url; renderCurrentProgram(); }
    });
  });

  // patient video upload
  list.querySelectorAll('.pt-video-input').forEach(inp => {
    inp.addEventListener('change', async () => {
      if (!inp.files[0]) return;
      showToast('Uploading video…');
      const url = await uploadPatientMedia(inp.files[0], inp.dataset.id, 'video');
      if (!url) return;
      const item = state.currentSession.find(s => s.exerciseId === inp.dataset.id);
      if (item) { item.patientVideo = url; renderCurrentProgram(); }
    });
  });

  // drag-and-drop reorder (SortableJS)
  if (window.Sortable) {
    Sortable.create(list, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd(evt) {
        const moved = state.currentSession.splice(evt.oldIndex, 1)[0];
        state.currentSession.splice(evt.newIndex, 0, moved);
      },
    });
  }
}

/* ─── Send current program to patient ───────────────────────── */

async function initiateSendCurrent() {
  const nameInput = document.getElementById('current-program-name');
  const name = nameInput.value.trim();
  if (!name) {
    showToast('Please give the program a name first');
    nameInput.focus();
    return;
  }
  if (state.currentSession.length === 0) {
    showToast('Add at least one exercise first');
    return;
  }
  if (state.currentSession.length < 3) {
    openModal('few-ex-modal');
    return;
  }
  openModal('phone-modal');
}

async function sendCurrentProgram() {
  const phone = document.getElementById('patient-phone').value.replace(/\D/g,'');
  if (phone.length < 10) {
    showToast('Please enter a valid phone number');
    return;
  }
  const name  = document.getElementById('current-program-name').value.trim();
  const code  = makeCode();
  const expiry = new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString(); // 8 weeks

  // Build program payload
  const payload = {
    company_id:   state.companyId,
    clinician_id: state.user.id,
    name,
    exercises:    state.currentSession,
    code,
    phone,
    expiry,
    compliance_days: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db.from('hep_programs').insert([payload]).select().single();
  if (error) { showToast('Error saving program — try again'); console.error(error); return; }

  // Send SMS via edge function (Stephen will wire this up)
  const link = `${window.location.origin}?code=${code}`;
  const msg  = `Your exercise program is ready and available! Tap here ${link} and enter code: ${code}`;
  await db.functions.invoke('send-sms', { body: { phone: `+1${phone}`, message: msg } });

  // Reset session
  closeModal('phone-modal');
  state.currentSession = [];
  document.getElementById('current-program-name').value = '';
  updateBadges();
  await loadPrograms();
  showToast(`Program sent! Code: ${code}`);
  showScreen('screen-programs');
}

/* ═══════════════════════════════════════════════════════════════
   MY PROGRAMS
   ═══════════════════════════════════════════════════════════════ */

async function loadPrograms() {
  if (!state.user) return;
  const { data, error } = await db
    .from('hep_programs')
    .select('*')
    .eq('clinician_id', state.user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }

  // filter out expired programs
  const now = Date.now();
  state.programs = (data || []).filter(p => new Date(p.expiry).getTime() > now);
  renderProgramsList();
}

function renderProgramsList() {
  const list  = document.getElementById('programs-list');
  const empty = document.getElementById('programs-empty');

  if (state.programs.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = state.programs.map(p => `
    <div class="program-item" data-id="${p.id}">
      <div class="program-item-info">
        <div class="program-item-name" data-id="${p.id}">${p.name}</div>
        <div class="program-item-meta">${(p.exercises || []).length} exercises · Expires ${fmtDate(p.expiry)}</div>
      </div>
      ${p.compliance_days > 0 ? `<span class="compliance-badge" title="${p.compliance_days} days completed">${p.compliance_days}</span>` : ''}
      <span class="program-item-arrow">›</span>
    </div>`).join('');

  // click → detail
  list.querySelectorAll('.program-item').forEach(item => {
    item.addEventListener('click', () => openProgramDetail(item.dataset.id));
  });

  // long-press → rename
  list.querySelectorAll('.program-item-name').forEach(nameEl => {
    let pressTimer;
    nameEl.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => startRename(nameEl, nameEl.dataset.id), 600);
    });
    nameEl.addEventListener('pointerup',   () => clearTimeout(pressTimer));
    nameEl.addEventListener('pointerleave',() => clearTimeout(pressTimer));
  });
}

function startRename(nameEl, programId) {
  const current = nameEl.textContent;
  const inp = document.createElement('input');
  inp.className = 'rename-input';
  inp.value = current;
  nameEl.replaceWith(inp);
  inp.focus();
  inp.select();

  async function commit() {
    const val = inp.value.trim() || current;
    const span = document.createElement('div');
    span.className = 'program-item-name';
    span.dataset.id = programId;
    span.textContent = val;
    inp.replaceWith(span);
    if (val !== current) {
      await db.from('hep_programs').update({ name: val }).eq('id', programId);
      await loadPrograms();
    }
  }

  inp.addEventListener('blur',  commit);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
}

function openProgramDetail(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog) return;
  state.activeProgram = prog;

  document.getElementById('detail-program-name').textContent = prog.name;
  document.getElementById('delete-program-name').textContent = prog.name;

  const list = document.getElementById('detail-list');
  const exercises = prog.exercises || [];

  list.innerHTML = exercises.map(s => {
    const ex = getExercise(s.exerciseId);
    if (!ex) return '';
    const params = [s.sets, s.reps, s.freq].filter(Boolean).join(' · ');
    return `
      <div class="ex-list-item">
        <div class="ex-list-item-header">
          ${ex.image
            ? `<img class="ex-list-thumb" src="${ex.image}" alt="${ex.name}">`
            : `<div class="ex-list-thumb-placeholder">🏋️</div>`}
          <div class="ex-list-info">
            <div class="ex-list-name">${ex.name}</div>
            ${params ? `<div class="ex-list-params">${params}</div>` : ''}
            ${s.comment ? `<div class="ex-list-params" style="margin-top:4px;font-style:italic;">"${s.comment}"</div>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  // drag-and-drop reorder on saved program
  if (window.Sortable) {
    Sortable.create(list, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: async (evt) => {
        const moved = exercises.splice(evt.oldIndex, 1)[0];
        exercises.splice(evt.newIndex, 0, moved);
        await db.from('hep_programs').update({ exercises }).eq('id', programId);
      },
    });
  }

  showScreen('screen-program-detail');
}

async function deleteProgramConfirmed() {
  if (!state.activeProgram) return;
  const { error } = await db.from('hep_programs').delete().eq('id', state.activeProgram.id);
  if (error) { showToast('Error deleting — try again'); return; }
  closeModal('delete-modal');
  state.activeProgram = null;
  await loadPrograms();
  showScreen('screen-programs');
  showToast('Program deleted');
}

async function sendSavedProgram() {
  openModal('phone-modal');
}

async function resendCode() {
  openModal('resend-modal');
}

async function confirmResend() {
  const phone = document.getElementById('resend-phone').value.replace(/\D/g,'');
  if (phone.length < 10) { showToast('Enter a valid phone number'); return; }
  if (!state.activeProgram) return;

  const code = state.activeProgram.code;
  const link = `${window.location.origin}?code=${code}`;
  const msg  = `Your exercise program is ready and available! Tap here ${link} and enter code: ${code}`;

  await db.functions.invoke('send-sms', { body: { phone: `+1${phone}`, message: msg } });
  closeModal('resend-modal');
  showToast(`Code ${code} resent!`);
}

/* ─── Add exercise to a previous (saved) program ─────────────── */

function showPreviousProgramPicker() {
  const listEl = document.getElementById('prev-program-list');
  if (state.programs.length === 0) {
    showToast('No saved programs yet');
    closeModal('exercise-popup');
    return;
  }
  listEl.innerHTML = state.programs.map(p => `
    <button class="prev-item" data-id="${p.id}">${p.name}</button>`).join('');

  listEl.querySelectorAll('.prev-item').forEach(btn => {
    btn.addEventListener('click', () => addToPreviousProgram(btn.dataset.id));
  });

  closeModal('exercise-popup');
  openModal('prev-picker-overlay');
}

async function addToPreviousProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog || !state.pendingExId) return;

  // avoid duplicates
  if ((prog.exercises || []).some(s => s.exerciseId === state.pendingExId)) {
    showToast('Already in that program');
    closeModal('prev-picker-overlay');
    return;
  }

  const updated = [
    ...(prog.exercises || []),
    { exerciseId: state.pendingExId, sets:'', reps:'', freq:'', comment:'', patientPhoto:null, patientVideo:null },
  ];

  const { error } = await db.from('hep_programs').update({ exercises: updated }).eq('id', programId);
  if (error) { showToast('Error updating program'); return; }

  await loadPrograms();
  closeModal('prev-picker-overlay');
  state.pendingExId = null;
  showToast('Exercise added to program');
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT VIEW
   ═══════════════════════════════════════════════════════════════ */

/** Called on page load — checks for ?code= in URL */
async function checkPatientURL() {
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');
  if (code) {
    // Skip clinician login and go straight to patient entry
    showScreen('screen-patient-entry');
    // pre-fill the code digits if 4 chars
    if (code.length === 4) {
      const inputs = document.querySelectorAll('.code-digit');
      code.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
    }
  }
}

async function submitPatientCode() {
  const digits = [...document.querySelectorAll('.code-digit')].map(i => i.value).join('');
  const errEl  = document.getElementById('patient-error');
  errEl.classList.add('hidden');

  if (digits.length < 4) {
    errEl.textContent = 'Please enter the full 4-digit code.';
    errEl.classList.remove('hidden');
    return;
  }

  // Look up the code in hep_programs
  const { data, error } = await db
    .from('hep_programs')
    .select('*')
    .eq('code', digits)
    .single();

  if (error || !data) {
    errEl.textContent = 'Code not found. Please check and try again.';
    errEl.classList.remove('hidden');
    return;
  }

  // Check expiry
  if (new Date(data.expiry).getTime() < Date.now()) {
    errEl.textContent = 'This program has expired. Contact your provider for a new link.';
    errEl.classList.remove('hidden');
    return;
  }

  state.patientProgram = data;
  loadCompletedToday();
  applyLang(state.lang);
  showScreen('screen-patient-home');
}

function loadCompletedToday() {
  // store in localStorage keyed by program id + today's date
  const key = `selko_done_${state.patientProgram?.id}_${new Date().toDateString()}`;
  try {
    const saved = localStorage.getItem(key);
    state.completedToday = saved ? JSON.parse(saved) : {};
  } catch { state.completedToday = {}; }
}

function saveCompletedToday() {
  const key = `selko_done_${state.patientProgram?.id}_${new Date().toDateString()}`;
  try { localStorage.setItem(key, JSON.stringify(state.completedToday)); } catch {}

  // check if all exercises done today → increment compliance_days on DB
  const prog = state.patientProgram;
  if (!prog) return;
  const allDone = (prog.exercises || []).every(s => state.completedToday[s.exerciseId]);
  if (allDone) {
    // Only credit once per calendar day — check flag
    const creditKey = `selko_credited_${prog.id}_${new Date().toDateString()}`;
    if (!localStorage.getItem(creditKey)) {
      localStorage.setItem(creditKey, '1');
      db.from('hep_programs')
        .update({ compliance_days: (prog.compliance_days || 0) + 1 })
        .eq('id', prog.id)
        .then(() => { prog.compliance_days = (prog.compliance_days || 0) + 1; });
    }
  }
}

function renderPatientExerciseGrid() {
  const grid = document.getElementById('patient-exercise-grid');
  const prog = state.patientProgram;
  if (!prog) return;

  grid.innerHTML = (prog.exercises || []).map(s => {
    const ex = getExercise(s.exerciseId);
    if (!ex) return '';
    const done = state.completedToday[s.exerciseId];
    return `
      <div class="ex-card ${done ? 'done' : ''}" data-id="${s.exerciseId}">
        <span class="ex-card-done" aria-hidden="true">✓</span>
        ${s.patientPhoto
          ? `<img class="ex-card-img" src="${s.patientPhoto}" alt="${ex.name}">`
          : ex.image
            ? `<img class="ex-card-img" src="${ex.image}" alt="${ex.name}" loading="lazy">`
            : `<div class="ex-card-img-placeholder">🏋️</div>`}
        <div class="ex-card-label">${ex.name}</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.ex-card').forEach(card => {
    card.addEventListener('click', () => openPatientExercise(card.dataset.id));
  });
}

function openPatientExercise(exId) {
  const prog = state.patientProgram;
  const sessionItem = (prog?.exercises || []).find(s => s.exerciseId === exId);
  const ex = getExercise(exId);
  if (!ex || !sessionItem) return;

  document.getElementById('pt-ex-name').textContent = ex.name;

  // image — prefer patient-specific photo, fall back to stock
  const imgEl = document.getElementById('pt-ex-img');
  const src   = sessionItem.patientPhoto || ex.image || '';
  if (src) { imgEl.src = src; imgEl.alt = ex.name; imgEl.classList.remove('hidden'); }
  else { imgEl.classList.add('hidden'); }

  // video
  const videoWrap = document.getElementById('pt-ex-video-wrap');
  const videoEl   = document.getElementById('pt-ex-video');
  if (sessionItem.patientVideo) {
    videoEl.src = sessionItem.patientVideo;
    videoWrap.classList.remove('hidden');
  } else {
    videoWrap.classList.add('hidden');
    videoEl.src = '';
  }

  // params
  const params = [sessionItem.sets, sessionItem.reps, sessionItem.freq].filter(Boolean).join(' · ');
  document.getElementById('pt-params').textContent = params || '';
  document.getElementById('pt-params').style.display = params ? 'block' : 'none';

  // comment
  document.getElementById('pt-comments').textContent = sessionItem.comment || '';

  // complete button state
  const done       = !!state.completedToday[exId];
  const btnComplete = document.getElementById('btn-complete');
  const doneLine    = document.getElementById('complete-done');
  const t = T[state.lang];
  if (done) {
    btnComplete.classList.add('hidden');
    doneLine.textContent = t.completed;
    doneLine.classList.remove('hidden');
  } else {
    btnComplete.textContent = t.markDone;
    btnComplete.classList.remove('hidden');
    doneLine.classList.add('hidden');
    btnComplete.onclick = () => markExerciseDone(exId);
  }

  showScreen('screen-patient-exercise');
}

function markExerciseDone(exId) {
  state.completedToday[exId] = true;
  saveCompletedToday();
  // update UI
  const t = T[state.lang];
  document.getElementById('btn-complete').classList.add('hidden');
  const doneLine = document.getElementById('complete-done');
  doneLine.textContent = t.completed;
  doneLine.classList.remove('hidden');
  // update grid card
  const card = document.querySelector(`#patient-exercise-grid .ex-card[data-id="${exId}"]`);
  if (card) card.classList.add('done');
}

/* ── Language toggle ──────────────────────────────────────────── */
function applyLang(lang) {
  state.lang = lang;
  const t = T[lang];

  // patient screens
  document.getElementById('pt-welcome-title').textContent    = t.welcome;
  document.getElementById('pt-welcome-sub').textContent      = t.programReady;
  document.getElementById('btn-patient-view-program').textContent = t.viewProgram;
  document.querySelectorAll('.patient-footer').forEach(el => el.textContent = t.footer);
  document.getElementById('pt-list-title').textContent       = t.myExercises;

  // complete button if on exercise screen
  const btnComplete = document.getElementById('btn-complete');
  if (btnComplete && !btnComplete.classList.contains('hidden')) {
    btnComplete.textContent = t.markDone;
  }
  const doneLine = document.getElementById('complete-done');
  if (doneLine && !doneLine.classList.contains('hidden')) {
    doneLine.textContent = t.completed;
  }

  // active state on toggle buttons
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

/* ═══════════════════════════════════════════════════════════════
   BOOT — initialise everything on DOM ready
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* ── Check if this is a patient link first ─────────────────── */
  const params = new URLSearchParams(window.location.search);
  const isRecovery = params.get('reset') === 'true' || window.location.hash.includes('type=recovery');

  if (params.get('code')) {
    showScreen('screen-patient-entry');
    const code = params.get('code');
    if (code.length === 4) {
      const inputs = document.querySelectorAll('.code-digit');
      code.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
    }
  } else if (isRecovery) {
    /* Recovery link clicked — Supabase already created a temporary
       session, but the user must set a real password before reaching
       the app. onAuthStateChange's PASSWORD_RECOVERY handler also
       covers this, but we check here too in case that event already
       fired before this listener was attached. */
    showScreen('screen-new-password');
  } else {
    /* ── Check existing Supabase session ───────────────────────── */
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      state.user = session.user;
      await onLoginSuccess();
    } else {
      showScreen('screen-login');
    }
  }

  /* ─── AUTH listeners ──────────────────────────────────────── */
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('btn-forgot').addEventListener('click', () => showScreen('screen-forgot'));
  document.getElementById('btn-back-login').addEventListener('click', () => showScreen('screen-login'));
  document.getElementById('btn-send-reset').addEventListener('click', handleForgotPassword);
  document.getElementById('btn-set-new-password').addEventListener('click', handleSetNewPassword);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  /* ─── NAV ─────────────────────────────────────────────────── */
  document.getElementById('btn-menu').addEventListener('click', openNav);
  document.getElementById('nav-overlay').addEventListener('click', closeNav);

  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeNav();
      const target = btn.dataset.screen;
      if (target === 'screen-exercises') {
        renderExerciseGrid();
        updateBadges();
      }
      if (target === 'screen-programs') loadPrograms();
      showScreen(target);
    });
  });

  // Quick-action cards on home screen
  document.querySelectorAll('.quick-card[data-screen]').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.screen;
      if (target === 'screen-exercises') { renderExerciseGrid(); updateBadges(); }
      if (target === 'screen-programs')  loadPrograms();
      showScreen(target);
    });
  });

  /* ─── SEARCH ──────────────────────────────────────────────── */
  const searchInput = document.getElementById('exercise-search');
  const searchClear = document.getElementById('btn-search-clear');

  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    searchClear.classList.toggle('hidden', !val);
    renderExerciseGrid(val);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    renderExerciseGrid();
    searchInput.focus();
  });

  /* ─── EXERCISE POPUP ──────────────────────────────────────── */
  document.getElementById('btn-add-current').addEventListener('click', () => {
    if (state.pendingExId) addToCurrentSession(state.pendingExId);
    closeModal('exercise-popup');
    state.pendingExId = null;
  });

  document.getElementById('btn-add-previous').addEventListener('click', () => {
    showPreviousProgramPicker();
  });

  document.getElementById('exercise-popup').addEventListener('click', e => {
    if (e.target === document.getElementById('exercise-popup')) {
      closeModal('exercise-popup');
      state.pendingExId = null;
    }
  });

  document.getElementById('btn-prev-cancel').addEventListener('click', () => {
    closeModal('prev-picker-overlay');
    state.pendingExId = null;
  });

  /* ─── CURRENT PROGRAM BUTTONS ─────────────────────────────── */
  document.getElementById('btn-view-current-home').addEventListener('click', () => {
    renderCurrentProgram();
    showScreen('screen-current');
  });
  document.getElementById('btn-view-current-ex').addEventListener('click', () => {
    renderCurrentProgram();
    showScreen('screen-current');
  });

  document.getElementById('btn-back-from-current').addEventListener('click', () => {
    renderExerciseGrid(searchInput.value);
    showScreen('screen-exercises');
  });

  document.getElementById('btn-send-current').addEventListener('click', initiateSendCurrent);

  // few-exercises modal
  document.getElementById('btn-few-yes').addEventListener('click', () => {
    closeModal('few-ex-modal');
    openModal('phone-modal');
  });
  document.getElementById('btn-few-no').addEventListener('click', () => closeModal('few-ex-modal'));

  // phone modal
  document.getElementById('btn-confirm-send').addEventListener('click', sendCurrentProgram);
  document.getElementById('btn-cancel-send').addEventListener('click', () => closeModal('phone-modal'));

  /* ─── MY PROGRAMS ─────────────────────────────────────────── */
  document.getElementById('btn-back-from-detail').addEventListener('click', () => {
    showScreen('screen-programs');
  });

  document.getElementById('btn-send-saved').addEventListener('click', sendSavedProgram);
  document.getElementById('btn-resend-code').addEventListener('click', resendCode);
  document.getElementById('btn-delete-program').addEventListener('click', () => openModal('delete-modal'));
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteProgramConfirmed);
  document.getElementById('btn-cancel-delete').addEventListener('click', () => closeModal('delete-modal'));

  // resend modal
  document.getElementById('btn-confirm-resend').addEventListener('click', confirmResend);
  document.getElementById('btn-cancel-resend').addEventListener('click', () => closeModal('resend-modal'));

  // When "Send to patient" is clicked from saved program detail, reuse phone modal
  document.getElementById('btn-confirm-send').addEventListener('click', async () => {
    // If we're in the detail view (not current build), send from active program
    if (
      document.getElementById('screen-program-detail').classList.contains('active') &&
      state.activeProgram
    ) {
      const phone = document.getElementById('patient-phone').value.replace(/\D/g,'');
      if (phone.length < 10) { showToast('Enter a valid phone number'); return; }
      const code = state.activeProgram.code;
      const link = `${window.location.origin}?code=${code}`;
      const msg  = `Your exercise program is ready and available! Tap here ${link} and enter code: ${code}`;
      await db.functions.invoke('send-sms', { body: { phone: `+1${phone}`, message: msg } });
      closeModal('phone-modal');
      showToast(`Program sent! Code: ${code}`);
    }
  });

  /* ─── PATIENT VIEW ────────────────────────────────────────── */
  document.getElementById('btn-patient-submit').addEventListener('click', submitPatientCode);

  document.querySelectorAll('.code-digit').forEach((inp, i, all) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/,'').slice(-1);
      if (inp.value && all[i + 1]) all[i + 1].focus();
      // auto-submit when last digit entered
      if (i === 3 && inp.value) submitPatientCode();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && all[i - 1]) all[i - 1].focus();
    });
  });

  document.getElementById('btn-patient-view-program').addEventListener('click', () => {
    renderPatientExerciseGrid();
    showScreen('screen-patient-list');
  });

  document.getElementById('btn-patient-back-home').addEventListener('click', () => {
    showScreen('screen-patient-home');
  });

  document.getElementById('btn-patient-back-list').addEventListener('click', () => {
    renderPatientExerciseGrid(); // refresh completion states
    showScreen('screen-patient-list');
  });

  /* ─── LANGUAGE TOGGLE ─────────────────────────────────────── */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  /* ─── Supabase auth state changes ────────────────────────── */
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      state.user = null;
      showScreen('screen-login');
    }
    if (event === 'PASSWORD_RECOVERY') {
      showScreen('screen-new-password');
    }
  });

}); // end DOMContentLoaded
