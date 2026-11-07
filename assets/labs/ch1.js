(function () {
  const S = SS, PI = Math.PI;

  S.lab('signal-types', L => {
    const f = t => Math.sin(2 * PI * .5 * t) + .45 * Math.sin(2 * PI * 1.3 * t + .6);
    let mode = 'digital', Ts = .2, bits = 3;
    const Q = v => { const lv = 2 ** bits, st = 3.2 / lv; return S.clamp(Math.floor((v + 1.6) / st), 0, lv - 1) * st + st / 2 - 1.6; };
    L.plot({ height: 240, x: [0, 6], y: [-1.8, 1.8], xlabel: 't', ylabel: 'x', draw: p => {
      p.fn(f, { color: mode === 'ct' ? 'x' : 'axis', w: mode === 'ct' ? 2.4 : 1.2 });
      if (mode === 'ct') return;
      const ns = S.range(0, Math.floor(6 / Ts));
      if (mode === 'digital') {
        const st = 3.2 / 2 ** bits;
        for (let i = 0; i < 2 ** bits && 2 ** bits <= 32; i++) p.hline(-1.6 + st * (i + .5), { color: 'grid', dash: [], w: 1 });
      }
      p.stem(ns.map(n => n * Ts), ns.map(n => mode === 'digital' ? Q(f(n * Ts)) : f(n * Ts)), { color: mode === 'digital' ? 'h' : 'x', r: 2.8 });
    } });
    const ui = L.controls();
    ui.seg('نوع سیگنال', [['ct', 'پیوسته'], ['dt', 'گسسته'], ['digital', 'دیجیتال']], mode, v => { mode = v; });
    ui.slider('فاصلهٔ نمونه‌برداری $T_s$', { min: .05, max: .6, step: .01, value: Ts }, v => { Ts = v; });
    ui.slider('تعداد بیت', { min: 1, max: 6, step: 1, value: bits }, v => { bits = v; });
    const st = L.stats();
    L.after(() => {
      let e = 0, c = 0;
      for (let n = 0; n * Ts <= 6; n++) { const d = f(n * Ts) - Q(f(n * Ts)); e += d * d; c++; }
      st({
        'زمان': mode === 'ct' ? 'همهٔ t' : 'فقط nTₛ',
        'مقدار': mode === 'digital' ? (2 ** bits) + ' سطح' : 'هر عدد حقیقی',
        'نمونه در ثانیه': mode === 'ct' ? '∞' : S.fmt(1 / Ts, 1),
        'خطای کوانتیزاسیون (RMS)': mode === 'digital' ? S.fmt(Math.sqrt(e / c), 3) : '0',
      });
    });
  });

  S.lab('energy-power', L => {
    const sigs = {
      exp: { name: 'نمایی میرا', f: (t, a) => (t >= 0 ? Math.exp(-a * t) : 0), E: a => 1 / (2 * a), P: () => 0, tex: 'e^{-at}u(t)' },
      rect: { name: 'پالس', f: (t, a) => (Math.abs(t) <= a ? 1 : 0), E: a => 2 * a, P: () => 0, tex: '|t|\\le a' },
      cos: { name: 'کسینوس', f: (t, a) => a * Math.cos(2 * t), E: () => Infinity, P: a => a * a / 2, tex: 'a\\cos(2t)' },
      step: { name: 'پله', f: t => (t >= 0 ? 1 : 0), E: () => Infinity, P: () => .5, tex: 'u(t)' },
      ramp: { name: 'شیب', f: t => (t >= 0 ? t : 0), E: () => Infinity, P: () => Infinity, tex: 't\\,u(t)' },
    };
    let k = 'exp', a = 1, T = 3;
    const row = L.row();
    const A = (s, a2, tt) => { let e = 0; const dt = tt / 800; for (let i = 0; i < 1600; i++) { const v = s.f(-tt + (i + .5) * dt, a2); e += v * v * dt; } return e; };
    L.plot({ height: 210, x: [-6, 6], y: [-.2, 2], ylabel: '|x(t)|²', xlabel: 't', title: 'انرژی همان مساحت زیر |x|² است', draw: p => {
      const s = sigs[k]; let m = 0; for (let t = -6; t <= 6; t += .02) m = Math.max(m, s.f(t, a) ** 2);
      p.setY(-.05 * Math.max(m, 1), Math.max(Math.min(m, 40), 1) * 1.15);
      p.begin();
      p.band(-T, T, 'b', .12);
      const xs = S.linspace(-T, T, 600); p.area(xs, xs.map(t => s.f(t, a) ** 2), { color: 'x' });
      p.fn(t => s.f(t, a) ** 2, { color: 'x' });
    } }, row);
    L.plot({ height: 210, x: [0, 30], y: [0, 2], xlabel: 'T', title: 'وقتی پنجره بزرگ می‌شود چه می‌شود؟', draw: p => {
      const s = sigs[k]; const Ts = S.linspace(.05, 30, 90), Es = Ts.map(t => A(s, a, t)), Ps = Es.map((e, i) => e / (2 * Ts[i]));
      const lim = s.E(a); const top = isFinite(lim) ? Math.max(lim, s.P(a)) * 1.4 + .01 : Math.max(s.P(a) * 3, 3);
      p.setY(0, Math.max(top, 1)); p.begin();
      p.line(Ts, Es, { color: 'y' }); p.line(Ts, Ps, { color: 'h' });
      if (T <= 30) p.vline(T);
      if (isFinite(lim)) p.hline(lim, { color: 'y' });
      if (isFinite(s.P(a))) p.hline(s.P(a), { color: 'h' });
    } }, row);
    L.legend([['y', 'انرژی تا پنجره $E_T$'], ['h', 'توان میانگین $P_T$']]);
    const ui = L.controls();
    ui.select('سیگنال', Object.keys(sigs).map(q => [q, sigs[q].name]), k, v => { k = v; });
    ui.slider('پارامتر $a$', { min: .2, max: 3, step: .05, value: a }, v => { a = v; });
    ui.slider('نیم‌پنجره $T$', { min: .25, max: 30, step: .25, value: T }, v => { T = v; });
    const st = L.stats();
    L.after(() => {
      const s = sigs[k], Ev = A(s, a, T), E = s.E(a), P = s.P(a);
      st({
        'سیگنال': `$${s.tex}$`,
        '$E_T$ در این پنجره': S.fmt(Ev, 3),
        '$P_T$ در این پنجره': S.fmt(Ev / (2 * T), 3),
        '$E_\\infty$': S.fmt(E, 3), '$P_\\infty$': S.fmt(P, 3),
        'دسته': `<span style="font-family:Vazirmatn">${isFinite(E) ? 'سیگنال انرژی' : isFinite(P) ? 'سیگنال توان' : 'نه انرژی، نه توان'}</span>`,
      });
    });
  });

  S.lab('time-ops', L => {
    const ct = {
      ramp: { n: 'شیب تمرین ۱.۵', f: t => (t >= 0 && t <= 3 ? t : 0), s: [0, 3] },
      pulse: { n: 'پالس [0,6]', f: t => (t >= 0 && t <= 6 ? 1 : 0), s: [0, 6] },
      tri: { n: 'مثلث نامتقارن', f: t => (t >= -1 && t < 0 ? 2 * (t + 1) : t >= 0 && t <= 3 ? 2 * (1 - t / 3) : 0), s: [-1, 3] },
    };
    const dtS = {
      ex7: { n: 'دنبالهٔ تمرین ۱.۷', v: { '-2': 2, '-1': -1, 1: -3, 2: 4 } },
      pulse: { n: 'پالس گسسته', v: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } },
      ramp: { n: 'شیب تمرین ۱.۶', v: { 0: 0, 1: 1, 2: 2, 3: 3 } },
    };
    let mode = 'ct', sk = 'ramp', dk = 'ex7', a = 2, b = -3, da = '3', db = -4;
    const ns = S.range(-14, 14);
    const dv = m => dtS[dk].v[m] || 0;
    const dOut = n => {
      const A = +da;
      if (da.startsWith('1/')) { const Ln = +da.slice(2); return n % Ln === 0 ? dv(n / Ln + db) : 0; }
      return dv(A * n + db);
    };
    const makeP = (title, ylabel, dr) => L.plot({ height: 128, x: [-8, 8], y: [-1, 4], title, ylabel, xlabel: 't', draw: p => {
      const dt = mode === 'dt';
      p.o.intX = dt; p.o.xlabel = dt ? 'n' : 't';
      if (dt) { p.setX(-14, 14); p.autoY(Object.values(dtS[dk].v), 2); } else { p.setX(-8, 8); const c = ct[sk]; p.setY(c === ct.ramp ? -.4 : -.3, c === ct.ramp ? 3.6 : 2.4); }
      p.begin(); dr(p, dt);
    } });
    makeP('گام صفر: سیگنال اصلی', 'x', (p, dt) => {
      if (dt) p.stem(ns, ns.map(dv), { color: 'x' }); else p.fn(ct[sk].f, { color: 'x', fill: true });
    });
    makeP('گام اول: فقط شیفت', '', (p, dt) => {
      if (dt) p.stem(ns, ns.map(n => dv(n + db)), { color: 'a' }); else p.fn(t => ct[sk].f(t + b), { color: 'a', fill: true });
    });
    makeP('گام دوم: حالا مقیاس روی نتیجهٔ گام اول', '', (p, dt) => {
      if (dt) p.stem(ns, ns.map(dOut), { color: 'y' }); else p.fn(t => ct[sk].f(a * t + b), { color: 'y', fill: true, q: 2 });
    });
    const ui = L.controls();
    ui.seg('زمان', [['ct', 'پیوسته'], ['dt', 'گسسته']], mode, v => { mode = v; vis(); });
    const s1 = ui.select('سیگنال', Object.keys(ct).map(k => [k, ct[k].n]), sk, v => { sk = v; });
    const s2 = ui.select('سیگنال', Object.keys(dtS).map(k => [k, dtS[k].n]), dk, v => { dk = v; });
    const sa = ui.slider('مقیاس $a$', { min: -3, max: 3, step: .25, value: a }, v => { a = v || .25; });
    const sb = ui.slider('شیفت $b$', { min: -8, max: 8, step: .5, value: b }, v => { b = v; });
    const sda = ui.select('ضریب $a$', ['3', '2', '1', '-1', '-2', '-3', '1/2', '1/3'].map(x => [x, x]), da, v => { da = v; });
    const sdb = ui.slider('شیفت $b$', { min: -8, max: 8, step: 1, value: db }, v => { db = v; });
    function vis() { const dt = mode === 'dt'; [s1.el, sa.el, sb.el].forEach(e => { e.style.display = dt ? 'none' : ''; }); [s2.el, sda.el, sdb.el].forEach(e => { e.style.display = dt ? '' : 'none'; }); }
    vis();
    const st = L.stats(), note = L.note();
    L.after(() => {
      if (mode === 'ct') {
        const [s0, s1v] = ct[sk].s, e1 = (s0 - b) / a, e2 = (s1v - b) / a;
        st({ 'سیگنال خروجی': `x(${S.fmt(a)}t ${b < 0 ? '−' : '+'} ${S.fmt(Math.abs(b))})`, 'بازهٔ غیرصفر': `[${S.fmt(Math.min(e1, e2))}, ${S.fmt(Math.max(e1, e2))}]`, 'پهنا': `${S.fmt(Math.abs(s1v - s0))} ÷ ${S.fmt(Math.abs(a))} = ${S.fmt(Math.abs(s1v - s0) / Math.abs(a))}` });
        note(a < 0 ? 'ضریب منفی یعنی سیگنال معکوس هم شده است. نقطهٔ شروع سیگنال اصلی حالا در انتهای بازهٔ جدید نشسته.' : Math.abs(a) > 1 ? 'وقتی $|a|>1$ سیگنال فشرده می‌شود و خروجی زودتر تمام می‌شود.' : Math.abs(a) < 1 ? 'وقتی $|a|<1$ سیگنال کش می‌آید.' : 'مقیاس ۱ است و فقط شیفت دیده می‌شود.');
      } else {
        const v = dtS[dk].v, keys = Object.keys(v).map(Number).filter(q => v[q] !== 0);
        let lost = 0;
        if (!da.startsWith('1/')) { const A = Math.abs(+da); keys.forEach(q => { if (A !== 1 && (q - db) % A !== 0) lost++; }); }
        st({ 'سیگنال خروجی': `x[${da === '1' ? '' : da === '-1' ? '−' : da.startsWith('1/') ? '(' + da + ')' : da}n ${db < 0 ? '−' : '+'} ${Math.abs(db)}]`, 'نمونه‌های از دست‌رفته': lost });
        note(da.startsWith('1/') ? 'این <b>بسط</b> است: بین نمونه‌ها صفر قرار می‌گیرد و هیچ اطلاعاتی از بین نمی‌رود.' : Math.abs(+da) > 1 ? 'این <b>کاهش نرخ</b> (decimation) است: فقط نمونه‌هایی می‌مانند که $an+b$ به آن‌ها برسد. بقیه برای همیشه از بین می‌روند.' : 'فقط شیفت یا معکوس‌سازی است و نمونه‌ای از دست نمی‌رود.');
      }
    });
  });

  S.lab('dt-periodic', L => {
    let mode = 'rat', m = 3, N = 7, w = 1;
    const ns = S.range(0, 40);
    const Om = () => (mode === 'rat' ? 2 * PI * m / N : w);
    const N0 = () => (mode === 'rat' ? N / S.gcd(m, N) : Infinity);
    L.plot({ height: 220, x: [-.5, 40.5], y: [-1.3, 1.3], intX: true, xlabel: 'n', ylabel: 'x[n]', draw: p => {
      const O = Om(), n0 = N0();
      if (isFinite(n0)) for (let k = 0; k * n0 <= 40; k += 2) p.band(k * n0 - .5, (k + 1) * n0 - .5, 'b', .12);
      p.fn(t => Math.cos(O * t), { color: 'axis', w: 1, q: 2 });
      p.stem(ns, ns.map(n => Math.cos(O * n)), { color: 'x' });
    } });
    const ui = L.controls();
    ui.seg('فرکانس', [['rat', '$\\Omega_0=2\\pi m/N$'], ['irr', 'دلخواه']], mode, v => { mode = v; show(); });
    const a = ui.slider('$m$', { min: 1, max: 12, step: 1, value: m }, v => { m = v; });
    const b = ui.slider('$N$', { min: 2, max: 24, step: 1, value: N }, v => { N = v; });
    const c = ui.slider('$\\Omega_0$ (رادیان)', { min: .1, max: PI, step: .001, value: w }, v => { w = v; });
    function show() { a.el.style.display = b.el.style.display = mode === 'rat' ? '' : 'none'; c.el.style.display = mode === 'rat' ? 'none' : ''; }
    show();
    const st = L.stats(), note = L.note();
    L.after(() => {
      const O = Om(), n0 = N0();
      st({ '$\\Omega_0$': S.fmt(O, 4), 'دورهٔ پیوستهٔ $2\\pi/\\Omega_0$': S.fmt(2 * PI / O, 3), 'دورهٔ گسسته $N_0$': isFinite(n0) ? n0 : 'ندارد' });
      note(mode === 'rat' ? `اینجا $\\Omega_0/2\\pi = ${m}/${N}$ گویا است، پس سیگنال بعد از $N_0=${n0}$ نمونه دقیقاً تکرار می‌شود${S.gcd(m, N) > 1 ? ' (کسر را ساده کن!)' : ''}. نوارهای رنگی یک‌درمیان دوره‌ها را نشان می‌دهند.` : 'به‌ازای بیشتر مقدارهای این اسلایدر، $\\Omega_0/2\\pi$ گویا نیست و سیگنال هیچ‌وقت دقیقاً تکرار نمی‌شود. منحنی پیوستهٔ زیر آن با این حال همچنان متناوب است.');
    });
  });

  S.lab('even-odd', L => {
    const xs = S.linspace(-2, 2, 161), ys = new Array(161).fill(0);
    const ev = i => (ys[i] + ys[160 - i]) / 2, od = i => (ys[i] - ys[160 - i]) / 2;
    const p1 = L.plot({ height: 190, x: [-2, 2], y: [-2, 2], xlabel: 't', ylabel: 'x(t)', title: 'روی این نمودار با ماوس یا انگشت بکش', draw: p => { p.line(xs, ys, { color: 'x', w: 2.4 }); } });
    const row = L.row();
    const p2 = L.plot({ height: 150, x: [-2, 2], y: [-2, 2], xlabel: 't', ylabel: 'xₑ(t)', title: 'بخش زوج: آینه نسبت به محور عمودی', draw: p => { p.line(xs, xs.map((_, i) => ev(i)), { color: 'y' }); } }, row);
    const p3 = L.plot({ height: 150, x: [-2, 2], y: [-2, 2], xlabel: 't', ylabel: 'xₒ(t)', title: 'بخش فرد: چرخش ۱۸۰ درجه حول مبدأ', draw: p => { p.line(xs, xs.map((_, i) => od(i)), { color: 'h' }); } }, row);
    const load = f => {
      xs.forEach((t, i) => { ys[i] = f(t); });
      const top = Math.max(1.5, ...ys.map(Math.abs)) * 1.15;
      [p1, p2, p3].forEach(p => p.setY(-top, top));
    };
    p1.editCurve(xs, ys, L.update);
    const ui = L.controls();
    ui.button('تمرین ۱.۱۶: t³−t+1', () => load(t => t ** 3 - t + 1));
    ui.button('e⁻ᵗu(t)', () => load(t => (t >= 0 ? Math.exp(-t) : 0)));
    ui.button('پله', () => load(t => (t >= 0 ? 1 : 0)));
    ui.button('پاک کردن', () => load(() => 0));
    load(t => t ** 3 - t + 1);
    const st = L.stats();
    L.after(() => {
      let Ee = 0, Eo = 0, Ex = 0; for (let i = 0; i < 161; i++) { Ee += ev(i) ** 2; Eo += od(i) ** 2; Ex += ys[i] ** 2; }
      const d = 4 / 160;
      st({ 'انرژی x': S.fmt(Ex * d, 2), 'انرژی زوج': S.fmt(Ee * d, 2), 'انرژی فرد': S.fmt(Eo * d, 2), 'جمع دو بخش': S.fmt((Ee + Eo) * d, 2) });
    });
  });

  S.lab('complex-plane', L => {
    let z1 = [1, 2], z2 = [2, 3], op = 'add', hold = 0;
    const res = () => {
      const [a, b] = z1, [c, d] = z2;
      if (op === 'add') return [a + c, b + d];
      if (op === 'sub') return [a - c, b - d];
      if (op === 'mul') return [a * c - b * d, a * d + b * c];
      const q = c * c + d * d || 1e-9; return [(a * c + b * d) / q, (b * c - a * d) / q];
    };
    const row = L.row();
    const p = L.plot({ height: 330, x: [-6, 6], y: [-6, 6], equal: true, xlabel: 'Re', ylabel: 'Im', title: 'دو نقطهٔ آبی و قرمز را بکش', draw: q => {
      const r = res();
      if (op === 'add' || op === 'sub') {
        const s = op === 'sub' ? -1 : 1;
        q.seg(z1[0], z1[1], r[0], r[1], { color: 'h', w: 1, dash: [4, 4] });
        q.seg(z2[0] * s, z2[1] * s, r[0], r[1], { color: 'x', w: 1, dash: [4, 4] });
        if (s < 0) q.arrow(0, 0, -z2[0], -z2[1], { color: 'h', w: 1 });
      }
      q.arrow(0, 0, z1[0], z1[1], { color: 'x' }); q.arrow(0, 0, z2[0], z2[1], { color: 'h' }); q.arrow(0, 0, r[0], r[1], { color: 'y', w: 2.6 });
      q.dot(z1[0], z1[1], { color: 'x' }); q.dot(z2[0], z2[1], { color: 'h' });
      q.text(z1[0], z1[1], 'z₁', { dy: -12, color: 'x' }); q.text(z2[0], z2[1], 'z₂', { dy: -12, color: 'h' }); q.text(r[0], r[1], 'نتیجه', { dy: -12, color: 'y', font: '12px Vazirmatn' });
    } }, row);
    p.pointer({ cursor: 'grab',
      down: (x, y) => { hold = Math.hypot(x - z1[0], y - z1[1]) < Math.hypot(x - z2[0], y - z2[1]) ? 1 : 2; set(x, y); },
      move: (x, y) => set(x, y) });
    const set = (x, y) => { const v = [Math.round(x * 4) / 4, Math.round(y * 4) / 4]; if (hold === 1) z1 = v; else z2 = v; L.update(); };
    const side = L.div('', '', row);
    const ui = L.controls(side);
    ui.seg('عمل', [['add', 'جمع'], ['sub', 'تفریق'], ['mul', 'ضرب'], ['div', 'تقسیم']], op, v => { op = v; });
    const st = L.stats(side), note = L.note(side);
    const pol = z => `${S.fmt(Math.hypot(z[0], z[1]))} ∠ ${S.fmt(Math.atan2(z[1], z[0]) * 180 / PI, 1)}°`;
    L.after(() => {
      const r = res();
      st({ 'z₁': S.cfmt(z1[0], z1[1]), 'قطبی z₁': pol(z1), 'z₂': S.cfmt(z2[0], z2[1]), 'قطبی z₂': pol(z2), 'نتیجه': S.cfmt(r[0], r[1]), 'قطبی نتیجه': pol(r) });
      note(op === 'mul' ? 'در ضرب <b>اندازه‌ها در هم ضرب</b> و <b>زاویه‌ها با هم جمع</b> می‌شوند. برای همین شکل قطبی برای ضرب راحت‌تر است.' : op === 'div' ? 'در تقسیم اندازه‌ها تقسیم و زاویه‌ها از هم کم می‌شوند.' : 'جمع و تفریق مؤلفه‌به‌مؤلفه‌اند و مثل قانون متوازی‌الاضلاع برای بردارها عمل می‌کنند.');
    });
  });

  S.quiz('ch1', [
    { q: 'سیگنال $x(t)=t$ روی $0\\le t\\le 3$ تعریف شده. $x(2t-3)$ روی چه بازه‌ای غیرصفر است؟', o: ['$[1.5,\\,3]$', '$[-3,\\,0]$', '$[0,\\,1.5]$', '$[3,\\,9]$'], a: 0, e: 'کافی است $0\\le 2t-3\\le 3$ را حل کنی. همین مثال در تمرین ۱.۵ آمده و می‌توانی آن را در آزمایشگاه عملیات زمانی ببینی.' },
    { q: 'چرا $x[2n]$ با $x[n]$ اطلاعات یکسانی ندارد، ولی $x(2t)$ با $x(t)$ دارد؟', o: ['چون در حالت گسسته نمونه‌های فرد حذف می‌شوند', 'چون $x(2t)$ سریع‌تر است', 'چون سیگنال گسسته انرژی ندارد', 'هر دو اطلاعات یکسانی دارند'], a: 0, e: 'زمان گسسته فقط اعداد صحیح است. وقتی $2n$ را می‌سازی به نمونه‌های فرد نمی‌رسی و آن‌ها از بین می‌روند.' },
    { q: 'سیگنال $x[n]=\\sin(\\tfrac{6\\pi}{7}n+1)$ دورهٔ تناوب اصلی‌اش چند است؟', o: ['۷', '۳', '$7/3$', 'متناوب نیست'], a: 0, e: '$\\Omega_0N=2\\pi m$ باید با $N$ صحیح برقرار باشد: $N=7m/3$ و کوچک‌ترین جواب $m=3,\\,N=7$ است.' },
    { q: 'سیگنال $\\cos(n)$ در زمان گسسته چطور؟', o: ['متناوب نیست', 'دورهٔ $2\\pi$ دارد', 'دورهٔ ۶ دارد', 'دورهٔ ۱ دارد'], a: 0, e: 'دوره باید عدد صحیح باشد و $2\\pi m$ به‌ازای هیچ $m$ صحیحی صحیح نمی‌شود.' },
    { q: 'سیگنال پلهٔ واحد $u(t)$ در کدام دسته است؟', o: ['سیگنال توان با $P_\\infty=1/2$', 'سیگنال انرژی با $E_\\infty=1$', 'سیگنال انرژی با $E_\\infty=1/2$', 'نه انرژی، نه توان'], a: 0, e: 'انرژی بی‌نهایت است ولی در پنجرهٔ $[-T,T]$ میانگین به $T/(2T)=1/2$ میل می‌کند.' },
    { q: 'حاصل $z_1z_2$ برای $z_1=2e^{j\\pi/2}$ و $z_2=2e^{j\\pi}$ چیست؟', o: ['$4e^{j3\\pi/2}$', '$4e^{j\\pi^2/2}$', '$2e^{j3\\pi/2}$', '$4e^{j\\pi/2}$'], a: 0, e: 'اندازه‌ها ضرب و زاویه‌ها جمع می‌شوند.' },
  ]);
})();
