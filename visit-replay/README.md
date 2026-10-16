# Visit Replay

Replays a recorded visit next to the note the AI drafted from it, built from the "Visit Replay" and "Visit replay – timeline" designs. It has two tabs:

- **AI answer & provenance:** each note sentence links to the transcript lines it came from, and selecting it plays those moments.
- **Clinical timeline:** when the patient mentions a past event, it shows their record around it and the event the AI matched, which the provider can rule out.
 It's plain JavaScript and CSS with no build step, and comes in the same three skins as the date components (`custom`, `ant`, `mui`), each in light and dark.

## Files

| File | What it is |
|---|---|
| `visitreplay.js` | The component. It defines `window.VisitReplay`. |
| `visitreplay.css` | Layout, the `--vr-*` tokens and the three skins. |
| `sample-visit.js` | Demo data: a 12-minute visit. Shows the data shape; not needed in production. |
| `index.html` | Documentation and demo page. Not needed in production. |

It uses the shared core for colours, skins, buttons, tooltip and icons, so load `../calendar-date-picker/datepicker.css` and `datepicker.js` first.

## Quick start

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Roboto:wght@400;500&display=swap">
<link rel="stylesheet" href="datepicker.css">   <!-- from ../calendar-date-picker -->
<link rel="stylesheet" href="visitreplay.css">

<script src="datepicker.js"></script>           <!-- from ../calendar-date-picker -->
<script src="visitreplay.js"></script>
<script>
  // As a dialog (Done, Cancel, × and Esc close it and return focus)
  VisitReplay.open({
    audio: '/recordings/visit-123.mp3',
    transcript, sections,
    section: 'hpi',                              // opens on this section
    onDone: ({ section, reviewed }) => markReviewed(reviewed),
    onCancel: () => {}
  });

  // Or inline, e.g. in a side panel
  new VisitReplay(document.getElementById('replay'), { audio, transcript, sections });
