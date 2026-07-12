/* ═══════════════════════════════════════════════════════════════
   SELKO HEP BUILDER — Exercise Library
   selko-hep-data.js

   This file is the master exercise database for the app.
   It is loaded before selko-hep-app.js and exposes the global
   constant EXERCISE_LIBRARY used throughout the application.

   ── HOW TO ADD A NEW EXERCISE ───────────────────────────────
   1. Add the image file to the /images/ folder
   2. Copy one of the entries below and paste it at the end
      of the array (before the closing bracket)
   3. Give it the next id in sequence (ex_0027, ex_0028, etc.)
   4. Fill in name, image path, and keywords
   5. Save and deploy — the new exercise appears immediately
      for all clinicians with no other changes needed

   ── IMAGE PATH FORMAT ───────────────────────────────────────
   "images/ex_XXXX_exercise_name.png"

   ── KEYWORD TIPS ────────────────────────────────────────────
   Include: body region, muscle names, movement type, position,
   equipment, abbreviations, alternate names, related conditions
   The search bar matches against name + all keywords combined.
   ═══════════════════════════════════════════════════════════════ */

const EXERCISE_LIBRARY = [

  /* ── 01 ── PRONE HIP EXTENSION ─────────────────────────────── */
  {
    id:           'ex_0001',
    name:         'Prone Hip Extension',
    image:        'images/ex_0001_prone_hip_extension.png',
    keywords: [
      'prone', 'hip', 'hip extension', 'extension', 'glutes',
      'lower extremity', 'gluteal strengthening', 'posterior chain',
      'hip hyperextension', 'leg raise', 'table exercise', 'prone position'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 02 ── KNEE EXTENSION ───────────────────────────────────── */
  {
    id:           'ex_0002',
    name:         'Knee Extension',
    image:        'images/ex_0002_knee_extension.png',
    keywords: [
      'knee extension', 'knee', 'extension', 'quads', 'long arc quad',
      'seated', 'quadriceps strengthening', 'lower extremity',
      'terminal knee extension', 'leg extension', 'sitting position',
      'quad set variation'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 03 ── STRAIGHT LEG RAISE ───────────────────────────────── */
  {
    id:           'ex_0003',
    name:         'Straight Leg Raise',
    image:        'images/ex_0003_straight_leg_raise.png',
    keywords: [
      'straight leg raise', 'straight leg', 'leg raise', 'hip', 'knee',
      'quads', 'SLR', 'supine', 'hip flexion', 'quad strengthening',
      'lower extremity', 'knee immobilization exercise',
      'post-op quad activation', 'hooklying'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 04 ── BRIDGE ───────────────────────────────────────────── */
  {
    id:           'ex_0004',
    name:         'Bridge',
    image:        'images/ex_0004_bridge.png',
    keywords: [
      'bridge', 'glute bridge', 'glutes', 'hip', 'supine',
      'hip extension', 'extension', 'lumbar stabilization',
      'core activation', 'posterior chain', 'hooklying',
      'hamstrings', 'pelvic lift'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 05 ── SHORT ARC QUAD ───────────────────────────────────── */
  {
    id:           'ex_0005',
    name:         'Short Arc Quad',
    image:        'images/ex_0005_short_arc_quad.png',
    keywords: [
      'short arc quad', 'short arc', 'quad', 'knee', 'supine', 'SAQ',
      'terminal knee extension', 'bolster', 'quad strengthening',
      'lower extremity', 'post-op knee exercise',
      'knee extension with support'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 06 ── LONG ARC QUAD ────────────────────────────────────── */
  {
    id:           'ex_0006',
    name:         'Long Arc Quad',
    image:        'images/ex_0006_long_arc_quad.png',
    keywords: [
      'long arc quad', 'LAQ', 'knee extension', 'knee', 'extension',
      'quads', 'seated', 'quadriceps strengthening', 'lower extremity',
      'terminal knee extension', 'leg extension', 'sitting position'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 07 ── SIDE LYING HIP ABDUCTION ────────────────────────── */
  {
    id:           'ex_0007',
    name:         'Side Lying Hip Abduction',
    image:        'images/ex_0007_side_lying_hip_abduction.png',
    keywords: [
      'side lying hip abduction', 'side lying', 'hip', 'abduction',
      'abd', 'knee', 'glute med', 'sidelying', 'gluteus medius',
      'hip strengthening', 'lateral leg raise', 'lower extremity',
      'frontal plane'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 08 ── SIDE LYING HIP ADDUCTION ────────────────────────── */
  {
    id:           'ex_0008',
    name:         'Side Lying Hip Adduction',
    image:        'images/ex_0008_side_lying_hip_adduction.png',
    keywords: [
      'side lying hip adduction', 'side lying', 'hip', 'adduction',
      'add', 'adductors', 'sidelying', 'inner thigh', 'lower leg lift',
      'hip strengthening', 'lower extremity', 'frontal plane'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 09 ── HAMSTRING CURL / KNEE FLEXION ───────────────────── */
  {
    id:           'ex_0009',
    name:         'Hamstring Curl / Knee Flexion',
    image:        'images/ex_0009_hamstring_curl_knee_flexion.png',
    keywords: [
      'hamstring curl', 'knee flexion', 'hamstring', 'knee', 'flexion',
      'standing', 'standing hamstring curl', 'hip extension support',
      'single leg stance', 'balance', 'lower extremity',
      'table-assisted standing'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 10 ── SQUAT ────────────────────────────────────────────── */
  {
    id:           'ex_0010',
    name:         'Squat',
    image:        'images/ex_0010_squat.png',
    keywords: [
      'squat', 'knee', 'hip', 'glutes', 'quads', 'sit to stand',
      'stand', 'functional strengthening', 'lower extremity',
      'table-assisted', 'bilateral', 'mini squat', 'table squat',
      'balance support'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 11 ── HEEL RAISE ───────────────────────────────────────── */
  {
    id:           'ex_0011',
    name:         'Heel Raise',
    image:        'images/ex_0011_heel_raise.png',
    keywords: [
      'heel raise', 'heel', 'raise', 'calf', 'gastroc', 'gastrocnemius',
      'soleus', 'tip toes', 'calf raise', 'ankle plantarflexion',
      'standing', 'bilateral', 'balance support', 'table-assisted'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 12 ── TOE RAISE ────────────────────────────────────────── */
  {
    id:           'ex_0012',
    name:         'Toe Raise',
    image:        'images/ex_0012_toe_raise.png',
    keywords: [
      'toe raises', 'shin', 'anterior tibialis', 'anterior tib', 'tib',
      'toes', 'ankle dorsiflexion', 'tibialis anterior strengthening',
      'standing', 'balance', 'foot drop exercise'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 13 ── STANDING HIP ABDUCTION ──────────────────────────── */
  {
    id:           'ex_0013',
    name:         'Standing Hip Abduction',
    image:        'images/ex_0013_standing_hip_abduction.png',
    keywords: [
      'standing hip abduction', 'hip', 'abduction', 'abd', 'standing',
      'glute med', 'gluteus medius', 'hip strengthening',
      'lateral leg raise', 'standing balance', 'table-assisted',
      'frontal plane', 'single leg stance'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 14 ── STANDING HIP EXTENSION ──────────────────────────── */
  {
    id:           'ex_0014',
    name:         'Standing Hip Extension',
    image:        'images/ex_0014_standing_hip_extension.png',
    keywords: [
      'standing hip extension', 'standing', 'hip', 'extension', 'ext',
      'glutes', 'glute max', 'gluteus maximus', 'hip strengthening',
      'posterior leg swing', 'table-assisted', 'balance', 'sagittal plane'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 15 ── PLANTAR FLEXION ──────────────────────────────────── */
  {
    id:           'ex_0015',
    name:         'Plantar Flexion',
    image:        'images/ex_0015_plantar_flexion.png',
    keywords: [
      'plantar flexion', 'calf', 'gastrocnemius', 'gastroc', 'bands',
      'ankle', 'resistance band', 'theraband', 'seated', 'supine',
      'ankle strengthening', 'foot', 'pointing toes'
    ],
    instructions: '',
    date_added:   '2026-06-29',
    added_by:     'Evan',
  },

  /* ── 16 ── HAMSTRING STRETCH (USING STRAP) ──────────────────── */
  {
    id:           'ex_0016',
    name:         'Hamstring Stretch (Using Strap)',
    image:        'images/ex_0016_hamstring_stretch_strap.png',
    keywords: [
      'hamstring stretch', 'hamstring', 'stretch', 'supine', 'strap',
      'flexibility', 'posterior thigh', 'hip flexion',
      'straight leg raise stretch', 'strap assisted', 'belt stretch',
      'lower extremity', 'hooklying'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 17 ── SHOULDER EXTERNAL ROTATION ──────────────────────── */
  {
    id:           'ex_0017',
    name:         'Shoulder External Rotation',
    image:        'images/ex_0017_shoulder_external_rotation.png',
    keywords: [
      'shoulder external rotation', 'shoulder', 'rotation', 'external',
      'ER', 'rotator cuff', 'resistance band', 'theraband', 'standing',
      'upper extremity', 'infraspinatus', 'teres minor',
      'shoulder strengthening'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 18 ── SHOULDER INTERNAL ROTATION ──────────────────────── */
  {
    id:           'ex_0018',
    name:         'Shoulder Internal Rotation',
    image:        'images/ex_0018_shoulder_internal_rotation.png',
    keywords: [
      'shoulder internal rotation', 'shoulder', 'internal', 'rotation',
      'IR', 'rotator cuff', 'resistance band', 'theraband', 'standing',
      'upper extremity', 'subscapularis', 'shoulder strengthening'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 19 ── ROW ──────────────────────────────────────────────── */
  {
    id:           'ex_0019',
    name:         'Row',
    image:        'images/ex_0019_row.png',
    keywords: [
      'row', 'shoulder', 'scapula', 'thoracic', 'rhomboids',
      'resistance band', 'theraband', 'standing', 'upper extremity',
      'middle trapezius', 'shoulder retraction', 'posture',
      'back strengthening', 'horizontal pull'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 20 ── PULL DOWN ────────────────────────────────────────── */
  {
    id:           'ex_0020',
    name:         'Pull Down',
    image:        'images/ex_0020_pull_down.png',
    keywords: [
      'pull down', 'lat', 'lats', 'pull', 'shoulder', 'latissimus',
      'scapula', 'resistance band', 'theraband', 'standing',
      'upper extremity', 'latissimus dorsi', 'shoulder depression',
      'back strengthening', 'vertical pull', 'shoulder adduction'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 21 ── PUNCH ────────────────────────────────────────────── */
  {
    id:           'ex_0021',
    name:         'Punch',
    image:        'images/ex_0021_punch.png',
    keywords: [
      'punch', 'shoulder', 'pec', 'pectoral', 'pec major',
      'pectoralis major', 'anterior shoulder', 'resistance band',
      'theraband', 'standing', 'upper extremity', 'serratus anterior',
      'scapular protraction', 'horizontal push', 'chest strengthening'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 22 ── SHOULDER FLEXION ─────────────────────────────────── */
  {
    id:           'ex_0022',
    name:         'Shoulder Flexion',
    image:        'images/ex_0022_shoulder_flexion.png',
    keywords: [
      'shoulder flexion', 'shoulder', 'flexion', 'raise', 'deltoids',
      'strength', 'dumbbell', 'weights', 'standing', 'upper extremity',
      'anterior deltoid', 'shoulder strengthening', 'front raise',
      'sagittal plane'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 23 ── SHOULDER ABDUCTION ───────────────────────────────── */
  {
    id:           'ex_0023',
    name:         'Shoulder Abduction',
    image:        'images/ex_0023_shoulder_abduction.png',
    keywords: [
      'shoulder abduction', 'shoulder', 'abduction', 'lateral', 'raise',
      'lateral raise', 'deltoid', 'dumbbell', 'weights', 'standing',
      'upper extremity', 'middle deltoid', 'shoulder strengthening',
      'frontal plane', 'side raise'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 24 ── SHOULDER SCAPTION ────────────────────────────────── */
  {
    id:           'ex_0024',
    name:         'Shoulder Scaption',
    image:        'images/ex_0024_shoulder_scaption.png',
    keywords: [
      'shoulder scaption', 'shoulder', 'scaption', '45 degrees',
      'deltoid', 'raise', 'dumbbell', 'weights', 'standing',
      'upper extremity', 'scapular plane', 'supraspinatus',
      'rotator cuff', 'shoulder strengthening', 'diagonal raise'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 25 ── PLANK ────────────────────────────────────────────── */
  {
    id:           'ex_0025',
    name:         'Plank',
    image:        'images/ex_0025_plank.png',
    keywords: [
      'plank', 'core', 'abdominal', 'abdomen', 'stability', 'prone',
      'isometric', 'lumbar stabilization', 'transverse abdominis',
      'plank hold', 'shoulder stability', 'bodyweight', 'floor exercise',
      'trunk strengthening'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ── 26 ── PIRIFORMIS STRETCH ───────────────────────────────── */
  {
    id:           'ex_0026',
    name:         'Piriformis Stretch',
    image:        'images/ex_0026_piriformis_stretch.png',
    keywords: [
      'piriformis stretch', 'piriformis', 'stretch', 'supine', 'hip',
      'rotation', 'cross body', 'sciatic', 'flexibility',
      'external rotator stretch', 'figure four', 'deep gluteal stretch',
      'sciatica', 'lower extremity', 'hooklying', 'hip internal rotation'
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  /* ═══════════════════════════════════════════════════════════════
     ADD NEW EXERCISES BELOW THIS LINE
     Copy the block format above — next id is ex_0027
     ═══════════════════════════════════════════════════════════════

  {
    id:           'ex_0027',
    name:         'Exercise Name Here',
    image:        'images/ex_0027_exercise_name_here.png',
    keywords: [
      'keyword1', 'keyword2', 'keyword3',
    ],
    instructions: '',
    date_added:   '2026-07-12',
    added_by:     'Evan',
  },

  ═══════════════════════════════════════════════════════════════ */

]; // end EXERCISE_LIBRARY
