(function () {
  const S = SS;
  const palette = ['x', 'h', 'y', 'a', 'b'];

  S.lab('conv-superpose', L => {
    const nx = S.range(0, 5), nh = S.range(0, 5);
    const x = [1, 2, -1, 0, 0, 0], h = [1, .75, .5, .25, 0, 0];
    let upto = 6;
    const row = L.row();
    L.plot({ height: 150, x: [-.5, 5.5], y: [-2.3, 2.3], intX: true, xlabel: 'n', ylabel: 'x[n]', title: 'ورودی: هر نمونه را بکش', draw: p => {
      nx.forEach((n, i) => { const on = i < upto; p.stem([n], [x[i]], { color: on ? palette[i % 5] : 'axis', r: 4 }); });
    } }, row).editStems(nx, x, L.update, { snap: .25, max: 2 });
    L.plot({ height: 150, x: [-.5, 5.5], y: [-1.3, 1.3], intX: true, xlabel: 'n', ylabel: 'h[n]', title: 'پاسخ ضربه: هر نمونه را بکش', draw: p => p.stem(nh, h, { color: 'ink', r: 4 }) }, row).editStems(nh, h, L.update, { snap: .25, max: 1 });
    const ny = S.range(0, 10);
    L.plot({ height: 230, x: [-.5, 10.5], y: [-3, 3], intX: true, xlabel: 'n', ylabel: 'y[n]', title: 'هر ضربهٔ ورودی یک کپی شیفت‌خورده و مقیاس‌شده از h می‌سازد؛ خروجی جمع آن‌هاست', draw: p => {
      const tot = ny.map(n => { let s = 0; nx.forEach((k, i) => { if (i < upto) { const j = n - k; if (j >= 0 && j < 6) s += x[i] * h[j]; } }); return s; });
      let hi = 1, lo = -1;
      ny.forEach(n => { let a = 0, b = 0; nx.forEach((k, i) => { const j = n - k; if (i < upto && j >= 0 && j < 6) { const v = x[i] * h[j]; if (v > 0) a += v; else b += v; } }); hi = Math.max(hi, a); lo = Math.min(lo, b); });
      p.setY(lo * 1.15, hi * 1.15); p.begin();
      const g = p.g, W = Math.min(28, (p.R - p.L) / 11 * .6);
      ny.forEach(n => {
        let up = 0, dn = 0;
        nx.forEach((k, i) => {
          const j = n - k; if (i >= upto || j < 0 || j >= 6) return;
          const v = x[i] * h[j]; if (!v) return;
          const base = v > 0 ? up : dn, top = base + v;
          g.fillStyle = S.alpha(palette[i % 5], .75);
          g.fillRect(p.X(n) - W / 2, Math.min(p.Y(base), p.Y(top)), W, Math.abs(p.Y(top) - p.Y(base)));
          if (v > 0) up = top; else dn = top;
        });
      });
      p.stem(ny, tot, { color: 'ink', r: 3, hideZero: true });
    } });
    const ui = L.controls();
    ui.slider('چند نمونهٔ ورودی اعمال شود؟', { min: 0, max: 6, step: 1, value: upto }, v => { upto = v; });
    const st = L.stats();
    L.after(() => {
      const r = S.conv(x, 0, h, 0);
      st({ 'y[n] کامل (از n=0)': r.y.map(v => S.fmt(v, 2)).join(', ') });
    });
  });

  S.lab('conv-dt', L => {
    const presets = {
      e10: ['تمرین ۴.۱۰', '1,1', 0, '1,1,1', -1],
      e8: ['تمرین ۴.۸: h=δ[n−3]', '1,2,3,2', 0, '1', 3],
      e9: ['تفاضل: h=δ[n]−δ[n−1]', '1,1,1,1,1', 0, '1,-1', 0],
      e7: ['تمرین ۴.۷: αⁿu[n]', '1,1,1,1,1,1,1,1,1,1', 0, '1,0.7,0.49,0.34,0.24,0.17,0.12,0.08', 0],
      ma: ['میانگین متحرک', '0,1,3,2,5,4,4,1', 0, '0.33,0.33,0.33', 0],
    };
    let xv = S.parseSeq(presets.e10[1]), x0 = 0, hv = S.parseSeq(presets.e10[3]), h0 = -1, n = 0;
    const X = k => xv[k - x0] || 0, H = k => hv[k - h0] || 0;
    const bounds = () => { const r = S.conv(xv, x0, hv, h0); return { r, a: Math.min(x0, x0 + h0, h0, r.y0) - 3, b: Math.max(x0 + xv.length, r.y0 + r.y.length, h0 + hv.length) + 2 }; };
    const ks = () => { const { a, b } = bounds(); return S.range(a, b); };
    const frame = p => { const { a, b } = bounds(); p.setX(a - .5, b + .5); };
    const ymax = () => Math.max(1, ...xv.map(Math.abs), ...hv.map(Math.abs)) * 1.2;
    L.plot({ height: 150, intX: true, xlabel: 'k', title: 'x[k] ثابت می‌ماند و h[n−k] وارونه شده روی آن می‌لغزد', draw: p => {
      frame(p); const m = ymax(); p.setY(-m, m); p.begin(); const K = ks();
      p.stem(K, K.map(X), { color: 'x', dx: -2 }); p.stem(K, K.map(k => H(n - k)), { color: 'h', hollow: true, dx: 2 }); p.vline(n);
    } });
    L.plot({ height: 120, intX: true, xlabel: 'k', title: 'حاصل‌ضرب x[k]·h[n−k] (نمونه به نمونه)', draw: p => {
      frame(p); const K = ks(), v = K.map(k => X(k) * H(n - k)); p.autoY(v, 1); p.begin(); p.stem(K, v, { color: 'a' });
    } });
    L.plot({ height: 150, intX: true, xlabel: 'n', title: 'خروجی y[n]؛ مقدار هر نقطه جمع نمودار بالاست', draw: p => {
      frame(p); const { r } = bounds(), K = ks(), Y = k => r.y[k - r.y0] || 0; p.autoY(K.map(Y), 1); p.begin();
      p.stem(K, K.map(k => (k <= n ? Y(k) : NaN)), { color: 'y' }); p.stem(K, K.map(k => (k > n ? Y(k) : NaN)), { color: 'grid' }); p.vline(n);
    } });
    const A = L.anim(() => {}, { auto: false });
    let tick = 0;
    const B = L.anim(dt => { tick += dt; if (tick > .7) { tick = 0; const { a, b } = bounds(); n = n >= b ? a : n + 1; sn.set(n); L.update(); } }, { auto: false });
    void A;
    const ui = L.controls();
    const syncN = () => { const { a, b } = bounds(); sn.range(a, b); if (n < a) n = a; if (n > b) n = b; sn.set(n); };
    ui.select('مثال', Object.keys(presets).map(k => [k, presets[k][0]]), 'e10', v => { const q = presets[v]; tx.set(q[1]); xv = S.parseSeq(q[1]); sx.set(q[2]); x0 = q[2]; th.set(q[3]); hv = S.parseSeq(q[3]); sh.set(q[4]); h0 = q[4]; syncN(); });
    const tx = ui.text('مقادیر x (با ویرگول)', presets.e10[1], v => { xv = S.parseSeq(v); syncN(); });
    const sx = ui.slider('شروع x', { min: -6, max: 6, step: 1, value: 0 }, v => { x0 = v; syncN(); });
    const th = ui.text('مقادیر h (با ویرگول)', presets.e10[3], v => { hv = S.parseSeq(v); syncN(); });
    const sh = ui.slider('شروع h', { min: -6, max: 6, step: 1, value: -1 }, v => { h0 = v; syncN(); });
    const sn = ui.slider('زمان خروجی $n$', { min: -8, max: 8, step: 1, value: n }, v => { n = v; });
    ui.play(B);
    const st = L.stats();
    syncN();
    L.after(() => {
      const { r } = bounds(), K = ks(), terms = K.filter(k => X(k) * H(n - k) !== 0);
      st({ [`y[${n}]`]: S.fmt(r.y[n - r.y0] || 0, 3) , 'جمع': terms.length ? terms.map(k => `${S.fmt(X(k))}·${S.fmt(H(n - k))}`).join(' + ') : '0 (همپوشانی ندارند)', 'نتیجهٔ کامل': `از n=${r.y0}: ` + r.y.map(v => S.fmt(v, 2)).join(', ') });
    });
  });

  S.lab('conv-ct', L => {
    const F = {
      r1: ['پالس [−1,2] (تمرین ۴.۶)', t => (t >= -1 && t <= 2 ? 1 : 0)],
      r2: ['پالس [−2,2] (تمرین ۴.۶)', t => (t >= -2 && t <= 2 ? 1 : 0)],
      e1: ['e⁻ᵗu(t) (تمرین ۴.۱)', t => (t >= 0 ? Math.exp(-t) : 0)],
      e2: ['e⁻²ᵗu(t) (تمرین ۴.۱)', t => (t >= 0 ? Math.exp(-2 * t) : 0)],
      st: ['پله u(t) (تمرین ۴.۴)', t => (t >= 0 ? 1 : 0)],
      tr: ['مثلث', t => (Math.abs(t) < 1 ? 1 - Math.abs(t) : 0)],
      imp: ['ضربهٔ تقریبی δ(t−1)', t => (Math.abs(t - 1) < .05 ? 10 : 0)],
    };
    let xk = 'e1', hk = 'e2', t = 1.5;
    const dt = .02, G = S.linspace(-8, 8, 801);
    let Y = [];
    const compute = () => {
      const X = G.map(F[xk][1]), Hh = G.map(F[hk][1]);
      Y = G.map((tt) => { let s = 0; for (let i = 0; i < 801; i++) { const v = X[i]; if (!v) continue; const q = tt - G[i]; if (q < -8 || q > 8) continue; s += v * Hh[Math.round((q + 8) / dt)]; } return s * dt; });
    };
    const yAt = tt => Y[S.clamp(Math.round((tt + 8) / dt), 0, 800)];
    compute();
    L.plot({ height: 170, x: [-8, 8], y: [-.15, 1.4], xlabel: 'τ', title: 'x(τ) و h(t−τ)؛ مساحت ناحیهٔ مشترک خروجی را می‌سازد', draw: p => {
      const fx = F[xk][1], fh = F[hk][1];
      const top = hk === 'imp' || xk === 'imp' ? 10.5 : 1.25; p.setY(-.1 * top, top); p.begin();
      const pr = G.map(q => fx(q) * fh(t - q)); p.area(G, pr, { color: 'a', fill: S.alpha('a', .3) });
      p.fn(fx, { color: 'x', q: 2 }); p.fn(q => fh(t - q), { color: 'h', q: 2 }); p.vline(t);
    } });
    L.legend([['x', 'x(τ)'], ['h', 'h(t−τ)'], ['a', 'حاصل‌ضرب']]);
    L.plot({ height: 170, x: [-8, 8], y: [-.2, 2], xlabel: 't', ylabel: 'y(t)', draw: p => {
      p.autoY(Y, .5); p.begin();
      p.line(G, Y, { color: 'grid', w: 2.5 });
      const k = S.clamp(Math.round((t + 8) / dt), 0, 800); p.line(G.slice(0, k + 1), Y.slice(0, k + 1), { color: 'y', w: 2.4 });
      p.vline(t); p.dot(t, yAt(t), { color: 'y' });
    } });
    const A = L.anim(d => { t += d * 1.2; if (t > 8) t = -8; s.set(t); L.update(); }, { auto: false });
    const ui = L.controls();
    const opts = Object.keys(F).map(k => [k, F[k][0]]);
    ui.select('ورودی $x$', opts, xk, v => { xk = v; compute(); });
    ui.select('پاسخ ضربه $h$', opts, hk, v => { hk = v; compute(); });
    const s = ui.slider('زمان $t$', { min: -8, max: 8, step: .02, value: t }, v => { t = v; });
    ui.play(A);
    const st = L.stats(), note = L.note();
    L.after(() => {
      st({ 'y(t) عددی': S.fmt(yAt(t), 3) });
      const c = xk + hk;
      note(c === 'e1e2' || c === 'e2e1' ? `پاسخ بسته: $y(t)=(e^{-t}-e^{-2t})u(t)$. در این $t$ مقدارش ${S.fmt(t >= 0 ? Math.exp(-t) - Math.exp(-2 * t) : 0, 3)} است.` : c === 'r1r2' || c === 'r2r1' ? 'خروجی فقط در $-3\\le t\\le4$ غیرصفر است: کران‌ها جمع می‌شوند. سقف ذوزنقه ۳ است، یعنی پهنای پالس کوتاه‌تر.' : c === 'stst' ? 'پله با پله: $y(t)=t\\,u(t)$. انتگرال در پنجره‌ای که با زمان بزرگ می‌شود.' : xk === 'imp' || hk === 'imp' ? 'کانولوشن با ضربه سیگنال دیگر را فقط شیفت می‌دهد.' : 'پهنای خروجی برابر جمع پهنای دو سیگنال است.');
    });
  });

  S.lab('correlation', L => {
    let mode = 'radar', D = 18, noise = .5, A = .7, seed = 3;
    const Nn = 80, tpl = [1, 1, -1, 1, -1, -1, 1, 1, 1, -1];
    const sigR = () => { const r = S.rng(seed * 991 + 5), v = new Array(Nn); for (let n = 0; n < Nn; n++) { const j = n - D; const u1 = r(), u2 = r(); const g = Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(6.283 * u2); v[n] = (j >= 0 && j < tpl.length ? A * tpl[j] : 0) + noise * g; } return v; };
    const corr = (x, y) => { /* R[l] = Σ x[k] y[k+l] */ const out = []; for (let l = 0; l < y.length; l++) { let s = 0; x.forEach((a, k) => { if (k + l < y.length) s += a * y[k + l]; }); out.push(s); } return out; };
    const ex = { x: [-3, 2, -1, 1], h: [-1, 0, -3, 2] };
    const corrFull = (x, y) => { const ls = S.range(-(x.length - 1), y.length - 1); return { ls, v: ls.map(l => { let s = 0; x.forEach((a, k) => { const q = y[k + l]; if (q !== undefined) s += a * q; }); return s; }) }; };
    const area = L.div('');
    const pa = L.plot({ height: 130, x: [0, Nn], y: [-3, 3], intX: true, xlabel: 'n', title: 'پالس فرستاده‌شده (الگوی معلوم)', draw: p => {
      if (mode === 'radar') { p.o.title; p.setX(0, Nn); p.autoY(tpl, 2.4, true); p.begin(); p.stem(tpl.map((_, i) => i), tpl, { color: 'x' }); }
      else { const d = mode === 'e12' ? ex.x : [-1, 2, 1]; p.setX(-1, 6); p.autoY(d, 2, true); p.begin(); p.stem(d.map((_, i) => i), d, { color: 'x' }); if (mode === 'e12') p.stem(ex.h.map((_, i) => i), ex.h, { color: 'h', hollow: true, dx: 3 }); }
    } }, area);
    const pb = L.plot({ height: 130, x: [0, Nn], y: [-3, 3], intX: true, xlabel: 'n', title: 'سیگنال دریافتی: همان پالس با تأخیر و نویز', draw: p => {
      if (mode === 'radar') { const r = sigR(); p.setX(0, Nn); p.autoY(r, 2, true); p.begin(); p.band(D - .5, D + tpl.length - .5, 'b', .15); p.line(r.map((_, i) => i), r, { color: 'h', w: 1.4 }); }
    } }, area);
    L.plot({ height: 170, x: [0, Nn], y: [-3, 3], intX: true, xlabel: 'n', title: 'همبستگی متقابل: قله جای تأخیر را نشان می‌دهد', draw: p => {
      if (mode === 'radar') { const v = corr(tpl, sigR()); p.setX(0, Nn); p.autoY(v, 3); p.begin(); p.stem(v.map((_, i) => i), v, { color: 'y', r: 2 }); const m = v.indexOf(Math.max(...v)); p.dot(m, v[m], { color: 'h' }); }
      else { const d = mode === 'e12' ? corrFull(ex.x, ex.h) : corrFull([-1, 2, 1], [-1, 2, 1]); p.setX(d.ls[0] - 1, d.ls[d.ls.length - 1] + 1); p.autoY(d.v, 3); p.begin(); p.stem(d.ls, d.v, { color: 'y' }); }
    } });
    const ui = L.controls();
    ui.seg('حالت', [['radar', 'رادار و لیدار'], ['e12', 'تمرین ۴.۱۲'], ['e13', 'خودهمبستگی ۴.۱۳']], mode, v => { mode = v; vis(); });
    const c1 = ui.slider('تأخیر واقعی', { min: 0, max: 65, step: 1, value: D }, v => { D = v; });
    const c2 = ui.slider('قدرت نویز', { min: 0, max: 2.5, step: .05, value: noise }, v => { noise = v; });
    const c3 = ui.slider('دامنهٔ بازگشتی', { min: .1, max: 1.5, step: .05, value: A }, v => { A = v; });
    const c4 = ui.button('نویز جدید', () => { seed++; });
    function vis() { const r = mode === 'radar'; [c1.el, c2.el, c3.el].forEach(e => { e.style.display = r ? '' : 'none'; }); c4.parentElement.style.display = r ? '' : 'none'; pb.wrap.style.display = r ? '' : 'none'; pa.wrap.querySelector('.plot-title').textContent = r ? 'پالس فرستاده‌شده (الگوی معلوم)' : mode === 'e12' ? 'x[n] (پر) و h[n] (توخالی)' : 'x[n]'; }
    vis();
    const st = L.stats(), note = L.note();
    L.after(() => {
      if (mode === 'radar') { const v = corr(tpl, sigR()), m = v.indexOf(Math.max(...v)); st({ 'تأخیر تخمینی': m, 'تأخیر واقعی': D, 'نتیجه': `<span style="font-family:Vazirmatn">${m === D ? 'درست' : 'خطا'}</span>` }); note('در نویز زیاد شکل پالس را با چشم نمی‌بینی ولی قله هنوز پیدا می‌شود، چون همبستگی انرژی پالس را روی یک نقطه جمع می‌کند. لیدار فاصله را همین‌طور از تأخیر محاسبه می‌کند.'); }
      else if (mode === 'e12') { const d = corrFull(ex.x, ex.h); st({ 'y[n] از n=−3': d.v.join(', ').replace(/-/g, '−') }); note('طبق تعریف $y[n]=\\sum_k x^*[k]h[n+k]$. فرق با کانولوشن: اینجا هیچ‌کدام وارونه نمی‌شوند.'); }
      else { const d = corrFull([-1, 2, 1], [-1, 2, 1]); st({ 'y[n] از n=−2': d.v.join(', ').replace(/-/g, '−') }); note('خودهمبستگی زوج است و بیشینه‌اش در $n=0$ است، و آنجا برابر انرژی سیگنال می‌شود ($1+4+1=6$).'); }
    });
  });

  S.lab('h-properties', L => {
    let k = 'exp', al = .8, n0 = 2;
    const ns = S.range(-8, 30);
    const H = {
      exp: { t: 'αⁿu[n]', f: n => (n >= 0 ? al ** n : 0), inv: () => ['δ[n] − αδ[n−1]', [1, -al], 0] },
      del: { t: 'δ[n−n₀] (تمرین ۴.۱۴)', f: n => (n === n0 ? 1 : 0), inv: () => ['δ[n+n₀]', [1], -n0] },
      step: { t: 'u[n] انباشتگر (تمرین ۴.۱۷)', f: n => (n >= 0 ? 1 : 0), inv: () => ['δ[n] − δ[n−1]', [1, -1], 0] },
      adv: { t: 'u[n+2] (مسئلهٔ ۴.۱)', f: n => (n >= -2 ? 1 : 0), inv: () => ['δ[n−2] − δ[n−3]', [1, -1], 2] },
      gain: { t: '3δ[n] بی‌حافظه', f: n => (n === 0 ? 3 : 0), inv: () => ['(1/3)δ[n]', [1 / 3], 0] },
      ma: { t: 'میانگین سه‌تایی', f: n => (n >= 0 && n < 3 ? 1 / 3 : 0), inv: () => null },
    };
    const row = L.row();
    L.plot({ height: 170, x: [-8.5, 30.5], y: [-1, 2], intX: true, xlabel: 'n', ylabel: 'h[n]', draw: p => { const v = ns.map(H[k].f); p.autoY(v, 1.2); p.begin(); p.band(-8.5, -.5, 'h', .07); p.stem(ns, v, { color: 'x', r: 2.8 }); } }, row);
    L.plot({ height: 170, x: [-8.5, 30.5], y: [-1, 2], intX: true, xlabel: 'n', ylabel: 's[n] = Σ h[k]', draw: p => { let s = 0; const v = ns.map(n => (s += H[k].f(n))); p.autoY(v, 1.2); p.begin(); p.stem(ns, v, { color: 'y', r: 2.8 }); } }, row);
    const ui = L.controls();
    ui.select('پاسخ ضربه', Object.keys(H).map(q => [q, H[q].t]), k, v => { k = v; });
    ui.slider('$\\alpha$', { min: -1.05, max: 1.05, step: .01, value: al }, v => { al = v; });
    ui.slider('$n_0$', { min: -4, max: 6, step: 1, value: n0 }, v => { n0 = v; });
    const st = L.stats();
    const pc = L.plot({ height: 130, x: [-8.5, 14.5], y: [-1.2, 1.2], intX: true, xlabel: 'n', title: 'آزمون وارون: h * h⁻¹ باید ضربه شود', draw: p => {
      const iv = H[k].inv(); if (!iv) return;
      const N = S.range(-40, 40), hv = N.map(H[k].f), r = S.conv(hv, -40, iv[1], iv[2]);
      const K = S.range(-8, 14); p.autoY([1, 0], 1.3); p.begin();
      p.stem(K, K.map(q => r.y[q - r.y0] || 0), { color: 'h', r: 3 });
    } });
    L.after(() => {
      const fN = S.range(-60, 2000); let sum = 0; fN.forEach(n => { sum += Math.abs(H[k].f(n)); });
      const iv = H[k].inv();
      const mem = S.range(-60, 200).every(n => n === 0 || H[k].f(n) === 0);
      const cau = S.range(-60, -1).every(n => H[k].f(n) === 0);
      st({ 'بی‌حافظه: فقط h[0] غیرصفر': `<span style="font-family:Vazirmatn">${mem ? 'بله' : 'خیر'}</span>`, 'علّی: h[n<0]=0': `<span style="font-family:Vazirmatn">${cau ? 'بله' : 'خیر'}</span>`, 'پایدار: $\\sum|h[n]|$': sum > 1500 ? '∞ — ناپایدار' : S.fmt(sum, 3) + ' — پایدار', 'وارون': iv ? iv[0] : '<span style="font-family:Vazirmatn">وارون پایدار ساده ندارد</span>' });
      pc.wrap.style.display = iv ? '' : 'none';
    });
  });

  S.lab('ml-template', L => {
    const G = 28; const X = new Float32Array(G * G);
    const render = (d, font) => {
      const c = document.createElement('canvas'); c.width = c.height = G; const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#000'; g.fillRect(0, 0, G, G); g.fillStyle = '#fff'; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d), 14, 15);
      const a = g.getImageData(0, 0, G, G).data, o = new Float32Array(G * G); for (let i = 0; i < o.length; i++) o[i] = a[i * 4] / 255; return o;
    };
    const fonts = ['700 24px Arial,sans-serif', '700 24px Georgia,serif', '700 23px "Courier New",monospace', '400 25px Verdana,sans-serif', '700 25px Tahoma,sans-serif'];
    /* فیلتر h با گرادیان کاهشی روی رقم‌های ساخته‌شده از چند فونت آموزش می‌بیند */
    const samples = [];
    fonts.forEach(f => { for (let d = 0; d < 10; d++) { const o = render(d, f); [-2, 0, 2].forEach(dx => [-2, 0, 2].forEach(dy => {
      const q = []; for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) { const v = o[r * G + c]; if (v > .02) { const R = r + dy, C = c + dx; if (R >= 0 && C >= 0 && R < G && C < G) q.push([R * G + C, v]); } }
      samples.push([q, d === 3 ? 1 : 0]);
    })); } });
    const Hf = new Float32Array(G * G);
    for (let it = 0; it < 220; it++) {
      const grad = new Float32Array(G * G);
      samples.forEach(([q, lab]) => {
        let s = 0; for (const [i, v] of q) s += v * Hf[i];
        const e = (lab - 1 / (1 + Math.exp(-s))) * (lab ? 9 : 1);
        for (const [i, v] of q) grad[i] += e * v;
      });
      for (let i = 0; i < Hf.length; i++) Hf[i] = Hf[i] * .9995 + .012 * grad[i] / samples.length * 9;
    }
    const gr = L.div('grid-draw');
    const panel = cap => { const w = S.mk('div'); w.appendChild(S.mk('p', 'cap', cap)); const c = document.createElement('canvas'); c.width = c.height = G; w.appendChild(c); gr.appendChild(w); return c; };
    const cx = panel('ورودی x: اینجا رقم بکش'), ch = panel('فیلتر h آموزش‌دیده برای رقم ۳'), cp = panel('حاصل‌ضرب پیکسلی x·h');
    const score = () => { let s = 0; for (let i = 0; i < X.length; i++) s += X[i] * Hf[i]; return s; };
    const paintAll = () => {
      const col = (c, get) => {
        const g = c.getContext('2d'), im = g.createImageData(G, G);
        const pos = hex(S.col('y')), neg = hex(S.col('h')), bg = hex(S.col('plot'));
        for (let i = 0; i < G * G; i++) { const v = S.clamp(get(i), -1, 1), t = Math.abs(v), base = v >= 0 ? pos : neg; for (let k = 0; k < 3; k++) im.data[i * 4 + k] = bg[k] + (base[k] - bg[k]) * t; im.data[i * 4 + 3] = 255; }
        g.putImageData(im, 0, 0);
      };
      const hmax = Math.max(...Hf.map(Math.abs)) || 1;
      const g = cx.getContext('2d'), im = g.createImageData(G, G), ink = hex(S.col('ink')), bg = hex(S.col('plot'));
      for (let i = 0; i < G * G; i++) { for (let k = 0; k < 3; k++) im.data[i * 4 + k] = bg[k] + (ink[k] - bg[k]) * X[i]; im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      col(ch, i => Hf[i] / hmax);
      col(cp, i => X[i] * Hf[i] / hmax);
    };
    const hex = c => { const v = parseInt(c.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };
    let drawing = false, last = null;
    const dab = (px, py) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const q = px + dx, r = py + dy; if (q < 0 || r < 0 || q >= G || r >= G) continue; const d = Math.hypot(dx, dy), v = S.clamp(1.7 - d * .75, 0, 1); const i = Math.round(r) * G + Math.round(q); X[i] = Math.max(X[i], v); } };
    const at = e => { const r = cx.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * G, (e.clientY - r.top) / r.height * G]; };
    cx.style.cursor = 'crosshair';
    cx.addEventListener('pointerdown', e => { drawing = true; cx.setPointerCapture(e.pointerId); last = at(e); dab(...last); L.update(); e.preventDefault(); });
    cx.addEventListener('pointermove', e => { if (!drawing) return; const p = at(e); const n = Math.ceil(Math.hypot(p[0] - last[0], p[1] - last[1])) + 1; for (let i = 0; i <= n; i++) dab(last[0] + (p[0] - last[0]) * i / n, last[1] + (p[1] - last[1]) * i / n); last = p; L.update(); });
    const stop = () => { drawing = false; }; cx.addEventListener('pointerup', stop); cx.addEventListener('pointercancel', stop);
    const ui = L.controls();
    const load = d => { const o = render(d, fonts[d % fonts.length === 1 ? 2 : 0]); X.set(o); };
    const pick = ui.seg('یک رقم آماده بگذار', S.range(0, 9).map(d => [String(d), String(d)]), '3', v => load(+v));
    ui.button('پاک کردن', () => { X.fill(0); pick.set(''); });
    load(3);
    const meter = L.div('', '<p class="cap">احتمال اینکه رقم ۳ باشد: $\\hat y=\\sigma\\big((x\\star h)[0,0]\\big)$</p><div class="meter"><i></i></div>');
    const st = L.stats();
    L.after(() => {
      paintAll();
      const s = score(), sg = 1 / (1 + Math.exp(-s));
      meter.querySelector('i').style.width = (sg * 100) + '%';
      st({ '$(x\\star h)[0,0]$': S.fmt(s, 3), '$\\hat y$': S.fmt(sg, 3), 'تشخیص': `<span style="font-family:Vazirmatn">${sg > .5 ? 'رقم ۳' : 'رقم دیگر'}</span>` });
    });
  });

  S.quiz('ch4', [
    { q: 'چرا فقط برای سیستم‌های LTI می‌توانیم با یک $h$ همه‌چیز را توصیف کنیم؟', o: ['چون هر ورودی جمع ضربه‌های شیفت‌خورده است و خطی بودن و تغییرناپذیری اجازهٔ جمع کردن پاسخ‌ها را می‌دهد', 'چون $h$ همیشه کوتاه است', 'چون این سیستم‌ها حافظه ندارند', 'چون همهٔ سیستم‌ها LTI هستند'], a: 0, e: 'تغییرناپذیری: $\\delta[n-k]\\to h[n-k]$. خطی بودن: $x[k]\\delta[n-k]\\to x[k]h[n-k]$. جمع این‌ها همان کانولوشن است.' },
    { q: 'برای $h(t)=e^{-2t}u(t)$ و $x(t)=e^{-t}u(t)$ خروجی چیست؟', o: ['$(e^{-t}-e^{-2t})u(t)$', '$e^{-3t}u(t)$', '$e^{-2t}e^{-t}$', '$(e^{-2t}-e^{-t})u(t)$'], a: 0, e: 'تمرین ۴.۱. این را در آزمایشگاه کانولوشن پیوسته بررسی کن.' },
    { q: 'اگر $x$ در $[-1,2]$ و $h$ در $[-2,2]$ غیرصفر باشند، $y=x*h$ کجا غیرصفر است؟', o: ['$[-3,4]$', '$[-1,2]$', '$[-2,2]$', '$[-1,4]$'], a: 0, e: 'کران‌های پایین با هم و کران‌های بالا با هم جمع می‌شوند.' },
    { q: 'شرط لازم و کافی پایداری BIBO برای LTI گسسته چیست؟', o: ['$\\sum_n|h[n]|<\\infty$', '$h[0]\\ne0$', '$h[n]=0$ برای $n<0$', '$\\max|h[n]|\\le1$'], a: 0, e: 'جمع‌پذیری مطلق. مثلاً $h[n]=u[n]$ کران‌دار است ولی پایدار نیست.' },
    { q: 'پاسخ پله و پاسخ ضربه در زمان گسسته چه رابطه‌ای دارند؟', o: ['$h[n]=s[n]-s[n-1]$', '$s[n]=h[n]-h[n-1]$', '$h[n]=s[n]s[n-1]$', '$s[n]=h[-n]$'], a: 0, e: 'چون $u$ جمع انباشتهٔ $\\delta$ است، $s$ هم جمع انباشتهٔ $h$ است.' },
    { q: 'فرق اصلی همبستگی با کانولوشن چیست؟', o: ['در همبستگی هیچ سیگنالی وارونه نمی‌شود', 'همبستگی همیشه صفر است', 'کانولوشن فقط برای سیگنال متناوب است', 'همبستگی خطی نیست'], a: 0, e: 'همبستگی شباهت را در هر تأخیر می‌سنجد و کانولوشن خروجی سیستم را می‌دهد.' },
  ]);
})();
