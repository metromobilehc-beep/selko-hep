/* ═══════════════════════════════════════════════════════════════
   SELKO HEP BUILDER — App Logic
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://zxserlkhwkfoqiepurdr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4c2VybGtod2tmb3FpZXB1cmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDM1NDIsImV4cCI6MjA5NjAxOTU0Mn0.cA9LJSn5t4sIbIemdQGQsdwtQFwb-6Q9xIZi48UYq34';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
const state = {
  user:            null,
  companyId:       null,
  currentSession:  [],
  programs:        [],
  activeProgram:   null,
  pendingExId:     null,
  lang:            'en',
  patientProgram:  null,
  completedToday:  {},
  exerciseLibrary: [],
  isAdmin:         false,
};

/* ═══════════════════════════════════════════════════════════════
   COMPANY CONTEXT
   ═══════════════════════════════════════════════════════════════ */
async function loadCompanyContext() {
  const { data: profile, error: profErr } = await db
    .from('profiles')
    .select('company_id, role, is_super_admin')
    .eq('id', state.user.id)
    .single();

  if (profErr || !profile) {
    showToast('Could not load your profile — contact your admin');
    console.error(profErr);
    return false;
  }
  state.companyId = profile.company_id;
  state.isAdmin   = profile.role === 'admin' || profile.is_super_admin === true;

  const { data: company, error: compErr } = await db
    .from('companies')
    .select('has_hep')
    .eq('id', state.companyId)
    .single();

  if (compErr || !company?.has_hep) {
    showToast('HEP is not enabled for your company yet — contact your admin');
    return false;
  }

  await loadCustomExercises();
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   EXERCISE LIBRARY (built-in + custom)
   ═══════════════════════════════════════════════════════════════ */
async function loadCustomExercises() {
  const { data, error } = await db
    .from('hep_custom_exercises')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    state.exerciseLibrary = [...EXERCISE_LIBRARY];
    return;
  }

  const custom = (data || []).map(row => ({
    id:           row.id,
    name:         row.name,
    image:        row.image || '',
    keywords:     row.keywords || [],
    instructions: row.instructions || '',
    date_added:   row.created_at,
    added_by:     'custom',
    is_custom:    true,
  }));

  state.exerciseLibrary = [...EXERCISE_LIBRARY, ...custom];
}

