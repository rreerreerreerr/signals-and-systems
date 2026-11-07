(function () {
  const S = SS, PI = Math.PI;
  const wrap = (t, T) => t - T * Math.floor(t / T + .5);
  const sincX = (w, T1) => (Math.abs(w) < 1e-9 ? 2 * T1 : 2 * Math.sin(w * T1) / w);

  S.lab('fs-to-ft', L => {
    let lg = .5; const T1 = 1;
    const T = () => 2.2 * 2 ** (lg * 5);
    L.plot({ height: 140, x: [-16, 16], y: [-.15, 1.3], xlabel: 't', ylabel: 'x̃(t)', title: 'پالس‌ها از هم دور می‌شوند', draw: p => {
      const t = T(); p.fn(q => (Math.abs(wrap(q, t)) < T1 ? 1 : 0), { color: 'x', q: 2, fill: true });
    } });
    L.plot({ height: 190, x: [-12, 12], y: [-.7, 2.3], xlabel: 'ω', ylabel: 'T·aₖ', title: 'نمونه‌های طیف (T·aₖ) همیشه روی همان منحنی X(jω) می‌نشینند', draw: p => {
      const t = T(), w0 = 2 * PI / t, K = S.range(-Math.ceil(12 / w0), Math.ceil(12 / w0));
      p.fn(w => sincX(w, T1), { color: 'axis', w: 1.2, dash: [3, 3] });
      p.stem(K.map(k => k * w0), K.map(k => sincX(k * w0, T1)), { color: 'y', r: t > 40 ? 1.4 : 2.8, w: t > 40 ? 1 : 1.6 });
    } });
    L.plot({ height: 130, x: [-12, 12], y: [-.2, 1], xlabel: 'ω', ylabel: 'aₖ', title: 'ضرایب خام aₖ با بزرگ شدن T کوچک می‌شوند', draw: p => {
      const t = T(), w0 = 2 * PI / t, K = S.range(-Math.ceil(12 / w0), Math.ceil(12 / w0));
      p.stem(K.map(k => k * w0), K.map(k => sincX(k * w0, T1) / t), { color: 'h', r: t > 40 ? 1.2 : 2.4, w: 1 });
    } });
    const ui = L.controls();
    ui.slider('دورهٔ $T$ (مقیاس لگاریتمی)', { min: 0, max: 1, step: .005, value: lg, fmt: () => S.fmt(T(), 1) }, v => { lg = v; });
    const st = L.stats();
    L.after(() => { const t = T(); st({ '$\\omega_0=2\\pi/T$': S.fmt(2 * PI / t, 3), '$a_0$': S.fmt(2 * T1 / t, 3), '$T\\cdot a_0=X(j0)$': S.fmt(2 * T1, 3), 'خط طیفی تا $|\\omega|\\le12$': 2 * Math.floor(12 * t / (2 * PI)) + 1 }); });
  });

  const FT = {
    eal: { n: 'e^(−a|t|) (تمرین ۸.۲)', x: (t, a) => Math.exp(-a * Math.abs(t)), X: (w, a) => [2 * a / (a * a + w * w), 0] },
    eu: { n: 'e^(−at)u(t) (تمرین ۸.۶)', x: (t, a) => (t >= 0 ? Math.exp(-a * t) : 0), X: (w, a) => { const d = a * a + w * w; return [a / d, -w / d]; } },
    rect: { n: 'پالس |t|<a (تمرین ۸.۴)', x: (t, a) => (Math.abs(t) < a ? 1 : 0), X: (w, a) => [sincX(w, a), 0] },
    sinc: { n: 'sin(at)/(πt) (تمرین ۸.۵)', x: (t, a) => (Math.abs(t) < 1e-9 ? a / PI : Math.sin(a * t) / (PI * t)), X: (w, a) => [Math.abs(w) < a ? 1 : 0, 0] },
    gau: { n: 'گوسی e^(−at²)', x: (t, a) => Math.exp(-a * t * t), X: (w, a) => [Math.sqrt(PI / a) * Math.exp(-w * w / (4 * a)), 0] },
    imp: { n: 'ضربه δ(t−t₀) (تمرین ۸.۳)', x: () => 0, X: () => [1, 0], delta: true },
  };
  /* پهنای دربرگیرندهٔ ۹۵٪ انرژی */
  const width95 = (f, lim, n = 4000) => {
    const d = 2 * lim / n, v = new Float64Array(n); let E = 0;
    for (let i = 0; i < n; i++) { const q = f(-lim + (i + .5) * d); v[i] = q * q * d; E += v[i]; }
    let a = 0, b = n - 1, drop = 0;
    while (a < b) { const pick = v[a] < v[b] ? a : b; if ((drop + v[pick]) > .05 * E) break; drop += v[pick]; if (pick === a) a++; else b--; }
    return (b - a + 1) * d;
  };

  S.lab('ft-explorer', L => {
    let k = 'rect', a = 1, t0 = 0;
    const Xs = w => { const [p, q] = FT[k].X(w, a), c = Math.cos(w * t0), s = -Math.sin(w * t0); return [p * c - q * s, p * s + q * c]; };
    L.plot({ height: 150, x: [-8, 8], y: [-.3, 1.3], xlabel: 't', ylabel: 'x(t)', draw: p => {
      if (FT[k].delta) { p.setY(-.1, 1.3); p.begin(); p.arrowUp(t0, 1, { color: 'x' }); return; }
      const v = S.linspace(-8, 8, 500).map(t => FT[k].x(t - t0, a)); p.autoY(v, .6); p.begin(); p.fn(t => FT[k].x(t - t0, a), { color: 'x', q: 2, fill: true });
    } });
    const row = L.row();
    L.plot({ height: 170, x: [-20, 20], y: [0, 1], xlabel: 'ω', ylabel: '|X(jω)|', draw: p => { const v = S.linspace(-20, 20, 800).map(w => Math.hypot(...Xs(w))); p.autoY(v, .3); p.begin(); p.fn(w => Math.hypot(...Xs(w)), { color: 'y', q: 2, fill: true }); } }, row);
    L.plot({ height: 170, x: [-20, 20], y: [-PI, PI], ypi: true, xlabel: 'ω', ylabel: '∠X(jω)', draw: p => { p.fn(w => { const c = Xs(w); return Math.hypot(...c) < 1e-3 ? NaN : Math.atan2(c[1], c[0]); }, { color: 'a', w: 1.4, q: 2 }); } }, row);
    const ui = L.controls();
    ui.select('سیگنال', Object.keys(FT).map(q => [q, FT[q].n]), k, v => { k = v; });
    ui.slider('پارامتر $a$', { min: .2, max: 6, step: .05, value: a }, v => { a = v; });
    ui.slider('شیفت $t_0$', { min: -4, max: 4, step: .05, value: t0 }, v => { t0 = v; });
    const st = L.stats(), note = L.note();
    L.after(() => {
      if (FT[k].delta) { st({ 'پهنای زمانی': '0', 'پهنای باند': '∞' }); note('ضربه همهٔ فرکانس‌ها را با اندازهٔ برابر دارد. شیفت هم فقط فاز خطی می‌سازد.'); return; }
      const dT = width95(t => FT[k].x(t, a), 40), dW = width95(w => Math.hypot(...FT[k].X(w, a)), 120);
      st({ 'پهنای زمانی (۹۵٪ انرژی)': S.fmt(dT, 2), 'پهنای باند (۹۵٪ انرژی)': S.fmt(dW, 2), 'حاصل‌ضرب': S.fmt(dT * dW, 2) });
      note('هرچه سیگنال در زمان باریک‌تر شود، در فرکانس پهن‌تر می‌شود و حاصل‌ضرب این دو تقریباً ثابت می‌ماند. برای هر سیگنال اسلایدر $a$ را عوض کن و ستون حاصل‌ضرب را ببین. شیفت زمانی <b>فقط</b> نمودار فاز را تغییر می‌دهد.');
    });
  });

  S.lab('inverse-synth', L => {
    let k = 'rect', W = 8;
    const sigs = { rect: FT.rect, eal: FT.eal, eu: FT.eu };
    const ts = S.linspace(-5, 5, 300);
    const rec = () => {
      const X = sigs[k].X, M = 500, d = 2 * W / M, out = new Float64Array(300);
      for (let i = 0; i < M; i++) { const w = -W + (i + .5) * d, [a, b] = X(w, 1); for (let j = 0; j < 300; j++) { const q = w * ts[j]; out[j] += (a * Math.cos(q) - b * Math.sin(q)) * d; } }
      return Array.from(out, v => v / (2 * PI));
    };
    L.plot({ height: 200, x: [-5, 5], y: [-.3, 1.3], xlabel: 't', title: 'بازسازی با انتگرال معادلهٔ سنتز فقط تا فرکانس W', draw: p => { p.fn(t => sigs[k].x(t, 1), { color: 'axis', w: 1.2, q: 2 }); p.line(ts, rec(), { color: 'x', w: 2.2 }); } });
    L.plot({ height: 130, x: [-30, 30], y: [-.5, 2.2], xlabel: 'ω', ylabel: 'Re X', title: 'بخشی از طیف که استفاده می‌شود', draw: p => {
      const f = w => sigs[k].X(w, 1)[0]; p.band(-W, W, 'b', .13); p.fn(f, { color: 'y', q: 2 });
    } });
    const ui = L.controls();
    ui.select('سیگنال', [['rect', 'پالس'], ['eal', 'e^(−|t|)'], ['eu', 'e^(−t)u(t)']], k, v => { k = v; });
    ui.slider('پهنای باند $W$', { min: .5, max: 30, step: .5, value: W }, v => { W = v; });
    const note = L.note();
    L.after(() => note(k === 'eal' ? 'این سیگنال پرش ندارد، پس با باند کوچک هم خوب بازسازی می‌شود.' : 'نزدیک پرش همان نوسان فراجهش فصل ۶ را می‌بینی. طیف این سیگنال پرش تا بی‌نهایت ادامه دارد، پس باند محدود هرگز پرش را کامل نمی‌سازد.'));
  });

  S.lab('freq-response', L => {
    let a = 2, w = 3, t = 0;
    const H = q => { const d = a * a + q * q; return [a / d, -q / d]; };
    const mag = q => 1 / Math.hypot(a, q), ph = q => -Math.atan2(q, a);
    const row = L.row();
    L.plot({ height: 150, x: [-.5, 5], y: [-.1, 1.15], xlabel: 't', ylabel: 'h(t)', draw: p => { p.fn(q => (q >= 0 ? Math.exp(-a * q) : 0), { color: 'x', fill: true }); p.vline(1 / a); } }, row);
    L.plot({ height: 150, x: [0, 12], y: [0, 1], xlabel: 'ω', ylabel: '|H(jω)|', draw: p => { p.setY(0, 1.15 / a); p.begin(); p.fn(mag, { color: 'y' }); p.vline(a, { color: 'y' }); p.dot(w, mag(w), { color: 'h' }); } }, row);
    L.plot({ height: 150, x: [0, 12], y: [-PI / 2 - .1, .1], ypi: true, xlabel: 'ω', ylabel: '∠H(jω)', draw: p => { p.fn(ph, { color: 'a' }); p.vline(a, { color: 'a' }); p.dot(w, ph(w), { color: 'h' }); } }, row);
    const P = L.plot({ height: 180, x: [0, 10], y: [-1.2, 1.2], xlabel: 't', title: 'کسینوس با فرکانس ω وارد می‌شود و با همان فرکانس بیرون می‌آید', draw: p => {
      const m = mag(w), f = ph(w); p.fn(q => Math.cos(w * (q + t)), { color: 'x', w: 1.4 }); const s = Math.max(1, 1 / Math.max(m, .05)); void s;
      p.fn(q => m * Math.cos(w * (q + t) + f), { color: 'y', w: 2.4 });
    } });
    L.legend([['x', 'ورودی $\\cos\\omega t$'], ['y', 'خروجی حالت ماندگار']]);
    const A = L.anim(dt => { t += dt * .6; P.render(); });
    const ui = L.controls();
    ui.slider('نرخ میرایی $a$', { min: .3, max: 8, step: .1, value: a }, v => { a = v; });
    ui.slider('فرکانس ورودی $\\omega$', { min: .1, max: 12, step: .1, value: w }, v => { w = v; });
    ui.play(A);
    const st = L.stats(), note = L.note();
    L.after(() => {
      st({ 'بهره $|H|$': S.fmt(mag(w), 3), 'فاز': S.fmt(ph(w) * 180 / PI, 1) + '°', 'تأخیر $-\\angle H/\\omega$': S.fmt(-ph(w) / w, 3) + ' s', 'نسبت به بهرهٔ DC': S.fmt(mag(w) * a, 3) });
      note(`پهنای باند این سیستم $\\omega=a=${S.fmt(a)}$ است، جایی که بهره به $1/\\sqrt2$ مقدار DC می‌رسد. $a$ را زیاد کن: پاسخ ضربه کوتاه‌تر می‌شود و فرکانس‌های بیشتری عبور می‌کنند. این همان معادلهٔ $\\dot y+ay=x$ در تمرین ۸.۶ است.`);
    });
    void H;
  });

  S.lab('filter-aperiodic', L => {
    let ik = 'tone', ty = 'lp', W = 6;
    const IN = {
      rect: ['پالس', t => (Math.abs(t) < 1 ? 1 : 0)],
      two: ['دو پالس', t => (Math.abs(t + 2) < .5 ? 1 : 0) + (Math.abs(t - 2) < .5 ? -.7 : 0)],
      tone: ['پالس با لرزش فرکانس‌بالا', t => (Math.abs(t) < 2.5 ? 1 + .35 * Math.cos(18 * t) : 0)],
    };
    const ts = S.linspace(-6, 6, 240), dt = ts[1] - ts[0], M = 400, ws = S.linspace(-40, 40, M), dw = ws[1] - ws[0];
    let Xr, Xi;
    const fwd = () => {
      const f = IN[ik][1], xv = ts.map(f); Xr = new Float64Array(M); Xi = new Float64Array(M);
      ws.forEach((w, i) => { let a = 0, b = 0; xv.forEach((v, j) => { if (!v) return; a += v * Math.cos(w * ts[j]); b -= v * Math.sin(w * ts[j]); }); Xr[i] = a * dt; Xi[i] = b * dt; });
    };
    const H = w => {
      const A = Math.abs(w);
      if (ty === 'lp') return [A < W ? 1 : 0, 0];
      if (ty === 'hp') return [A >= W ? 1 : 0, 0];
      if (ty === 'bp') return [A > W && A < W + 8 ? 1 : 0, 0];
      const d = W * W + w * w; return [W * W / d, -W * w / d];
    };
    const inv = () => {
      const o = new Float64Array(240);
      ws.forEach((w, i) => { const [c, d] = H(w), a = Xr[i] * c - Xi[i] * d, b = Xr[i] * d + Xi[i] * c; if (!a && !b) return; for (let j = 0; j < 240; j++) { const q = w * ts[j]; o[j] += a * Math.cos(q) - b * Math.sin(q); } });
      return Array.from(o, v => v * dw / (2 * PI));
    };
    fwd();
    L.plot({ height: 180, x: [-6, 6], y: [-1, 1.6], xlabel: 't', title: 'ورودی و خروجی در زمان', draw: p => { const yy = inv(); p.autoY([...yy, ...ts.map(IN[ik][1])], 1.4); p.begin(); p.fn(IN[ik][1], { color: 'x', w: 1.2, q: 2 }); p.line(ts, yy, { color: 'y', w: 2.3 }); } });
    L.plot({ height: 170, x: [-40, 40], y: [0, 1], xlabel: 'ω', title: 'طیف ورودی، پاسخ فرکانسی و طیف خروجی', draw: p => {
      const m = ws.map((_, i) => Math.hypot(Xr[i], Xi[i])), mx = Math.max(...m) || 1; p.setY(0, 1.1); p.begin();
      const y = ws.map((w, i) => { const [c, d] = H(w); return Math.hypot(c, d) * m[i] / mx; });
      p.line(ws, m.map(v => v / mx), { color: 'x', w: 1.2 }); p.area(ws, y, { color: 'y' }); p.line(ws, y, { color: 'y', w: 1.5 });
      p.fn(w => Math.hypot(...H(w)), { color: 'h', w: 1.5, dash: [5, 3] });
    } });
    L.legend([['x', 'ورودی (نرمال‌شده)'], ['y', 'خروجی'], ['h', '$|H(j\\omega)|$', 1]]);
    const ui = L.controls();
    ui.select('ورودی', Object.keys(IN).map(k => [k, IN[k][0]]), ik, v => { ik = v; fwd(); });
    ui.seg('فیلتر', [['lp', 'پایین‌گذر'], ['hp', 'بالاگذر'], ['bp', 'میان‌گذر'], ['rc', 'مرتبه اول']], ty, v => { ty = v; });
    ui.slider('فرکانس گوشه', { min: 1, max: 30, step: .5, value: W }, v => { W = v; });
    const note = L.note();
    L.after(() => note('در زمان باید کانولوشن کرد ولی در فرکانس فقط ضرب لازم است: $Y(j\\omega)=H(j\\omega)X(j\\omega)$. فیلتر ایده‌آل چون لبهٔ تیز دارد در خروجی نوسان می‌سازد، ولی فیلتر مرتبه اول نرم‌تر عمل می‌کند.'));
  });

  S.lab('periodic-ft', L => {
    let k = 'sin', w0 = 2;
    const lines = () => {
      const K = S.range(-12, 12), T = 2 * PI / w0;
      if (k === 'sin') return { a: { 1: [0, -.5], '-1': [0, .5] }, x: t => Math.sin(w0 * t) };
      if (k === 'cos') return { a: { 1: [.5, 0], '-1': [.5, 0] }, x: t => Math.cos(w0 * t) };
      if (k === 'sq') { const a = {}; K.forEach(q => { a[q] = [q === 0 ? .5 : Math.sin(q * PI / 2) / (q * PI), 0]; }); return { a, x: t => (Math.abs(wrap(t, T)) < T / 4 ? 1 : 0) }; }
      const a = {}; K.forEach(q => { a[q] = [1 / T, 0]; }); return { a, train: T };
    };
    L.plot({ height: 150, x: [-8, 8], y: [-1.4, 1.4], xlabel: 't', ylabel: 'x(t)', draw: p => {
      const l = lines();
      if (l.train) { p.setY(-.1, 1.3); p.begin(); for (let q = -8; q <= 8; q++) p.arrowUp(q * l.train, 1, { color: 'x' }); return; }
      p.fn(l.x, { color: 'x', q: 2 });
    } });
    L.plot({ height: 190, x: [-20, 20], y: [-1, 7], xlabel: 'ω', ylabel: '|X(jω)|', title: 'هر ضریب aₖ به یک ضربه با مساحت 2π|aₖ| تبدیل می‌شود', draw: p => {
      const l = lines(), v = Object.values(l.a).map(c => 2 * PI * Math.hypot(...c)); p.setY(-.08 * Math.max(...v), Math.max(...v) * 1.2); p.begin();
      Object.keys(l.a).forEach(q => { const m = 2 * PI * Math.hypot(...l.a[q]); if (m > 1e-6) p.arrowUp(+q * w0, m, { color: 'y' }); });
    } });
    const ui = L.controls();
    ui.select('سیگنال', [['sin', 'sin ω₀t (تمرین ۸.۸)'], ['cos', 'cos ω₀t'], ['sq', 'موج مربعی'], ['tr', 'قطارضربه (تمرین ۸.۹)']], k, v => { k = v; });
    ui.slider('$\\omega_0$', { min: .5, max: 6, step: .1, value: w0 }, v => { w0 = v; });
    const st = L.stats();
    L.after(() => {
      const T = 2 * PI / w0;
      st(k === 'tr' ? { 'دوره در زمان $T$': S.fmt(T, 3), 'فاصلهٔ ضربه‌ها در فرکانس $2\\pi/T$': S.fmt(w0, 3), 'مساحت هر ضربه $2\\pi/T$': S.fmt(w0, 3) } : k === 'sin' ? { '$X(j\\omega)$': 'jπ[δ(ω+ω₀) − δ(ω−ω₀)]', 'مساحت هر ضربه': 'π' } : { 'فاصلهٔ خطوط طیف': S.fmt(w0, 3), 'دوره': S.fmt(T, 3) });
    });
  });

  S.quiz('ch8', [
    { q: 'تبدیل فوریهٔ پالس $|t|<T_1$ چیست؟', o: ['$\\dfrac{2\\sin\\omega T_1}{\\omega}$', '$\\dfrac{1}{a+j\\omega}$', '$2\\pi\\delta(\\omega)$', '$e^{-j\\omega T_1}$'], a: 0, e: 'تمرین ۸.۴. انتگرال $e^{-j\\omega t}$ روی بازهٔ متقارن.' },
    { q: 'با باریک‌تر شدن پالس در زمان، طیف چه می‌شود؟', o: ['پهن‌تر می‌شود', 'باریک‌تر می‌شود', 'تغییر نمی‌کند', 'صفر می‌شود'], a: 0, e: 'رابطهٔ عکس زمان و فرکانس. در حد ضربه طیف کاملاً تخت است.' },
    { q: 'تبدیل $e^{-a|t|}$ با $a>0$ چیست؟', o: ['$\\dfrac{2a}{a^2+\\omega^2}$', '$\\dfrac{1}{a+j\\omega}$', '$\\dfrac{a}{a^2+\\omega^2}$', '$\\dfrac{2}{a+j\\omega}$'], a: 0, e: 'تمرین ۸.۲. جمع $\\tfrac1{a-j\\omega}$ و $\\tfrac1{a+j\\omega}$.' },
    { q: 'برای $h(t)=e^{-at}u(t)$ پهنای باند با زیاد شدن $a$ چه می‌شود؟', o: ['بیشتر می‌شود و فرکانس‌های بالاتری عبور می‌کنند', 'کمتر می‌شود', 'ثابت می‌ماند', 'صفر می‌شود'], a: 0, e: 'گوشه در $\\omega=a$ است و پاسخ ضربه کوتاه‌تر شده است.' },
    { q: 'سیگنال متناوب با ضرایب $a_k$ چه تبدیل فوریه‌ای دارد؟', o: ['$\\sum_k2\\pi a_k\\delta(\\omega-k\\omega_0)$', '$\\sum_ka_ke^{jk\\omega_0t}$', 'تبدیل فوریه ندارد', '$2\\pi a_0$'], a: 0, e: 'با استفاده از ضربه در حوزهٔ فرکانس، سری فوریه و تبدیل فوریه یکی می‌شوند.' },
    { q: 'قطارضربه با دورهٔ $T$ در زمان، در فرکانس چیست؟', o: ['قطارضربه با فاصلهٔ $2\\pi/T$ و مساحت $2\\pi/T$', 'پالس مربعی', 'یک ضربهٔ تکی', 'سینک'], a: 0, e: 'تمرین ۸.۹. همهٔ ضرایب $a_k=1/T$ هستند.' },
  ]);
})();