</script>
```

## Data

Times are in seconds from the start of the recording.

```js
transcript: [
  { id: 'h6', speaker: 'patient', start: 72, end: 81, text: "It's more like a pressure…" },
  { id: 'm3', speaker: 'patient', start: 280, end: 289, text: 'And the [unclear] one at night', unclear: true }
],
sections: [{
  id: 'hpi', title: 'History of present illness', start: 24, end: 190,
  note: '3/52 hx of chest tightness… Pressure-like in character, occasionally radiating to the L arm…',
  sentences: [
    { text: 'Feels like pressure, sometimes spreads to left arm', sources: ['h6', 'h7'],
      quote: 'Pressure-like in character, occasionally radiating to the L arm' }
  ]
}]
```

- **Status comes from the data.** A line is *in the note* when a sentence cites it, *said, not in note* when none does, and *not clear* when `unclear: true`. The waveform colours follow automatically: blue for the provider, peach for the patient, grey for lines not in the note, and red for unclear lines.
- **`[unclear]`** inside a line's text is shown as a red *unclear* marker.
- **`quote`** is the phrase in `note` that the sentence came from. It's highlighted when the sentence is selected, and clicking it selects the sentence. It's optional.
- **Sections** are the tags on the waveform. Transcript lines belong to the section in which they start.
- **A sentence with no `sources`** is flagged "No source found". One citing an unclear line is flagged "Audio not clear". Your pipeline should make sure every sentence links to something.

### Clinical timeline data

Pass these to get the second tab. Without them the component shows only the AI answer.

```js
visitDate: '2026-10-01',          // today's visit; the timeline ends here
events: [                          // the patient's record
  { id: 'enc-uc', type: 'encounter', date: '2026-09-10', title: 'Urgent care sinus',
    subtitle: 'Riverside Urgent Care, Dr K. Patel',
    details: [['Visit summary', 'Facial pressure…'], ['Diagnosis', 'Acute bacterial sinusitis'], ['Treatment', '…']],
    openLabel: 'Open visit note' }     // optional; defaults by type
],
mentions: [                        // past events the patient refers to
  { id: 'mn-sinus', line: 'i2', candidates: ['enc-uc', 'med-amox', 'enc-fu'] }   // AI matches, best first
]
```

- `type` is `encounter` (●), `lab` (■) or `medication` (◆).
- `details` rows appear in the event card. Keep them short.
- `candidates: []` means the AI found nothing; the tab says so.

## Options

| Option | Type | Default | Notes |
|---|---|---|---|
| `ds`, `theme` | | `'custom'`, `'light'` | Skin and theme. |
| `audio` | URL | none | The recording. Without it, playback runs on a timer, which is useful for demos and tests. |
| `duration` | seconds | last line's end | Needed when there's no audio, or before its metadata loads. |
| `peaks` | `number[]` (0–1) | none | Real waveform levels from your audio pipeline. Without them the bar heights are illustrative. |
| `transcript`, `sections` | arrays | `[]` | See above. |
| `section` | section id | first | The section shown on open. |
| `tab` | `'answer' \| 'timeline'` | `'answer'` | The tab shown on open. |
| `visitDate`, `events`, `mentions` | | none | Clinical timeline data (see above). `visitDate` defaults to today. |
| `sentence` | index | none | A sentence to select on open. It isn't played. |
| `speakers` | object | `{ provider: 'Provider', patient: 'Patient' }` | Speaker labels. |
| `title`, `hint`, `tabLabel` | string | `'Visit Replay'`, … | Copy. |
| `onDone` | `({ section, reviewed, timeline }) => void` | none | `reviewed` lists every section opened. `timeline` lists each mention with its linked `event` and `status` (see below). |
| `onOpenEvent` | `(event) => void` | none | "Open visit note / lab report / prescription" on an event card. |
| `onCancel`, `onSection`, `onSentence` | functions | none | |

## Methods

```js
replay.play(); replay.pause(); replay.seek(95);
replay.showSection(3, { play: true });
replay.selectSentence(1);        // selects and plays its sources
replay.setTab('timeline');
replay.getState();               // { time, playing, section, sentence, reviewed, tab, mention }
replay.setTheme('dark'); replay.setDS('mui'); replay.destroy();
```

## Behaviour

- **Selecting a tag** shows that section and plays it, stopping at the section's end.
- **Selecting a sentence** highlights its sources and dims the other lines. The connectors draw in, the phrase in the draft is highlighted, and the sources are played one after another, stopping at the end of the last one.
- **Selecting a transcript line** plays just that line, and selects the sentence that uses it.
- **Play** runs freely from the playhead. As it crosses into the next section, the view follows.
- **Clicking or dragging the waveform** seeks.
- **Scrolling:** each column scrolls on its own inside the panel, and the connectors follow. When a sentence is selected, its sources scroll into view.
- **Nothing in the note is edited here.** Done reports the review. Cancel, × and Esc close without changes.

### Clinical timeline

- **It follows the audio.** The mention shown is the latest one heard at the playhead (the first one before any). Seeking, tags and playback all change it. Clicking the quote plays it.
- **The date axis** shows four half-month ranges (1–15 and 16–end), two on narrow screens. It ends on the visit day, which is marked with a green dot, and it opens on the range around the shown event. ‹ › page one half-month at a time. Ranges outside the visit's year show the year.
- **The matched event** is ringed, with a stem down to its card.
- **Not this event** moves to the AI's next candidate, marked "Possible match", which "Use this event" confirms ("Linked by you"). After the last candidate, the mention shows "No event linked", and "Show suggestions again" restores the list.
- **Selecting any other event** previews it with a grey "Not linked" card. Esc or "Back to linked event" returns.
- **Switches** hide encounters, labs or medications. The linked event always stays visible.
- **`timeline` in the Done result:** `status` is `ai` (best match kept), `confirmed` (the provider chose a later suggestion), `suggested` (a later suggestion left unconfirmed), `none` (all ruled out) or `unmatched` (the AI found nothing).
- **Narrow layout:** below 640px the thread stacks, and the selected sentence opens to show its sources underneath. As a dialog it fills the screen.

## Keyboard

| Key | Action |
|---|---|
| Space / Enter on the waveform, or the play button | Play or pause |
| ← → on the waveform | Seek 5 s (Shift: 15 s) |
| PageUp / PageDown, Home / End | Seek 30 s, go to start / end |
| ← → between tags, tabs or timeline events · ↑ ↓ between sentences or transcript lines | Move (one Tab stop per group) |
| Enter / Space | Select |
| Esc | Back to the linked event (timeline preview), otherwise close (dialog) |

## Accessibility

- As a dialog it's `role="dialog"` with `aria-modal`. Focus starts on Play, is trapped inside, and returns to the opener on close. Inline it's a labelled region.
- The waveform is a `slider` whose value text includes the section ("1:12 of 12:31, History of present illness").
- Sentences are toggle buttons (`aria-pressed`). Flags have screen-reader text as well as the tooltip.
- Selections and section changes are announced through a polite live region, including the times of the sources.
- Status is never shown by colour alone: transcript lines say "Not clear" or "Not in note".
- Animations (the gliding selection, drawn connectors, staggered highlights and section fade) are removed under `prefers-reduced-motion`.

## Before production

- **Audio:** pass `audio` and, ideally, `peaks` from your audio pipeline. Check range requests (seeking) and authentication on the recording URL.
- **Data contract:** the sentence-to-source links and the `unclear` flags come from your AI pipeline. The component shows them but doesn't verify them.
- **Dimmed lines:** lines that aren't sources of the selected sentence are shown at 45% opacity (design choice). They're still readable, but below AA contrast while dimmed.
- **Timeline data:** event matching comes from your AI pipeline. The component shows the ranked candidates and records the provider's decision; it doesn't search the record itself.
- **Long histories:** the axis pages a half-month at a time and opens on the shown event. If providers need to browse years, add a zoom level.
- **Playback speed and transcript search** aren't included yet.
- **Testing:** tested in desktop Chrome and at 375px width. Not yet tested in Safari, Firefox, on touch devices, or with screen readers.
- **Demo content** in `sample-visit.js` is a placeholder.