function getExercise(id) {
  return state.exerciseLibrary.find(e => e.id === id) || null;
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — EXERCISE LIST
   ═══════════════════════════════════════════════════════════════ */
function renderAdminExerciseList() {
  const list  = document.getElementById('admin-custom-ex-list');
  const empty = document.getElementById('admin-custom-ex-empty');
  const custom = state.exerciseLibrary.filter(ex => ex.is_custom);

  if (custom.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.innerHTML = custom.map(ex => `
    <div class="program-item" data-id="${ex.id}">
      <div class="program-item-info">
        <div class="program-item-name">${ex.name}</div>
        <div class="program-item-meta">${ex.instructions ? ex.instructions.slice(0, 60) + (ex.instructions.length > 60 ? '…' : '') : 'No instructions added'}</div>
      </div>
      <button class="ex-list-remove btn-delete-custom-ex" data-id="${ex.id}" aria-label="Delete ${ex.name}">🗑</button>
    </div>`).join('');

  list.querySelectorAll('.btn-delete-custom-ex').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const ex = custom.find(c => c.id === id);
      if (!confirm(`Delete "${ex?.name}"? This can't be undone.`)) return;
      const { error } = await db.from('hep_custom_exercises').delete().eq('id', id);
      if (error) { console.error(error); showToast('Could not delete — try again'); return; }
      await loadCustomExercises();
      renderAdminExerciseList();
      showToast('Exercise deleted');
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — USER LIST
   ═══════════════════════════════════════════════════════════════ */
async function loadAndRenderUserList() {
  const list  = document.getElementById('admin-user-list');
  const empty = document.getElementById('admin-user-empty');

  list.innerHTML = '<div class="screen-hint" style="padding:12px 0;">Loading clinicians…</div>';

  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email, role, is_super_admin')
    .eq('company_id', state.companyId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error(error);
    list.innerHTML = '<div class="screen-hint" style="padding:12px 0;color:var(--danger);">Could not load users.</div>';
    return;
  }

  const users = data || [];

  if (users.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = users.map(u => {
    const badge = u.is_super_admin
      ? '<span style="font-size:10px;background:var(--teal-dark);color:#fff;border-radius:4px;padding:2px 6px;font-family:var(--font-head);font-weight:600;margin-left:6px;">ADMIN</span>'
      : u.role === 'admin'
        ? '<span style="font-size:10px;background:var(--amber);color:#fff;border-radius:4px;padding:2px 6px;font-family:var(--font-head);font-weight:600;margin-left:6px;">ADMIN</span>'
        : '';
    return `
      <div class="program-item">
        <div class="program-item-info">
          <div class="program-item-name" style="display:flex;align-items:center;gap:4px;">
            ${u.full_name || '—'}${badge}
          </div>
          <div class="program-item-meta">${u.email || ''}</div>
        </div>
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — INVITE USER
   ═══════════════════════════════════════════════════════════════ */
function openInviteModal() {
  document.getElementById('invite-name').value  = '';
  document.getElementById('invite-email').value = '';
  const msgEl = document.getElementById('invite-user-msg');
  msgEl.classList.add('hidden');
  msgEl.className = 'alert hidden';
  document.getElementById('invite-user-modal').classList.remove('hidden');
}

async function handleSendInvite() {
  const nameEl  = document.getElementById('invite-name');
  const emailEl = document.getElementById('invite-email');
  const msgEl   = document.getElementById('invite-user-msg');
  const btn     = document.getElementById('btn-confirm-invite');
  msgEl.classList.add('hidden');

  const name  = nameEl.value.trim();
  const email = emailEl.value.trim();

  if (!name) {
    msgEl.textContent = 'Please enter the clinician\'s full name.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }
  if (!email || !email.includes('@')) {
    msgEl.textContent = 'Please enter a valid email address.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const { data, error } = await db.functions.invoke('invite-staff', {
      body: {
        name,
        email,
        company_id: state.companyId,
        role:       'clinician',
        app:        'hep',
      },
    });

    if (error || data?.error) throw new Error(error?.message || data?.error || 'Unknown error');

    msgEl.textContent = `Invite sent to ${email}! They'll receive an email with a link to set up their account.`;
    msgEl.className = 'alert alert-success';
    msgEl.classList.remove('hidden');
    nameEl.value  = '';
    emailEl.value = '';

    loadAndRenderUserList();

    setTimeout(() => {
      document.getElementById('invite-user-modal').classList.add('hidden');
    }, 3000);

  } catch (err) {
    console.error('Invite error:', err);
    msgEl.textContent = 'Could not send invite — ' + (err.message || 'please try again.');
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send invite';
  }
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — SAVE NEW EXERCISE
   ═══════════════════════════════════════════════════════════════ */
async function uploadExercisePhoto(file) {
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${state.companyId}/exercise-library/${Date.now()}.${ext}`;
  const { error } = await db.storage.from('hep-media').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error(error); return null; }
  const { data } = db.storage.from('hep-media').getPublicUrl(path);
  return data.publicUrl;
}

async function handleSaveNewExercise() {
  const nameEl  = document.getElementById('new-ex-name');
  const instrEl = document.getElementById('new-ex-instructions');
  const kwEl    = document.getElementById('new-ex-keywords');
  const photoEl = document.getElementById('new-ex-photo');
  const msgEl   = document.getElementById('add-exercise-msg');
  const btn     = document.getElementById('btn-save-new-exercise');
  msgEl.classList.add('hidden');

  const name = nameEl.value.trim();
  if (!name) {
    msgEl.textContent = 'Please enter an exercise name.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Saving…';

  let imageUrl = '';
  if (photoEl.files[0]) imageUrl = await uploadExercisePhoto(photoEl.files[0]) || '';

  const keywords = kwEl.value.split(',').map(k => k.trim()).filter(Boolean);

  const { error } = await db.from('hep_custom_exercises').insert([{
    company_id:   state.companyId,
    created_by:   state.user.id,
    name,
    image:        imageUrl,
    instructions: instrEl.value.trim(),
    keywords,
  }]);

  btn.disabled = false;
  btn.textContent = 'Save exercise';

  if (error) {
    console.error(error);
    msgEl.textContent = 'Could not save exercise — try again.';
    msgEl.className = 'alert alert-error';
    msgEl.classList.remove('hidden');
    return;
  }

  nameEl.value = ''; instrEl.value = ''; kwEl.value = ''; photoEl.value = '';
  await loadCustomExercises();
  renderExerciseGrid(document.getElementById('exercise-search').value);
  if (document.getElementById('admin-custom-ex-list')) renderAdminExerciseList();
  document.getElementById('add-exercise-modal').classList.add('hidden');
  showToast('Exercise added');
}

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS
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
  const appScreens = [
    'screen-home','screen-exercises','screen-current',
    'screen-programs','screen-program-detail','screen-admin'
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

function makeCode() { return String(Math.floor(1000 + Math.random() * 9000)); }

function updateBadges() {
  const n = state.currentSession.length;
  document.querySelectorAll('.badge').forEach(b => { b.textContent = n; b.dataset.count = n; });
  document.getElementById('current-hint').textContent =
    `${n} exercise${n !== 1 ? 's' : ''} selected this session. Adjust parameters below.`;
}

function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function fmtDate(iso)   { return iso ? new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : ''; }

async function uploadPatientMedia(file, exerciseId, kind) {
  const ext  = (file.name.split('.').pop() || (kind === 'photo' ? 'jpg' : 'mp4')).toLowerCase();
  const path = `${state.companyId}/${state.user.id}/${exerciseId}_${kind}_${Date.now()}.${ext}`;
  const { error } = await db.storage.from('hep-media').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error(error); showToast(`Error uploading ${kind} — try again`); return null; }
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
  if (!email || !pw) { errEl.textContent = 'Please enter your email and password.'; errEl.classList.remove('hidden'); return; }
  const { data, error } = await db.auth.signInWithPassword({ email, password: pw });
  if (error) { errEl.textContent = error.message; errEl.classList.remove('hidden'); return; }
  state.user = data.user;
  onLoginSuccess();
}

async function handleForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim();
  const msgEl = document.getElementById('forgot-msg');
  msgEl.classList.add('hidden');
  if (!email) { msgEl.textContent = 'Please enter your email address.'; msgEl.className = 'alert alert-error'; msgEl.classList.remove('hidden'); return; }
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/?reset=true' });
  if (error) { msgEl.textContent = error.message; msgEl.className = 'alert alert-error'; }
  else { msgEl.textContent = 'Reset link sent! Check your email inbox.'; msgEl.className = 'alert alert-success'; }
  msgEl.classList.remove('hidden');
}

async function handleSetNewPassword() {
  const pw     = document.getElementById('new-password').value;
  const pwConf = document.getElementById('new-password-confirm').value;
  const msgEl  = document.getElementById('new-password-msg');
  msgEl.classList.add('hidden');
  if (pw.length < 8) { msgEl.textContent = 'Password must be at least 8 characters.'; msgEl.className = 'alert alert-error'; msgEl.classList.remove('hidden'); return; }
  if (pw !== pwConf) { msgEl.textContent = 'Passwords do not match.'; msgEl.className = 'alert alert-error'; msgEl.classList.remove('hidden'); return; }
  const { error } = await db.auth.updateUser({ password: pw });
  if (error) { msgEl.textContent = error.message; msgEl.className = 'alert alert-error'; msgEl.classList.remove('hidden'); return; }
  const { data: { session } } = await db.auth.getSession();
  state.user = session.user;
  await onLoginSuccess();
}

async function handleLogout() {
  await db.auth.signOut();
  state.user = null; state.currentSession = []; state.programs = [];
  closeNav();
  showScreen('screen-login');
}

async function onLoginSuccess() {
  document.getElementById('nav-user-email').textContent = state.user.email || '';
  const ok = await loadCompanyContext();
  if (!ok) { await handleLogout(); return; }
  loadPrograms();
  applyAdminVisibility();
  showScreen('screen-home');
}

function applyAdminVisibility() {
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.toggle('hidden', !state.isAdmin);
  });
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */
function openNav() {
  const nav = document.getElementById('side-nav');
  nav.classList.remove('hidden');
  nav.removeAttribute('inert');
  nav.removeAttribute('aria-hidden');
  requestAnimationFrame(() => nav.classList.add('open'));
}

function closeNav() {
  const nav     = document.getElementById('side-nav');
  const menuBtn = document.getElementById('btn-menu');
  if (menuBtn) menuBtn.focus();
  nav.classList.remove('open');
  setTimeout(() => {
    nav.classList.add('hidden');
    nav.setAttribute('inert', '');
    nav.setAttribute('aria-hidden', 'true');
  }, 260);
}

/* ═══════════════════════════════════════════════════════════════
   EXERCISES SCREEN
   ═══════════════════════════════════════════════════════════════ */
function renderExerciseGrid(filter = '') {
  const grid = document.getElementById('exercise-grid');
  const term = filter.toLowerCase().trim();
  const filtered = state.exerciseLibrary.filter(ex => {
    if (!term) return true;
    return [ex.name, ...(ex.keywords || [])].join(' ').toLowerCase().includes(term);
  });
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No exercises match "${filter}".</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(ex => {
    const inSession = state.currentSession.some(s => s.exerciseId === ex.id);
    return `
      <div class="ex-card ${inSession ? 'selected' : ''}" data-id="${ex.id}">
        <span class="ex-card-check" aria-hidden="true">✓</span>
        ${ex.image ? `<img class="ex-card-img" src="${ex.image}" alt="${ex.name}" loading="lazy">` : `<div class="ex-card-img-placeholder">🏋️</div>`}
        <div class="ex-card-label">${ex.name}</div>
      </div>`;
  }).join('');
  grid.querySelectorAll('.ex-card').forEach(card => {
    card.addEventListener('click', () => onExerciseCardClick(card.dataset.id));
  });
}

/* ─── Exercise card click — FIX: shows remove button when exercise
       is already in the current session so clinicians can deselect
       without leaving the exercises screen ──────────────────────── */
function onExerciseCardClick(exId) {
  state.pendingExId = exId;
  const ex = getExercise(exId);
  document.getElementById('popup-ex-name').textContent = ex ? ex.name : '';

  // Toggle add vs remove based on whether it's already in the session
  const inSession  = state.currentSession.some(s => s.exerciseId === exId);
  const addBtn     = document.getElementById('btn-add-current');
  const removeBtn  = document.getElementById('btn-remove-from-current');

  if (inSession) {
    addBtn.classList.add('hidden');
    removeBtn.classList.remove('hidden');
  } else {
    addBtn.classList.remove('hidden');
    removeBtn.classList.add('hidden');
  }

  openModal('exercise-popup');
}

/* ═══════════════════════════════════════════════════════════════
   CURRENT PROGRAM
   ═══════════════════════════════════════════════════════════════ */
function addToCurrentSession(exId) {
  if (state.currentSession.some(s => s.exerciseId === exId)) { showToast('Already in current program'); return; }
  state.currentSession.push({ exerciseId: exId, sets: '', reps: '', freq: '', comment: '', patientPhoto: null, patientVideo: null });
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
  const list     = document.getElementById('current-list');
  const empty    = document.getElementById('current-empty');
  const sendArea = document.getElementById('current-send-area');
  if (state.currentSession.length === 0) {
    list.innerHTML = ''; empty.classList.remove('hidden'); sendArea.classList.add('hidden'); return;
  }
  empty.classList.add('hidden'); sendArea.classList.remove('hidden');
  list.innerHTML = state.currentSession.map((s, idx) => {
    const ex = getExercise(s.exerciseId);
    if (!ex) return '';
    return `
      <div class="ex-list-item" data-id="${s.exerciseId}" data-idx="${idx}">
        <div class="ex-list-item-header">
          <span class="drag-handle" title="Drag to reorder">⠿</span>
          ${ex.image ? `<img class="ex-list-thumb" src="${ex.image}" alt="${ex.name}">` : `<div class="ex-list-thumb-placeholder">🏋️</div>`}
          <div class="ex-list-info"><div class="ex-list-name">${ex.name}</div></div>
          <button class="ex-list-remove" data-id="${s.exerciseId}" aria-label="Remove ${ex.name}">✕</button>
        </div>
        ${ex.instructions ? `<div class="ex-list-stock-instructions">${ex.instructions}</div>` : ''}
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
        <div style="padding:0 14px 12px;display:flex;gap:8px;flex-wrap:wrap;">
          <label style="font-size:12px;color:var(--text-muted);cursor:pointer;">📷 Patient photo<input type="file" accept="image/*" capture="environment" class="pt-photo-input" data-id="${s.exerciseId}" style="display:none"></label>
          <label style="font-size:12px;color:var(--text-muted);cursor:pointer;">🎥 Patient video<input type="file" accept="video/*" capture="environment" class="pt-video-input" data-id="${s.exerciseId}" style="display:none"></label>
          ${s.patientPhoto ? `<span style="font-size:12px;color:var(--teal-dark);">✓ Photo added</span>` : ''}
          ${s.patientVideo ? `<span style="font-size:12px;color:var(--teal-dark);">✓ Video added</span>` : ''}
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.ex-list-remove').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); removeFromSession(btn.dataset.id); });
  });
  list.querySelectorAll('.param-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const item = state.currentSession.find(s => s.exerciseId === sel.dataset.id);
      if (item) item[sel.dataset.field] = sel.value;
    });
  });
  list.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      const item = state.currentSession.find(s => s.exerciseId === ta.dataset.id);
      if (item) item.comment = ta.value;
    });
  });
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
  if (window.Sortable) {
    Sortable.create(list, {
      handle: '.drag-handle', animation: 150,
      ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen',
      onEnd(evt) {
        const moved = state.currentSession.splice(evt.oldIndex, 1)[0];
        state.currentSession.splice(evt.newIndex, 0, moved);
      },
    });
  }
}

