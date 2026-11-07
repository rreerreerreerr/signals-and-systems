(function () {
  const S = SS, PI = Math.PI;

  /* سیگنال‌های متناوب با دورهٔ T */
  const wrap = (t, T) => t - T * Math.floor(t / T + .5);
  const WAVES = {
    square: { n: 'موج مربعی (تمرین ۶.۱۳)', T: 2, f: t => (Math.abs(wrap(t, 2)) < .5 ? 1 : 0) },
    tri: { n: 'موج مثلثی (تمرین ۶.۱۴)', T: 4, f: t => 1 - Math.abs(wrap(t, 4)) },
    saw: { n: 'دندان‌اره‌ای (تمرین ۶.۱۵)', T: 2, f: t => wrap(t, 2) },
    exp: { n: 'نمایی (تمرین ۶.۱۲)', T: PI, f: t => { const q = t - PI * Math.floor(t / PI); return Math.exp(-q / 2); } },
  };
  const synth = (co, K, w0, t) => { let s = 0; for (let k = -K; k <= K; k++) { const [a, b] = co[k]; s += a * Math.cos(k * w0 * t) - b * Math.sin(k * w0 * t); } return s; };

  S.lab('harmony', L => {
    const ks = S.range(1, 10); const b = ks.map((k, i) => (i === 0 ? 1 : 0));
    let f0 = 220, ctx = null, osc = null, gain = null;
    const x = t => b.reduce((s, v, i) => s + v * Math.sin(2 * PI * (i + 1) * t), 0);
    L.plot({ height: 170, x: [0, 2], y: [-2, 2], xlabel: 'زمان (بر حسب دورهٔ اصلی)', ylabel: 'x(t)', draw: p => {
      const v = S.linspace(0, 1, 400).map(x); p.autoY(v, 2, true); p.begin(); p.fn(x, { color: 'x', q: 2 });
    } });
    L.plot({ height: 150, x: [.3, 10.7], y: [-.02, 1.05], m: [10, 12, 22, 34], intX: true, xlabel: 'هارمونیک k', ylabel: 'دامنه', title: 'ارتفاع هر هارمونیک را بکش', draw: p => p.stem(ks, b, { color: 'h', r: 4.5, w: 4 }) }).editStems(ks, b, () => { L.update(); pushWave(); }, { snap: .02, max: 1 });
    const pushWave = () => {
      if (!osc) return;
      const re = new Float32Array(11), im = new Float32Array(11);
      b.forEach((v, i) => { im[i + 1] = Math.max(0, v); });
      osc.setPeriodicWave(ctx.createPeriodicWave(re, im)); osc.frequency.value = f0;
    };
    const ui = L.controls();
    const P = (nm, f) => ui.button(nm, () => { ks.forEach((k, i) => { b[i] = f(k); }); pushWave(); });
    P('سینوس خالص', k => (k === 1 ? 1 : 0));
    P('مربعی: 1/k فرد', k => (k % 2 ? 1 / k : 0));
    P('اره‌ای: 1/k', k => 1 / k);
    P('مثلثی: 1/k² فرد', k => (k % 2 ? 1 / (k * k) : 0));
    ui.slider('فرکانس پایه (هرتز)', { min: 110, max: 440, step: 1, value: f0 }, v => { f0 = v; pushWave(); });
    const play = ui.button('▶ پخش صدا', () => {
      if (osc) { osc.stop(); osc.disconnect(); osc = null; play.textContent = '▶ پخش صدا'; return; }
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume();
      osc = ctx.createOscillator(); gain = gain || ctx.createGain(); gain.gain.value = .12; gain.connect(ctx.destination);
      osc.connect(gain); pushWave(); osc.start(); play.textContent = '■ قطع صدا';
    }, 'pri');
    const note = L.note();
    L.after(() => note(`صداهایی با فرکانس‌های ${f0}، ${2 * f0}، ${3 * f0} هرتز و … هارمونیک‌های یک نت هستند. ارتفاع نت را فرکانس پایه تعیین می‌کند و رنگ صدا را ترکیب هارمونیک‌ها.`));
    new IntersectionObserver(e => { if (!e[0].isIntersecting && osc) play.click(); }).observe(L.root);
  });

  S.lab('epicycles', L => {
    let key = 'square', N = 5, th = 0, co = {};
    const load = () => { const w = WAVES[key]; co = S.fsCoef(t => w.f(t * w.T), 1, 40, 2048, -.5); };
    load();
    const g = q => { let s = 0; for (let k = -N; k <= N; k++) { const [a, b] = co[k]; s += a * Math.cos(2 * PI * k * q) - b * Math.sin(2 * PI * k * q); } return s; };
    const row = L.row();
    const Y = [-1.7, 1.7];
    const pz = L.plot({ height: 300, x: [-1.7, 1.7], y: Y, equal: true, xlabel: 'Im', ylabel: 'Re', title: 'هر ضریب aₖ یک چرخ است', m: [8, 0, 22, 34], draw: p => {
      let re = co[0][0], im = co[0][1];
      for (const k of S.range(1, N)) {
        for (const s of [k, -k]) {
          const [a, b] = co[s], c = Math.cos(2 * PI * s * th), d = Math.sin(2 * PI * s * th), R = Math.hypot(a, b);
          if (R < 1e-4) continue;
          const nr = re + a * c - b * d, ni = im + a * d + b * c;
          p.circle(im, re, R, { color: 'axis', w: .6 });
          p.seg(im, re, ni, nr, { color: 'x', w: 1.4 });
          re = nr; im = ni;
        }
      }
      p.dot(im, re, { color: 'h', r: 3.5 });
      p.seg(im, re, p.x[1], re, { color: 'h', w: 1, dash: [3, 3] });
    } }, row);
    const pw = L.plot({ height: 300, x: [0, 1], y: Y, xlabel: 'زمان گذشته', ylabel: 'x_N(t)', title: 'جمع چرخ‌ها، سیگنال را می‌سازد', m: [8, 8, 22, 26], draw: p => {
      const f = WAVES[key];
      p.fn(s => f.f((th - s) * f.T), { color: 'axis', w: 1 });
      p.fn(s => g(th - s), { color: 'h', w: 2.2 });
    } }, row);
    const A = L.anim(dt => { th = (th + dt * .22) % 1; pz.render(); pw.render(); });
    const ui = L.controls();
    ui.select('سیگنال', ['square', 'tri', 'saw'].map(k => [k, WAVES[k].n]), key, v => { key = v; load(); });
    ui.slider('تعداد هارمونیک $N$', { min: 0, max: 40, step: 1, value: N }, v => { N = v; });
    ui.play(A);
    const st = L.stats();
    L.after(() => {
      const w = WAVES[key];
      let e = 0, en = 0; for (let i = 0; i < 400; i++) { const q = (i + .5) / 400; e += (w.f((q - .5) * w.T) - g(q - .5)) ** 2; en += w.f((q - .5) * w.T) ** 2; }
      st({ 'چرخ‌های غیرصفر': S.range(-N, N).filter(k => Math.hypot(...co[k]) > 1e-4).length, 'خطای میانگین مربعات': S.fmt(e / 400, 4), 'سهم انرژی بازسازی‌شده': S.fmt(100 * (1 - e / en), 1) + '٪' });
    });
  });

  S.lab('gibbs', L => {
    let N = 9, zoom = false;
    const xN = t => { let s = 0; for (let k = 1; k <= N; k += 2) s += Math.sin(k * t) / k; return 4 / PI * s; };
    L.plot({ height: 240, x: [-PI, PI], y: [-1.45, 1.45], xpi: true, xlabel: 't', draw: p => {
      if (zoom) { p.o.xpi = false; p.setX(-.1, .9); p.setY(.7, 1.3); } else { p.o.xpi = true; p.setX(-1.5 * PI, 1.5 * PI); p.setY(-1.45, 1.45); }
      p.begin();
      p.fn(t => (Math.sin(t) >= 0 ? 1 : -1), { color: 'axis', w: 1.2 });
      if (zoom) p.hline(1.0895, { color: 'h' });
      p.fn(xN, { color: 'x', q: 3 });
    } });
    const ui = L.controls();
    ui.slider('بالاترین هارمونیک (فرد) $N$', { min: 1, max: 301, step: 2, value: N }, v => { N = v; });
    ui.check('نزدیک‌نمایی روی پرش', zoom, v => { zoom = v; });
    const st = L.stats();
    L.after(() => {
      let mx = 0; for (let i = 1; i <= 800; i++) { const v = xN(i * (3 * PI / (N + 1)) / 800); if (v > mx) mx = v; }
      let sum = 0; for (let k = 1; k <= N; k += 2) sum += 1 / (k * k);
      st({ 'بیشینهٔ منحنی': S.fmt(mx, 4), 'فراجهش نسبت به پرش': S.fmt((mx - 1) / 2 * 100, 2) + '٪', 'فاصلهٔ قله تا پرش': S.fmt(PI / (N + 1), 4), 'میانگین مربع خطا': S.fmt(1 - 8 / PI / PI * sum, 5) });
    });
  });

  S.lab('pulse-train', L => {
    let T0 = 1, T = 4, N = 6;
    const a = k => (k === 0 ? 2 * T0 / T : Math.sin(k * 2 * PI / T * T0) / (k * PI));
    const part = t => { let s = a(0); for (let k = 1; k <= N; k++) s += 2 * a(k) * Math.cos(k * 2 * PI * t / T); return s; };
    L.plot({ height: 170, x: [-8, 8], y: [-.3, 1.35], xlabel: 't', ylabel: 'x(t)', draw: p => {
      p.fn(t => (Math.abs(wrap(t, T)) < T0 ? 1 : 0), { color: 'x', w: 1.6, q: 2 });
      p.fn(part, { color: 'h', w: 1.6 });
    } });
    const K = S.range(-24, 24);
    L.plot({ height: 180, x: [-24.5, 24.5], y: [-.3, 1], intX: true, xlabel: 'k', ylabel: 'aₖ', draw: p => {
      const top = Math.max(.25, a(0)) * 1.15; p.setY(-.32 * top, top); p.begin();
      p.fn(k => (Math.abs(k) < 1e-6 ? a(0) : a(k)), { color: 'axis', w: 1, dash: [3, 3] });
      p.stem(K, K.map(a), { color: 'y', r: 2.8 });
      K.filter(k => Math.abs(k) <= N).forEach(k => p.dot(k, a(k), { color: 'h', r: 3.4 }));
    } });
    L.legend([['x', 'x(t)'], ['h', 'جمع تا هارمونیک $N$']]);
    const ui = L.controls();
    const sT = ui.slider('دوره $T$', { min: 1, max: 16, step: .1, value: T }, v => { T = v; if (T0 >= T / 2) { T0 = T / 2 - .01; s0.set(T0); } });
    const s0 = ui.slider('نیم‌پهنای پالس $T_0$', { min: .1, max: 4, step: .05, value: T0 }, v => { T0 = Math.min(v, T / 2 - .01); });
    ui.slider('تعداد هارمونیک $N$', { min: 0, max: 24, step: 1, value: N }, v => { N = v; });
    void sT;
    const st = L.stats(), note = L.note();
    L.after(() => {
      const fz = T / (2 * T0);
      st({ '$\\omega_0=2\\pi/T$': S.fmt(2 * PI / T, 3), '$a_0=2T_0/T$': S.fmt(a(0), 3), 'اولین صفر پوش $k$': S.fmt(fz, 2) });
      note('پالس را <b>باریک‌تر</b> کن: پوش طیف پهن‌تر می‌شود، چون لبه‌های تیز به فرکانس‌های بالا نیاز دارند. دوره را <b>بزرگ‌تر</b> کن: خط‌های طیفی به هم نزدیک می‌شوند. این همان راهی است که در فصل ۸ به تبدیل فوریه می‌رسد.');
    });
  });

  S.lab('vector-projection', L => {
    let v = [2, 1.5], th = 0;
    const e1 = () => [Math.cos(th), Math.sin(th)], e2 = () => [-Math.sin(th), Math.cos(th)];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    const row = L.row();
    const p = L.plot({ height: 300, x: [-3.2, 3.2], y: [-3.2, 3.2], equal: true, title: 'نوک بردار را بکش', draw: q => {
      const a = e1(), b = e2(), A = dot(v, a), B = dot(v, b);
      q.seg(-5 * a[0], -5 * a[1], 5 * a[0], 5 * a[1], { color: 'grid', w: 1 }); q.seg(-5 * b[0], -5 * b[1], 5 * b[0], 5 * b[1], { color: 'grid', w: 1 });
      q.seg(v[0], v[1], A * a[0], A * a[1], { color: 'h', w: 1, dash: [3, 3] }); q.seg(v[0], v[1], B * b[0], B * b[1], { color: 'y', w: 1, dash: [3, 3] });
      q.arrow(0, 0, A * a[0], A * a[1], { color: 'h', w: 2.4 }); q.arrow(0, 0, B * b[0], B * b[1], { color: 'y', w: 2.4 });
      q.arrow(0, 0, v[0], v[1], { color: 'x', w: 2.4 }); q.dot(v[0], v[1], { color: 'x' });
    } }, row);
    p.pointer({ cursor: 'grab', down: (x, y) => { v = [x, y]; L.update(); }, move: (x, y) => { v = [x, y]; L.update(); } });
    const side = L.div('', '', row);
    const ui = L.controls(side);
    ui.slider('چرخش پایه‌ها $\\theta$', { min: 0, max: 1.57, step: .01, value: 0 }, x => { th = x; });
    const st = L.stats(side), note = L.note(side);
    note('برای پیدا کردن مختصات، بردار را روی هر پایه تصویر می‌کنیم: $a_i=\\langle x,e_i\\rangle$. چون پایه‌ها متعامدند، هر مختصات مستقل از بقیه به دست می‌آید. سری فوریه همین کار را با تابع‌ها می‌کند و پایه‌هایش $e^{jk\\omega_0t}$ هستند.');
    L.after(() => { const A = dot(v, e1()), B = dot(v, e2()); st({ '$a_1=\\langle x,e_1\\rangle$': S.fmt(A), '$a_2=\\langle x,e_2\\rangle$': S.fmt(B), '$a_1^2+a_2^2$': S.fmt(A * A + B * B), '$\\|x\\|^2$': S.fmt(dot(v, v)) }); });
  });

  S.lab('analysis-eq', L => {
    const SG = {
      e6: ['1+cos ω₀t (تمرین ۶.۶)', t => 1 + Math.cos(t)],
      e7: ['1+cos ω₀t+sin ω₀t (تمرین ۶.۷)', t => 1 + Math.cos(t) + Math.sin(t)],
      h2: ['cos 2ω₀t: آزمون تعامد', t => Math.cos(2 * t)],
      sq: ['موج مربعی', t => (Math.abs(wrap(t, 2 * PI)) < PI / 2 ? 1 : 0)],
      sw: ['دندان‌اره‌ای', t => wrap(t, 2 * PI) / PI],
    };
    let sk = 'e7', k = 1;
    const coef = () => S.fsCoef(SG[sk][1], 2 * PI, 8, 1024);
    const row = L.row();
    L.plot({ height: 165, x: [0, 2 * PI], y: [-2.3, 2.6], xpi: true, xlabel: 'ω₀t', title: 'سیگنال و پایهٔ کنونی', draw: p => {
      p.fn(SG[sk][1], { color: 'x', q: 2 }); p.fn(t => Math.cos(k * t), { color: 'h', w: 1.3 }); p.fn(t => -Math.sin(k * t), { color: 'h', w: 1.3, dash: [4, 3] });
    } }, row);
    L.plot({ height: 165, x: [0, 2 * PI], y: [-2.5, 2.5], xpi: true, xlabel: 'ω₀t', title: 'x(t)·e^(−jkω₀t)؛ میانگینش همان aₖ است', draw: p => {
      const f = SG[sk][1];
      const re = t => f(t) * Math.cos(k * t), im = t => -f(t) * Math.sin(k * t);
      p.fn(re, { color: 'y', fill: true, q: 2 }); p.fn(im, { color: 'a', fill: true, q: 2, w: 1.4 });
    } }, row);
    L.legend([['x', 'x(t)'], ['h', 'Re و Im پایه'], ['y', 'بخش حقیقی حاصل‌ضرب'], ['a', 'بخش موهومی حاصل‌ضرب']]);
    const K = S.range(-8, 8);
    L.plot({ height: 150, x: [-8.5, 8.5], y: [0, 1.2], intX: true, xlabel: 'k', ylabel: '|aₖ|', title: 'روی یک k کلیک کن', draw: p => {
      const c = coef(), v = K.map(q => Math.hypot(...c[q])); p.autoY(v, .4); p.begin(); p.stem(K, v, { color: 'axis', r: 3 }); p.stem([k], [v[k + 8]], { color: 'h', r: 5 });
    } }).pointer({ cursor: 'pointer', down: x => { k = S.clamp(Math.round(x), -8, 8); sk2.set(k); L.update(); } });
    const ui = L.controls();
    ui.select('سیگنال', Object.keys(SG).map(q => [q, SG[q][0]]), sk, v => { sk = v; });
    const sk2 = ui.slider('هارمونیک $k$', { min: -8, max: 8, step: 1, value: k }, v => { k = v; });
    const st = L.stats();
    L.after(() => { const c = coef()[k]; st({ '$a_k$ (مختصات دکارتی)': S.cfmt(c[0], c[1], 3), '$|a_k|$': S.fmt(Math.hypot(...c), 3), '$\\angle a_k$': Math.hypot(...c) < 1e-3 ? '—' : S.fmt(Math.atan2(c[1], c[0]) * 180 / PI, 1) + '°' }); });
  });

  S.lab('fs-props', L => {
    const B = {
      pulse: ['پالس نامتقارن', t => { const q = wrap(t, 2); return q > -.2 && q < .6 ? 1 : 0; }],
      tri: ['مثلث', t => 1 - 2 * Math.abs(wrap(t, 2))],
      saw: ['دندان‌اره‌ای', t => wrap(t, 2)],
    };
    let bk = 'tri', op = 'shift', t0 = .4;
    const T = 2, w0 = PI;
    const fnx = () => {
      const f = B[bk][1];
      if (op === 'shift') return t => f(t - t0);
      if (op === 'rev') return t => f(-t);
      if (op === 'scale') return t => f(2 * t);
      if (op === 'diff') { const h = 1e-3; return t => (f(t + h) - f(t - h)) / (2 * h); }
      return f;
    };
    const row = L.row();
    L.plot({ height: 165, x: [-2.2, 2.2], y: [-1.5, 1.5], xlabel: 't', title: 'زمان', draw: p => {
      const g = fnx(), v = S.linspace(-1, 1, 300).map(g); p.autoY([...v.map(q => S.clamp(q, -6, 6)), 1], 2.2, true); p.begin();
      p.fn(B[bk][1], { color: 'axis', w: 1.2 }); p.fn(t => S.clamp(g(t), -8, 8), { color: 'y', q: 2 });
    } }, row);
    const K = S.range(-12, 12);
    L.plot({ height: 165, x: [-12.5, 12.5], y: [0, 1], intX: true, xlabel: 'k', ylabel: '|aₖ|', title: 'اندازهٔ ضرایب: قبل و بعد', draw: p => {
      const a = S.fsCoef(B[bk][1], T, 12, 1024), b = S.fsCoef(fnx(), T, 12, 1024);
      const u = K.map(k => Math.hypot(...a[k])), v = K.map(k => Math.hypot(...b[k])); p.autoY([...u, ...v], .4); p.begin();
      p.stem(K, u, { color: 'axis', r: 4.5, hollow: true, w: 1 }); p.stem(K, v, { color: 'y', r: 2.8 });
    } }, row);
    L.plot({ height: 150, x: [-12.5, 12.5], y: [-PI, PI], ypi: true, intX: true, xlabel: 'k', ylabel: '∠aₖ', title: 'فاز ضرایب: قبل و بعد', draw: p => {
      const a = S.fsCoef(B[bk][1], T, 12, 1024), b = S.fsCoef(fnx(), T, 12, 1024);
      const ang = c => (Math.hypot(...c) < 1e-3 ? NaN : Math.atan2(c[1], c[0]));
      p.stem(K, K.map(k => ang(a[k])), { color: 'axis', r: 4.5, hollow: true, w: 1 }); p.stem(K, K.map(k => ang(b[k])), { color: 'y', r: 2.8 });
    } });
    const ui = L.controls();
    ui.select('سیگنال پایه', Object.keys(B).map(k => [k, B[k][0]]), bk, v => { bk = v; });
    ui.select('عمل', [['none', 'هیچ'], ['shift', 'شیفت زمانی'], ['rev', 'معکوس زمانی'], ['scale', 'مقیاس زمانی x(2t)'], ['diff', 'مشتق']], op, v => { op = v; });
    ui.slider('شیفت $t_0$', { min: -1, max: 1, step: .02, value: t0 }, v => { t0 = v; });
    const st = L.stats(), note = L.note();
    const RULE = {
      none: 'سیگنال اصلی. به تقارن مزدوج نگاه کن: برای سیگنال حقیقی $a_{-k}=a_k^*$، پس اندازه زوج و فاز فرد است.',
      shift: 'قانون: $a_k\\to a_ke^{-jk\\omega_0t_0}$. اندازه هیچ تغییری نمی‌کند و فقط فاز به‌صورت خطی با $k$ می‌چرخد.',
      rev: 'قانون: $a_k\\to a_{-k}$. برای سیگنال حقیقی این یعنی مزدوج ضرایب؛ پس اندازه ثابت و فاز قرینه می‌شود.',
      scale: 'قانون: ضرایب همان می‌مانند ولی فرکانس پایه دو برابر می‌شود. چون اینجا روی دورهٔ اصلی می‌سنجیم، ضرایب روی $k$های زوج نشسته‌اند.',
      diff: 'قانون: $a_k\\to jk\\omega_0a_k$. فرکانس‌های بالا تقویت می‌شوند. مشتق موج با پرش، قطارضربه می‌سازد (تمرین ۶.۱۱).',
    };
    L.after(() => {
      const g = fnx(); let m = 0; for (let i = 0; i < 2000; i++) m += g(-1 + (i + .5) * 2 / 2000) ** 2; m /= 2000;
      const c = S.fsCoef(g, T, 60, 2000); let s = 0; S.range(-60, 60).forEach(k => { s += c[k][0] ** 2 + c[k][1] ** 2; });
      st(op === 'diff' && bk !== 'tri' ? { 'پارسوال': 'مشتق پرش انرژی متناهی ندارد' } : { 'پارسوال: $\\frac1T\\int|x|^2dt$': S.fmt(m, 4), '$\\sum|a_k|^2$ تا $|k|\\le60$': S.fmt(s, 4) });
      note(RULE[op]);
    });
    void w0;
  });

  S.lab('lti-periodic', L => {
    const IN = {
      e16: ['cos πt + sin 2πt (تمرین ۶.۱۶)', t => Math.cos(PI * t) + Math.sin(2 * PI * t)],
      sq: ['موج مربعی', WAVES.square.f],
      saw: ['دندان‌اره‌ای', WAVES.saw.f],
      cos: ['فقط cos 3πt', t => Math.cos(3 * PI * t)],
    };
    let ik = 'sq', ty = 'lp', a = 4, t0 = .3;
    const w0 = PI, K = 40;
    const H = w => {
      if (ty === 'lp') { const d = a * a + w * w; return [a * a / d, -a * w / d]; }
      if (ty === 'hp') { const d = a * a + w * w; return [w * w / d, a * w / d]; }
      return [Math.cos(w * t0), -Math.sin(w * t0)];
    };
    let co = {};
    const calc = () => { co = S.fsCoef(IN[ik][1], 2, K, 2048); };
    calc();
    const bk = k => { const [x, y] = co[k], [c, d] = H(k * w0); return [x * c - y * d, x * d + y * c]; };
    L.plot({ height: 190, x: [-2, 2], y: [-1.8, 1.8], xlabel: 't', draw: p => {
      p.fn(IN[ik][1], { color: 'x', w: 1.5, q: 2 });
      p.fn(t => { let s = 0; for (let k = -K; k <= K; k++) { const [q, r] = bk(k); s += q * Math.cos(k * w0 * t) - r * Math.sin(k * w0 * t); } return s; }, { color: 'y', w: 2.2 });
    } });
    L.legend([['x', 'ورودی $x(t)$'], ['y', 'خروجی $y(t)$'], ['h', '$|H(jk\\omega_0)|$'], ['axis', 'ضرایب ورودی $|a_k|$']]);
    const Ks = S.range(-16, 16);
    L.plot({ height: 170, x: [-16.5, 16.5], y: [0, 1.1], intX: true, xlabel: 'k', title: 'طیف: هر ضریب در یک عدد مختلط ضرب می‌شود', draw: p => {
      p.fn(k => Math.hypot(...H(k * w0)), { color: 'h', w: 1.4, dash: [4, 3] });
      p.stem(Ks, Ks.map(k => Math.hypot(...co[k])), { color: 'axis', r: 4.4, hollow: true, w: 1 });
      p.stem(Ks, Ks.map(k => Math.hypot(...bk(k))), { color: 'y', r: 2.8 });
    } });
    const ui = L.controls();
    ui.select('ورودی', Object.keys(IN).map(k => [k, IN[k][0]]), ik, v => { ik = v; calc(); });
    ui.select('سیستم', [['lp', 'پایین‌گذر a/(a+jω)'], ['hp', 'بالاگذر jω/(a+jω)'], ['delay', 'تأخیر e^(−jωt₀)']], ty, v => { ty = v; });
    ui.slider('گوشهٔ $a$', { min: .5, max: 30, step: .5, value: a }, v => { a = v; });
    ui.slider('تأخیر $t_0$', { min: 0, max: 1, step: .01, value: t0 }, v => { t0 = v; });
    const st = L.stats();
    L.after(() => {
      const list = S.range(0, 5).filter(k => Math.hypot(...co[k]) > 1e-3).slice(0, 3);
      const o = {}; list.forEach(k => { const h = H(k * w0); o[`k=${k}`] = `|H|=${S.fmt(Math.hypot(...h), 2)} ∠${S.fmt(Math.atan2(h[1], h[0]) * 180 / PI, 0)}°`; });
      st(o);
    });
  });

  S.lab('draw-fs', L => {
    const M = 200, xs = S.linspace(0, 1, M), ys = xs.map(t => (t > .15 && t < .45 ? 1 : t > .6 ? -.5 * Math.sin((t - .6) * 8) : 0));
    let N = 8, co = null;
    const calc = () => { const f = t => { const q = t - Math.floor(t); return ys[Math.min(M - 1, Math.round(q * (M - 1)))]; }; co = S.fsCoef(f, 1, 30, M, 0); };
    calc();
    const P = L.plot({ height: 220, x: [0, 1], y: [-1.5, 1.5], xlabel: 'یک دوره', ylabel: 'x(t)', title: 'یک دوره از سیگنال را خودت بکش', draw: p => {
      p.line(xs, ys, { color: 'x', w: 2.2 });
      p.fn(t => synth(co, N, 2 * PI, t), { color: 'h', w: 1.8 });
    } });
    P.editCurve(xs, ys, () => { calc(); L.update(); });
    const Ks = S.range(-30, 30);
    L.plot({ height: 130, x: [-30.5, 30.5], y: [0, 1], intX: true, xlabel: 'k', ylabel: '|aₖ|', draw: p => {
      const v = Ks.map(k => Math.hypot(...co[k])); p.autoY(v, .2); p.begin(); p.stem(Ks, v, { color: 'axis', r: 2.2 }); p.stem(S.range(-N, N), S.range(-N, N).map(k => v[k + 30]), { color: 'h', r: 2.6 });
    } });
    const ui = L.controls();
    ui.slider('تعداد هارمونیک $N$', { min: 0, max: 30, step: 1, value: N }, v => { N = v; });
    ui.button('سینوس', () => { xs.forEach((t, i) => { ys[i] = Math.sin(2 * PI * t); }); calc(); });
    ui.button('یک پالس', () => { xs.forEach((t, i) => { ys[i] = t > .3 && t < .7 ? 1 : 0; }); calc(); });
    ui.button('صفر', () => { ys.fill(0); calc(); });
  });

  S.quiz('ch6', [
    { q: 'ضرایب فوریهٔ $x(t)=1+\\cos\\omega_0t$ کدام‌اند؟', o: ['$a_0=1,\\;a_{\\pm1}=\\tfrac12$', '$a_0=1,\\;a_1=1$', '$a_0=\\tfrac12,\\;a_{\\pm1}=1$', 'همهٔ $a_k$ غیرصفرند'], a: 0, e: 'با اویلر: $\\cos\\omega_0t=\\tfrac12(e^{j\\omega_0t}+e^{-j\\omega_0t})$.' },
    { q: 'چرا هارمونیک‌ها برای نمایش سیگنال مناسب‌اند؟', o: ['چون متعامدند و هر ضریب مستقل از بقیه با یک انتگرال به دست می‌آید', 'چون همگی حقیقی‌اند', 'چون دامنهٔ همه یکی است', 'چون فرکانس همه یکی است'], a: 0, e: 'انتگرال $e^{jk\\omega_0t}e^{-jl\\omega_0t}$ در یک دوره برای $k\\ne l$ صفر است.' },
    { q: 'پدیدهٔ گیبس چه می‌گوید؟', o: ['نزدیک پرش، با زیاد کردن هارمونیک‌ها فراجهش حدود ۹٪ از بین نمی‌رود', 'سری فوریه هیچ‌وقت همگرا نمی‌شود', 'سیگنال پیوسته فوریه ندارد', 'خطای کل زیاد می‌شود'], a: 0, e: 'قله باریک‌تر می‌شود و انرژی خطا به صفر می‌رود، ولی ارتفاع فراجهش تقریباً ثابت می‌ماند.' },
    { q: 'اگر $x(t)$ را به اندازهٔ $t_0$ شیفت دهیم، $|a_k|$ چه می‌شود؟', o: ['تغییر نمی‌کند', 'نصف می‌شود', 'صفر می‌شود', 'با $k$ زیاد می‌شود'], a: 0, e: 'فقط فاز تغییر می‌کند: $a_ke^{-jk\\omega_0t_0}$.' },
    { q: 'سیگنال حقیقی و زوج چه ضرایبی دارد؟', o: ['حقیقی و زوج', 'موهومی و فرد', 'حقیقی و فرد', 'موهومی و زوج'], a: 0, e: 'تقارن زوج جملهٔ سینوسی را حذف می‌کند.' },
    { q: 'ورودی $e^{j\\omega t}$ در سیستم LTI پایدار چه خروجی‌ای می‌دهد؟', o: ['$H(j\\omega)e^{j\\omega t}$', '$e^{j2\\omega t}$', '$h(t)$', 'ثابت $H(0)$'], a: 0, e: 'نمایی مختلط ویژه‌تابع LTI است و $H(j\\omega)$ ویژه‌مقدار آن است.' },
    { q: 'کدام‌یک شرایط دیریکله را نقض می‌کند؟', o: ['$x(t)=\\sin(3\\pi/4t)$ روی $0<t\\le1$ که متناوب تکرار شود', 'موج مربعی', 'موج مثلثی', '$\\cos t$'], a: 0, e: 'نزدیک $t=0$ این تابع بی‌نهایت بیشینه و کمینه دارد، پس شرط دوم نقض می‌شود. موج مربعی پرش دارد ولی تعداد پرش‌هایش در یک دوره متناهی است.' },
  ]);
})();
