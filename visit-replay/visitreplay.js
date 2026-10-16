/* =========================================================================
   Visit Replay: replay a recorded visit beside the AI-drafted note.
   Every note sentence links to the transcript lines it came from, and the
   audio jumps to them. Built on the shared core in ../calendar-date-picker
   (colour tokens, skins, .dp-btn, .dp-tip, icons), so load that first.
   ========================================================================= */
(function () {
  'use strict';

  const core = window.DatePicker && window.DatePicker.shared;
  if (!core) throw new Error('VisitReplay: load ../calendar-date-picker/datepicker.js first.');
  const { esc, I, MONTHS, MONTHS_SHORT, sparkle } = core;

  const icon = (d, o = {}) =>
    `<svg viewBox="${o.vb || '0 0 24 24'}" aria-hidden="true"${o.stroke
      ? ` fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linecap="round" stroke-linejoin="round"`
      : ' fill="currentColor"'}>${d}</svg>`;

  const IC = {
    play: {
      custom: icon('<path d="M7 4.9v14.2a1 1 0 0 0 1.53.85l11.2-7.1a1 1 0 0 0 0-1.7L8.53 4.05A1 1 0 0 0 7 4.9z"/>'),
      ant: icon('<path d="M715.8 493.5 335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"/>', { vb: '64 64 896 896' }),
      mui: icon('<path d="M8 5v14l11-7z"/>')
    },
    pause: {
      custom: icon('<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>'),
      ant: icon('<path d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z"/>', { vb: '64 64 896 896' }),
      mui: icon('<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>')
    },
    close: {
      custom: icon('<path d="M6 6l12 12M18 6 6 18"/>', { stroke: 2.2 }),
      ant: icon('<path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"/>', { vb: '64 64 896 896' }),
      mui: icon('<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>')
    }
  };

  const XS = icon('<path d="M6 6l12 12M18 6 6 18"/>', { stroke: 2.4 });

  // 12:31, or 1:02:05 past an hour.
  const fmt = sec => {
    const s = Math.max(0, Math.floor(sec)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(r).padStart(2, '0');
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = k => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const LEVELS = [5, 7, 13, 13, 21, 33, 33];   // bar heights from the spec (px)
  const NARROW = 640;                           // below this width the thread stacks

  // Connector from a sentence (x0, y0) to a source card (x1, y1): quarter curve, trunk, quarter curve.
  const curve = (x0, y0, x1, y1) => {
    const dy = y1 - y0, s = Math.sign(dy) || 1, xm = (x0 + x1) / 2;
    const r = Math.min((x1 - x0) / 2, Math.abs(dy) / 2);
    if (r < 1) return `M${x0} ${y0}H${x1}`;
    const k = r * 0.5523, f = n => n.toFixed(1);
    return `M${f(x0)} ${f(y0)}H${f(xm - r)}C${f(xm - r + k)} ${f(y0)} ${f(xm)} ${f(y0 + s * (r - k))} ${f(xm)} ${f(y0 + s * r)}` +
      `V${f(y1 - s * r)}C${f(xm)} ${f(y1 - s * (r - k))} ${f(xm + r - k)} ${f(y1)} ${f(xm + r)} ${f(y1)}H${f(x1)}`;
  };

  // Clinical timeline: half-month buckets (1–15, 16–end of month), drawn at equal width.
  const DAY = 864e5;
  const parseDay = v => {
    if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
    const [y, m, d] = String(v).split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const bucketOf = d => d.getFullYear() * 24 + d.getMonth() * 2 + (d.getDate() > 15 ? 1 : 0);
  const bucketStart = b => new Date(Math.floor(b / 24), Math.floor((b % 24) / 2), b % 2 ? 16 : 1);
  const dayMonth = d => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  const longDay = d => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const TYPES = {
    encounter: { label: 'Encounter', filter: 'Encounter', open: 'Open visit note' },
    lab: { label: 'Lab', filter: 'Labs', open: 'Open lab report' },
    medication: { label: 'Medication', filter: 'Medication', open: 'Open prescription' }
  };

  let uid = 0;

  class VisitReplay {
    constructor(el, opts = {}) {
      this.host = el;
      this.o = Object.assign({
        ds: 'custom', theme: 'light', title: 'Visit Replay',
        hint: 'Select a tag to jump to that section',
        tabLabel: 'AI answer & provenance',
        speakers: { provider: 'Provider', patient: 'Patient' },
        transcript: [], sections: [], duration: 0, audio: null, peaks: null,
        section: null, sentence: -1, modal: false,
        timelineLabel: 'Clinical timeline', tab: 'answer',
        visitDate: null, events: [], mentions: []
      }, opts);
      this.uid = 'vr' + (++uid);

      this.lines = this.o.transcript.map(l => Object.assign({}, l)).sort((a, b) => a.start - b.start);
      this.byId = new Map(this.lines.map(l => [String(l.id), l]));
      this.secs = this.o.sections.map(s => Object.assign({}, s, {
        sentences: (s.sentences || []).map(x => Object.assign({}, x, { sources: (x.sources || []).map(String) }))
      }));
      const cited = new Set();
      this.secs.forEach(s => s.sentences.forEach(x => x.sources.forEach(id => cited.add(id))));
      this.lines.forEach(l => { l.status = l.unclear ? 'unclear' : cited.has(String(l.id)) ? l.speaker : 'omitted'; });
      this.secs.forEach(s => { s.lines = this.lines.filter(l => l.start >= s.start && l.start < s.end); });
      this.dur = this.o.duration || (this.lines.length ? this.lines[this.lines.length - 1].end : 0);

      const si = this.o.section != null ? this.secs.findIndex(s => s.id === this.o.section) : -1;
      this.sec = si >= 0 ? si : 0;
      const sec = this.secs[this.sec];
      this.sel = sec && sec.sentences[this.o.sentence] ? this.o.sentence : -1;
      const first = this.sel >= 0 && this.clipsFor(sec.sentences[this.sel].sources)[0];
      this.t = first ? first.start : sec ? sec.start : 0;
      this.visited = new Set(sec ? [sec.id] : []);

      // Clinical timeline: record events, and the past events the patient mentions (with the AI's ranked candidates).
      this.today = parseDay(this.o.visitDate || new Date());
      this.events = new Map(this.o.events.map(e => [String(e.id), Object.assign({}, e, { id: String(e.id), day: parseDay(e.date) })]));
      this.mentions = this.o.mentions
        .map(m => Object.assign({}, m, { line: String(m.line), candidates: (m.candidates || []).map(String).filter(id => this.events.has(id)), pick: 0, confirmed: false }))
        .filter(m => this.byId.has(m.line))
        .sort((a, b) => this.byId.get(a.line).start - this.byId.get(b.line).start);
      this.hasTimeline = this.events.size > 0 || this.mentions.length > 0;
      this.tab = this.hasTimeline && this.o.tab === 'timeline' ? 'timeline' : 'answer';
      this.types = { encounter: true, lab: true, medication: true };
      this.mi = -1; this.preview = null; this.win = null;
      this.playing = false; this.queue = []; this.clipEnd = null;
      this.tickB = this.tick.bind(this);

      if (this.o.audio) {
        this.audio = new Audio(this.o.audio);
        this.audio.preload = 'metadata';
        this.audio.addEventListener('loadedmetadata', () => {
          if (!this.o.duration && isFinite(this.audio.duration)) { this.dur = this.audio.duration; this.rebuild(); }
        });
        this.audio.addEventListener('ended', () => this.pause());
      }
      this.build();
    }

    /* ---------- Markup ---------- */
    build() {
      const o = this.o, ds = o.ds, id = this.uid;
      const root = this.root = document.createElement('div');
      root.className = 'dp vr' + (o.modal ? ' is-modal' : '');
      root.dataset.ds = ds; root.dataset.theme = o.theme;
      root.setAttribute('role', o.modal ? 'dialog' : 'region');
      if (o.modal) root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-labelledby', id + '-title');

      const key = [['provider', o.speakers.provider], ['patient', o.speakers.patient], ['unclear', 'Unclear audio'], ['omitted', 'Said, not in note']];
      const keys = ds === 'custom' ? `<div class="vr-keys" aria-hidden="true">
          <span><kbd class="is-wide">Space</kbd>play or pause</span>
          <span><kbd>${I.aL}</kbd><kbd>${I.aR}</kbd>seek</span>
          <span><kbd>${I.aU}</kbd><kbd>${I.aD}</kbd>move</span>
          <span><kbd>${I.enter}</kbd>select</span></div>` : '';

      root.innerHTML = `
        <header class="vr-head">
          <h2 class="vr-title" id="${id}-title">${esc(o.title)}</h2>
          <button type="button" class="vr-close" data-act="cancel" aria-label="Close">${IC.close[ds]}</button>
        </header>
        <div class="vr-body">
          <div class="vr-bar">
            <p class="vr-hint">${esc(o.hint)}</p>
            <ul class="vr-legend" aria-label="Colour key">${key.map(([k, l]) => `<li><i class="is-${k}"></i>${esc(l)}</li>`).join('')}</ul>
          </div>
          <div class="vr-player">
            <button type="button" class="vr-play" data-act="play" aria-label="Play recording">${IC.play[ds]}</button>
            <span class="vr-time vr-now" aria-hidden="true">0:00</span>
            <div class="vr-track">
              <div class="vr-wave" role="slider" tabindex="0" aria-label="Recording position"
                   aria-valuemin="0" aria-valuemax="${Math.round(this.dur)}" aria-valuenow="0">
                <svg class="vr-bars" aria-hidden="true"></svg>
                <div class="vr-hover" aria-hidden="true"></div>
                <div class="vr-ph" aria-hidden="true"></div>
              </div>
              <div class="vr-tags" role="group" aria-label="Sections">${this.secs.map((s, i) =>
                `<button type="button" class="vr-tag" data-i="${i}" tabindex="-1" style="left:${(s.start / this.dur * 100).toFixed(3)}%"
                  aria-label="${esc(s.title)}, ${fmt(s.start)} to ${fmt(s.end)}"></button>`).join('')}</div>
            </div>
            <span class="vr-time vr-dur" aria-hidden="true">${fmt(this.dur)}</span>
          </div>
          ${this.hasTimeline
            ? `<div class="vr-tabs" role="tablist" aria-label="Views">
                <button type="button" class="vr-tab" role="tab" id="${id}-tab-a" aria-controls="${id}-pa" data-tab="answer">${esc(o.tabLabel)}</button>
                <button type="button" class="vr-tab" role="tab" id="${id}-tab-t" aria-controls="${id}-pt" data-tab="timeline">${esc(o.timelineLabel)}</button>
              </div>`
            : `<div class="vr-tabs"><h3 class="vr-tab is-on">${esc(o.tabLabel)}</h3></div>`}
          <div class="vr-view" id="${id}-pa"${this.hasTimeline ? ` role="tabpanel" aria-labelledby="${id}-tab-a"` : ''}></div>
          ${this.hasTimeline ? `<div class="vr-tl" id="${id}-pt" role="tabpanel" aria-labelledby="${id}-tab-t" hidden></div>` : ''}
        </div>
        <footer class="vr-foot">${keys}
          <div class="vr-actions">
            <button type="button" class="dp-btn" data-act="cancel">Cancel</button>
            <button type="button" class="dp-btn is-primary" data-act="done">Done</button>
          </div>
        </footer>
        <div class="dp-tip vr-tip" id="${id}-tip" role="tooltip" hidden></div>
        <div class="dp-sr" aria-live="polite"></div>`;

      const q = s => root.querySelector(s);
      this.body = q('.vr-body'); this.playBtn = q('.vr-play'); this.nowEl = q('.vr-now');
      this.wave = q('.vr-wave'); this.bars = q('.vr-bars'); this.ph = q('.vr-ph'); this.hoverEl = q('.vr-hover');
      this.tagsEl = q('.vr-tags'); this.view = q('.vr-view'); this.tip = q('.vr-tip'); this.live = q('.dp-sr');
      this.tl = q('.vr-tl');

      if (o.modal) this.host.appendChild(root);
      else { this.host.innerHTML = ''; this.host.appendChild(root); }

      this.bind();
      this.narrow = root.clientWidth < NARROW;
      root.classList.toggle('is-narrow', this.narrow);
      this.renderBars();
      this.renderView();
      this.markTags();
      this.setTime(this.t, false);
      if (this.hasTimeline) this.setTab(this.tab, { animate: false, focus: false });
      this.ro = new ResizeObserver(() => this.layout());
      this.ro.observe(root); this.ro.observe(this.view);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.root && this.layout());
    }

    rebuild() {
      const playing = this.playing;
      this.pause();
      this.teardown();
      this.build();
      if (playing) this.play();
    }

    teardown() {
      if (this.ro) this.ro.disconnect();
      clearTimeout(this._swap);
      if (this.root) this.root.remove();
      this.root = null;
    }

    noteHTML(s) {
      const head = `<b>${esc(s.title)}:</b> `;
      if (!s.note) return head + '<span class="vr-none">Not included in the note.</span>';
      const text = s.note;
      const spans = s.sentences.map((x, i) => ({ i, at: x.quote ? text.indexOf(x.quote) : -1, len: x.quote ? x.quote.length : 0 }))
        .filter(x => x.at >= 0).sort((a, b) => a.at - b.at);
      let html = '', pos = 0;
      spans.forEach(x => {
        if (x.at < pos) return;
        html += esc(text.slice(pos, x.at)) + `<span class="vr-q" data-i="${x.i}">${esc(text.substr(x.at, x.len))}</span>`;
        pos = x.at + x.len;
      });
      return head + html + esc(text.slice(pos));
    }

    cardHTML(l) {
      const who = esc(this.o.speakers[l.speaker] || l.speaker);
      const st = l.status === 'unclear' ? '<i></i><span class="vr-st is-unclear">Not clear</span>'
        : l.status === 'omitted' ? '<i></i><span class="vr-st">Not in note</span>' : '';
      const text = esc(l.text).replace(/\[unclear\]/g, '<span class="vr-inaud">unclear</span>');
      return `<button type="button" class="vr-card is-${l.status}" data-id="${esc(l.id)}" tabindex="-1">` +
        `<span class="vr-meta"><span class="vr-who">${who}</span><i></i><span class="vr-at">${fmt(l.start)}</span>${st}` +
        `<span class="vr-eq" aria-hidden="true"><b></b><b></b><b></b></span></span>` +
        `<span class="vr-text">${text}</span></button>`;
    }

    sentUnclear(x) { return x.sources.some(id => { const l = this.byId.get(id); return l && l.status === 'unclear'; }); }

    renderView() {
      const s = this.secs[this.sec];
      if (!s) { this.view.innerHTML = ''; return; }
      const sents = s.sentences.length
        ? `<ul class="vr-sents" aria-label="Note sentences. Select one to see and hear where it came from.">${s.sentences.map((x, i) => {
            const flag = !x.sources.length ? 'nosource' : this.sentUnclear(x) ? 'unclear' : '';
            const sr = flag === 'nosource' ? ', no source in the recording' : ', based on unclear audio';
            return `<li><button type="button" class="vr-sent${flag ? ' has-flag' : ''}" data-i="${i}" data-flag="${flag}" aria-pressed="false" tabindex="-1">` +
              `<span>${esc(x.text)}</span>${flag ? `<span class="vr-flag is-${flag}">${I.warn}<span class="dp-sr">${sr}</span></span>` : ''}</button>` +
              `<div class="vr-exp"><div><ul class="vr-exp-list" aria-label="Sources"></ul></div></div></li>`;
          }).join('')}</ul>`
        : '<p class="vr-empty">Nothing from this part of the visit is in the note.</p>';
      this.view.innerHTML = `
        <p class="vr-note">${this.noteHTML(s)}</p>
        <div class="vr-thread">
          <div class="vr-scol"><div class="vr-ind" aria-hidden="true"></div>${sents}</div>
          <svg class="vr-links" aria-hidden="true"></svg>
          <ul class="vr-srcs" aria-label="Transcript of this section">${s.lines.map(l => `<li>${this.cardHTML(l)}</li>`).join('')}</ul>
        </div>`;
      this.thread = this.view.querySelector('.vr-thread');
      this.scol = this.view.querySelector('.vr-scol');
      this.srcs = this.view.querySelector('.vr-srcs');
      const redraw = () => {
        cancelAnimationFrame(this._linkRaf);
        this._linkRaf = requestAnimationFrame(() => { this.drawLinks(false); this.markEdges(); });
      };
      this.scol.addEventListener('scroll', redraw, { passive: true });
      this.srcs.addEventListener('scroll', () => { redraw(); this.hideTip(); }, { passive: true });
      const first = this.view.querySelector('.vr-sent'); if (first) first.tabIndex = 0;
      const card = this.view.querySelector('.vr-srcs .vr-card'); if (card) card.tabIndex = 0;
      this.speaking = null;
      this.selectSentence(this.sel, { play: false, animate: false, scroll: false, announce: false });
      this.markSpeaking(true);
      requestAnimationFrame(() => this.root && this.markEdges());
    }

    renderBars() {
      const w = this.wave.clientWidth;
      if (!w || w === this._barsW) return;
      this._barsW = w;
      const n = Math.max(1, Math.floor((w + 2) / 4)), step = w / n, H = 34, peaks = this.o.peaks;
      let li = 0, out = '';
      for (let b = 0; b < n; b++) {
        const t0 = b / n * this.dur, t1 = (b + 1) / n * this.dur, tc = (t0 + t1) / 2;
        while (li < this.lines.length && this.lines[li].end <= t0) li++;
        let best = null, over = 0;
        for (let j = li; j < this.lines.length && this.lines[j].start < t1; j++) {
          const L = this.lines[j], ov = Math.min(t1, L.end) - Math.max(t0, L.start);
          if (ov > over) { over = ov; best = L; }
        }
        let cls = 'sil', h = 3;
        if (best && over >= (t1 - t0) * 0.3) {
          cls = best.status;
          if (peaks && peaks.length) {
            const a = Math.floor(t0 / this.dur * peaks.length), z = Math.max(a + 1, Math.ceil(t1 / this.dur * peaks.length));
            h = Math.max(4, Math.round(Math.max(...peaks.slice(a, z)) * H));
          } else h = LEVELS[Math.floor(rnd(Math.floor(tc * 1.3)) * LEVELS.length)];
        }
        out += `<rect class="is-${cls}" x="${(b * step + (step - 2) / 2).toFixed(2)}" y="${((H - h) / 2).toFixed(2)}" width="2" height="${h}" rx="1"/>`;
      }
      this.bars.setAttribute('viewBox', `0 0 ${w.toFixed(2)} ${H}`);
      this.bars.innerHTML = out;
    }

    layout() {
      if (!this.root) return;
      const narrow = this.root.clientWidth < NARROW;
      if (narrow !== this.narrow) {
        this.narrow = narrow;
        this.root.classList.toggle('is-narrow', narrow);
        this.renderExpansion();
        if (this.tab === 'timeline') { this.win = null; this.renderTimeline(false); }
      }
      this.renderBars();
      if (this.tab === 'timeline') { this.placeCard(); return; }
      this.moveIndicator(false);
      this.drawLinks(false);
      this.markEdges();
    }

    /* ---------- Selection ---------- */
    markTags() {
      this.tagsEl.querySelectorAll('.vr-tag').forEach(b => {
        const on = +b.dataset.i === this.sec;
        b.classList.toggle('is-on', on);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      if (!this.tagsEl.contains(document.activeElement)) this.rove(this.tagsEl, '.vr-tag', this.sec);
    }

    rove(scope, sel, i) {
      scope.querySelectorAll(sel).forEach((b, k) => { b.tabIndex = k === i ? 0 : -1; });
    }

    showSection(i, opts = {}) {
      const s = this.secs[i];
      if (!s) return;
      const changed = i !== this.sec;
      this.sec = i;
      this.visited.add(s.id);
      this.markTags();
      if (changed) {
        this.sel = -1;
        this.hideTip();
        const swap = () => {
          this.renderView();
          this.view.classList.remove('is-out', 'is-in');
          void this.view.offsetWidth;
          if (opts.animate !== false && !reduced()) this.view.classList.add('is-in');
        };
        clearTimeout(this._swap);
        if (opts.animate === false || reduced()) swap();
        else { this.view.classList.add('is-out'); this._swap = setTimeout(swap, 110); }
        const n = s.sentences.length;
        this.say(`${s.title}. ${n ? `${n} sentence${n > 1 ? 's' : ''} in the note.` : 'Not included in the note.'}`);
        if (this.o.onSection) this.o.onSection(s, this);
      }
      if (opts.play) this.playClips([{ start: s.start, end: s.end }]);
    }

    selectSentence(i, opts = {}) {
      const s = this.secs[this.sec];
      if (!s || !s.sentences[i]) i = -1;
      const prev = this.sel;
      this.sel = i;
      this.view.querySelectorAll('.vr-sent').forEach(b => {
        const on = +b.dataset.i === i;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (i >= 0) this.rove(this.view, '.vr-sent', i);
      this.view.querySelectorAll('.vr-q').forEach(q => q.classList.toggle('is-on', +q.dataset.i === i));

      const src = i >= 0 ? new Set(s.sentences[i].sources) : null;
      let n = 0;
      this.view.querySelectorAll('.vr-srcs .vr-card').forEach(c => {
        const on = !!src && src.has(c.dataset.id);
        c.classList.toggle('is-linked', on);
        c.style.transitionDelay = on && opts.animate !== false ? (n++ * 45) + 'ms' : '';
      });
      if (this.thread) this.thread.classList.toggle('has-sel', i >= 0);
      this.moveIndicator(opts.animate !== false && prev >= 0);
      this.renderExpansion();
      this.drawLinks(opts.animate !== false);
      if (i < 0) return;

      const x = s.sentences[i], clips = this.clipsFor(x.sources);
      if (opts.scroll !== false) this.revealSources(opts.animate !== false);
      else if (!this.narrow) this.revealSources(false);
      if (opts.announce !== false) {
        const list = x.sources.map(id => this.byId.get(id)).filter(Boolean)
          .map(l => `${this.o.speakers[l.speaker] || l.speaker} at ${fmt(l.start)}`);
        this.say(list.length ? `${list.length} source${list.length === 1 ? '' : 's'}: ${list.join(', ')}.${opts.play !== false ? ' Playing.' : ''}`
          : 'No source in the recording. Check this sentence before signing.');
      }
      if (opts.play !== false && clips.length) this.playClips(clips);
      if (this.o.onSentence) this.o.onSentence(x, this);
    }

    // Fades a column's edge while there's more to scroll that way.
    markEdges() {
      [this.scol, this.srcs].forEach(c => {
        if (!c) return;
        c.classList.toggle('is-more-above', c.scrollTop > 2);
        c.classList.toggle('is-more-below', c.scrollTop + c.clientHeight < c.scrollHeight - 2);
      });
    }

    // Scrolls each column (not the page) so the selected sentence and its sources are in view.
    revealSources(smooth) {
      const behavior = smooth && !reduced() ? 'smooth' : 'auto';
      if (this.narrow) {
        const li = this.sel >= 0 && this.view.querySelector(`.vr-sent[data-i="${this.sel}"]`);
        if (li && smooth) li.closest('li').scrollIntoView({ block: 'nearest', behavior });
        return;
      }
      const fit = (box, els) => {
        if (!box || !els.length || box.scrollHeight <= box.clientHeight) return;
        const br = box.getBoundingClientRect();
        const top = els[0].getBoundingClientRect().top - br.top + box.scrollTop;
        const bottom = els[els.length - 1].getBoundingClientRect().bottom - br.top + box.scrollTop;
        if (top >= box.scrollTop + 8 && bottom <= box.scrollTop + box.clientHeight - 8) return;
        const span = bottom - top, target = span < box.clientHeight ? top - (box.clientHeight - span) / 2 : top - 8;
        box.scrollTo({ top: clamp(target, 0, box.scrollHeight - box.clientHeight), behavior });
      };
      fit(this.srcs, [...this.srcs.querySelectorAll('.vr-card.is-linked')]);
      const b = this.sel >= 0 && this.scol.querySelector(`.vr-sent[data-i="${this.sel}"]`);
      if (b) fit(this.scol, [b]);
    }

    moveIndicator(animate) {
      const ind = this.view.querySelector('.vr-ind');
      if (!ind) return;
      const b = this.sel >= 0 && this.view.querySelector(`.vr-sent[data-i="${this.sel}"]`);
      if (!b || this.narrow) { ind.classList.remove('is-on'); return; }
      const col = ind.parentElement, cr = col.getBoundingClientRect(), br = b.getBoundingClientRect();
      const wasOn = ind.classList.contains('is-on');
      if (!animate || !wasOn) ind.classList.add('no-anim');
      ind.style.transform = `translate(${(br.left - cr.left).toFixed(1)}px, ${(br.top - cr.top + col.scrollTop).toFixed(1)}px)`;
      ind.style.width = br.width.toFixed(1) + 'px';
      ind.style.height = br.height.toFixed(1) + 'px';
      ind.classList.add('is-on');
      if (!animate || !wasOn) { void ind.offsetWidth; ind.classList.remove('no-anim'); }
    }

    // Narrow layouts show the selected sentence's sources right under it, as a thread.
    renderExpansion() {
      const s = this.secs[this.sec];
      this.view.querySelectorAll('.vr-exp').forEach(exp => {
        const i = +exp.previousElementSibling.dataset.i, open = this.narrow && i === this.sel;
        const list = exp.querySelector('.vr-exp-list');
        if (open) {
          list.innerHTML = s.sentences[i].sources.map(id => this.byId.get(id)).filter(Boolean)
            .sort((a, b) => a.start - b.start).map(l => `<li>${this.cardHTML(l).replace('class="vr-card', 'class="vr-card is-linked')}</li>`).join('');
          list.querySelectorAll('.vr-card').forEach(c => { c.tabIndex = 0; });
        }
        exp.classList.toggle('is-open', open);
        if (!open && list.innerHTML) {
          if (reduced()) list.innerHTML = '';
          else setTimeout(() => { if (!exp.classList.contains('is-open')) list.innerHTML = ''; }, 280);
        }
      });
      this.markSpeaking(true);
    }

    drawLinks(animate) {
      const svg = this.view.querySelector('.vr-links');
      if (!svg) return;
      const b = this.sel >= 0 && !this.narrow && this.view.querySelector(`.vr-sent[data-i="${this.sel}"]`);
      if (!b) { svg.innerHTML = ''; return; }
      // Ends are clamped to each column's visible area, so a source scrolled out of view still shows which way it is.
      const th = svg.getBoundingClientRect(), br = b.getBoundingClientRect();
      const lc = this.scol.getBoundingClientRect(), rc = this.srcs.getBoundingClientRect();
      const x0 = br.right - th.left;
      const y0raw = br.top + Math.min(br.height / 2, 18);
      const y0 = clamp(y0raw, lc.top + 6, lc.bottom - 6) - th.top;
      const cards = [...this.view.querySelectorAll('.vr-srcs .vr-card.is-linked')];
      const ends = cards.map(c => {
        const r = c.getBoundingClientRect(), y = r.top + Math.min(r.height / 2, 36);
        const cy = clamp(y, rc.top + 6, rc.bottom - 6);
        return { d: curve(x0, y0, r.left - th.left - 2, cy - th.top), off: cy !== y || y0raw - th.top !== y0 };
      });
      const paths = svg.querySelectorAll('path');
      if (!animate && paths.length === ends.length) {
        paths.forEach((p, k) => { p.setAttribute('d', ends[k].d); p.classList.toggle('is-off', ends[k].off); });
        return;
      }
      svg.classList.remove('is-drawing');
      svg.innerHTML = ends.map((e, k) => `<path d="${e.d}" pathLength="1"${e.off ? ' class="is-off"' : ''} style="--d:${60 + k * 50}ms"/>`).join('');
      if (animate && !reduced()) { void svg.getBoundingClientRect(); svg.classList.add('is-drawing'); }
    }

    /* ---------- Tabs ---------- */
    setTab(tab, opts = {}) {
      if (!this.hasTimeline) return;
      const changed = tab !== this.tab;
      this.tab = tab;
      this.root.querySelectorAll('.vr-tab[role="tab"]').forEach(b => {
        const on = b.dataset.tab === tab;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && opts.focus) b.focus();
      });
      this.view.hidden = tab !== 'answer';
      this.tl.hidden = tab !== 'timeline';
      this.hideTip();
      const panel = tab === 'answer' ? this.view : this.tl;
      if (tab === 'timeline') { this.mi = -1; this.followMention(false); }
      else { this.layout(); }
      if (changed && opts.animate !== false && !reduced()) {
        panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
      }
    }

    /* ---------- Clinical timeline ---------- */
    // The mention that follows the audio: the latest one heard at or before the playhead (the first before any).
    mentionAt(t) {
      let i = this.mentions.length ? 0 : -1;
      this.mentions.forEach((m, k) => { if (this.byId.get(m.line).start <= t + 0.05) i = k; });
      return i;
    }

    followMention(animate) {
      if (!this.tl || this.tab !== 'timeline') return;
      const i = this.mentionAt(this.t);
      if (i === this.mi && this.tl.firstChild) return;
      this.mi = i; this.preview = null; this.win = null;
      this.renderTimeline(animate);
      const m = this.mentions[i];
      if (m && animate) {
        const ev = this.shownEvent();
        this.say(`Patient mentions a past event at ${fmt(this.byId.get(m.line).start)}. ${ev ? `${this.matchLabel(m)}: ${ev.title}, ${longDay(ev.day)}.` : 'No matching event.'}`);
      }
    }

    linkedEvent(m) {
      if (!m || m.pick >= m.candidates.length) return null;
      return this.events.get(m.candidates[m.pick]) || null;
    }

    shownEvent() {
      const m = this.mentions[this.mi];
      return this.preview ? this.events.get(this.preview) : this.linkedEvent(m);
    }

    matchLabel(m) {
      if (m.confirmed) return 'Linked by you';
      return m.pick === 0 ? 'Matches' : 'Possible match';
    }

    timelineGeometry() {
      const n = this.narrow ? 2 : 4, today = this.today;
      let T = bucketOf(today);
      if (today.getDate() === 1 || today.getDate() === 16) T -= 1;   // a window ends on the visit day
      const endOf = b => b === T ? new Date(today.getTime() + DAY) : bucketStart(b + 1);
      return { n, T, maxW: T - n + 1, endOf };
    }

    renderTimeline(animate) {
      const tl = this.tl;
      if (!tl) return;
      const m = this.mentions[this.mi];
      const G = this.timelineGeometry();
      const shown = this.shownEvent(), linked = this.linkedEvent(m);
      if (this.win == null) {
        const focus = shown || linked;
        this.win = focus ? Math.min(G.maxW, bucketOf(focus.day) - Math.floor((G.n - 1) / 2)) : G.maxW;
      }
      this.win = Math.min(this.win, G.maxW);
      const w = this.win, last = w + G.n - 1;
      const posOf = d => {
        let b = bucketOf(d);
        if (b === G.T + 1 && d <= this.today) b = G.T;   // the visit day closes the last bucket
        if (b < w || b > last || d > this.today) return null;
        const s = bucketStart(b), e = G.endOf(b);
        return ((b - w) + (d - s + DAY / 2) / (e - s)) / G.n;
      };

      // Quote
      let quote;
      if (!m) {
        quote = `<p class="vr-tl-empty">No past events were mentioned in this visit.</p>`;
      } else {
        const l = this.byId.get(m.line);
        const st = l.status === 'unclear' ? '<i></i><span class="vr-st is-unclear">Unclear audio</span>' : '';
        quote = `<button type="button" class="vr-tl-line" data-id="${esc(l.id)}" aria-label="Play: ${esc(this.o.speakers[l.speaker] || l.speaker)} at ${fmt(l.start)}, ${esc(l.text.replace(/\[unclear\]/g, 'unclear'))}">` +
          `<span class="vr-meta"><span class="vr-who">${esc(this.o.speakers[l.speaker] || l.speaker)}</span><i></i><span class="vr-at">${fmt(l.start)}</span>${st}</span>` +
          `<span class="vr-tl-text">${esc(l.text).replace(/\[unclear\]/g, '<span class="vr-inaud">unclear</span>')}</span></button>`;
      }

      // Axis
      const labels = [];
      for (let b = w; b <= last; b++) {
        const s = bucketStart(b), e = new Date(G.endOf(b).getTime() - DAY);
        const yr = e.getFullYear() !== this.today.getFullYear() ? ' ' + e.getFullYear() : '';
        labels.push(`<span style="left:${((b - w + 0.5) / G.n * 100).toFixed(3)}%">${dayMonth(s)} – ${dayMonth(e)}${yr}</span>`);
      }
      const from = bucketStart(w), to = new Date(G.endOf(last).getTime() - DAY);

      // Events in view (the linked and shown events stay visible whatever the filters)
      const keep = new Set([shown && shown.id, linked && linked.id]);
      const items = [...this.events.values()]
        .filter(e => this.types[e.type] !== false || keep.has(e.id))
        .map(e => ({ e, x: posOf(e.day) })).filter(o => o.x != null)
        .sort((a, b) => a.x - b.x || a.e.type.localeCompare(b.e.type));
      const spanW = Math.max(1, this.tlSpanWidth || 820), minGap = 14 / spanW;
      items.forEach((o, k) => { if (k && o.x - items[k - 1].x < minGap) o.x = items[k - 1].x + minGap; });
      const glyphs = items.map(({ e, x }) => {
        const cls = ['vr-ev', 'is-' + e.type];
        if (linked && e.id === linked.id) cls.push('is-linked');
        if (shown && e.id === shown.id) cls.push('is-shown');
        const label = `${TYPES[e.type] ? TYPES[e.type].label : e.type}: ${e.title}, ${longDay(e.day)}${linked && e.id === linked.id ? `, ${this.matchLabel(m).toLowerCase()}` : ''}`;
        return `<button type="button" class="${cls.join(' ')}" data-ev="${esc(e.id)}" data-x="${x.toFixed(5)}" style="left:${(x * 100).toFixed(3)}%" aria-label="${esc(label)}" tabindex="-1"></button>`;
      }).join('');
      const tx = posOf(this.today);
      const todayDot = tx != null ? `<span class="vr-today" style="left:${(tx * 100).toFixed(3)}%" role="img" aria-label="This visit, ${longDay(this.today)}"></span>` : '';
      const grid = Array.from({ length: G.n - 1 }, (_, k) => `<i style="left:${((k + 1) / G.n * 100).toFixed(3)}%"></i>`).join('');

      // Card, or what to show instead
      let card = '';
      const shownX = shown ? posOf(shown.day) : null;
      if (m && !m.candidates.length) {
        card = `<div class="vr-tl-none"><b>No matching event</b><p>Nothing in the record matches what the patient described. Check the record if it matters for this visit.</p></div>`;
      } else if (m && !linked && !this.preview) {
        card = `<div class="vr-tl-none"><b>No event linked</b><p>You ruled out every suggested event, so this mention won't be linked to the record.</p>` +
          `<button type="button" class="vr-tl-btn" data-tl="reset">Show suggestions again</button></div>`;
      } else if (shown && shownX == null) {
        card = `<button type="button" class="vr-tl-btn vr-tl-jump" data-tl="goto">${this.preview ? 'Selected' : 'Linked'} event is on ${longDay(shown.day)}. Show it</button>`;
      } else if (shown) {
        card = this.cardHTML2(shown, m);
      }

      const leftOk = w > G.maxW - 240, rightOk = w < G.maxW;   // about ten years back
      tl.innerHTML = `
        <div class="vr-tl-quote">${quote}</div>
        <div class="vr-tl-axis">
          <button type="button" class="vr-tl-nav" data-tl="prev" aria-label="Earlier"${leftOk ? '' : ' disabled'}>${I.chevL}</button>
          <div class="vr-tl-span vr-tl-labels" aria-hidden="true">${labels.join('')}</div>
          <button type="button" class="vr-tl-nav" data-tl="next" aria-label="Later"${rightOk ? '' : ' disabled'}>${I.chevR}</button>
        </div>
        <div class="vr-tl-body">
          <div class="vr-tl-span vr-tl-grid" aria-hidden="true">${grid}</div>
          <div class="vr-tl-stage">
            <div class="vr-tl-span vr-tl-track" role="group" aria-label="Record from ${longDay(from)} to ${longDay(to)}">${glyphs}${todayDot}</div>
            <div class="vr-tl-stem" aria-hidden="true"></div>
            <div class="vr-tl-slot">${card}</div>
          </div>
          <div class="vr-tl-filters" role="group" aria-label="Show event types">${Object.keys(TYPES).map(t =>
            `<span class="vr-tl-filter"><span class="vr-glyph is-${t}" aria-hidden="true"></span><span id="${this.uid}-f-${t}">${TYPES[t].filter}</span>` +
            `<button type="button" class="vr-sw" role="switch" data-type="${t}" aria-checked="${this.types[t] !== false}" aria-labelledby="${this.uid}-f-${t}"></button></span>`).join('')}</div>
        </div>`;
      const evs = [...tl.querySelectorAll('.vr-ev')];
      const focusEv = tl.querySelector('.vr-ev.is-shown') || evs[0];
      if (focusEv) focusEv.tabIndex = 0;
      if (animate && !reduced()) {
        tl.querySelector('.vr-tl-slot').classList.add('is-in');
        const ring = tl.querySelector('.vr-ev.is-shown');
        if (ring) ring.classList.add('is-pop');
      }
      this.placeCard();
    }

    cardHTML2(e, m) {
      const t = TYPES[e.type] || { label: e.type, open: 'Open' };
      const isLinked = m && !this.preview && this.linkedEvent(m) === e;
      let badge = '', acts = '';
      const open = `<button type="button" class="vr-tl-btn" data-tl="open">${esc(e.openLabel || t.open)}</button>`;
      const reject = `<button type="button" class="vr-tl-btn" data-tl="reject">${XS}<span>Not this event</span></button>`;
      if (isLinked && (m.pick === 0 || m.confirmed)) {
        badge = `<span class="vr-badge is-match">${I.check}${m.confirmed ? 'Linked by you' : 'Matches'}</span>`;
        acts = open + reject;
      } else if (isLinked) {
        badge = `<span class="vr-badge is-maybe">${sparkle()}Possible match</span>`;
        acts = `<button type="button" class="vr-tl-btn is-primary" data-tl="confirm">Use this event</button>` + reject + open;
      } else {
        badge = `<span class="vr-badge">Not linked</span>`;
        acts = open + (m && this.linkedEvent(m) ? '<button type="button" class="vr-tl-btn" data-tl="back">Back to linked event</button>' : '');
      }
      const rows = (e.details || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
      const state = isLinked ? (m.pick === 0 || m.confirmed ? 'is-match' : 'is-maybe') : 'is-preview';
      return `<div class="vr-tl-card ${state}" role="region" aria-label="${esc(t.label)}: ${esc(e.title)}">
          <div class="vr-tl-chead"><span class="vr-tl-kind">${esc(t.label)}, ${longDay(e.day)}</span>${badge}</div>
          <h4 class="vr-tl-title">${esc(e.title)}</h4>
          ${e.subtitle ? `<p class="vr-tl-sub">${esc(e.subtitle)}</p>` : ''}
          ${rows ? `<dl class="vr-tl-rows">${rows}</dl>` : ''}
          <div class="vr-tl-acts">${acts}</div>
        </div>`;
    }

    // Puts the card under its event (15px to the left of it, kept inside the panel) and draws the stem.
    placeCard() {
      const tl = this.tl;
      if (!tl || tl.hidden) return;
      const span = tl.querySelector('.vr-tl-track'), slot = tl.querySelector('.vr-tl-slot'), stem = tl.querySelector('.vr-tl-stem');
      if (!span || !slot) return;
      const spanW = span.clientWidth;
      if (spanW && Math.abs(spanW - (this.tlSpanWidth || 0)) > 40) { this.tlSpanWidth = spanW; this.renderTimeline(false); return; }
      this.tlSpanWidth = spanW;
      const ev = tl.querySelector('.vr-ev.is-shown'), card = slot.firstElementChild;
      stem.hidden = true;
      slot.style.paddingLeft = '';
      if (!ev || !card || !card.classList.contains('vr-tl-card')) return;
      const stage = tl.querySelector('.vr-tl-stage').getBoundingClientRect(), er = ev.getBoundingClientRect();
      const cx = er.left + er.width / 2 - stage.left;
      const cw = card.offsetWidth, max = Math.max(0, slot.clientWidth - cw);
      slot.style.paddingLeft = clamp(cx - 15 - 16, 0, max) + 'px';
      stem.hidden = false;
      stem.style.left = cx + 'px';
    }

    tlAction(act, el) {
      const m = this.mentions[this.mi];
      const shown = this.shownEvent();
      if (act === 'prev' || act === 'next') {
        this.win += act === 'prev' ? -1 : 1;
        this.renderTimeline(false);
        const t = this.tl.querySelector('.vr-tl-stage');
        if (!reduced()) { t.classList.remove('is-slide-l', 'is-slide-r'); void t.offsetWidth; t.classList.add(act === 'prev' ? 'is-slide-r' : 'is-slide-l'); }
        const nav = this.tl.querySelector(`[data-tl="${act}"]`);
        if (nav && !nav.disabled) nav.focus();
        const l = this.tl.querySelectorAll('.vr-tl-labels span');
        this.say(`${l[0].textContent} to ${l[l.length - 1].textContent}`);
        return;
      }
      if (act === 'goto') { this.win = null; this.renderTimeline(true); return; }
      if (act === 'open') { if (shown && this.o.onOpenEvent) this.o.onOpenEvent(shown, this); return; }
      if (!m) return;
      if (act === 'reject') {
        m.pick += 1; m.confirmed = false; this.preview = null; this.win = null;
        this.renderTimeline(true);
        const next = this.linkedEvent(m);
        this.say(next ? `Ruled out. Possible match: ${next.title}, ${longDay(next.day)}.` : 'Ruled out. No event linked.');
        this.focusCard();
      } else if (act === 'confirm') {
        m.confirmed = true;
        this.renderTimeline(false);
        this.say(`Linked to ${shown.title}.`);
        this.focusCard();
      } else if (act === 'reset') {
        m.pick = 0; m.confirmed = false; this.preview = null; this.win = null;
        this.renderTimeline(true);
        this.say('Suggestions restored.');
        this.focusCard();
      } else if (act === 'back') {
        this.preview = null; this.win = null;
        this.renderTimeline(true);
        this.focusCard();
      }
    }

    focusCard() {
      const b = this.tl.querySelector('.vr-tl-card .vr-tl-btn, .vr-tl-none .vr-tl-btn, .vr-tl-jump');
      if (b) b.focus({ preventScroll: true });
    }

    pickEvent(id) {
      const m = this.mentions[this.mi], linked = this.linkedEvent(m);
      this.preview = linked && linked.id === id ? null : id;
      const keepWin = this.win;
      this.renderTimeline(true);
      this.win = keepWin;
      const ev = this.tl.querySelector(`.vr-ev[data-ev="${CSS.escape(id)}"]`);
      if (ev) { this.rove(this.tl, '.vr-ev', [...this.tl.querySelectorAll('.vr-ev')].indexOf(ev)); ev.focus({ preventScroll: true }); }
    }

    timelineResult() {
      return this.mentions.map(m => {
        const ev = this.linkedEvent(m);
        return {
          mention: m.id, line: m.line, event: ev ? ev.id : null,
          status: !m.candidates.length ? 'unmatched' : !ev ? 'none' : m.confirmed ? 'confirmed' : m.pick === 0 ? 'ai' : 'suggested'
        };
      });
    }

    /* ---------- Playback ---------- */
    clipsFor(ids) {
      const ls = ids.map(id => this.byId.get(String(id))).filter(Boolean).sort((a, b) => a.start - b.start);
      const out = [];
      ls.forEach(l => {
        const last = out[out.length - 1];
        if (last && l.start - last.end <= 2) last.end = Math.max(last.end, l.end);
        else out.push({ start: l.start, end: l.end });
      });
      return out;
    }

    sectionAt(t) {
      const x = Math.min(t, this.dur - 0.01);
      return this.secs.findIndex(s => x >= s.start && x < s.end);
    }
    lineAt(t) { return this.lines.find(l => t >= l.start && t < l.end) || null; }

    playClips(clips) {
      if (!clips.length) return;
      this.queue = clips.slice(1);
      this.clipEnd = clips[0].end;
      this.seekRaw(clips[0].start);
      this.setTime(clips[0].start, false);
      this.play(true);
    }

    play(keepClip) {
      if (!keepClip) { this.queue = []; this.clipEnd = null; }
      if (this.t >= this.dur - 0.05) { this.seekRaw(0); this.setTime(0); }
      if (!this.playing) {
        this.playing = true;
        if (this.audio) this.audio.play().catch(() => this.pause());
        this._t0 = performance.now() - this.t * 1000;
        this.playBtn.innerHTML = IC.pause[this.o.ds];
        this.playBtn.setAttribute('aria-label', 'Pause recording');
        this.root.classList.add('is-playing');
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(this.tickB);
      }
      this.markSpeaking();
    }

    pause() {
      this.queue = []; this.clipEnd = null;
      if (!this.playing) return;
      this.playing = false;
      cancelAnimationFrame(this.raf);
      if (this.audio) this.audio.pause();
      if (this.root) {
        this.playBtn.innerHTML = IC.play[this.o.ds];
        this.playBtn.setAttribute('aria-label', 'Play recording');
        this.root.classList.remove('is-playing');
        this.markSpeaking();
      }
    }

    toggle() { if (this.playing) this.pause(); else this.play(); }

    tick(now) {
      if (!this.playing) return;
      let t = this.audio ? this.audio.currentTime : (now - this._t0) / 1000;
      if (this.clipEnd != null && t >= this.clipEnd) {
        if (this.queue.length) {
          const c = this.queue.shift();
          this.clipEnd = c.end; this.seekRaw(c.start); t = c.start;
        } else {
          this.setTime(this.clipEnd, false);
          this.pause();
          return;
        }
      }
      if (t >= this.dur) { this.setTime(this.dur); this.pause(); return; }
      this.setTime(t, this.clipEnd == null);
      this.raf = requestAnimationFrame(this.tickB);
    }

    seekRaw(t) {
      t = clamp(t, 0, this.dur);
      if (this.audio) { try { this.audio.currentTime = t; } catch (e) { /* not loaded yet */ } }
      this._t0 = performance.now() - t * 1000;
    }

    seek(t) {
      this.queue = []; this.clipEnd = null;
      this.seekRaw(t);
      this.setTime(clamp(t, 0, this.dur), true);
    }

    setTime(t, follow = true) {
      this.t = clamp(t, 0, this.dur);
      this.ph.style.left = (this.t / this.dur * 100).toFixed(3) + '%';
      const whole = Math.floor(this.t);
      if (whole !== this._whole) {
        this._whole = whole;
        this.nowEl.textContent = fmt(this.t);
        const si = this.sectionAt(this.t);
        this.wave.setAttribute('aria-valuenow', whole);
        this.wave.setAttribute('aria-valuetext', `${fmt(this.t)} of ${fmt(this.dur)}${si >= 0 ? ', ' + this.secs[si].title : ''}`);
      }
      if (follow) {
        const si = this.sectionAt(this.t);
        if (si >= 0 && si !== this.sec) this.showSection(si);
      }
      this.markSpeaking();
      if (this.tab === 'timeline') this.followMention(true);
    }

    markSpeaking(force) {
      const l = this.playing ? this.lineAt(this.t) : null, id = l ? String(l.id) : null;
      if (!force && id === this.speaking) return;
      this.speaking = id;
      this.view.querySelectorAll('.vr-card.is-speaking').forEach(c => c.classList.remove('is-speaking'));
      if (id) this.view.querySelectorAll('.vr-card').forEach(c => { if (c.dataset.id === id) c.classList.add('is-speaking'); });
    }

    /* ---------- Tooltip + announcements ---------- */
    showTip(el, html) {
      this.tip.innerHTML = html;
      this.tip.hidden = false;
      el.setAttribute('aria-describedby', this.tip.id);
      this._tipFor = el;
      const rr = this.root.getBoundingClientRect(), br = el.getBoundingClientRect();
      let left = br.left - rr.left;
      if (el.classList.contains('vr-tag') || el.classList.contains('vr-ev')) left = br.left + br.width / 2 - rr.left - 20;
      this.tip.style.top = (br.bottom - rr.top + 6) + 'px';
      if (el.classList.contains('vr-ev')) this.tip.style.top = (br.top - rr.top - this.tip.offsetHeight - 6) + 'px';
      this.tip.style.left = left + 'px';
      const vw = document.documentElement.clientWidth, tw = this.tip.offsetWidth;
      if (rr.left + left + tw > vw - 12) left = Math.max(12 - rr.left, vw - 12 - tw - rr.left);
      if (rr.left + left < 12) left = 12 - rr.left;
      this.tip.style.left = left + 'px';
    }

    hideTip() {
      if (!this.tip) return;
      this.tip.hidden = true;
      if (this._tipFor) { this._tipFor.removeAttribute('aria-describedby'); this._tipFor = null; }
    }

    tipFor(el) {
      if (el.classList.contains('vr-tag')) {
        const s = this.secs[+el.dataset.i], n = s.sentences.length;
        return `<div class="dp-tip-h"><span>${esc(s.title)}</span></div>` +
          `<p>${fmt(s.start)} – ${fmt(s.end)} · ${n ? `${n} sentence${n > 1 ? 's' : ''} in the note` : 'Not in the note'}</p>`;
      }
      if (el.classList.contains('vr-ev')) {
        const ev = this.events.get(el.dataset.ev), t = TYPES[ev.type] || { label: ev.type };
        return `<div class="dp-tip-h"><span>${esc(ev.title)}</span></div><p>${esc(t.label)} · ${longDay(ev.day)}</p>`;
      }
      if (el.dataset.flag === 'nosource') {
        return `<div class="dp-tip-h">${I.warn}<span>No source found</span></div>` +
          '<p>This sentence couldn\'t be linked to anything said in the visit. Check it before you sign the note.</p>';
      }
      if (el.dataset.flag === 'unclear') {
        return `<div class="dp-tip-h">${I.warn}<span>Audio not clear</span></div>` +
          '<p>Part of this sentence came from audio that wasn\'t clear. Listen to the source before you sign the note.</p>';
      }
      return '';
    }

    say(text) {
      if (!this.live) return;
      this.live.textContent = '';
      clearTimeout(this._say);
      this._say = setTimeout(() => { if (this.live) this.live.textContent = text; }, 60);
    }

    /* ---------- Events ---------- */
    bind() {
      const root = this.root;

      root.addEventListener('click', e => {
        const act = e.target.closest('[data-act]');
        if (act) {
          const a = act.dataset.act;
          if (a === 'play') this.toggle();
          else if (a === 'cancel') this.cancel();
          else if (a === 'done') this.done();
          return;
        }
        const tab = e.target.closest('.vr-tab[role="tab"]');
        if (tab) { this.setTab(tab.dataset.tab); return; }
        const tl = e.target.closest('[data-tl]');
        if (tl) { if (!tl.disabled) this.tlAction(tl.dataset.tl, tl); return; }
        const ev = e.target.closest('.vr-ev');
        if (ev) { this.pickEvent(ev.dataset.ev); return; }
        const sw = e.target.closest('.vr-sw');
        if (sw) {
          const t = sw.dataset.type;
          this.types[t] = this.types[t] === false;
          this.renderTimeline(false);
          const again = this.tl.querySelector(`.vr-sw[data-type="${t}"]`);
          if (again) again.focus();
          return;
        }
        const line = e.target.closest('.vr-tl-line');
        if (line) { const l = this.byId.get(line.dataset.id); if (l) this.playClips([{ start: l.start, end: l.end }]); return; }
        const tag = e.target.closest('.vr-tag');
        if (tag) { this.showSection(+tag.dataset.i, { play: true }); return; }
        const sent = e.target.closest('.vr-sent');
        if (sent) { this.selectSentence(+sent.dataset.i); return; }
        const q = e.target.closest('.vr-q');
        if (q) { this.selectSentence(+q.dataset.i); return; }
        const card = e.target.closest('.vr-card');
        if (card) this.playLine(card.dataset.id, !!card.closest('.vr-exp'));
      });

      // Waveform: click or drag to seek.
      const toTime = x => { const r = this.wave.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0, 1) * this.dur; };
      this.wave.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        this.wave.focus({ preventScroll: true });
        this.wave.setPointerCapture(e.pointerId);
        this.dragging = true;
        const keep = this.playing;
        this.seek(toTime(e.clientX));
        if (keep && !this.playing) this.play();
      });
      this.wave.addEventListener('pointermove', e => {
        const r = this.wave.getBoundingClientRect();
        this.hoverEl.style.left = clamp(e.clientX - r.left, 0, r.width) + 'px';
        if (this.dragging) this.seek(toTime(e.clientX));
      });
      const end = e => { if (this.dragging) { this.dragging = false; try { this.wave.releasePointerCapture(e.pointerId); } catch (x) { /* already released */ } } };
      this.wave.addEventListener('pointerup', end);
      this.wave.addEventListener('pointercancel', end);

      this.wave.addEventListener('keydown', e => {
        const step = e.shiftKey ? 15 : 5;
        const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -30, PageUp: 30 };
        if (e.key in map) { e.preventDefault(); this.seek(this.t + map[e.key]); }
        else if (e.key === 'Home') { e.preventDefault(); this.seek(0); }
        else if (e.key === 'End') { e.preventDefault(); this.seek(this.dur); }
        else if (e.key === ' ' || e.key === 'Enter' || e.key === 'k') { e.preventDefault(); this.toggle(); }
      });

      // Roving focus inside the tag row, the sentence list and the transcript.
      root.addEventListener('keydown', e => {
        const groups = [['.vr-tag', this.tagsEl, ['ArrowLeft', 'ArrowRight']],
          ['.vr-tab[role="tab"]', root, ['ArrowLeft', 'ArrowRight']],
          ['.vr-ev', this.tl || root, ['ArrowLeft', 'ArrowRight']],
          ['.vr-sent', this.view, ['ArrowUp', 'ArrowDown']],
          ['.vr-srcs .vr-card', this.view, ['ArrowUp', 'ArrowDown']]];
        for (const [sel, scope, [prev, next]] of groups) {
          const cur = e.target.closest(sel.split(' ').pop());
          if (!cur || !scope.contains(cur) || (sel.includes('vr-srcs') && !cur.closest('.vr-srcs'))) continue;
          const all = [...scope.querySelectorAll(sel)], i = all.indexOf(cur);
          if (i < 0) continue;
          let j = -1;
          if (e.key === prev) j = Math.max(0, i - 1);
          else if (e.key === next) j = Math.min(all.length - 1, i + 1);
          else if (e.key === 'Home') j = 0;
          else if (e.key === 'End') j = all.length - 1;
          if (j < 0) break;
          e.preventDefault();
          all.forEach((b, k) => { b.tabIndex = k === j ? 0 : -1; });
          all[j].focus();
          if (all[j].getAttribute('role') === 'tab') this.setTab(all[j].dataset.tab);
          return;
        }
        if (e.key === 'Escape' && this.preview && this.tl && this.tl.contains(e.target)) { e.preventDefault(); this.tlAction('back'); return; }
        if (e.key === 'Escape' && this.o.modal) { e.preventDefault(); this.cancel(); }
        if (e.key === 'Tab' && this.o.modal) this.trap(e);
      });

      // Tooltips on hover and focus.
      const tipTarget = e => e.target.closest && e.target.closest('.vr-tag, .vr-sent.has-flag, .vr-ev');
      root.addEventListener('mouseover', e => { const t = tipTarget(e); if (t) this.showTip(t, this.tipFor(t)); });
      root.addEventListener('mouseout', e => { const t = tipTarget(e); if (t && !t.contains(e.relatedTarget) && document.activeElement !== t) this.hideTip(); });
      root.addEventListener('focusin', e => { const t = tipTarget(e); if (t) this.showTip(t, this.tipFor(t)); else this.hideTip(); });
      root.addEventListener('focusout', e => { if (tipTarget(e)) this.hideTip(); });
      this.body.addEventListener('scroll', () => this.hideTip(), { passive: true });
    }

    playLine(id, fromThread) {
      const l = this.byId.get(String(id));
      if (!l) return;
      const s = this.secs[this.sec];
      const cur = this.sel >= 0 && s.sentences[this.sel].sources.includes(String(id));
      if (!fromThread && !cur) {
        const i = s.sentences.findIndex(x => x.sources.includes(String(id)));
        this.selectSentence(i, { play: false, scroll: false, announce: false });
      }
      this.playClips([{ start: l.start, end: l.end }]);
    }

    trap(e) {
      const f = [...this.root.querySelectorAll('button, [tabindex="0"]')].filter(x => !x.disabled && x.offsetParent !== null && x.tabIndex >= 0);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    /* ---------- Actions ---------- */
    done() {
      const s = this.secs[this.sec];
      const result = { section: s && s.id, reviewed: [...this.visited] };
      if (this.hasTimeline) result.timeline = this.timelineResult();
      if (this.o.onDone) this.o.onDone(result, this);
      if (this.o.modal) this.close();
    }

    cancel() {
      if (this.o.onCancel) this.o.onCancel(this);
      if (this.o.modal) this.close();
    }

    close() {
      this.destroy();
      if (this._back) this._back.remove();
      if (this._restore) this._restore();
      if (this._opener && this._opener.focus) this._opener.focus();
    }

    /* ---------- Public API ---------- */
    getState() {
      const s = this.secs[this.sec];
      return { time: this.t, playing: this.playing, section: s && s.id, sentence: this.sel, reviewed: [...this.visited],
        tab: this.tab, mention: this.mentions[this.mi] ? this.mentions[this.mi].id : null };
    }
    setTheme(theme) {
      this.o.theme = theme;
      if (this.root) this.root.dataset.theme = theme;
      if (this._back) this._back.dataset.theme = theme;
    }
    setDS(ds) { this.o.ds = ds; this.rebuild(); }
    destroy() {
      this.pause();
      if (this.audio) { this.audio.pause(); this.audio.src = ''; }
      clearTimeout(this._say);
      this.teardown();
    }

    // Opens Visit Replay as a modal dialog. Returns the instance; Done, Cancel, × and Esc close it.
    static open(opts = {}) {
      const back = document.createElement('div');
      back.className = 'vr-backdrop';
      back.dataset.theme = opts.theme || 'light';
      document.body.appendChild(back);
      const opener = document.activeElement;
      const html = document.documentElement, prev = html.style.overflow;
      html.style.overflow = 'hidden';
      const vr = new VisitReplay(back, Object.assign({}, opts, { modal: true }));
      vr._back = back; vr._opener = opener;
      vr._restore = () => { html.style.overflow = prev; };
      requestAnimationFrame(() => vr.playBtn && vr.playBtn.focus());
      return vr;
    }
  }

  VisitReplay.fmt = fmt;
  window.VisitReplay = VisitReplay;
})();