async function initiateSendCurrent() {
  const nameInput = document.getElementById('current-program-name');
  const name = nameInput.value.trim();
  if (!name) { showToast('Please give the program a name first'); nameInput.focus(); return; }
  if (state.currentSession.length === 0) { showToast('Add at least one exercise first'); return; }
  if (state.currentSession.length < 3) { openModal('few-ex-modal'); return; }
  openModal('phone-modal');
}

async function sendCurrentProgram() {
  const phone = document.getElementById('patient-phone').value.replace(/\D/g,'');
  if (phone.length < 10) { showToast('Please enter a valid phone number'); return; }
  const name   = document.getElementById('current-program-name').value.trim();
  const code   = makeCode();
  const expiry = new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString();
  const payload = { company_id: state.companyId, clinician_id: state.user.id, name, exercises: state.currentSession, code, phone, expiry, compliance_days: 0, created_at: new Date().toISOString() };
  const { error } = await db.from('hep_programs').insert([payload]).select().single();
  if (error) { showToast('Error saving program — try again'); console.error(error); return; }
  const link = `${window.location.origin}?code=${code}`;
  const msg  = `Your exercise program is ready and available! Tap here ${link} and enter code: ${code}`;
  await db.functions.invoke('send-sms', { body: { phone: `+1${phone}`, message: msg } });
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
  const { data, error } = await db.from('hep_programs').select('*').eq('clinician_id', state.user.id).order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  const now = Date.now();
  state.programs = (data || []).filter(p => new Date(p.expiry).getTime() > now);
  renderProgramsList();
}

