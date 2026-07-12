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
    instructions: 'Lie face down on a firm surface. Keeping your knee straight, slowly lift one leg a few inches off the surface, squeezing your buttock at the top. Hold briefly, then lower with control. Keep your hips flat on the surface the whole time — don\'t arch your lower back to lift the leg higher.',
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
    instructions: 'Sit in a sturdy chair with your back supported. Slowly straighten one knee until your leg is fully extended out in front of you. Hold briefly at the top, then lower slowly back down. Keep your thigh on the seat throughout — only your lower leg should move.',
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
    instructions: 'Lie on your back with one knee bent, foot flat on the surface, and the other leg straight. Tighten the thigh muscle of the straight leg, then lift it to the height of the opposite bent knee. Hold briefly, then lower slowly with control. Keep the knee locked straight the entire time.',
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
    instructions: 'Lie on your back with both knees bent and feet flat, hip-width apart. Squeeze your buttocks and lift your hips up until your body forms a straight line from shoulders to knees. Hold briefly at the top, then lower slowly. Avoid arching your lower back excessively.',
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
    instructions: 'Lie on your back with a rolled towel or small bolster under your knee. Keeping the back of your knee on the bolster, straighten your lower leg until it\'s fully extended. Hold briefly, then lower slowly. This is a smaller, gentler motion than a full leg extension.',
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
    instructions: 'Sit in a sturdy chair with your back supported. Slowly straighten one knee all the way out in front of you until your leg is fully extended. Hold for a few seconds at the top, then lower slowly. Keep your thigh in contact with the seat throughout.',
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
    instructions: 'Lie on your side with your legs stacked and your body in a straight line. Keeping your knee straight and toes pointing forward, lift your top leg up toward the ceiling. Hold briefly, then lower slowly with control. Don\'t let your hip roll backward as you lift.',
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
    instructions: 'Lie on your side with your bottom leg straight and your top leg bent, foot planted in front of the bottom knee for support. Lift your bottom leg straight up toward the top leg. Hold briefly, then lower slowly with control. Keep your bottom leg straight throughout.',
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
    instructions: 'Stand at a counter or sturdy surface for balance. Keeping your thigh still, bend one knee and bring your heel up toward your buttock. Hold briefly at the top, then lower slowly with control. Avoid swinging your hip forward to compensate.',
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
    instructions: 'Stand facing a sturdy table or counter, holding on for balance. With your feet shoulder-width apart, slowly bend your knees and lower your hips as if sitting into a chair, keeping your chest up. Go only as low as comfortable, then push back up to standing. Keep your knees tracking over your toes.',
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
    instructions: 'Stand at a counter or sturdy surface, holding on for balance. Slowly rise up onto your toes as high as comfortable, then lower back down with control. Keep your legs straight and avoid rocking forward or backward.',
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
    instructions: 'Stand at a counter or sturdy surface, holding on for balance. Keeping your heels on the ground, lift the front of your feet and toes up toward your shins as high as comfortable. Hold briefly, then lower with control.',
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
    instructions: 'Stand sideways next to a counter or sturdy surface, holding on for balance. Keeping your leg straight and toes pointing forward, lift the outside leg out to the side. Hold briefly, then lower slowly with control. Keep your body upright — don\'t lean to the side to lift higher.',
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
    instructions: 'Stand facing a counter or sturdy surface, holding on for balance. Keeping your knee straight, swing one leg backward behind you without leaning your upper body forward. Hold briefly, then return slowly with control.',
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
    instructions: 'Sit or lie down with a resistance band looped around the ball of one foot, holding the ends of the band in your hands. Slowly point your toes away from you against the resistance of the band, then relax back to the starting position with control.',
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
    instructions: 'Lie on your back with a strap or towel looped around the ball of one foot. Keeping that knee straight, use the strap to gently pull your leg up toward the ceiling until you feel a stretch in the back of your thigh. Hold the stretch, breathing normally, then slowly release.',
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
    instructions: 'Stand with your elbow bent to 90 degrees and tucked at your side, holding a resistance band anchored in front of you. Keeping your elbow pinned to your side, rotate your forearm outward away from your body. Hold briefly, then return slowly with control.',
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
    instructions: 'Stand with your elbow bent to 90 degrees and tucked at your side, holding a resistance band anchored to the side. Keeping your elbow pinned to your side, rotate your forearm inward across your body. Hold briefly, then return slowly with control.',
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
    instructions: 'Stand holding a resistance band anchored in front of you at chest height, arms extended forward. Pull your elbows back, squeezing your shoulder blades together, keeping your elbows close to your body. Hold briefly, then return slowly with control.',
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
    instructions: 'Stand holding a resistance band anchored overhead, arms extended up. Pull your elbows down and slightly back toward your sides, as if pulling the band down behind your head. Hold briefly, then return slowly with control.',
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
    instructions: 'Stand holding a resistance band anchored behind you at chest height. Starting with your hands near your chest, push forward as if throwing a punch, extending your arm fully and rotating your palm downward. Return slowly with control, keeping your shoulder blade from winging out.',
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
    instructions: 'Stand holding a light weight in one hand at your side, palm facing your body. Keeping your elbow straight, slowly raise your arm forward and up in front of you to about shoulder height. Hold briefly, then lower slowly with control.',
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
    instructions: 'Stand holding a light weight in one hand at your side, palm facing your body. Keeping your elbow straight, slowly raise your arm out to the side up to about shoulder height. Hold briefly, then lower slowly with control. Avoid shrugging your shoulder up toward your ear.',
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
    instructions: 'Stand holding a light weight in one hand at your side, thumb pointed slightly upward. Keeping your elbow straight, raise your arm up and out at roughly a 45-degree angle from your body (between a front raise and a side raise), to about shoulder height. Hold briefly, then lower slowly with control.',
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
    instructions: 'Lie face down, then prop yourself up on your forearms and toes, keeping your body in one straight line from head to heels. Tighten your abdominal muscles and hold this position, breathing normally, without letting your hips sag or pike up. Hold for the prescribed time, then rest.',
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
    instructions: 'Lie on your back with both knees bent. Cross one ankle over the opposite knee. Reach through and gently pull the uncrossed thigh toward your chest until you feel a stretch in the buttock of the crossed leg. Hold the stretch, breathing normally, then slowly release.',
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
