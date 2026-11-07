(function () {
  const S = SS, PI = Math.PI;
  const mod = (a, n) => ((a % n) + n) % n;
  const order = N => { const o = [0]; for (let k = 1; o.length < N; k++) { o.push(k); if (o.length < N) o.push(N - k); } return o; };

  S.lab('dfs-editor', L => {
    let N = 8, M = 8; const x = new Array(24).fill(0);
    const load = (n, f) => { N = n; for (let i = 0; i < 24; i++) x[i] = i < n ? f(i) : 0; sN.set(n); M = n; sM.set(n); sM.range(1, n); bind(); };
    const base = () => x.slice(0, N);
    const rec = (n, c) => { let s = 0; order(N).slice(0, M).forEach(k => { const a = c[k], w = 2 * PI * k * n / N; s += a[0] * Math.cos(w) - a[1] * Math.sin(w); }); return s; };
    let ed = [];
    const P = L.plot({ height: 180, x: [-8.5, 16.5], y: [-2.3, 2.3], intX: true, xlabel: 'n', ylabel: 'x[n]', title: 'نمونه‌های یک دوره (نوار رنگی) را بکش؛ بقیه خودشان تکرار می‌شوند', draw: p => {
      p.setX(-N - .5, 2 * N - .5); const vals = base(), m = Math.max(1.5, ...vals.map(Math.abs)) * 1.2; p.setY(-m, m); p.begin();
      p.band(-.5, N - .5, 'b', .1);
      const ns = S.range(-N, 2 * N - 1), c = S.dfs(vals);
      p.stem(ns, ns.map(n => vals[mod(n, N)]), { color: 'x', r: 3.4 });
      p.stem(ns, ns.map(n => rec(mod(n, N), c)), { color: 'h', r: 5, hollow: true, w: .5 });
    } });
    const bind = () => { ed.length = 0; S.range(0, N - 1).forEach(n => ed.push(n)); };
    P.editStems(ed, x, L.update, { snap: .25 });
    const row = L.row();
    const Ks = () => S.range(-N, 2 * N - 1);
    L.plot({ height: 150, x: [-8.5, 16.5], y: [0, 1], intX: true, xlabel: 'k', ylabel: '|aₖ|', title: 'ضرایب هم با همان دوره تکرار می‌شوند', draw: p => {
      p.setX(-N - .5, 2 * N - .5); const c = S.dfs(base()), K = Ks(), v = K.map(k => Math.hypot(...c[mod(k, N)])); p.autoY(v, .4); p.begin(); p.band(-.5, N - .5, 'b', .1); p.stem(K, v, { color: 'y', r: 3 });
    } }, row);
    L.plot({ height: 150, x: [-8.5, 16.5], y: [-PI, PI], ypi: true, intX: true, xlabel: 'k', ylabel: '∠aₖ', draw: p => {
      p.setX(-N - .5, 2 * N - .5); const c = S.dfs(base()), K = Ks(); p.band(-.5, N - .5, 'b', .1); p.stem(K, K.map(k => { const q = c[mod(k, N)]; return Math.hypot(...q) < 1e-6 ? NaN : Math.atan2(q[1], q[0]); }), { color: 'a', r: 3 });
    } }, row);
    L.legend([['x', 'سیگنال'], ['h', 'بازسازی با $M$ ضریب']]);
    const ui = L.controls();
    const sN = ui.slider('دوره $N$', { min: 2, max: 24, step: 1, value: N }, v => { N = v; sM.range(1, N); if (M > N) M = N; sM.set(M); bind(); });
    const sM = ui.slider('تعداد ضریب $M$', { min: 1, max: N, step: 1, value: M }, v => { M = v; });
    ui.button('تمرین ۷.۳: مربعی N=11', () => load(11, n => (mod(n + 2, 11) <= 4 ? 1 : 0)));
    ui.button('تمرین ۷.۱: sin(0.1πn)', () => load(20, n => Math.sin(.1 * PI * n)));
    ui.button('نظیر ۷.۲: جمع سه مؤلفه', () => load(10, n => 1 + Math.sin(2 * PI * n / 10) + Math.cos(4 * PI * n / 10 + PI / 2)));
    ui.button('قطارضربه', () => load(8, n => (n === 0 ? 1 : 0)));
    load(8, n => (n < 3 ? 1 : 0));
    const st = L.stats(), note = L.note();
    L.after(() => {
      const c = S.dfs(base()); let e = 0; base().forEach((v, n) => { e += (v - rec(n, c)) ** 2; });
      let px = 0, ps = 0; base().forEach(v => { px += v * v; }); c.forEach(q => { ps += q[0] ** 2 + q[1] ** 2; });
      st({ 'خطای بازسازی': S.fmt(Math.sqrt(e / N), 4), 'پارسوال: $\\frac1N\\sum|x|^2$': S.fmt(px / N, 3), '$\\sum|a_k|^2$': S.fmt(ps, 3) });
      note(M === N ? `با $M=N=${N}$ ضریب، بازسازی <b>دقیق</b> است. هیچ پدیدهٔ گیبسی نیست، چون فضا فقط $N$ بعد دارد.` : `هنوز ${N - M} ضریب از ${N} ضریب مانده. $M$ را تا $N$ بالا ببر.`);
    });
  });

  S.lab('dt-square', L => {
    let N = 11, N1 = 2;
    const a = k => { const r = mod(k, N); return r === 0 ? (2 * N1 + 1) / N : Math.sin(2 * PI * k * (N1 + .5) / N) / (N * Math.sin(PI * k / N)); };
    L.plot({ height: 140, x: [-22, 22], y: [-.2, 1.3], intX: true, xlabel: 'n', ylabel: 'x[n]', draw: p => { const ns = S.range(-22, 22); p.stem(ns, ns.map(n => (mod(n + N1, N) <= 2 * N1 ? 1 : 0)), { color: 'x', r: 2.8 }); } });
    const K = S.range(-22, 22);
    L.plot({ height: 180, x: [-22, 22], y: [-.4, 1], intX: true, xlabel: 'k', ylabel: 'aₖ', draw: p => {
      const top = (2 * N1 + 1) / N; p.setY(-.35 * top - .02, top * 1.15); p.begin();
      p.fn(k => (Math.abs(Math.sin(PI * k / N)) < 1e-6 ? top * (Math.cos(PI * k / N) > 0 || (2 * N1 + 1) % 2 ? 1 : -1) : a(k)), { color: 'axis', w: 1, dash: [3, 3], q: .5 });
      p.stem(K, K.map(a), { color: 'y', r: 3 });
    } });
    const ui = L.controls();
    ui.slider('دوره $N$', { min: 5, max: 41, step: 1, value: N }, v => { N = v; if (2 * N1 + 1 > N) N1 = (N - 1) >> 1; s1.set(N1); });
    const s1 = ui.slider('نیم‌پهنا $N_1$', { min: 0, max: 20, step: 1, value: N1 }, v => { N1 = Math.min(v, (N - 1) >> 1); });
    const st = L.stats();
    L.after(() => {
      const X = S.range(0, N - 1).map(n => (mod(n + N1, N) <= 2 * N1 ? 1 : 0)), c = S.dfs(X); let e = 0; c.forEach((q, k) => { e = Math.max(e, Math.abs(q[0] - a(k))); });
      st({ '$a_0=(2N_1+1)/N$': S.fmt((2 * N1 + 1) / N, 3), 'بیشترین اختلاف فرمول با محاسبهٔ مستقیم': e < 1e-9 ? '< 10⁻⁹' : S.fmt(e, 6) });
    });
  });

  S.lab('orth-matrix', L => {
    let N = 6, ck = 1, cl = 2;
    const row = L.row();
    const dim = () => N + 3;
    const M = L.plot({ height: 280, x: [0, 9], y: [0, 9], equal: true, noTicks: true, m: [6, 6, 6, 6], title: 'ستون k و سطر l از گوشه؛ روی خانه‌ها کلیک کن', draw: p => {
      const d = dim(); p.setX(0, d); p.o.x = [0, d]; p.setY(0, d); p.begin();
      const g = p.g;
      for (let k = 0; k < d; k++) for (let l = 0; l < d; l++) {
        let re = 0, im = 0; for (let n = 0; n < N; n++) { const w = 2 * PI * (k - l) * n / N; re += Math.cos(w); im += Math.sin(w); }
        const v = Math.hypot(re, im) / N;
        const x0 = p.X(k), x1 = p.X(k + 1), y0 = p.Y(d - l), y1 = p.Y(d - l - 1);
        g.fillStyle = v > .5 ? S.col('x') : S.col('soft'); g.fillRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2);
        if (k === ck && l === cl) { g.strokeStyle = S.col('h'); g.lineWidth = 2.5; g.strokeRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2); }
      }
    } }, row);
    M.pointer({ cursor: 'pointer', down: (x, y) => { const d = dim(); ck = S.clamp(Math.floor(x), 0, d - 1); cl = S.clamp(d - 1 - Math.floor(y), 0, d - 1); L.update(); } });
    const c = L.div('', '', row);
    L.plot({ height: 130, x: [-.5, 12], y: [-1.3, 1.3], intX: true, xlabel: 'n', title: 'Re Φₖ[n] و Re Φₗ[n]', draw: p => { p.setX(-.5, N - .5); p.begin(); const ns = S.range(0, N - 1); p.stem(ns, ns.map(n => Math.cos(2 * PI * ck * n / N)), { color: 'x', dx: -2 }); p.stem(ns, ns.map(n => Math.cos(2 * PI * cl * n / N)), { color: 'h', dx: 2, hollow: true }); } }, c);
    L.plot({ height: 130, x: [-.5, 12], y: [-1.3, 1.3], intX: true, xlabel: 'n', title: 'Re Φₖ[n]·Φₗ*[n]', draw: p => { p.setX(-.5, N - .5); p.begin(); const ns = S.range(0, N - 1); p.stem(ns, ns.map(n => Math.cos(2 * PI * (ck - cl) * n / N)), { color: 'y' }); } }, c);
    const ui = L.controls();
    ui.slider('دوره $N$', { min: 3, max: 12, step: 1, value: N }, v => { N = v; ck = Math.min(ck, N + 2); cl = Math.min(cl, N + 2); });
    const st = L.stats(), note = L.note();
    L.after(() => {
      let s = 0; for (let n = 0; n < N; n++) s += Math.cos(2 * PI * (ck - cl) * n / N);
      st({ 'k': ck, 'l': cl, '$\\sum\\Phi_k\\Phi_l^*$': S.fmt(s, 3) });
      note(mod(ck - cl, N) === 0 ? (ck === cl ? `قطر اصلی: حاصل $N=${N}$ است.` : `اینجا $k-l$ مضرب $N$ است، پس $\\Phi_k$ و $\\Phi_l$ <b>یک تابع‌اند</b>! خانه‌های آبی بیرون قطر همین را می‌گویند: فقط $N$ پایهٔ متفاوت وجود دارد.`) : 'جمع مقدارهای حاصل‌ضرب صفر می‌شود: این دو پایه متعامدند.');
    });
  });

  S.lab('dt-lti-periodic', L => {
    let ik = 'sin', sy = 'diff', al = .5;
    const IN = {
      sin: ['sin(0.1πn) (تمرین ۷.۶)', 20, n => Math.sin(.1 * PI * n)],
      tr: ['قطارضربه با N=2 (تمرین ۷.۷)', 2, n => (mod(n, 2) === 0 ? 1 : 0)],
      cs: ['cos(2πn/4) (تمرین ۷.۱۴)', 4, n => Math.cos(2 * PI * n / 4)],
      sq: ['مربعی N=11', 11, n => (mod(n + 2, 11) <= 4 ? 1 : 0)],
      mix: ['1 + cos(πn/2) + cos(πn)', 8, n => 1 + Math.cos(PI * n / 2) + Math.cos(PI * n)],
    };
    const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    const cdiv = (a, b) => { const d = b[0] ** 2 + b[1] ** 2; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
    const E = w => [Math.cos(w), -Math.sin(w)];
    const SYS = {
      diff: ['y[n]=x[n]−x[n−1] (تمرین ۷.۶)', w => [1 - E(w)[0], -E(w)[1]], (x, y, n) => x(n) - x(n - 1)],
      ar: ['y[n]+0.5y[n−1]=x[n] (تمرین ۷.۷)', w => cdiv([1, 0], [1 + .5 * E(w)[0], .5 * E(w)[1]]), (x, y, n) => x(n) - .5 * y(n - 1)],
      d2: ['y[n]=x[n−1]−x[n−2] (تمرین ۷.۱۳)', w => [E(w)[0] - E(2 * w)[0], E(w)[1] - E(2 * w)[1]], (x, y, n) => x(n - 1) - x(n - 2)],
      exp: ['h[n]=αⁿu[n] (تمرین ۷.۱۴)', w => cdiv([1, 0], [1 - al * E(w)[0], -al * E(w)[1]]), (x, y, n) => x(n) + al * y(n - 1)],
    };
    const compute = () => {
      const [, N, f] = IN[ik], a = S.dfs(S.range(0, N - 1).map(f)), H = S.range(0, N - 1).map(k => SYS[sy][1](2 * PI * k / N)), b = a.map((c, k) => cmul(c, H[k]));
      const yv = S.range(0, N - 1).map(n => { let s = 0; b.forEach((c, k) => { const w = 2 * PI * k * n / N; s += c[0] * Math.cos(w) - c[1] * Math.sin(w); }); return s; });
      /* شبیه‌سازی مستقیم معادله برای مقایسه */
      const Y = {}; const yf = m => Y[m] || 0, B = 200 * N;
      for (let n = 0; n < B + N; n++) Y[n] = SYS[sy][2](f, yf, n);
      const direct = S.range(0, N - 1).map(n => Y[B + n]);
      return { N, a, H, b, yv, direct, f };
    };
    const row = L.row();
    L.plot({ height: 160, x: [-1, 20], y: [-2, 2], intX: true, xlabel: 'n', title: 'ورودی و خروجی', draw: p => {
      const c = compute(), lim = Math.max(20, 3 * c.N), ns = S.range(0, lim), xv = ns.map(c.f), yv = ns.map(n => c.yv[mod(n, c.N)]);
      p.setX(-1, lim + 1); p.autoY([...xv, ...yv], 1.5); p.begin(); p.stem(ns, xv, { color: 'x', r: 2.6, dx: -1.5 }); p.stem(ns, yv, { color: 'y', r: 2.6, dx: 1.5 });
    } }, row);
    L.plot({ height: 160, x: [-1, 20], y: [0, 1], intX: true, xlabel: 'k', title: '|aₖ| (توخالی) و |bₖ| (پر)', draw: p => {
      const c = compute(), K = S.range(0, c.N - 1); p.setX(-.5, c.N - .5); p.autoY([...c.a.map(q => Math.hypot(...q)), ...c.b.map(q => Math.hypot(...q))], .4); p.begin();
      p.stem(K, c.a.map(q => Math.hypot(...q)), { color: 'x', r: 4.5, hollow: true, w: 1 }); p.stem(K, c.b.map(q => Math.hypot(...q)), { color: 'y', r: 2.8 });
    } }, row);
    const ui = L.controls();
    ui.select('ورودی', Object.keys(IN).map(k => [k, IN[k][0]]), ik, v => { ik = v; });
    ui.select('سیستم', Object.keys(SYS).map(k => [k, SYS[k][0]]), sy, v => { sy = v; });
    ui.slider('$\\alpha$', { min: -.95, max: .95, step: .05, value: al }, v => { al = v; });
    const st = L.stats();
    const tb = L.div('tbl-wrap');
    L.after(() => {
      const c = compute(); let e = 0; c.yv.forEach((v, i) => { e = Math.max(e, Math.abs(v - c.direct[i])); });
      st({ 'دوره': c.N, 'اختلاف با شبیه‌سازی مستقیم معادله': e < 1e-6 ? '≈ 0' : S.fmt(e, 5) });
      const rows = S.range(0, c.N - 1).filter(k => Math.hypot(...c.a[k]) > 1e-6).slice(0, 10);
      tb.innerHTML = `<table class="tbl-num"><tr><th>k</th><th>aₖ</th><th>H(e^(jkω₀))</th><th>bₖ = aₖ·H</th></tr>${rows.map(k => `<tr><td>${k}</td><td>${S.cfmt(...c.a[k], 3)}</td><td>${S.cfmt(...c.H[k], 3)}</td><td>${S.cfmt(...c.b[k], 3)}</td></tr>`).join('')}</table>`;
    });
  });

  S.lab('dt-props', L => {
    const N = 8, ns = S.range(0, 7);
    const x = [1, 2, 0, -1, 0, 1, 0, 0], y = [1, 0, 1, 0, -1, 0, 0, 0];
    let op = 'shift', n0 = 2;
    const X = n => x[mod(n, N)], Y = n => y[mod(n, N)];
    const calc = () => {
      const a = S.dfs(x), b = S.dfs(y);
      const cm = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
      let t, pred, law;
      if (op === 'shift') { t = ns.map(n => X(n - n0)); pred = a.map((c, k) => { const w = -2 * PI * k * n0 / N; return cm(c, [Math.cos(w), Math.sin(w)]); }); law = '$x[n-n_0]\\leftrightarrow a_ke^{-jk(2\\pi/N)n_0}$'; }
      else if (op === 'diff') { t = ns.map(n => X(n) - X(n - 1)); pred = a.map((c, k) => { const w = -2 * PI * k / N; return cm(c, [1 - Math.cos(w), -Math.sin(w)]); }); law = '$x[n]-x[n-1]\\leftrightarrow(1-e^{-jk2\\pi/N})a_k$'; }
      else if (op === 'conv') { t = ns.map(n => ns.reduce((s, r) => s + X(r) * Y(n - r), 0)); pred = a.map((c, k) => { const v = cm(c, b[k]); return [N * v[0], N * v[1]]; }); law = '$\\sum_{r=\\langle N\\rangle}x[r]y[n-r]\\leftrightarrow Na_kb_k$'; }
      else { t = ns.map(n => X(n) * Y(n)); pred = ns.map(k => { let s = [0, 0]; ns.forEach(l => { const v = cm(a[l], b[mod(k - l, N)]); s = [s[0] + v[0], s[1] + v[1]]; }); return s; }); law = '$x[n]y[n]\\leftrightarrow\\sum_{l=\\langle N\\rangle}a_lb_{k-l}$'; }
      return { t, pred, meas: S.dfs(t), law };
    };
    const row = L.row();
    L.plot({ height: 140, x: [-.5, 7.5], y: [-2.3, 2.3], intX: true, xlabel: 'n', ylabel: 'x[n]', title: 'x (بکش)', draw: p => p.stem(ns, x, { color: 'x', r: 4 }) }, row).editStems(ns, x, L.update, { snap: .5, max: 2 });
    L.plot({ height: 140, x: [-.5, 7.5], y: [-2.3, 2.3], intX: true, xlabel: 'n', ylabel: 'y[n]', title: 'y (بکش)', draw: p => p.stem(ns, y, { color: 'h', r: 4 }) }, row).editStems(ns, y, L.update, { snap: .5, max: 2 });
    const row2 = L.row();
    L.plot({ height: 150, x: [-.5, 7.5], y: [-2, 2], intX: true, xlabel: 'n', title: 'نتیجه در زمان', draw: p => { const r = calc(); p.autoY(r.t, 2); p.begin(); p.stem(ns, r.t, { color: 'y', r: 4 }); } }, row2);
    L.plot({ height: 150, x: [-.5, 7.5], y: [0, 1], intX: true, xlabel: 'k', title: '|cₖ|: اندازه‌گیری (پر) و قانون (توخالی)', draw: p => { const r = calc(), m = r.meas.map(q => Math.hypot(...q)), q2 = r.pred.map(q => Math.hypot(...q)); p.autoY([...m, ...q2], .4); p.begin(); p.stem(ns, m, { color: 'y', r: 3 }); p.stem(ns, q2, { color: 'a', r: 6, hollow: true, w: .6 }); } }, row2);
    const ui = L.controls();
    ui.seg('خاصیت', [['shift', 'شیفت'], ['diff', 'تفاضل'], ['conv', 'کانولوشن دوره‌ای'], ['mul', 'ضرب']], op, v => { op = v; });
    ui.slider('شیفت $n_0$', { min: -7, max: 7, step: 1, value: n0 }, v => { n0 = v; });
    const st = L.stats(), note = L.note();
    L.after(() => {
      const r = calc(); let e = 0; r.meas.forEach((q, i) => { e = Math.max(e, Math.hypot(q[0] - r.pred[i][0], q[1] - r.pred[i][1])); });
      st({ 'بیشترین اختلاف قانون و اندازه‌گیری': e < 1e-9 ? '< 10⁻⁹' : S.fmt(e, 6), 'تفاضل $c_0$': op === 'diff' ? S.fmt(Math.hypot(...r.meas[0]), 4) : '—' });
      note('قانون: ' + r.law + (op === 'diff' ? ' تفاضل میانگین سیگنال را حذف می‌کند، پس $c_0=0$.' : ''));
    });
  });

  S.quiz('ch7', [
    { q: 'سیگنال گسستهٔ با دورهٔ $N$ چند ضریب فوریهٔ متفاوت دارد؟', o: ['دقیقاً $N$', 'بی‌نهایت', '$2N$', '$N/2$'], a: 0, e: 'چون $\\Phi_{k+N}[n]=\\Phi_k[n]$، پس فضا $N$ بعد دارد و $a_{k+N}=a_k$.' },
    { q: 'چرا سری فوریهٔ گسسته پدیدهٔ گیبس ندارد؟', o: ['چون با $N$ جمله نمایش دقیق است و مسئلهٔ همگرایی نداریم', 'چون سیگنال گسسته پرش ندارد', 'چون $N$ همیشه زوج است', 'چون انرژی صفر است'], a: 0, e: 'جمع متناهی است، پس حد و همگرایی مطرح نیست.' },
    { q: 'دورهٔ اصلی $x[n]=\\sin(0.1\\pi n)$ چند است؟', o: ['۲۰', '۱۰', '$0.1\\pi$', '۵'], a: 0, e: '$0.1\\pi N=2\\pi m$ پس کوچک‌ترین $N$ برابر ۲۰ است.' },
    { q: 'برای $y[n]=x[n]-x[n-1]$ ضرایب خروجی کدام‌اند؟', o: ['$b_k=(1-e^{-jk2\\pi/N})a_k$', '$b_k=a_k-a_{k-1}$', '$b_k=a_k^2$', '$b_k=a_{k+1}$'], a: 0, e: 'خاصیت شیفت: تأخیر یک نمونه ضریب $e^{-jk2\\pi/N}$ می‌سازد.' },
    { q: 'برای $y[n]+0.5y[n-1]=x[n]$ کدام درست است؟', o: ['$b_k=\\dfrac{a_k}{1+0.5e^{-jk2\\pi/N}}$', '$b_k=\\dfrac{a_k}{1-0.5e^{-jk2\\pi/N}}$', '$b_k=a_k+0.5$', '$b_k=0.5a_k$'], a: 0, e: 'دقت کن علامت از معادله می‌آید: $b_k(1+0.5e^{-j\\cdot})=a_k$. در حل تمرین ۷.۷ در کتاب این علامت منفی چاپ شده که با خود معادله نمی‌خواند.' },
    { q: 'کانولوشن دوره‌ای در حوزهٔ فرکانس برابر چیست؟', o: ['$Na_kb_k$', '$a_kb_k/N$', '$a_k+b_k$', '$\\sum a_lb_{k-l}$'], a: 0, e: 'جمع روی یک دوره ضریب $N$ می‌آورد. جمع $\\sum a_lb_{k-l}$ مال ضرب در زمان است.' },
  ]);
})();