function renderProgramsList() {
  const list  = document.getElementById('programs-list');
  const empty = document.getElementById('programs-empty');
  if (state.programs.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
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
  list.querySelectorAll('.program-item').forEach(item => {
    item.addEventListener('click', () => openProgramDetail(item.dataset.id));
  });
  list.querySelectorAll('.program-item-name').forEach(nameEl => {
    let pressTimer;
    nameEl.addEventListener('pointerdown', () => { pressTimer = setTimeout(() => startRename(nameEl, nameEl.dataset.id), 600); });
    nameEl.addEventListener('pointerup',   () => clearTimeout(pressTimer));
    nameEl.addEventListener('pointerleave',() => clearTimeout(pressTimer));
  });
}

function startRename(nameEl, programId) {
  const current = nameEl.textContent;
  const inp = document.createElement('input');
  inp.className = 'rename-input'; inp.value = current;
  nameEl.replaceWith(inp); inp.focus(); inp.select();
  async function commit() {
    const val = inp.value.trim() || current;
    const span = document.createElement('div');
    span.className = 'program-item-name'; span.dataset.id = programId; span.textContent = val;
    inp.replaceWith(span);
    if (val !== current) { await db.from('hep_programs').update({ name: val }).eq('id', programId); await loadPrograms(); }
  }
  inp.addEventListener('blur', commit);
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
          ${ex.image ? `<img class="ex-list-thumb" src="${ex.image}" alt="${ex.name}">` : `<div class="ex-list-thumb-placeholder">🏋️</div>`}
          <div class="ex-list-info">
            <div class="ex-list-name">${ex.name}</div>
            ${params ? `<div class="ex-list-params">${params}</div>` : ''}
            ${s.comment ? `<div class="ex-list-params" style="margin-top:4px;font-style:italic;">"${s.comment}"</div>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
  if (window.Sortable) {
    Sortable.create(list, { animation: 150, ghostClass: 'sortable-ghost',
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
  closeModal('delete-modal'); state.activeProgram = null;
  await loadPrograms(); showScreen('screen-programs'); showToast('Program deleted');
}

async function confirmResend() {
  const phone = document.getElementById('resend-phone').value.replace(/\D/g,'');
  if (phone.length < 10) { showToast('Enter a valid phone number'); return; }
  if (!state.activeProgram) return;
  const code = state.activeProgram.code;
  const link = `${window.location.origin}?code=${code}`;
  const msg  = `Your exercise program is ready and available! Tap here ${link} and enter code: ${code}`;
  await db.functions.invoke('send-sms', { body: { phone: `+1${phone}`, message: msg } });
  closeModal('resend-modal'); showToast(`Code ${code} resent!`);
}

function showPreviousProgramPicker() {
  const listEl = document.getElementById('prev-program-list');
  if (state.programs.length === 0) { showToast('No saved programs yet'); closeModal('exercise-popup'); return; }
  listEl.innerHTML = state.programs.map(p => `<button class="prev-item" data-id="${p.id}">${p.name}</button>`).join('');
  listEl.querySelectorAll('.prev-item').forEach(btn => {
    btn.addEventListener('click', () => addToPreviousProgram(btn.dataset.id));
  });
  closeModal('exercise-popup'); openModal('prev-picker-overlay');
}

async function addToPreviousProgram(programId) {
  const prog = state.programs.find(p => p.id === programId);
  if (!prog || !state.pendingExId) return;
  if ((prog.exercises || []).some(s => s.exerciseId === state.pendingExId)) {
    showToast('Already in that program'); closeModal('prev-picker-overlay'); return;
  }
  const updated = [...(prog.exercises || []), { exerciseId: state.pendingExId, sets:'', reps:'', freq:'', comment:'', patientPhoto:null, patientVideo:null }];
  const { error } = await db.from('hep_programs').update({ exercises: updated }).eq('id', programId);
  if (error) { showToast('Error updating program'); return; }
  await loadPrograms(); closeModal('prev-picker-overlay'); state.pendingExId = null; showToast('Exercise added to program');
}

/* ═══════════════════════════════════════════════════════════════
   PATIENT VIEW
   ═══════════════════════════════════════════════════════════════ */
async function submitPatientCode() {
  const digits = [...document.querySelectorAll('.code-digit')].map(i => i.value).join('');
  const errEl  = document.getElementById('patient-error');
  errEl.classList.add('hidden');
  if (digits.length < 4) { errEl.textContent = 'Please enter the full 4-digit code.'; errEl.classList.remove('hidden'); return; }
  const { data, error } = await db.from('hep_programs').select('*').eq('code', digits).single();
  if (error || !data) { errEl.textContent = 'Code not found. Please check and try again.'; errEl.classList.remove('hidden'); return; }
  if (new Date(data.expiry).getTime() < Date.now()) { errEl.textContent = 'This program has expired. Contact your provider for a new link.'; errEl.classList.remove('hidden'); return; }
  state.patientProgram = data; loadCompletedToday(); applyLang(state.lang); showScreen('screen-patient-home');
}

function loadCompletedToday() {
  const key = `selko_done_${state.patientProgram?.id}_${new Date().toDateString()}`;
  try { const saved = localStorage.getItem(key); state.completedToday = saved ? JSON.parse(saved) : {}; } catch { state.completedToday = {}; }
}

function saveCompletedToday() {
  const key = `selko_done_${state.patientProgram?.id}_${new Date().toDateString()}`;
  try { localStorage.setItem(key, JSON.stringify(state.completedToday)); } catch {}
  const prog = state.patientProgram;
  if (!prog) return;
  const allDone = (prog.exercises || []).every(s => state.completedToday[s.exerciseId]);
  if (allDone) {
    const creditKey = `selko_credited_${prog.id}_${new Date().toDateString()}`;
    if (!localStorage.getItem(creditKey)) {
      localStorage.setItem(creditKey, '1');
      db.from('hep_programs').update({ compliance_days: (prog.compliance_days || 0) + 1 }).eq('id', prog.id)
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
        ${s.patientPhoto ? `<img class="ex-card-img" src="${s.patientPhoto}" alt="${ex.name}">` : ex.image ? `<img class="ex-card-img" src="${ex.image}" alt="${ex.name}" loading="lazy">` : `<div class="ex-card-img-placeholder">🏋️</div>`}
        <div class="ex-card-label">${ex.name}</div>
      </div>`;
  }).join('');
  grid.querySelectorAll('.ex-card').forEach(card => {
    card.addEventListener('click', () => openPatientExercise(card.dataset.id));
  });
}

