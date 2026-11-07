(function () {
  const S = SS, PI = Math.PI;

  /* هر سیستم تابعی از (x, n) است؛ x خودش تابعی از زمان گسسته است. */
  const accum = (x, n) => { let s = 0; for (let k = Math.max(-300, n - 600); k <= n; k++) s += x(k); return s; };
  const SYS = {
    gain: { n: '2x[n]', f: (x, n) => 2 * x(n) },
    delay: { n: 'x[n−1]', f: (x, n) => x(n - 1) },
    diff: { n: 'x[n]−x[n−1]', f: (x, n) => x(n) - x(n - 1) },
    avg: { n: '(x[n]+x[n−1])/2', f: (x, n) => (x(n) + x(n - 1)) / 2 },
    sq: { n: 'x²[n]', f: (x, n) => x(n) ** 2 },
    nx: { n: 'n·x[n]', f: (x, n) => n * x(n) },
    acc: { n: 'Σ x[k] انباشتگر', f: accum },
  };

  S.lab('connect', L => {
    let a = 'sq', b = 'delay', topo = 'series';
    const x0 = { '-2': 1, '-1': 2, 0: -1, 1: 2, 2: .5, 3: -1.5 };
    const x = n => x0[n] || 0;
    const seq = f => n => f(x, n);
    const ns = S.range(-4, 12);
    const ab = n => SYS[b].f(m => SYS[a].f(x, m), n), ba = n => SYS[a].f(m => SYS[b].f(x, m), n), par = n => SYS[a].f(x, n) + SYS[b].f(x, n);
    const dg = L.div('');
    const row = L.row();
    const scale = vs => Math.max(2, ...vs.map(Math.abs)) * 1.15;
    L.plot({ height: 160, x: [-4.5, 12.5], y: [-3, 3], intX: true, xlabel: 'n', ylabel: 'x[n]', title: 'ورودی', draw: p => p.stem(ns, ns.map(x), { color: 'x' }) }, row);
    L.plot({ height: 160, x: [-4.5, 12.5], y: [-3, 3], intX: true, xlabel: 'n', ylabel: 'y[n]', title: 'خروجی', draw: p => {
      if (topo === 'series') {
        const v1 = ns.map(ab), v2 = ns.map(ba), m = scale([...v1, ...v2]); p.setY(-m, m); p.begin();
        p.stem(ns, v1, { color: 'y', dx: -2.5 }); p.stem(ns, v2, { color: 'h', hollow: true, dx: 2.5 });
      } else { const v = ns.map(par), m = scale(v); p.setY(-m, m); p.begin(); p.stem(ns, v, { color: 'y' }); }
    } }, row);
    const lg = L.legend([['y', 'S₁ بعد S₂ (یا موازی)'], ['h', 'S₂ بعد S₁']]);
    const ui = L.controls();
    const opts = Object.keys(SYS).map(k => [k, SYS[k].n]);
    ui.seg('اتصال', [['series', 'سری'], ['par', 'موازی']], topo, v => { topo = v; });
    ui.select('سیستم $S_1$', opts, a, v => { a = v; });
    ui.select('سیستم $S_2$', opts, b, v => { b = v; });
    const note = L.note();
    const box = (t, x2, y, w = 112) => `<rect class="box" x="${x2}" y="${y}" width="${w}" height="34" rx="4"/><text x="${x2 + w / 2}" y="${y + 22}" text-anchor="middle" style="font-style:normal;font-family:Vazirmatn;font-size:12.5px">${t}</text>`;
    const wire = pts => `<polyline class="wire" points="${pts}"/>`;
    L.after(() => {
      lg.style.display = topo === 'series' ? '' : 'none';
      dg.innerHTML = topo === 'series'
        ? `<svg class="diagram" viewBox="0 0 520 56" role="img" aria-label="اتصال سری">${wire('34,28 86,28')}${box(SYS[a].n, 86, 11, 150)}${wire('236,28 284,28')}${box(SYS[b].n, 284, 11, 150)}${wire('434,28 486,28')}<text x="8" y="33">x[n]</text><text x="490" y="33">y[n]</text></svg>`
        : `<svg class="diagram" viewBox="0 0 520 96" role="img" aria-label="اتصال موازی">${wire('34,48 70,48')}${wire('70,24 70,72')}${wire('70,24 130,24')}${wire('70,72 130,72')}${box(SYS[a].n, 130, 7, 190)}${box(SYS[b].n, 130, 55, 190)}${wire('320,24 402,24 402,36')}${wire('320,72 402,72 402,60')}<circle class="box" cx="402" cy="48" r="12"/><text x="402" y="53" text-anchor="middle">+</text>${wire('414,48 486,48')}<text x="8" y="53">x[n]</text><text x="490" y="53">y[n]</text></svg>`;
      const same = ns.every(n => Math.abs(ab(n) - ba(n)) < 1e-9);
      note(topo === 'series' ? (same ? 'برای این ورودی ترتیب مهم نبود. دو سیستم <b>LTI</b> در اتصال سری همیشه جابه‌جاپذیرند.' : 'ترتیب سیستم‌ها جواب را عوض کرد! جابه‌جایی فقط وقتی تضمین شده است که هر دو سیستم LTI باشند.') : 'در اتصال موازی خروجی‌ها با هم جمع می‌شوند: $y[n]=S_1\\{x[n]\\}+S_2\\{x[n]\\}$.');
    });
    void seq;
  });

  /* آزمون عددی خواص */
  const PRESETS = [
    { n: 'y[n] = 2x[n] + 3 (تمرین ۳.۱۵)', e: '2*x[n]+3', inv: true },
    { n: 'y[n] = n·x[n] (نظیر تمرین ۳.۱۶)', e: 'n*x[n]' },
    { n: 'y[n] = x²[n] + 1 (نظیر تمرین ۳.۴)', e: 'x[n]^2+1' },
    { n: 'y[n] = cos(x[n]) (نظیر تمرین ۳.۷)', e: 'cos(x[n])' },
    { n: 'y[n] = x²[n] + n·x[n] (تمرین ۳.۱۴)', e: 'x[n]^2+n*x[n]' },
    { n: 'y[n] = cos(πn/2)·x[n] (تمرین ۳.۱۷)', e: 'cos(pi*n/2)*x[n]' },
    { n: 'y[n] = x[n−2] (تمرین ۳.۱۰)', e: 'x[n-2]', inv: true },
    { n: 'y[n] = x[n] − x[n−1] (تمرین ۳.۱۸)', e: 'x[n]-x[n-1]' },
    { n: 'میانگین: (x[n]+x[n−1]+x[n−2])/3 (نظیر ۳.۶)', e: '(x[n]+x[n-1]+x[n-2])/3' },
    { n: 'پیش‌بینی: x[n+1]', e: 'x[n+1]', inv: true },
    { n: 'y[n] = x[3n] (نظیر تمرین ۳.۲)', e: 'x[3*n]' },
    { n: 'y[n] = 2·exp(x[n]) (تمرین ۳.۱۲)', e: '2*exp(x[n])' },
    { n: 'انباشتگر: Σ x[k] (تمرین ۳.۱۱)', acc: true, e: 'sum', inv: true },
  ];
  const compile = src => {
    if (src === 'sum') return accum;
    const s = src.replace(/\s+/g, '');
    if (!s || !/^(?:x\[|n|pi|cos|sin|exp|abs|sqrt|[0-9.+\-*/^()\]])+$/.test(s)) return null;
    const js = s.replace(/x\[/g, 'x(').replace(/\]/g, ')').replace(/\^/g, '**').replace(/pi/g, 'Math.PI').replace(/\b(cos|sin|exp|abs|sqrt)\(/g, 'Math.$1(');
    try { const f = new Function('x', 'n', '"use strict";return (' + js + ');'); f(() => 1, 1); return f; } catch (e) { return null; }
  };

  S.lab('property-tester', L => {
    let sysF = compile(PRESETS[0].e), seed = 7, tab = 'lin', res = {};
    const NS = S.range(-20, 20);
    const mkSig = (r, amp = 2, sup = 12) => { const m = {}; for (let n = -sup; n <= sup; n++) m[n] = (r() - .5) * 2 * amp; return n => m[n] || 0; };
    const y = (x, n) => sysF(x, n);
    const cmp = (a, b, ns = NS) => ns.every(n => { const A = a(n), B = b(n); return (!isFinite(A) && !isFinite(B)) || Math.abs(A - B) < 1e-7 * (1 + Math.abs(A)); });

    const tests = () => {
      const out = {}, r = S.rng(seed * 2654435 + 11);
      const x1 = mkSig(r), x2 = mkSig(r), a = 1.5, b = -.7, n0 = 3;
      const mix = n => a * x1(n) + b * x2(n);
      /* خطی بودن */
      const L1 = n => y(mix, n), L2 = n => a * y(x1, n) + b * y(x2, n);
      out.lin = { ok: cmp(L1, L2), plots: [['S{1.5x₁ − 0.7x₂}', L1, 'y'], ['1.5·S{x₁} − 0.7·S{x₂}', L2, 'h']], msg: 'اگر دو خروجی روی هم بیفتند، جمع‌آثار برقرار است.' };
      /* تغییرناپذیری با زمان */
      const sh = n => x1(n - n0), T1 = n => y(sh, n), T2 = n => y(x1, n - n0);
      out.ti = { ok: cmp(T1, T2), plots: [['S{x[n−3]}', T1, 'y'], ['y[n−3]', T2, 'h']], msg: 'اول ورودی را شیفت بده یا خروجی را شیفت بده؛ در سیستم تغییرناپذیر با زمان فرقی نباید بماند.' };
      /* حافظه: همه چیز به‌جز n=4 عوض می‌شود */
      const P = 4, mr = S.rng(seed + 91);
      let mem = false;
      for (let t = 0; t < 8 && !mem; t++) { for (const pt of [P, -3, 1, 0]) { const w = mkSig(mr), keep = n => (n === pt ? x1(n) : w(n)); if (Math.abs(y(keep, pt) - y(x1, pt)) > 1e-7) mem = true; } }
      const wm = mkSig(S.rng(seed + 5)), xm = n => (n === P ? x1(n) : wm(n));
      out.mem = { ok: !mem, plots: [['y[n] برای x', n => y(x1, n), 'y'], ['y[n] وقتی همه‌چیز به‌جز n=4 عوض شود', n => y(xm, n), 'h']], mark: P, msg: 'در سیستم بی‌حافظه خروجی در n=4 فقط به همان نمونهٔ ورودی بستگی دارد، پس باید ثابت بماند.' };
      /* علیت */
      let cau = true; const cr = S.rng(seed + 33);
      for (let t = 0; t < 10 && cau; t++) { for (const pt of [-3, 0, 2, 5]) { const w = mkSig(cr), fut = n => (n <= pt ? x1(n) : w(n)); if (Math.abs(y(fut, pt) - y(x1, pt)) > 1e-7) { cau = false; break; } } }
      const wc = mkSig(S.rng(seed + 8)), xc = n => (n <= 0 ? x1(n) : wc(n));
      out.cau = { ok: cau, plots: [['y[n] برای x', n => y(x1, n), 'y'], ['y[n] وقتی فقط آیندهٔ n>0 عوض شود', n => y(xc, n), 'h']], mark: 0, cutLeft: true, msg: 'سیستم علّی به آینده نگاه نمی‌کند، پس برای n≤0 دو خروجی باید یکی باشند.' };
      /* پایداری: ورودی‌های کران‌دار با پنجره‌های بزرگ‌شونده */
      const inputs = [n => (n >= 0 ? 1 : 0), n => Math.cos(.7 * n), n => (n % 2 ? -1 : 1)];
      const mx = (x, R) => { let m = 0; for (let n = -R; n <= R; n += R > 80 ? 3 : 1) { const v = Math.abs(y(x, n)); if (v > m) m = v; if (!isFinite(v)) return Infinity; } return m; };
      let worst = 0; inputs.forEach(x => { const a1 = mx(x, 40), a2 = mx(x, 240); worst = Math.max(worst, a2 / (a1 + 1e-9)); if (!isFinite(a2)) worst = Infinity; });
      out.stb = { ok: worst < 1.5, plots: [['خروجی برای ورودی پلهٔ کران‌دار', n => y(inputs[0], n), 'y']], msg: 'ورودی کران‌دار می‌دهیم و پنجره را بزرگ می‌کنیم. اگر قدر مطلق خروجی رشد کند، سیستم BIBO پایدار نیست.' };
      /* وارون‌پذیری: جست‌وجوی دو ورودی متفاوت با خروجی یکسان */
      const cand = [];
      cand.push([n => -x1(n), 'قرینهٔ x']);
      cand.push([n => (Math.abs(n) <= 12 ? x1(n) + 2 * PI : x1(n)), 'x + 2π']);
      for (const k of [0, 1, -1, 2, 3, 5]) cand.push([n => (n === k ? x1(n) + 1.3 : x1(n)), `x با یک نمونهٔ عوض‌شده در n=${k}`]);
      cand.push([n => -x1(n) - n, '−x − n']);
      let coll = null;
      for (const [w, d] of cand) { if (cmp(n => y(x1, n), n => y(w, n), S.range(-30, 30))) { coll = [w, d]; break; } }
      out.inv = { ok: !coll, plots: coll ? [['y[n] برای x', n => y(x1, n), 'y'], ['y[n] برای ' + coll[1], n => y(coll[0], n), 'h']] : [['ورودی x', x1, 'x'], ['خروجی y', n => y(x1, n), 'y']], msg: coll ? 'دو ورودی متفاوت خروجی یکسان دادند، پس از روی خروجی نمی‌شود ورودی را برگرداند.' : 'در این جست‌وجو دو ورودی با خروجی یکسان پیدا نشد. این نشانهٔ وارون‌پذیری است ولی اثبات نیست؛ برای اثبات باید سیستم وارون را بنویسی.', soft: true };
      return out;
    };

    const ui = L.controls();
    const sel = ui.select('یک سیستم از کتاب انتخاب کن', PRESETS.map((p, i) => [i, p.n]), 0, v => { const p = PRESETS[+v]; if (p.e !== 'sum') tx.set(p.e); else tx.set(''); sysF = compile(p.e); });
    const tx = ui.text('یا خودت بنویس (مثلاً x[n-1]*n + sin(x[n]))', PRESETS[0].e, v => { const f = compile(v); if (f) sysF = f; bad.textContent = f ? '' : 'این عبارت را نفهمیدم. فقط x[…]، n، عدد، + − * / ^ و cos sin exp abs sqrt pi مجاز است.'; });
    ui.button('ورودی تصادفی جدید', () => { seed++; });
    const bad = L.div('hint');
    const V = L.div('verdicts');
    const names = { lin: 'خطی', ti: 'تغییرناپذیر با زمان', mem: 'بی‌حافظه', cau: 'علّی', stb: 'پایدار BIBO', inv: 'وارون‌پذیر' };
    const cards = {};
    Object.keys(names).forEach(k => {
      const b = S.mk('button', 'v-card'); b.type = 'button'; b.innerHTML = `<b>${names[k]}</b><span></span>`;
      b.addEventListener('click', () => { tab = k; L.update(); });
      V.appendChild(b); cards[k] = b;
    });
    const msg = L.note();
    const ns = S.range(-16, 16);
    const P = L.plot({ height: 210, x: [-16.5, 16.5], y: [-3, 3], intX: true, xlabel: 'n', draw: p => {
      const t = res[tab]; if (!t) return;
      const vs = t.plots.map(q => ns.map(n => q[1](n)));
      const m = Math.max(1, ...vs.flat().filter(isFinite).map(Math.abs)) * 1.15; p.setY(-m, m); p.begin();
      if (t.mark != null) { t.cutLeft ? p.band(-16.5, t.mark + .5, 'b', .1) : p.vline(t.mark, { color: 'b', w: 1.5 }); }
      t.plots.forEach((q, i) => p.stem(ns, vs[i], { color: q[2], hollow: i === 1, r: i === 1 ? 4.6 : 3, dx: 0 }));
    } });
    const lg = L.div('legend');
    L.after(() => {
      /* نمودار قبل از محاسبهٔ نتایج رسم می‌شود، پس نتایج را جلوتر می‌سازیم */
      try { res = tests(); } catch (e) { res = {}; }
      Object.keys(names).forEach(k => {
        const c = cards[k], r = res[k]; if (!r) return;
        c.className = 'v-card ' + (r.ok ? (r.soft ? 'maybe' : 'yes') : 'no');
        c.querySelector('span').textContent = r.ok ? (r.soft ? 'احتمالاً بله' : 'بله') : 'خیر';
        c.setAttribute('aria-pressed', String(k === tab));
      });
      if (res[tab]) {
        msg(res[tab].msg);
        lg.innerHTML = res[tab].plots.map(q => `<span class="lg"><i style="background:${S.col(q[2])}"></i><b dir="ltr">${q[0]}</b></span>`).join('');
      }
      P.render();
    });
    void sel;
  });

  S.lab('blocks-ops', L => {
    const inp = {
      sin: t => Math.sin(t), pulse: t => (t > -1 && t < 2 ? 1 : 0),
      tri: t => (Math.abs(t) < 2 ? 1 - Math.abs(t) / 2 : 0), exp: t => (t >= 0 ? Math.exp(-t) : 0),
    };
    let k = 'tri', op = 'int', A = 2;
    const dt = .01, ts = S.linspace(-6, 6, 1201);
    const output = () => {
      const f = inp[k], x = ts.map(f);
      if (op === 'gain') return x.map(v => A * v);
      if (op === 'add') return x.map((v, i) => v + Math.cos(2 * ts[i]) * .5);
      if (op === 'mul') return x.map((v, i) => v * Math.cos(4 * ts[i]));
      if (op === 'int') { let s = 0; return x.map(v => (s += v * dt)); }
      if (op === 'dif') return x.map((v, i) => (i ? (v - x[i - 1]) / dt : 0));
      if (op === 'del') return ts.map(t => f(t - A));
      return ts.map(t => f(t + A));
    };
    L.plot({ height: 150, x: [-6, 6], y: [-1.3, 1.3], xlabel: 't', ylabel: 'x(t)', title: 'ورودی', draw: p => p.fn(inp[k], { color: 'x', q: 2 }) });
    L.plot({ height: 170, x: [-6, 6], y: [-2, 2], xlabel: 't', ylabel: 'y(t)', title: 'خروجی بلوک', draw: p => { const y = output(); p.autoY(y.map(v => S.clamp(v, -8, 8)), 2); p.begin(); p.line(ts, y, { color: 'y' }); } });
    const ui = L.controls();
    ui.select('بلوک', [['gain', 'ضرب‌کنندهٔ اسکالر: A·x'], ['add', 'جمع‌کننده: x + ½cos 2t'], ['mul', 'ضرب‌کننده: x·cos 4t'], ['int', 'انتگرال‌گیر'], ['dif', 'مشتق‌گیر'], ['del', 'تأخیر: x(t−A)'], ['adv', 'پیش‌برنده: x(t+A)']], op, v => { op = v; });
    ui.select('ورودی', [['tri', 'مثلث'], ['pulse', 'پالس'], ['sin', 'سینوس'], ['exp', 'نمایی میرا']], k, v => { k = v; });
    ui.slider('$A$', { min: -3, max: 3, step: .1, value: A }, v => { A = v; });
    const note = L.note();
    const T = { gain: 'بی‌حافظه، خطی، تغییرناپذیر با زمان.', add: 'بی‌حافظه. با سیگنال دوم که ورودی نیست، این نمایش خطی نیست ولی خود جمع‌کننده بلوک خطی است.', mul: 'ضرب در سیگنال معلوم بی‌حافظه و خطی است ولی به زمان وابسته. این همان مدولاسیون است.', int: 'حافظه دارد چون گذشتهٔ ورودی را جمع می‌کند. علّی است ولی BIBO پایدار نیست: ورودی پله خروجی بی‌کران می‌دهد.', dif: 'مشتق پرش‌های ورودی را به ضربهٔ بزرگ تبدیل می‌کند، پس پایدار نیست. مقدار خروجی روی پرش به دقت گام عددی بستگی دارد.', del: 'حافظه دارد. برای $A>0$ علّی است.', adv: 'برای $A>0$ به آینده نگاه می‌کند، پس علّی نیست و به‌طور بلادرنگ قابل پیاده‌سازی نیست.' };
    L.after(() => note(T[op]));
  });

  S.lab('neuron', L => {
    let w1 = 1, w2 = 1, th = 1.5, x1 = 1, x2 = 1;
    const out = (a, b) => (w1 * a + w2 * b - th >= 0 ? 1 : 0);
    const row = L.row();
    const p = L.plot({ height: 290, x: [-.25, 1.25], y: [-.25, 1.25], equal: true, xlabel: 'x₁', ylabel: 'x₂', title: 'نقطهٔ ورودی را بکش. ناحیهٔ رنگی یعنی نورون شلیک می‌کند', draw: q => {
      const g = q.g, st = 4; g.fillStyle = S.alpha('y', .22);
      for (let px = q.L; px < q.R; px += st) for (let py = q.T; py < q.B; py += st) if (out(q.iX(px + 2), q.iY(py + 2))) g.fillRect(px, py, st, st);
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => { q.dot(a, b, { color: out(a, b) ? 'y' : 'h', r: 6 }); q.text(a, b, String(out(a, b)), { dy: -15, font: '700 13px monospace' }); });
      q.dot(x1, x2, { color: 'x', r: 6 });
    } }, row);
    p.pointer({ cursor: 'grab', down: (a, b) => set(a, b), move: (a, b) => set(a, b) });
    const set = (a, b) => { x1 = S.clamp(a, -.25, 1.25); x2 = S.clamp(b, -.25, 1.25); L.update(); };
    const side = L.div('', '', row);
    const ui = L.controls(side);
    const a = ui.slider('وزن $w_1$', { min: -2, max: 2, step: .1, value: w1 }, v => { w1 = v; });
    const b = ui.slider('وزن $w_2$', { min: -2, max: 2, step: .1, value: w2 }, v => { w2 = v; });
    const c = ui.slider('آستانه $\\theta$', { min: -2, max: 3, step: .1, value: th }, v => { th = v; });
    const set3 = (A, B, C) => { a.set(A); b.set(B); c.set(C); w1 = A; w2 = B; th = C; };
    ui.button('AND', () => set3(1, 1, 1.5)); ui.button('OR', () => set3(1, 1, .5)); ui.button('NAND', () => set3(-1, -1, -1.5));
    const st = L.stats(side), note = L.note(side);
    L.after(() => {
      const s = w1 * x1 + w2 * x2;
      st({ 'جمع وزن‌دار $\\sum w_ix_i$': S.fmt(s, 2), 'خروجی $u(\\sum w_ix_i-\\theta)$': s - th >= 0 ? '1' : '0' });
      note('هیچ ترکیبی از وزن‌ها XOR نمی‌سازد، چون یک خط نمی‌تواند $(0,1)$ و $(1,0)$ را از $(0,0)$ و $(1,1)$ جدا کند. برای همین به شبکه‌ای از نورون‌ها نیاز داریم.');
    });
  });

  S.quiz('ch3', [
    { q: 'سیستم $y(t)=tx(t)$ چگونه است؟', o: ['خطی ولی متغیر با زمان', 'غیرخطی و تغییرناپذیر با زمان', 'خطی و تغییرناپذیر با زمان', 'غیرعلی'], a: 0, e: 'ضریب $t$ به ورودی وابسته نیست، پس خطی است؛ ولی شیفت ورودی ضریب را شیفت نمی‌دهد.' },
    { q: 'آیا $y(t)=ax(t)+b$ با $b\\ne0$ خطی است؟', o: ['نه، چون ورودی صفر خروجی صفر نمی‌دهد', 'بله، چون رابطهٔ خط است', 'فقط برای $a=1$', 'فقط برای $t>0$'], a: 0, e: 'شرط لازم خطی بودن: صفر در ورودی باید صفر در خروجی بدهد. این سیستم «آفین» است.' },
    { q: 'سیستم $y[n]=x[n+1]$ چگونه است؟', o: ['غیرعلی و با حافظه', 'علی و بی‌حافظه', 'علی و با حافظه', 'غیرعلی و بی‌حافظه'], a: 0, e: 'خروجی به نمونهٔ بعدی ورودی نیاز دارد، پس هم آینده را می‌بیند و هم حافظه دارد.' },
    { q: 'چرا انباشتگر $y[n]=\\sum_{k\\le n}x[k]$ پایدار BIBO نیست؟', o: ['چون برای ورودی پله خروجی بی‌کران می‌شود', 'چون وارون‌پذیر نیست', 'چون غیرخطی است', 'چون حافظه دارد'], a: 0, e: 'ورودی $u[n]$ کران‌دار است ولی خروجی $(n+1)u[n]$ بی‌نهایت رشد می‌کند. داشتن حافظه به‌تنهایی مانع پایداری نیست.' },
    { q: 'برای اثبات وارون‌ناپذیری $y(t)=\\cos x(t)$ کافی است …', o: ['دو ورودی متفاوت با خروجی یکسان پیدا کنی', 'نشان دهی غیرخطی است', 'نشان دهی حافظه ندارد', 'آن را مشتق بگیری'], a: 0, e: 'مثلاً $x$ و $x+2\\pi$ خروجی یکسان می‌دهند.' },
    { q: 'نورون رُزنبلات با تابع پله چه نوع سیستمی است؟', o: ['غیرخطی', 'خطی', 'انتگرال‌گیر', 'تأخیردهنده'], a: 0, e: 'جمع وزن‌دار خطی است، ولی عبور از تابع پله غیرخطی است.' },
  ]);
})();
