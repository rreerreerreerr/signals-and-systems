/* هستهٔ مشترک سایت: رسم نمودار، کنترل‌ها، آزمایشگاه‌ها، آزمونک‌ها و ناوبری */
(function () {
  'use strict';
  const S = (window.SS = { labs: {}, quizzes: {} });

  S.CHAPTERS = [
    { id: 'ch1', t: 'سیگنال و سیستم چیست؟', s: 'انواع سیگنال، انرژی و توان، عملیات روی زمان، تقارن و اعداد مختلط' },
    { id: 'ch2', t: 'آجرهای سازندهٔ سیگنال', s: 'نمایی حقیقی و مختلط، ضربهٔ واحد و پلهٔ واحد' },
    { id: 'ch3', t: 'خواص سیستم‌ها', s: 'اتصال سیستم‌ها، حافظه، علیت، پایداری، خطی بودن و تغییرناپذیری با زمان' },
    { id: 'ch4', t: 'پاسخ ضربه و کانولوشن', s: 'نمایش LTI، کانولوشن پیوسته و گسسته، همبستگی و کاربرد در یادگیری ماشین' },
    { id: 'ch5', t: 'معادلات دیفرانسیل و تفاضلی', s: 'پاسخ همگن و خصوصی، قطب‌ها، بازگشت گسسته و نمودار بلوکی' },
    { id: 'ch6', t: 'سری فوریه پیوسته', s: 'هارمونی، ضرب داخلی، پدیدهٔ گیبس، خواص و عبور از سیستم LTI' },
    { id: 'ch7', t: 'سری فوریه گسسته', s: 'فضای N بعدی، ضرایب متناوب، خواص و سیستم‌های LTI گسسته' },
    { id: 'ch8', t: 'تبدیل فوریه پیوسته', s: 'گذر از سری به تبدیل، طیف، پاسخ فرکانسی و سیگنال‌های متناوب' },
  ];

  /* ---------- ابزارهای عددی ---------- */
  S.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  S.range = (a, b, st = 1) => { const r = []; for (let i = a; st > 0 ? i <= b + 1e-9 : i >= b - 1e-9; i += st) r.push(i); return r; };
  S.linspace = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  S.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  S.u = t => (t >= 0 ? 1 : 0);
  S.fmt = (v, d = 2) => {
    if (!isFinite(v)) return v > 0 ? '∞' : (v < 0 ? '−∞' : '—');
    const r = Number(v.toFixed(d));
    return String(Object.is(r, -0) ? 0 : r).replace('-', '−');
  };
  S.cfmt = (re, im, d = 2) => {
    if (Math.abs(re) < 10 ** -d / 2) re = 0;
    if (Math.abs(im) < 10 ** -d / 2) im = 0;
    if (!im) return S.fmt(re, d);
    const b = S.fmt(Math.abs(im), d) + 'j';
    return (re ? S.fmt(re, d) + (im < 0 ? ' − ' : ' + ') : (im < 0 ? '−' : '')) + b;
  };
  S.rng = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  /* a_k = (1/N) Σ x[n] e^{-jk2πn/N} برای k=0..N-1 */
  S.dfs = x => {
    const N = x.length, out = [];
    for (let k = 0; k < N; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) { const w = -2 * Math.PI * k * n / N; re += x[n] * Math.cos(w); im += x[n] * Math.sin(w); }
      out.push([re / N, im / N]);
    }
    return out;
  };
  /* ضرایب سری فوریه با انتگرال عددی؛ خروجی تابعی از k است */
  S.fsCoef = (f, T, K, M = 2048, t0 = -T / 2) => {
    const xs = new Float64Array(M);
    for (let i = 0; i < M; i++) xs[i] = f(t0 + (i + 0.5) * T / M);
    const co = {};
    for (let k = -K; k <= K; k++) {
      let re = 0, im = 0;
      for (let i = 0; i < M; i++) { const w = -2 * Math.PI * k * (t0 + (i + 0.5) * T / M) / T; re += xs[i] * Math.cos(w); im += xs[i] * Math.sin(w); }
      co[k] = [re / M, im / M];
    }
    return co;
  };
  S.conv = (x, x0, h, h0) => {
    const y = new Array(x.length + h.length - 1).fill(0);
    x.forEach((a, i) => h.forEach((b, j) => { y[i + j] += a * b; }));
    return { y, y0: x0 + h0 };
  };
  S.parseSeq = str => str.split(/[,،\s]+/).filter(Boolean).map(Number).filter(v => !isNaN(v));

  /* ---------- رنگ‌ها ---------- */
  let colorCache = {};
  S.col = n => {
    if (n && (n[0] === '#' || n.startsWith('rgb'))) return n;
    if (!colorCache[n]) colorCache[n] = getComputedStyle(document.documentElement).getPropertyValue('--c-' + n).trim() || n;
    return colorCache[n];
  };
  S.alpha = (n, a) => {
    const c = S.col(n);
    if (c[0] !== '#') return c;
    const v = parseInt(c.slice(1), 16);
    return `rgba(${v >> 16 & 255},${v >> 8 & 255},${v & 255},${a})`;
  };

  /* ---------- نمودار ---------- */
  const niceStep = (span, n) => { const r = span / n, p = 10 ** Math.floor(Math.log10(r)), m = r / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; };
  const piLabel = v => {
    const q = v / Math.PI, f = Math.round(q * 4);
    if (!f) return '0';
    const g = S.gcd(f, 4), a = f / g, b = 4 / g, sg = a < 0 ? '−' : '', A = Math.abs(a);
    return sg + (A === 1 ? '' : A) + 'π' + (b === 1 ? '' : '/' + b);
  };
  class Plot {
    constructor(parent, o) {
      this.o = Object.assign({ height: 200, x: [-1, 1], y: [-1, 1], m: [10, 12, 22, 34] }, o);
      this.wrap = document.createElement('div'); this.wrap.className = 'plot';
      this.c = document.createElement('canvas');
      this.wrap.appendChild(this.c); parent.appendChild(this.wrap);
      if (o.title) { const t = document.createElement('div'); t.className = 'plot-title'; t.textContent = o.title; this.wrap.prepend(t); }
      this.g = this.c.getContext('2d');
      this.c.style.height = this.o.height + 'px';
      this.x = this.o.x.slice(); this.y = this.o.y.slice();
      this.W = 300; this.H = this.o.height;
      this.draw = o.draw;
      new ResizeObserver(() => this.render()).observe(this.wrap);
    }
    size() {
      const w = this.wrap.clientWidth || 300, r = Math.min(2.5, window.devicePixelRatio || 1);
      if (this.W !== w || this.c.width !== Math.round(w * r)) {
        this.c.width = Math.round(w * r); this.c.height = Math.round(this.o.height * r);
      }
      this.W = w; this.H = this.o.height;
      this.g.setTransform(r, 0, 0, r, 0, 0);
      const [t, ri, b, l] = this.o.m;
      this.L = l; this.T = t; this.R = w - ri; this.B = this.H - b;
      if (this.o.equal) {
        const sc = (this.B - this.T) / (this.y[1] - this.y[0]), cx = (this.o.x[0] + this.o.x[1]) / 2, half = (this.R - this.L) / sc / 2;
        this.x = [cx - half, cx + half];
      }
    }
    X(v) { return this.L + (v - this.x[0]) / (this.x[1] - this.x[0]) * (this.R - this.L); }
    Y(v) { return this.B - (v - this.y[0]) / (this.y[1] - this.y[0]) * (this.B - this.T); }
    iX(p) { return this.x[0] + (p - this.L) / (this.R - this.L) * (this.x[1] - this.x[0]); }
    iY(p) { return this.y[0] + (this.B - p) / (this.B - this.T) * (this.y[1] - this.y[0]); }
    setX(a, b) { this.x = [a, b]; this.o.x = [a, b]; return this; }
    setY(a, b) { this.y = [a, b]; return this; }
    autoY(vals, min = 1, sym = false) {
      let lo = 0, hi = 0;
      for (const v of vals) if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
      if (sym) { hi = Math.max(hi, -lo); lo = -hi; }
      if (hi - lo < min) { if (sym) { hi = min / 2; lo = -hi; } else if (lo < 0 && hi > 0) { const e = (min - (hi - lo)) / 2; hi += e; lo -= e; } else if (lo < 0) lo = hi - min; else hi = lo + min; }
      const pad = (hi - lo) * 0.1;
      this.y = [lo < 0 || sym ? lo - pad : lo - pad * 0.5, hi + pad];
      return this;
    }
    begin() {
      this.end();
      this.size();
      const g = this.g, o = this.o;
      g.clearRect(0, 0, this.W, this.H);
      g.fillStyle = S.col('plot'); g.fillRect(this.L, this.T, this.R - this.L, this.B - this.T);
      g.font = '11px ui-monospace,SFMono-Regular,Menlo,monospace';
      g.lineWidth = 1;
      const pxPerTick = o.xpi ? 56 : 60;
      let sx;
      if (o.xpi) {
        sx = Math.PI / 4;
        while ((this.x[1] - this.x[0]) / sx > (this.R - this.L) / pxPerTick) sx *= 2;
      } else {
        sx = niceStep(this.x[1] - this.x[0], Math.max(2, (this.R - this.L) / pxPerTick));
        if (o.intX) sx = Math.max(1, Math.round(sx));
      }
      const sy = niceStep(this.y[1] - this.y[0], Math.max(2, (this.B - this.T) / 34));
      g.textAlign = 'center'; g.textBaseline = 'top';
      if (!o.noTicks) for (let v = Math.ceil(this.x[0] / sx) * sx; v <= this.x[1] + 1e-9; v += sx) {
        const p = this.X(v);
        g.strokeStyle = S.col('grid'); g.beginPath(); g.moveTo(p + .5, this.T); g.lineTo(p + .5, this.B); g.stroke();
        g.fillStyle = S.col('muted');
        g.fillText(o.xpi ? piLabel(v) : S.fmt(v, 3), p, this.B + 5);
      }
      g.textAlign = 'right'; g.textBaseline = 'middle';
      if (!o.noTicks) for (let v = Math.ceil(this.y[0] / sy) * sy; v <= this.y[1] + 1e-9; v += sy) {
        const p = this.Y(v);
        g.strokeStyle = S.col('grid'); g.beginPath(); g.moveTo(this.L, p + .5); g.lineTo(this.R, p + .5); g.stroke();
        g.fillStyle = S.col('muted');
        g.fillText(o.ypi ? piLabel(v) : S.fmt(v, 3), this.L - 5, p);
      }
      g.strokeStyle = S.col('axis');
      if (this.y[0] <= 0 && this.y[1] >= 0) { const p = this.Y(0); g.beginPath(); g.moveTo(this.L, p + .5); g.lineTo(this.R, p + .5); g.stroke(); }
      if (this.x[0] <= 0 && this.x[1] >= 0) { const p = this.X(0); g.beginPath(); g.moveTo(p + .5, this.T); g.lineTo(p + .5, this.B); g.stroke(); }
      g.font = 'italic 13px "Times New Roman",Times,serif'; g.fillStyle = S.col('ink');
      if (o.xlabel) { g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(o.xlabel, this.R - 3, this.B - 2); }
      if (o.ylabel) { g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(o.ylabel, this.L + 5, this.T + 3); }
      g.save(); g.beginPath(); g.rect(this.L, this.T, this.R - this.L, this.B - this.T); g.clip();
      this.clipped = true;
      return this;
    }
    end() { if (this.clipped) { this.g.restore(); this.clipped = false; } }
    render() { if (!this.draw || !this.wrap.isConnected) return; this.begin(); this.draw(this); this.end(); }
    style(o, fallback = 'x') {
      const g = this.g;
      g.strokeStyle = S.col(o.color || fallback);
      g.lineWidth = o.w || 2;
      g.setLineDash(o.dash || []);
      g.lineJoin = 'round'; g.lineCap = 'round';
    }
    line(xs, ys, o = {}) {
      const g = this.g; this.style(o);
      g.beginPath(); let pen = false;
      for (let i = 0; i < xs.length; i++) {
        const y = ys[i];
        if (!isFinite(y)) { pen = false; continue; }
        const py = S.clamp(this.Y(y), -2000, 4000), px = this.X(xs[i]);
        if (pen) g.lineTo(px, py); else { g.moveTo(px, py); pen = true; }
      }
      g.stroke(); g.setLineDash([]);
      return this;
    }
    fn(f, o = {}) {
      const n = Math.max(2, Math.ceil((this.R - this.L) * (o.q || 1))), xs = new Array(n + 1), ys = new Array(n + 1);
      for (let i = 0; i <= n; i++) { xs[i] = this.x[0] + (this.x[1] - this.x[0]) * i / n; ys[i] = f(xs[i]); }
      if (o.fill) this.area(xs, ys, o);
      return this.line(xs, ys, o);
    }
    area(xs, ys, o = {}) {
      const g = this.g, y0 = this.Y(0);
      g.fillStyle = typeof o.fill === 'string' ? o.fill : S.alpha(o.color || 'x', 0.18);
      g.beginPath(); g.moveTo(this.X(xs[0]), y0);
      for (let i = 0; i < xs.length; i++) g.lineTo(this.X(xs[i]), S.clamp(this.Y(isFinite(ys[i]) ? ys[i] : 0), -2000, 4000));
      g.lineTo(this.X(xs[xs.length - 1]), y0); g.closePath(); g.fill();
      return this;
    }
    stem(ns, ys, o = {}) {
      const g = this.g, c = S.col(o.color || 'x'), y0 = this.Y(0), r = o.r || 3.2;
      g.setLineDash([]);
      for (let i = 0; i < ns.length; i++) {
        const v = ys[i];
        if (!isFinite(v) || (o.hideZero && Math.abs(v) < 1e-9)) continue;
        const px = this.X(ns[i]) + (o.dx || 0), py = this.Y(v);
        g.strokeStyle = c; g.lineWidth = o.w || 1.6;
        g.beginPath(); g.moveTo(px, y0); g.lineTo(px, py); g.stroke();
        g.fillStyle = o.hollow ? S.col('plot') : c;
        g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
        if (o.hollow) g.stroke();
      }
      return this;
    }
    arrowUp(x, v, o = {}) { /* ضربه */
      const g = this.g, px = this.X(x), py = this.Y(v), y0 = this.Y(0), d = v >= 0 ? 1 : -1, c = S.col(o.color || 'x');
      g.strokeStyle = c; g.fillStyle = c; g.lineWidth = o.w || 2; g.setLineDash([]);
      g.beginPath(); g.moveTo(px, y0); g.lineTo(px, py); g.stroke();
      g.beginPath(); g.moveTo(px, py - d * 2); g.lineTo(px - 4, py + d * 6); g.lineTo(px + 4, py + d * 6); g.closePath(); g.fill();
      return this;
    }
    vline(x, o = {}) { const g = this.g; this.style(Object.assign({ w: 1, dash: [4, 4] }, o), 'muted'); g.beginPath(); g.moveTo(this.X(x), this.T); g.lineTo(this.X(x), this.B); g.stroke(); g.setLineDash([]); return this; }
    hline(y, o = {}) { const g = this.g; this.style(Object.assign({ w: 1, dash: [4, 4] }, o), 'muted'); g.beginPath(); g.moveTo(this.L, this.Y(y)); g.lineTo(this.R, this.Y(y)); g.stroke(); g.setLineDash([]); return this; }
    band(a, b, color = 'a', al = 0.12) { const g = this.g; g.fillStyle = S.alpha(color, al); g.fillRect(this.X(a), this.T, this.X(b) - this.X(a), this.B - this.T); return this; }
    dot(x, y, o = {}) { const g = this.g, c = S.col(o.color || 'x'); g.setLineDash([]); g.beginPath(); g.arc(this.X(x), this.Y(y), o.r || 4.5, 0, 7); if (o.hollow) { g.fillStyle = S.col('plot'); g.fill(); g.strokeStyle = c; g.lineWidth = 2; g.stroke(); } else { g.fillStyle = c; g.fill(); } return this; }
    seg(x0, y0, x1, y1, o = {}) { const g = this.g; this.style(o); g.beginPath(); g.moveTo(this.X(x0), this.Y(y0)); g.lineTo(this.X(x1), this.Y(y1)); g.stroke(); g.setLineDash([]); return this; }
    arrow(x0, y0, x1, y1, o = {}) {
      this.seg(x0, y0, x1, y1, o);
      const g = this.g, a = Math.atan2(this.Y(y1) - this.Y(y0), this.X(x1) - this.X(x0)), px = this.X(x1), py = this.Y(y1), s = o.head || 8;
      if (Math.hypot(px - this.X(x0), py - this.Y(y0)) < s) return this;
      g.fillStyle = S.col(o.color || 'x');
      g.beginPath(); g.moveTo(px, py); g.lineTo(px - s * Math.cos(a - .4), py - s * Math.sin(a - .4)); g.lineTo(px - s * Math.cos(a + .4), py - s * Math.sin(a + .4)); g.closePath(); g.fill();
      return this;
    }
    circle(x, y, r, o = {}) { const g = this.g; this.style(Object.assign({ w: 1 }, o), 'muted'); g.beginPath(); g.ellipse(this.X(x), this.Y(y), Math.abs(this.X(r) - this.X(0)), Math.abs(this.Y(r) - this.Y(0)), 0, 0, 7); g.stroke(); g.setLineDash([]); return this; }
    text(x, y, s, o = {}) { const g = this.g; g.fillStyle = S.col(o.color || 'ink'); g.font = o.font || 'italic 13px "Times New Roman",Times,serif'; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle'; g.fillText(s, this.X(x) + (o.dx || 0), this.Y(y) + (o.dy || 0)); return this; }
    /* تعامل با اشاره‌گر؛ مختصات به واحد داده است */
    pointer(h) {
      const c = this.c;
      c.style.touchAction = 'none'; c.style.cursor = h.cursor || 'crosshair';
      const pos = e => { const r = c.getBoundingClientRect(); return [this.iX(e.clientX - r.left), this.iY(e.clientY - r.top)]; };
      let on = false;
      c.addEventListener('pointerdown', e => { on = true; c.setPointerCapture(e.pointerId); h.down && h.down(...pos(e), e); e.preventDefault(); });
      c.addEventListener('pointermove', e => { if (on) h.move && h.move(...pos(e), e); });
      const up = e => { if (on) { on = false; h.up && h.up(...pos(e), e); } };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      return this;
    }
    /* ویرایش نقاط سیگنال گسسته با کشیدن */
    editStems(ns, vals, cb, o = {}) {
      const snap = o.snap || 0.25, set = (x, y) => {
        const i = ns.indexOf(Math.round(x));
        if (i < 0) return;
        let v = Math.round(y / snap) * snap;
        if (o.max != null) v = S.clamp(v, -o.max, o.max);
        vals[i] = v; cb();
      };
      return this.pointer({ cursor: 'ns-resize', down: set, move: set });
    }
    /* ترسیم آزاد منحنی */
    editCurve(xs, ys, cb) {
      let last = null;
      const n = xs.length, idx = x => S.clamp(Math.round((x - xs[0]) / (xs[n - 1] - xs[0]) * (n - 1)), 0, n - 1);
      const put = (x, y) => {
        const i = idx(x), yy = S.clamp(y, this.y[0], this.y[1]);
        if (last) { const [a, b] = last, st = Math.sign(i - a) || 1; for (let k = a; k !== i + st && st * (i - k) >= 0; k += st) ys[k] = b + (yy - b) * (i === a ? 1 : (k - a) / (i - a)); } else ys[i] = yy;
        last = [i, yy]; cb();
      };
      return this.pointer({ down: (x, y) => { last = null; put(x, y); }, move: put, up: () => { last = null; } });
    }
  }
  S.Plot = Plot;

  /* ---------- ریاضی ---------- */
  const mathOpts = { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, ignoredTags: ['script', 'style', 'textarea', 'input', 'canvas'] };
  S.math = el => { if (window.renderMathInElement) window.renderMathInElement(el, mathOpts); };
  const setRich = (el, s) => { if (el._s === s) return; el._s = s; el.innerHTML = s; if (s.includes('$')) S.math(el); };
  S.setRich = setRich;

  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) { e.innerHTML = html; } return e; };
  S.mk = mk;

  /* ---------- کنترل‌ها ---------- */
  function controls(parent, onChange) {
    const box = mk('div', 'ctrls'); parent.appendChild(box);
    const add = (cls, label) => {
      const w = mk('div', 'ctl ' + cls);
      if (label) { const l = mk('span', 'ctl-l'); l.innerHTML = label; if (label.includes('$')) S.math(l); w.appendChild(l); }
      box.appendChild(w); return w;
    };
    return {
      box,
      slider(label, o, cb) {
        const w = add('ctl-slider', label), inp = mk('input'), out = mk('output');
        inp.type = 'range'; inp.dir = 'ltr'; inp.min = o.min; inp.max = o.max; inp.step = o.step || 'any'; inp.value = o.value;
        inp.setAttribute('aria-label', label.replace(/\$/g, ''));
        const show = () => { out.textContent = o.fmt ? o.fmt(+inp.value) : S.fmt(+inp.value, 3); };
        show();
        inp.addEventListener('input', () => { show(); cb && cb(+inp.value); onChange(); });
        w.append(inp, out);
        return { get v() { return +inp.value; }, set(v, fire) { inp.value = v; show(); if (fire) { cb && cb(+inp.value); onChange(); } }, el: w, range(a, b) { inp.min = a; inp.max = b; show(); }, inp };
      },
      select(label, opts, value, cb) {
        const w = add('ctl-select', label), sel = mk('select');
        opts.forEach(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; const op = mk('option'); op.value = v; op.textContent = t; sel.appendChild(op); });
        sel.value = value;
        sel.addEventListener('change', () => { cb && cb(sel.value); onChange(); });
        w.appendChild(sel);
        return { get v() { return sel.value; }, set(v, fire) { sel.value = v; if (fire) { cb && cb(v); onChange(); } }, el: w };
      },
      seg(label, opts, value, cb) {
        const w = add('ctl-seg', label), g = mk('div', 'seg'); g.setAttribute('role', 'group');
        let cur = value; const btns = [];
        opts.forEach(o => {
          const [v, t] = Array.isArray(o) ? o : [o, o];
          const b = mk('button', '', t); b.type = 'button'; if (t.includes('$')) S.math(b);
          b.setAttribute('aria-pressed', String(v === cur));
          b.addEventListener('click', () => { cur = v; btns.forEach(x => x[0].setAttribute('aria-pressed', String(x[1] === cur))); cb && cb(v); onChange(); });
          btns.push([b, v]); g.appendChild(b);
        });
        w.appendChild(g);
        return { get v() { return cur; }, el: w, set(v, fire) { cur = v; btns.forEach(x => x[0].setAttribute('aria-pressed', String(x[1] === cur))); if (fire) { cb && cb(v); onChange(); } } };
      },
      check(label, value, cb) {
        const w = add('ctl-check'), l = mk('label'), i = mk('input'); i.type = 'checkbox'; i.checked = value;
        i.addEventListener('change', () => { cb && cb(i.checked); onChange(); });
        const sp = mk('span', '', label); if (label.includes('$')) S.math(sp);
        l.append(i, sp); w.appendChild(l);
        return { get v() { return i.checked; }, set(v) { i.checked = v; }, el: w };
      },
      button(label, cb, cls = '') {
        const b = mk('button', 'btn ' + cls, label); b.type = 'button'; if (label.includes('$')) S.math(b);
        b.addEventListener('click', () => { cb && cb(b); onChange(); });
        const w = add('ctl-btn'); w.appendChild(b); return b;
      },
      text(label, value, cb, o = {}) {
        const w = add('ctl-text', label), i = mk('input'); i.type = 'text'; i.dir = 'ltr'; i.value = value; i.spellcheck = false; i.autocomplete = 'off';
        if (o.placeholder) i.placeholder = o.placeholder;
        i.addEventListener('input', () => { cb && cb(i.value); onChange(); });
        w.appendChild(i);
        return { get v() { return i.value; }, set(v) { i.value = v; }, el: w, inp: i };
      },
      play(anim) {
        const b = mk('button', 'btn btn-play'); b.type = 'button';
        const sync = () => { b.textContent = anim.on ? '⏸ توقف' : '▶ پخش'; };
        b.addEventListener('click', () => { anim.toggle(); sync(); });
        anim.onchange = sync; sync();
        const w = add('ctl-btn'); w.appendChild(b); return b;
      },
    };
  }

  /* ---------- آزمایشگاه ---------- */
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.lab = (name, fn) => { S.labs[name] = fn; };

  function initLab(root) {
    if (root._init) return; root._init = true;
    const fn = S.labs[root.dataset.lab];
    const notes = [...root.childNodes];
    root.textContent = '';
    const head = mk('header', 'lab-head');
    const t = mk('h3', '', root.dataset.title || ''); S.math(t);
    head.appendChild(mk('span', 'lab-tag', 'آزمایشگاه'));
    head.appendChild(t);
    if (root.dataset.ref) head.appendChild(mk('span', 'lab-ref', root.dataset.ref));
    const body = mk('div', 'lab-body');
    root.append(head, body);
    const plots = [], afters = [];
    const L = {
      root, body,
      update() { plots.forEach(p => p.render()); afters.forEach(f => f()); },
      after(f) { afters.push(f); },
      plot(o, parent) { const p = new Plot(parent || body, o); plots.push(p); return p; },
      row(cols) { const r = mk('div', 'plots-row' + (cols ? ' cols-' + cols : '')); body.appendChild(r); return r; },
      div(cls, html, parent) { const d = mk('div', cls, html); (parent || body).appendChild(d); if (html && html.includes('$')) S.math(d); return d; },
      controls(parent) { return controls(parent || body, L.update); },
      legend(items, parent) {
        const d = mk('div', 'legend');
        items.forEach(([c, t, dash]) => { const s = mk('span', 'lg'); s.innerHTML = `<i style="background:${dash ? 'none' : S.col(c)};border-color:${S.col(c)}" class="${dash ? 'dash' : ''}"></i><b>${t}</b>`; d.appendChild(s); });
        (parent || body).appendChild(d); S.math(d); return d;
      },
      stats(parent) {
        const d = mk('dl', 'stats'); (parent || body).appendChild(d); const rows = {};
        return o => {
          const keys = Object.keys(o);
          keys.forEach(k => {
            if (!rows[k]) { const w = mk('div', 'stat'), dt = mk('dt'), dd = mk('dd'); setRich(dt, k); w.append(dt, dd); d.appendChild(w); rows[k] = [w, dd]; }
            setRich(rows[k][1], String(o[k]));
          });
          Object.keys(rows).forEach(k => { rows[k][0].style.display = keys.includes(k) ? '' : 'none'; });
        };
      },
      note(parent) { const d = mk('p', 'lab-note'); (parent || body).appendChild(d); return s => setRich(d, s); },
      anim(fn2, o = {}) {
        const A = { on: o.auto !== false && !reduced(), visible: false, last: 0, onchange: null, raf: 0,
          loop(ts) { A.raf = 0; if (!A.on || !A.visible || document.hidden) return; const dt = A.last ? Math.min(0.05, (ts - A.last) / 1000) : 0; A.last = ts; fn2(dt); A.kick(); },
          kick() { if (!A.raf && A.on && A.visible) A.raf = requestAnimationFrame(A.loop); },
          toggle() { A.set(!A.on); }, set(v) { A.on = v; A.last = 0; A.kick(); A.onchange && A.onchange(); } };
        new IntersectionObserver(es => { A.visible = es[0].isIntersecting; A.last = 0; A.kick(); }).observe(root);
        document.addEventListener('visibilitychange', () => { A.last = 0; A.kick(); });
        return A;
      },
    };
    try {
      if (fn) fn(L); else body.textContent = 'این آزمایشگاه پیدا نشد: ' + root.dataset.lab;
      L.update();
      requestAnimationFrame(() => L.update());
    } catch (e) { console.error('lab failed:', root.dataset.lab, e); body.appendChild(mk('p', 'lab-note', 'خطا در اجرای این آزمایشگاه.')); }
    if (notes.some(n => n.nodeType === 1 || (n.textContent || '').trim())) {
      const tr = mk('div', 'lab-try'); notes.forEach(n => tr.appendChild(n)); root.appendChild(tr); S.math(tr);
    }
  }

  /* ---------- آزمونک ---------- */
  const store = {
    get(k) { try { return localStorage.getItem('ss:' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('ss:' + k, v); } catch (e) { /* مرورگر اجازه نداد */ } },
  };
  S.store = store;
  S.quiz = (id, qs) => { S.quizzes[id] = qs; };
  function renderQuiz(root) {
    const id = root.dataset.quiz, qs = S.quizzes[id]; if (!qs) return;
    const right = new Set(); const res = mk('p', 'quiz-res');
    const paint = () => { res.textContent = `${right.size.toLocaleString('fa-IR')} از ${qs.length.toLocaleString('fa-IR')} پرسش را درست جواب داده‌ای.`; };
    qs.forEach((q, i) => {
      const box = mk('fieldset', 'q'); box.appendChild(mk('div', 'q-t', `<span class="q-n">${(i + 1).toLocaleString('fa-IR')}</span> ${q.q}`));
      const fb = mk('p', 'q-fb');
      const rnd = S.rng((i + 1) * 7919 + id.length * 31 + q.q.length);
      q.o.map((t, j) => [t, j, rnd()]).sort((a, b2) => a[2] - b2[2]).forEach(([t, j]) => {
        const b = mk('button', 'q-o', t); b.type = 'button';
        b.addEventListener('click', () => {
          box.querySelectorAll('.q-o').forEach(x => x.classList.remove('ok', 'no'));
          const ok = j === q.a;
          b.classList.add(ok ? 'ok' : 'no');
          if (ok) { right.add(i); } else { right.delete(i); }
          fb.innerHTML = (ok ? '<b>درست.</b> ' : '<b>نه.</b> ') + q.e; S.math(fb);
          paint();
          const best = +(store.get('quiz:' + id) || 0);
          if (right.size > best) store.set('quiz:' + id, right.size);
        });
        box.appendChild(b);
      });
      box.appendChild(fb); root.appendChild(box);
    });
    root.appendChild(res); paint(); S.math(root);
  }

  /* ---------- ناوبری و قالب صفحه ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
    colorCache = {};
    document.dispatchEvent(new Event('ss-theme'));
  }
  const curTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  (function () { const t = store.get('theme'); if (t) document.documentElement.dataset.theme = t; })();

  function chrome() {
    const ch = document.body.dataset.ch;
    const idx = S.CHAPTERS.findIndex(c => c.id === ch);
    const bar = mk('header', 'topbar');
    const links = S.CHAPTERS.map((c, i) => `<a href="${c.id}.html" title="${c.t}" ${i === idx ? 'aria-current="page"' : ''}>${(i + 1).toLocaleString('fa-IR')}</a>`).join('');
    bar.innerHTML = `<a class="brand" href="index.html"><svg viewBox="0 0 28 16" width="28" height="16" aria-hidden="true"><path d="M1 8c3-9 6-9 9 0s6 9 9 0 5-7 8-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>آزمایشگاه سیگنال و سیستم</span></a><nav class="chips" aria-label="فصل‌ها">${links}</nav><button class="theme" type="button" aria-label="تغییر حالت روشن و تاریک">◐</button>`;
    document.body.prepend(bar);
    bar.querySelector('.theme').addEventListener('click', () => { const n = curTheme() === 'dark' ? 'light' : 'dark'; store.set('theme', n); applyTheme(n); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(document.documentElement.dataset.theme));

    const main = document.querySelector('main');
    if (idx >= 0) {
      /* فهرست خودکار */
      const hs = [...main.querySelectorAll('h2')];
      const toc = mk('nav', 'toc'); toc.setAttribute('aria-label', 'فهرست این فصل');
      toc.innerHTML = '<b>در این فصل</b>';
      hs.forEach((h, i) => { h.id = h.id || 's' + (i + 1); const a = mk('a', '', h.textContent); a.href = '#' + h.id; toc.appendChild(a); });
      main.before(toc);
      const links2 = toc.querySelectorAll('a');
      const tocIO = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) links2.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
      }), { rootMargin: '-10% 0px -80% 0px' });
      hs.forEach(h => tocIO.observe(h));
      const pn = mk('nav', 'pager');
      const p = S.CHAPTERS[idx - 1], n = S.CHAPTERS[idx + 1];
      pn.innerHTML = (p ? `<a href="${p.id}.html"><small>فصل قبل</small>${p.t}</a>` : '<a href="index.html"><small>بازگشت</small>صفحهٔ اصلی</a>') +
        (n ? `<a href="${n.id}.html" class="nx"><small>فصل بعد</small>${n.t}</a>` : '<a href="index.html" class="nx"><small>پایان</small>صفحهٔ اصلی</a>');
      main.appendChild(pn);
    }
    const ft = mk('footer', 'foot', 'توضیح‌ها و شبیه‌سازها مستقل نوشته شده‌اند و ترتیب مباحث از کتاب <cite dir="ltr">Signals and Systems: Theory and Practical Explorations with Python</cite> (Yarman Vural &amp; Akbaş, Wiley 2025) پیروی می‌کند. متن و شکل‌های کتاب در این سایت نیامده است.');
    document.body.appendChild(ft);
  }

  S.boot = () => {
    chrome();
    S.math(document.querySelector('main') || document.body);
    document.querySelectorAll('[data-quiz]').forEach(renderQuiz);
    const labs = document.querySelectorAll('[data-lab]');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); initLab(e.target); } }), { rootMargin: '900px 0px' });
    labs.forEach(l => io.observe(l));
    S.initAll = () => labs.forEach(l => initLab(l));
    document.addEventListener('ss-theme', () => S._plots.forEach(p => p.render()));
    if (location.hash) { const t = document.querySelector(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 60); }
  };
  /* نگه داشتن فهرست نمودارها برای بازترسیم هنگام تغییر حالت رنگ */
  const origRender = Plot.prototype.render;
  S._plots = new Set();
  Plot.prototype.render = function () { S._plots.add(this); return origRender.call(this); };

  document.addEventListener('DOMContentLoaded', S.boot);
})();
