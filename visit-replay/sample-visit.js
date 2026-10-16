/* Sample visit for the Visit Replay demo: a 12:31 consultation about exertional chest tightness.
   All names, times and clinical content are placeholders. Times are in seconds.
   transcript: one entry per spoken line. A line is "in the note" when a sentence cites it,
               "said, not in note" when none does, and "not clear" when unclear: true.
   sections:   one per tag. note is the AI draft; each sentence cites its source lines,
               and quote (optional) is the matching phrase in the note. */
window.SAMPLE_VISIT = {
  duration: 751,
  transcript: [
    { id: 'i1', speaker: 'provider', start: 6, end: 12, text: 'Hi, good to see you again. How have you been?' },
    { id: 'i2', speaker: 'patient', start: 13, end: 23, text: 'Better, thanks. The sinus thing was about three weeks ago. They gave me antibiotics at the urgent care.' },

    { id: 'h0', speaker: 'provider', start: 24, end: 29, text: 'So what brings you in today?' },
    { id: 'h1', speaker: 'patient', start: 30, end: 38, text: "I've been getting this tightness in my chest, maybe three weeks now." },
    { id: 'h2', speaker: 'provider', start: 40, end: 45, text: 'When do you notice it most?' },
    { id: 'h3', speaker: 'patient', start: 46, end: 52, text: 'Mostly when I walk up the hill to the bus stop.' },
    { id: 'h4', speaker: 'provider', start: 55, end: 60, text: 'And what happens if you stop?' },
    { id: 'h5', speaker: 'patient', start: 61, end: 70, text: 'If I stop and stand for a bit, it goes away. A couple of minutes, maybe.' },
    { id: 'h6', speaker: 'patient', start: 72, end: 81, text: "It's more like a pressure, like someone's pressing down on me." },
    { id: 'h7', speaker: 'patient', start: 82, end: 88, text: 'Sometimes down my left arm a little.' },
    { id: 'h8', speaker: 'provider', start: 96, end: 101, text: 'Any shortness of breath with it?' },
    { id: 'h9', speaker: 'patient', start: 102, end: 108, text: 'A bit, yes. I have to catch my breath.' },
    { id: 'h10', speaker: 'provider', start: 110, end: 116, text: 'Any palpitations, or feeling faint?' },
    { id: 'h11', speaker: 'patient', start: 117, end: 120, text: 'No, nothing like that.' },
    { id: 'h12', speaker: 'patient', start: 122, end: 131, text: 'I had one of those heart tracings in January last year and they said it was fine.' },
    { id: 'h13', speaker: 'provider', start: 133, end: 138, text: 'Has it changed recently?' },
    { id: 'h14', speaker: 'patient', start: 139, end: 149, text: "This last week it's been coming on sooner. Even on the flat sometimes." },
    { id: 'h15', speaker: 'patient', start: 151, end: 163, text: 'I thought it was just the cold weather, to be honest.' },
    { id: 'h16', speaker: 'provider', start: 165, end: 176, text: "That's helpful. Has anything like this happened before?" },
    { id: 'h17', speaker: 'patient', start: 177, end: 188, text: 'Not really. Maybe once last summer, but I was carrying the shopping.' },

    { id: 'p1', speaker: 'provider', start: 191, end: 196, text: 'Any other medical problems I should know about?' },
    { id: 'p2', speaker: 'patient', start: 197, end: 208, text: 'Just the blood pressure. And my cholesterol was a bit high last year.' },
    { id: 'p3', speaker: 'provider', start: 210, end: 216, text: 'Are you diabetic at all?' },
    { id: 'p4', speaker: 'patient', start: 217, end: 221, text: 'No, they checked that. It was fine.' },
    { id: 'p5', speaker: 'patient', start: 223, end: 236, text: 'I had my gallbladder out, oh, must be ten years ago now.' },
    { id: 'p6', speaker: 'provider', start: 238, end: 250, text: 'Right. And no heart problems before, no stents or anything?' },
    { id: 'p7', speaker: 'patient', start: 251, end: 258, text: 'No, never.' },

    { id: 'm1', speaker: 'provider', start: 261, end: 266, text: 'What medications are you taking at the moment?' },
    { id: 'm2', speaker: 'patient', start: 267, end: 279, text: 'The amlodipine, for my blood pressure. Every morning.' },
    { id: 'm3', speaker: 'patient', start: 280, end: 289, text: 'And the [unclear] one at night, the small white one.', unclear: true },
    { id: 'm4', speaker: 'provider', start: 291, end: 299, text: 'Is that the atorvastatin? For the cholesterol?' },
    { id: 'm5', speaker: 'patient', start: 300, end: 305, text: 'I think so, yes.' },
    { id: 'm6', speaker: 'patient', start: 307, end: 318, text: 'Sometimes I take ibuprofen for my knee, not every day.' },
    { id: 'm7', speaker: 'provider', start: 320, end: 328, text: "Okay, we'll check the doses on your records." },

    { id: 'a1', speaker: 'provider', start: 331, end: 335, text: 'Any allergies to medicines?' },
    { id: 'a2', speaker: 'patient', start: 336, end: 345, text: 'Penicillin. I came out in a rash when I was younger.' },
    { id: 'a3', speaker: 'patient', start: 347, end: 358, text: 'Not the swelling kind, just a rash.' },

    { id: 's1', speaker: 'provider', start: 361, end: 366, text: 'Do you smoke?' },
    { id: 's2', speaker: 'patient', start: 367, end: 380, text: 'I stopped five years ago. I smoked for about thirty years before that.' },
    { id: 's3', speaker: 'provider', start: 382, end: 387, text: 'Roughly how many a day?' },
    { id: 's4', speaker: 'patient', start: 388, end: 394, text: 'Maybe ten a day.' },
    { id: 's5', speaker: 'provider', start: 396, end: 401, text: 'And alcohol?' },
    { id: 's6', speaker: 'patient', start: 402, end: 411, text: "A glass of wine at the weekend, that's all." },
    { id: 's7', speaker: 'patient', start: 413, end: 428, text: 'I retired from the bus depot two years ago, so I walk most places now.' },
    { id: 's8', speaker: 'patient', start: 430, end: 444, text: "My wife and I still go dancing on Thursdays, though I've skipped the last two." },
    { id: 's9', speaker: 'provider', start: 446, end: 458, text: 'Good to hear you keep active.' },

    { id: 'f1', speaker: 'provider', start: 461, end: 466, text: 'Any heart problems in the family?' },
    { id: 'f2', speaker: 'patient', start: 467, end: 480, text: "My brother had a [unclear] in his fifties. He's alright now.", unclear: true },
    { id: 'f3', speaker: 'provider', start: 482, end: 488, text: 'A heart attack?' },
    { id: 'f4', speaker: 'patient', start: 489, end: 497, text: 'Something like that. They put a stent in.' },
    { id: 'f5', speaker: 'patient', start: 499, end: 508, text: 'And my father had diabetes.' },

    { id: 'r1', speaker: 'provider', start: 511, end: 518, text: 'Any cough, fevers, or ankle swelling?' },
    { id: 'r2', speaker: 'patient', start: 519, end: 524, text: 'No, none of that.' },
    { id: 'r3', speaker: 'provider', start: 526, end: 532, text: 'Do you get breathless lying flat at night?' },
    { id: 'r4', speaker: 'patient', start: 533, end: 538, text: 'No, I sleep on one pillow.' },
    { id: 'r5', speaker: 'provider', start: 540, end: 548, text: 'Any heartburn, or pain after eating?' },
    { id: 'r6', speaker: 'patient', start: 549, end: 557, text: "Only if I have a curry, and that's different. More of a burning." },
    { id: 'r7', speaker: 'provider', start: 559, end: 568, text: 'Okay. Let me have a listen to your chest.' },

    { id: 'e1', speaker: 'provider', start: 571, end: 580, text: 'Blood pressure is 148 over 92. Pulse 78 and regular.' },
    { id: 'e2', speaker: 'provider', start: 582, end: 590, text: 'Heart sounds normal, no murmurs.' },
    { id: 'e3', speaker: 'provider', start: 592, end: 599, text: 'Chest is clear on both sides.' },
    { id: 'e4', speaker: 'patient', start: 601, end: 612, text: 'Is that bad, the blood pressure?' },
    { id: 'e5', speaker: 'provider', start: 614, end: 628, text: "It's a little high today. We'll look at it together with everything else." },
    { id: 'e6', speaker: 'provider', start: 630, end: 638, text: 'No swelling in the ankles.' },
    { id: 'e7', speaker: 'provider', start: 640, end: 648, text: 'Oxygen levels are 97 percent.' },

    { id: 'x1', speaker: 'provider', start: 651, end: 666, text: "From what you're describing, this could be angina. The heart isn't getting quite enough blood when it's working harder." },
    { id: 'x2', speaker: 'patient', start: 668, end: 676, text: 'Is it a heart attack?' },
    { id: 'x3', speaker: 'provider', start: 678, end: 689, text: "No, nothing suggests that today. But because it's getting worse, we want to look into it quickly." },

    { id: 'n1', speaker: 'provider', start: 691, end: 702, text: "I'm going to do an ECG today and some blood tests, including cholesterol." },
    { id: 'n2', speaker: 'provider', start: 704, end: 716, text: "I'll refer you to the chest pain clinic. They usually see people within two weeks." },
    { id: 'n3', speaker: 'provider', start: 718, end: 728, text: "I'll give you a spray to use under the tongue if it comes on." },
    { id: 'n4', speaker: 'provider', start: 730, end: 742, text: 'If the pain lasts more than fifteen minutes, or comes on at rest, call an ambulance straight away.' },
    { id: 'n5', speaker: 'patient', start: 743, end: 748, text: 'Okay. Thank you, doctor.' }
  ],
  sections: [
    { id: 'intro', title: 'Introduction', start: 0, end: 24, note: '', sentences: [] },
    {
      id: 'hpi', title: 'History of present illness', start: 24, end: 190,
      note: '3/52 hx of chest tightness on exertion, mainly walking uphill to the bus stop. Pressure-like in character, occasionally radiating to the L arm. Eases within a couple of minutes of rest. Assoc. mild SOB during episodes. Denies palpitations and syncope. Previous ECG Jan 2025 normal. Symptoms worsening over the past week.',
      sentences: [
        { text: 'Chest tightness for 3 weeks', sources: ['h1', 'h3'], quote: '3/52 hx of chest tightness on exertion, mainly walking uphill to the bus stop' },
        { text: 'Feels like pressure, sometimes spreads to left arm', sources: ['h6', 'h7'], quote: 'Pressure-like in character, occasionally radiating to the L arm' },
        { text: 'Eases within a couple of minutes of rest', sources: ['h4', 'h5'], quote: 'Eases within a couple of minutes of rest' },
        { text: 'Mild shortness of breath with episodes', sources: ['h8', 'h9'], quote: 'Assoc. mild SOB during episodes' },
        { text: 'No palpitations or fainting', sources: ['h10', 'h11'], quote: 'Denies palpitations and syncope' },
        { text: 'Normal ECG in Jan 2025', sources: ['h12'], quote: 'Previous ECG Jan 2025 normal' },
        { text: 'Worsening over the past week', sources: ['h13', 'h14'], quote: 'Symptoms worsening over the past week' }
      ]
    },
    {
      id: 'pmh', title: 'Past medical history', start: 190, end: 260,
      note: 'HTN. Hypercholesterolaemia (raised last year). Not diabetic. Cholecystectomy ~10 yrs ago. No known cardiac history.',
      sentences: [
        { text: 'High blood pressure', sources: ['p2'], quote: 'HTN' },
        { text: 'Raised cholesterol last year', sources: ['p2'], quote: 'Hypercholesterolaemia (raised last year)' },
        { text: 'Not diabetic', sources: ['p3', 'p4'], quote: 'Not diabetic' },
        { text: 'Gallbladder removed about 10 years ago', sources: ['p5'], quote: 'Cholecystectomy ~10 yrs ago' },
        { text: 'No previous heart problems', sources: ['p6', 'p7'], quote: 'No known cardiac history' }
      ]
    },
    {
      id: 'meds', title: 'Medications', start: 260, end: 330,
      note: 'Amlodipine mane (dose not stated). Evening tablet, possibly atorvastatin: name unclear in recording, confirm with records. Ibuprofen PRN for knee pain.',
      sentences: [
        { text: 'Takes amlodipine every morning', sources: ['m2'], quote: 'Amlodipine mane (dose not stated)' },
        { text: 'Evening tablet, possibly atorvastatin. Check records', sources: ['m3', 'm4', 'm5'], quote: 'Evening tablet, possibly atorvastatin: name unclear in recording, confirm with records' },
        { text: 'Takes ibuprofen now and then for knee pain', sources: ['m6'], quote: 'Ibuprofen PRN for knee pain' }
      ]
    },
    {
      id: 'allergies', title: 'Allergies', start: 330, end: 360,
      note: 'Penicillin: rash in childhood, no angioedema.',
      sentences: [
        { text: 'Allergic to penicillin: rash as a child', sources: ['a1', 'a2'], quote: 'Penicillin: rash in childhood' },
        { text: 'No swelling reaction', sources: ['a3'], quote: 'no angioedema' }
      ]
    },
    {
      id: 'social', title: 'Social history', start: 360, end: 460,
      note: 'Ex-smoker, quit 5 yrs ago (~15 pack-years). Alcohol ~1 glass wine/week. Retired; walks most days.',
      sentences: [
        { text: 'Stopped smoking 5 years ago, about 15 pack-years', sources: ['s1', 's2', 's3', 's4'], quote: 'Ex-smoker, quit 5 yrs ago (~15 pack-years)' },
        { text: 'Drinks about one glass of wine a week', sources: ['s5', 's6'], quote: 'Alcohol ~1 glass wine/week' },
        { text: 'Retired and walks most days', sources: ['s7'], quote: 'Retired; walks most days' }
      ]
    },
    {
      id: 'family', title: 'Family history', start: 460, end: 510,
      note: 'Brother: cardiac event in his 50s treated with a stent (details unclear). Father: T2DM.',
      sentences: [
        { text: 'Brother had a heart event and a stent in his 50s', sources: ['f2', 'f3', 'f4'], quote: 'Brother: cardiac event in his 50s treated with a stent (details unclear)' },
        { text: 'Father had diabetes', sources: ['f5'], quote: 'Father: T2DM' }
      ]
    },
    {
      id: 'ros', title: 'Review of systems', start: 510, end: 570,
      note: 'No cough, fever or ankle oedema. No orthopnoea. Occasional burning after spicy food, distinct from exertional symptoms.',
      sentences: [
        { text: 'No cough, fever or ankle swelling', sources: ['r1', 'r2'], quote: 'No cough, fever or ankle oedema' },
        { text: 'Not breathless lying flat', sources: ['r3', 'r4'], quote: 'No orthopnoea' },
        { text: 'Burning after spicy food, different from the tightness', sources: ['r5', 'r6'], quote: 'Occasional burning after spicy food, distinct from exertional symptoms' }
      ]
    },
    {
      id: 'exam', title: 'Examination', start: 570, end: 650,
      note: 'BP 148/92, HR 78 regular. HS I+II+0, no murmurs. Chest clear bilaterally. No peripheral oedema. SpO2 97%.',
      sentences: [
        { text: 'Blood pressure 148/92, pulse 78 and regular', sources: ['e1'], quote: 'BP 148/92, HR 78 regular' },
        { text: 'Normal heart sounds, no murmurs', sources: ['e2'], quote: 'HS I+II+0, no murmurs' },
        { text: 'Chest clear', sources: ['e3'], quote: 'Chest clear bilaterally' },
        { text: 'No ankle swelling', sources: ['e6'], quote: 'No peripheral oedema' },
        { text: 'Oxygen saturation 97%', sources: ['e7'], quote: 'SpO2 97%' }
      ]
    },
    {
      id: 'assessment', title: 'Assessment', start: 650, end: 690,
      note: 'Exertional chest tightness with features of stable angina, worsening over the past week. No features of ACS today.',
      sentences: [
        { text: 'Symptoms sound like angina', sources: ['x1'], quote: 'Exertional chest tightness with features of stable angina' },
        { text: 'Getting worse, so needs prompt follow-up', sources: ['x3'], quote: 'worsening over the past week' },
        { text: 'Nothing suggests a heart attack today', sources: ['x2', 'x3'], quote: 'No features of ACS today' }
      ]
    },
    {
      id: 'plan', title: 'Plan', start: 690, end: 751,
      note: 'ECG today; bloods incl. lipid profile. Refer to chest pain clinic (seen within 2 wks). GTN spray PRN. Safety-netting: call an ambulance if pain lasts >15 min or occurs at rest.',
      sentences: [
        { text: 'ECG and blood tests today, including cholesterol', sources: ['n1'], quote: 'ECG today; bloods incl. lipid profile' },
        { text: 'Referral to the chest pain clinic within 2 weeks', sources: ['n2'], quote: 'Refer to chest pain clinic (seen within 2 wks)' },
        { text: 'Spray under the tongue if symptoms start', sources: ['n3'], quote: 'GTN spray PRN' },
        { text: 'Call an ambulance if pain lasts over 15 minutes or comes on at rest', sources: ['n4'], quote: 'Safety-netting: call an ambulance if pain lasts >15 min or occurs at rest' }
      ]
    }
  ],

  /* Clinical timeline: the patient's record, and the past events they mention.
     mentions[].candidates are the AI's ranked matches, best first. */
  visitDate: '2026-10-01',
  events: [
    { id: 'enc-uc', type: 'encounter', date: '2026-09-10', title: 'Urgent care sinus', subtitle: 'Riverside Urgent Care, Dr K. Patel',
      details: [['Visit summary', 'Facial pressure and congestion for 10 days'], ['Diagnosis', 'Acute bacterial sinusitis'], ['Treatment', 'Amoxicillin-clavulanate 875 mg twice daily for 7 days. Saline rinse']] },
    { id: 'med-amox', type: 'medication', date: '2026-09-10', title: 'Amoxicillin-clavulanate 875 mg', subtitle: 'Prescribed by Dr K. Patel, Riverside Urgent Care',
      details: [['Dose', 'Twice daily'], ['Duration', '7 days, 10 – 17 September'], ['Status', 'Completed']] },
    { id: 'lab-crp', type: 'lab', date: '2026-09-10', title: 'C-reactive protein', subtitle: 'Riverside Urgent Care',
      details: [['Result', '18 mg/L'], ['Reference range', 'Under 5 mg/L'], ['Interpretation', 'Raised']] },
    { id: 'enc-fu', type: 'encounter', date: '2026-09-24', title: 'Sinusitis follow-up', subtitle: 'Telephone, Dr A. Moore',
      details: [['Visit summary', 'Symptoms settled after antibiotics'], ['Diagnosis', 'Resolved sinusitis'], ['Treatment', 'None needed']] },
    { id: 'enc-tel', type: 'encounter', date: '2026-08-19', title: 'Telephone consult', subtitle: 'Dr A. Moore',
      details: [['Visit summary', 'Dry cough for 2 weeks after a cold'], ['Diagnosis', 'Post-viral cough'], ['Treatment', 'Fluids and honey; review if not settling in 3 weeks']] },
    { id: 'lab-fbc', type: 'lab', date: '2026-08-20', title: 'Full blood count', subtitle: 'Ordered by Dr A. Moore',
      details: [['Result', 'Within normal limits'], ['Interpretation', 'Normal']] },
    { id: 'enc-bp', type: 'encounter', date: '2026-08-04', title: 'Blood pressure review', subtitle: 'Practice nurse S. Lee',
      details: [['Visit summary', 'Home readings 135–145 / 85–90'], ['Diagnosis', 'Hypertension, not at target'], ['Treatment', 'Continue amlodipine 5 mg; recheck in 3 months']] },
    { id: 'med-ibu', type: 'medication', date: '2026-08-27', title: 'Ibuprofen 400 mg', subtitle: 'Prescribed by Dr A. Moore',
      details: [['Dose', 'Up to three times daily as needed for knee pain'], ['Status', 'Active']] },
    { id: 'lab-hba1c', type: 'lab', date: '2026-09-02', title: 'HbA1c', subtitle: 'Ordered by Practice nurse S. Lee',
      details: [['Result', '38 mmol/mol'], ['Reference range', 'Under 42 mmol/mol'], ['Interpretation', 'Normal']] },
    { id: 'lab-lipid', type: 'lab', date: '2025-11-03', title: 'Lipid panel', subtitle: 'Ordered by Dr A. Moore',
      details: [['Result', 'Total cholesterol 6.4 mmol/L, LDL 4.1 mmol/L'], ['Reference range', 'Total under 5.0, LDL under 3.0'], ['Interpretation', 'High']] },
    { id: 'med-atorva', type: 'medication', date: '2025-11-10', title: 'Atorvastatin 20 mg', subtitle: 'Prescribed by Dr A. Moore',
      details: [['Dose', 'Once daily, evening'], ['Status', 'Active']] },
    { id: 'enc-palp', type: 'encounter', date: '2025-01-14', title: 'Palpitations check', subtitle: 'Dr A. Moore',
      details: [['Visit summary', 'Brief palpitations after coffee'], ['Diagnosis', 'Benign palpitations'], ['Treatment', 'ECG arranged; cut down on caffeine']] },
    { id: 'lab-ecg', type: 'lab', date: '2025-01-21', title: '12-lead ECG', subtitle: 'Ordered by Dr A. Moore',
      details: [['Result', 'Sinus rhythm, 72 bpm, no ischaemic changes'], ['Interpretation', 'Normal']] },
    { id: 'med-amlo', type: 'medication', date: '2024-03-18', title: 'Amlodipine 5 mg', subtitle: 'Prescribed by Dr A. Moore',
      details: [['Dose', 'Once daily, morning'], ['Status', 'Active']] },
    { id: 'enc-chole', type: 'encounter', date: '2016-05-12', title: 'Laparoscopic cholecystectomy', subtitle: "St Mary's Hospital, Mr J. Okafor",
      details: [['Visit summary', 'Recurrent biliary colic'], ['Diagnosis', 'Symptomatic gallstones'], ['Treatment', 'Laparoscopic cholecystectomy; home the next day']] }
  ],
  mentions: [
    { id: 'mn-sinus', line: 'i2', candidates: ['enc-uc', 'med-amox', 'enc-fu'] },
    { id: 'mn-ecg', line: 'h12', candidates: ['lab-ecg', 'enc-palp'] },
    { id: 'mn-summer', line: 'h17', candidates: [] },
    { id: 'mn-lipids', line: 'p2', candidates: ['lab-lipid'] },
    { id: 'mn-gall', line: 'p5', candidates: ['enc-chole'] },
    { id: 'mn-amlo', line: 'm2', candidates: ['med-amlo', 'enc-bp'] }
  ]
};