function openPatientExercise(exId) {
  const prog = state.patientProgram;
  const s    = (prog?.exercises || []).find(s => s.exerciseId === exId);
  const ex   = getExercise(exId);
  if (!ex || !s) return;
  document.getElementById('pt-ex-name').textContent = ex.name;
  const imgEl = document.getElementById('pt-ex-img');
  const src   = s.patientPhoto || ex.image || '';
  if (src) { imgEl.src = src; imgEl.alt = ex.name; imgEl.classList.remove('hidden'); } else { imgEl.classList.add('hidden'); }
  const videoWrap = document.getElementById('pt-ex-video-wrap');
  const videoEl   = document.getElementById('pt-ex-video');
  if (s.patientVideo) { videoEl.src = s.patientVideo; videoWrap.classList.remove('hidden'); } else { videoWrap.classList.add('hidden'); videoEl.src = ''; }
  const params = [s.sets, s.reps, s.freq].filter(Boolean).join(' · ');
  document.getElementById('pt-params').textContent   = params || '';
  document.getElementById('pt-params').style.display = params ? 'block' : 'none';
  document.getElementById('pt-instructions').textContent = ex.instructions || '';
  document.getElementById('pt-comments').textContent = s.comment || '';
  const done = !!state.completedToday[exId];
  const btnComplete = document.getElementById('btn-complete');
  const doneLine    = document.getElementById('complete-done');
  const t = T[state.lang];
  if (done) { btnComplete.classList.add('hidden'); doneLine.textContent = t.completed; doneLine.classList.remove('hidden'); }
  else { btnComplete.textContent = t.markDone; btnComplete.classList.remove('hidden'); doneLine.classList.add('hidden'); btnComplete.onclick = () => markExerciseDone(exId); }
  showScreen('screen-patient-exercise');
}

function markExerciseDone(exId) {
  state.completedToday[exId] = true; saveCompletedToday();
  const t = T[state.lang];
  document.getElementById('btn-complete').classList.add('hidden');
  const doneLine = document.getElementById('complete-done');
  doneLine.textContent = t.completed; doneLine.classList.remove('hidden');
  const card = document.querySelector(`#patient-exercise-grid .ex-card[data-id="${exId}"]`);
  if (card) card.classList.add('done');
}

function applyLang(lang) {
  state.lang = lang; const t = T[lang];
  document.getElementById('pt-welcome-title').textContent       = t.welcome;
  document.getElementById('pt-welcome-sub').textContent         = t.programReady;
  document.getElementById('btn-patient-view-program').textContent = t.viewProgram;
  document.querySelectorAll('.patient-footer').forEach(el => el.textContent = t.footer);
  document.getElementById('pt-list-title').textContent          = t.myExercises;
  const btnComplete = document.getElementById('btn-complete');
  if (btnComplete && !btnComplete.classList.contains('hidden')) btnComplete.textContent = t.markDone;
  const doneLine = document.getElementById('complete-done');
  if (doneLine && !doneLine.classList.contains('hidden')) doneLine.textContent = t.completed;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  const params     = new URLSearchParams(window.location.search);
  const isRecovery = params.get('reset') === 'true' || window.location.hash.includes('type=recovery');

  if (params.get('code')) {
    showScreen('screen-patient-entry');
    const code = params.get('code');
    if (code.length === 4) {
      const inputs = document.querySelectorAll('.code-digit');
      code.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
    }
  } else if (isRecovery) {
    showScreen('screen-new-password');
  } else {
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) { state.user = session.user; await onLoginSuccess(); }
    else showScreen('screen-login');
  }

  /* ─── AUTH ────────────────────────────────────────────────── */
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('btn-forgot').addEventListener('click', () => showScreen('screen-forgot'));
  document.getElementById('btn-back-login').addEventListener('click', () => showScreen('screen-login'));
  document.getElementById('btn-send-reset').addEventListener('click', handleForgotPassword);
  document.getElementById('btn-set-new-password').addEventListener('click', handleSetNewPassword);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  /* ─── ADD EXERCISE MODAL ──────────────────────────────────── */
  document.getElementById('btn-open-add-exercise').addEventListener('click', () => {
    document.getElementById('add-exercise-msg').classList.add('hidden');
    document.getElementById('add-exercise-modal').classList.remove('hidden');
  });
  document.getElementById('btn-open-add-exercise-admin').addEventListener('click', () => {
    document.getElementById('add-exercise-msg').classList.add('hidden');
    document.getElementById('add-exercise-modal').classList.remove('hidden');
  });
  document.getElementById('btn-cancel-new-exercise').addEventListener('click', () => {
    document.getElementById('add-exercise-modal').classList.add('hidden');
  });
  document.getElementById('btn-save-new-exercise').addEventListener('click', handleSaveNewExercise);

  /* ─── INVITE USER MODAL ───────────────────────────────────── */
  document.getElementById('btn-open-invite-user').addEventListener('click', openInviteModal);
  document.getElementById('btn-confirm-invite').addEventListener('click', handleSendInvite);
  document.getElementById('btn-cancel-invite').addEventListener('click', () => {
    document.getElementById('invite-user-modal').classList.add('hidden');
  });
  document.getElementById('invite-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSendInvite();
  });

  /* ─── NAV ─────────────────────────────────────────────────── */
  document.getElementById('btn-menu').addEventListener('click', openNav);
  document.getElementById('nav-overlay').addEventListener('click', closeNav);
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeNav();
      const target = btn.dataset.screen;
      if (target === 'screen-exercises') { renderExerciseGrid(); updateBadges(); }
      if (target === 'screen-programs')  loadPrograms();
      if (target === 'screen-admin')     { renderAdminExerciseList(); loadAndRenderUserList(); }
      showScreen(target);
    });
  });
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
    searchInput.value = ''; searchClear.classList.add('hidden'); renderExerciseGrid(); searchInput.focus();
  });

  /* ─── EXERCISE POPUP ──────────────────────────────────────── */
  document.getElementById('btn-add-current').addEventListener('click', () => {
    if (state.pendingExId) addToCurrentSession(state.pendingExId);
    closeModal('exercise-popup');
    state.pendingExId = null;
  });

  /* FIX: Remove from current program button */
  document.getElementById('btn-remove-from-current').addEventListener('click', () => {
    if (state.pendingExId) removeFromSession(state.pendingExId);
    closeModal('exercise-popup');
    state.pendingExId = null;
    showToast('Exercise removed from current program');
  });

  document.getElementById('btn-add-previous').addEventListener('click', showPreviousProgramPicker);
  document.getElementById('exercise-popup').addEventListener('click', e => {
    if (e.target === document.getElementById('exercise-popup')) { closeModal('exercise-popup'); state.pendingExId = null; }
  });
  document.getElementById('btn-prev-cancel').addEventListener('click', () => { closeModal('prev-picker-overlay'); state.pendingExId = null; });

  /* ─── CURRENT PROGRAM ─────────────────────────────────────── */
  document.getElementById('btn-view-current-home').addEventListener('click', () => { renderCurrentProgram(); showScreen('screen-current'); });
  document.getElementById('btn-view-current-ex').addEventListener('click',  () => { renderCurrentProgram(); showScreen('screen-current'); });
  document.getElementById('btn-back-from-current').addEventListener('click', () => { renderExerciseGrid(searchInput.value); showScreen('screen-exercises'); });
  document.getElementById('btn-send-current').addEventListener('click', initiateSendCurrent);
  document.getElementById('btn-few-yes').addEventListener('click', () => { closeModal('few-ex-modal'); openModal('phone-modal'); });
  document.getElementById('btn-few-no').addEventListener('click', () => closeModal('few-ex-modal'));
  document.getElementById('btn-confirm-send').addEventListener('click', sendCurrentProgram);
  document.getElementById('btn-cancel-send').addEventListener('click', () => closeModal('phone-modal'));

  /* ─── MY PROGRAMS ─────────────────────────────────────────── */
  document.getElementById('btn-back-from-detail').addEventListener('click', () => showScreen('screen-programs'));
  document.getElementById('btn-send-saved').addEventListener('click',   () => openModal('phone-modal'));
  document.getElementById('btn-resend-code').addEventListener('click',  () => openModal('resend-modal'));
  document.getElementById('btn-delete-program').addEventListener('click', () => openModal('delete-modal'));
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteProgramConfirmed);
  document.getElementById('btn-cancel-delete').addEventListener('click',  () => closeModal('delete-modal'));
  document.getElementById('btn-confirm-resend').addEventListener('click', confirmResend);
  document.getElementById('btn-cancel-resend').addEventListener('click',  () => closeModal('resend-modal'));

  /* ─── PATIENT VIEW ────────────────────────────────────────── */
  document.getElementById('btn-patient-submit').addEventListener('click', submitPatientCode);
  document.querySelectorAll('.code-digit').forEach((inp, i, all) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/,'').slice(-1);
      if (inp.value && all[i+1]) all[i+1].focus();
      if (i === 3 && inp.value) submitPatientCode();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && all[i-1]) all[i-1].focus(); });
  });
  document.getElementById('btn-patient-view-program').addEventListener('click', () => { renderPatientExerciseGrid(); showScreen('screen-patient-list'); });
  document.getElementById('btn-patient-back-home').addEventListener('click',  () => showScreen('screen-patient-home'));
  document.getElementById('btn-patient-back-list').addEventListener('click',  () => { renderPatientExerciseGrid(); showScreen('screen-patient-list'); });

  /* ─── LANGUAGE TOGGLE ─────────────────────────────────────── */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  /* ─── SUPABASE AUTH STATE ─────────────────────────────────── */
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT')        { state.user = null; showScreen('screen-login'); }
    if (event === 'PASSWORD_RECOVERY') showScreen('screen-new-password');
  });

}); // end DOMContentLoaded
