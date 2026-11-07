(function () {
  const S = SS, PI = Math.PI;

  S.lab('first-order', L => {
    let a = 2, b = 1, y0 = 0, k = 'exp', w = 3, A = 1;
    const aa = () => (Math.abs(a) < .01 ? .01 : a);
    const yp = t => {
      const q = aa();
      if (k === 'step') return b * A / q;
      if (k === 'cos') return b * A * (q * Math.cos(w * t) + w * Math.sin(w * t)) / (q * q + w * w);
      const d = Math.abs(q - 1) < .01 ? q + .01 : q; return b * A * Math.exp(-t) / (d - 1);
    };
    const yh = t => (y0 - yp(0)) * Math.exp(-aa() * t);
    const inp = t => (t < 0 ? 0 : k === 'step' ? A : k === 'cos' ? A * Math.cos(w * t) : A * Math.exp(-t));
    L.plot({ height: 240, x: [-.5, 6], y: [-1.5, 1.5], xlabel: 't', draw: p => {
      const vals = S.linspace(0, 6, 200).flatMap(t => [yh(t), yp(t), yh(t) + yp(t), inp(t)]);
      p.autoY(vals.map(v => S.clamp(v, -6, 6)), 1.4); p.begin();
      p.fn(inp, { color: 'axis', w: 1.2, dash: [2, 3] });
      const on = t => (t >= 0 ? 1 : NaN);
      p.fn(t => yh(t) * on(t), { color: 'h', w: 1.5, dash: [6, 4] });
      p.fn(t => yp(t) * on(t), { color: 'b', w: 1.5, dash: [6, 4] });
      p.fn(t => (yh(t) + yp(t)) * on(t), { color: 'y', w: 2.6 });
      p.dot(0, y0, { color: 'y' });
      if (a > .15) p.vline(1 / a);
    } });
    L.legend([['y', 'پاسخ کل $y(t)$'], ['h', 'پاسخ همگن $y_h$', 1], ['b', 'پاسخ خصوصی $y_p$', 1], ['axis', 'ورودی $x(t)$', 1]]);
    const ui = L.controls();
    ui.select('ورودی', [['exp', 'e⁻ᵗu(t) (تمرین ۵.۲)'], ['step', 'پله'], ['cos', 'کسینوس']], k, v => { k = v; });
    ui.slider('$a$ در $\\dot y+ay=bx$', { min: -1, max: 5, step: .05, value: a }, v => { a = v; });
    ui.slider('$b$', { min: -2, max: 3, step: .1, value: b }, v => { b = v; });
    ui.slider('شرط اولیه $y(0)$', { min: -2, max: 2, step: .1, value: y0 }, v => { y0 = v; });
    ui.slider('دامنهٔ ورودی', { min: -2, max: 2, step: .1, value: A }, v => { A = v; });
    ui.slider('$\\omega$ ورودی کسینوسی', { min: .5, max: 12, step: .1, value: w }, v => { w = v; });
    const note = L.note();
    L.after(() => note(a > 0 ? `بخش همگن با $e^{-${S.fmt(a)}t}$ می‌میرد (خط‌چین عمودی: ثابت زمانی $1/a$). بعد از آن فقط اثر ورودی می‌ماند. ${y0 === 0 ? 'با $y(0)=0$ سیستم از سکون شروع کرده و LTI رفتار می‌کند.' : 'با شرط اولیهٔ غیرصفر، پاسخ دیگر با ورودی خطی نیست.'}` : a < 0 ? 'با $a<0$ بخش همگن رشد می‌کند و سیستم ناپایدار است. این همان تمرین ۳.۲۰ است که $\\dot y-y=x$ بود.' : 'با $a=0$ سیستم یک انتگرال‌گیر خالص است.'));
  });

  S.lab('pedal', L => {
    let a = .8, push = 0, y = 0, on = false;
    const N = 600, ys = new Array(N).fill(0), xs = new Array(N).fill(0);
    const dg = L.div('', `<svg class="diagram" viewBox="0 0 560 124" role="img" aria-label="نمودار بلوکی سیستم مرتبهٔ اول">
      <polyline class="wire" points="44,36 150,36"/><circle class="box" cx="162" cy="36" r="12"/><text x="162" y="41" text-anchor="middle">+</text>
      <polyline class="wire" points="174,36 270,36"/><rect class="box" x="270" y="16" width="60" height="40" rx="4"/><text x="300" y="42" text-anchor="middle">∫</text>
      <polyline class="wire" points="330,36 500,36"/><polyline class="wire" points="420,36 420,100 310,100"/>
      <rect class="box" x="250" y="82" width="60" height="36" rx="4"/><text x="280" y="105" text-anchor="middle">−a</text><polyline class="wire" points="250,100 162,100 162,48"/>
      <text x="6" y="41">x(t)</text><text x="508" y="41">y(t)</text><text x="200" y="28">dy/dt</text>
      <text class="val" id="pv-x" x="60" y="28">0</text><text class="val" id="pv-d" x="205" y="52">0</text><text class="val" id="pv-y" x="430" y="28">0</text></svg>`);
    const q = id => dg.querySelector(id);
    const tt = S.linspace(-10, 0, N);
    const P = L.plot({ height: 200, x: [-10, 0], y: [-.1, 2.5], xlabel: 'زمان', ylabel: 'y(t)', draw: p => {
      const top = Math.max(1.3, 1.2 / Math.max(a, .1) * 1.1); p.setY(-.08 * top, top); p.begin();
      p.area(tt, xs, { color: 'x', fill: S.alpha('x', .13) }); p.line(tt, ys, { color: 'y', w: 2.4 });
    } });
    const stp = dt => {
      const x = on ? 1 : 0; push += dt;
      y += (x - a * y) * dt;
      if (push > 10 / N) { push = 0; ys.push(y); ys.shift(); xs.push(x); xs.shift(); }
      q('#pv-x').textContent = x.toFixed(0); q('#pv-d').textContent = (x - a * y).toFixed(2); q('#pv-y').textContent = y.toFixed(2);
      P.render();
    };
    const A = L.anim(stp);
    const ui = L.controls();
    const hold = ui.button('پدال را نگه دار', null, 'pri');
    const set = v => e => { on = v; hold.textContent = v ? 'پدال فشرده است' : 'پدال را نگه دار'; if (e && e.preventDefault && v) e.preventDefault(); };
    hold.addEventListener('pointerdown', set(true)); ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => hold.addEventListener(e, set(false)));
    hold.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { set(true)(e); } });
    hold.addEventListener('keyup', set(false));
    ui.slider('اصطکاک $a$', { min: .1, max: 3, step: .05, value: a }, v => { a = v; });
    ui.play(A);
    const st = L.stats();
    L.after(() => st({ 'سرعت نهایی با پدال کامل $1/a$': S.fmt(1 / a), 'ثابت زمانی $1/a$': S.fmt(1 / a) + ' s' }));
  });

  S.lab('pole-drag', L => {
    let P = [[-1, 0], [-2, 0]], hold = -1;
    const cplx = () => Math.abs(P[0][1]) > 1e-6;
    const co = () => (cplx() ? { a1: -2 * P[0][0], a0: P[0][0] ** 2 + P[0][1] ** 2 } : { a1: -(P[0][0] + P[1][0]), a0: P[0][0] * P[1][0] });
    const h = t => {
      if (t < 0) return 0;
      if (cplx()) { const [s, w] = P[0]; return Math.exp(s * t) * Math.sin(Math.abs(w) * t) / Math.abs(w); }
      const a = P[0][0], b = P[1][0];
      if (Math.abs(a - b) < 1e-3) return t * Math.exp(a * t);
      return (Math.exp(a * t) - Math.exp(b * t)) / (a - b);
    };
    const row = L.row();
    const sp = L.plot({ height: 300, x: [-5, 2], y: [-4, 4], equal: true, xlabel: 'σ', ylabel: 'jω', title: 'قطب‌ها را بکش', draw: p => {
      p.band(0, 50, 'h', .1);
      P.forEach(q => { const g = p.g, X = p.X(q[0]), Y = p.Y(q[1]), r = 6; g.strokeStyle = S.col('x'); g.lineWidth = 2.6; g.beginPath(); g.moveTo(X - r, Y - r); g.lineTo(X + r, Y + r); g.moveTo(X + r, Y - r); g.lineTo(X - r, Y + r); g.stroke(); });
    } }, row);
    sp.pointer({ cursor: 'grab',
      down: (x, y) => { hold = Math.hypot(x - P[0][0], y - P[0][1]) <= Math.hypot(x - P[1][0], y - P[1][1]) ? 0 : 1; move(x, y); },
      move: (x, y) => move(x, y) });
    const move = (x, y) => {
      x = S.clamp(Math.round(x * 10) / 10, -5, 1.5); y = Math.round(y * 10) / 10;
      if (Math.abs(y) < .25) { if (cplx()) { P = [[x, 0], [x, 0]]; } else P[hold] = [x, 0]; } else { const s = hold === 0 ? 1 : -1; P[0] = [x, s * y]; P[1] = [x, -s * y]; }
      L.update();
    };
    const col = L.div('', '', row);
    const ts = S.linspace(0, 12, 500);
    L.plot({ height: 145, x: [-.5, 12], y: [-1, 1], xlabel: 't', ylabel: 'h(t)', title: 'پاسخ ضربه', draw: p => { const v = ts.map(h); p.autoY(v.map(q => S.clamp(q, -5, 5)), .4); p.begin(); p.line(ts, v, { color: 'x' }); } }, col);
    L.plot({ height: 145, x: [-.5, 12], y: [-1, 1], xlabel: 't', ylabel: 's(t)', title: 'پاسخ پله', draw: p => { let s = 0; const d = ts[1], v = ts.map(t => { s += h(t) * d; return s; }); p.autoY(v.map(q => S.clamp(q, -8, 8)), .4); p.begin(); p.line(ts, v, { color: 'y' }); const { a0 } = co(); if (a0 > 0 && P[0][0] < 0 && P[1][0] < 0) p.hline(1 / a0); } }, col);
    const ui = L.controls();
    const set = (a, b) => { P = [a, b]; };
    ui.button('تمرین ۵.۱۰: s²+3s+2', () => set([-1, 0], [-2, 0]));
    ui.button('میرایی بحرانی', () => set([-2, 0], [-2, 0]));
    ui.button('نوسانی', () => set([-.4, 2], [-.4, -2]));
    ui.button('نوسان خالص', () => set([0, 2], [0, -2]));
    ui.button('ناپایدار', () => set([.3, 1.5], [.3, -1.5]));
    const st = L.stats(), note = L.note();
    L.after(() => {
      const { a1, a0 } = co(), stable = P[0][0] < 0 && P[1][0] < 0;
      const nm = cplx() ? (P[0][0] === 0 ? 'نوسان پایدار نشده (مرز پایداری)' : P[0][0] > 0 ? 'نوسانی ناپایدار' : 'زیرمیرا (نوسانی میرا)') : !stable ? 'ناپایدار' : P[0][0] === P[1][0] ? 'میرایی بحرانی' : 'فوق‌میرا';
      st({ 'معادله': `y″ ${a1 < 0 ? '−' : '+'} ${S.fmt(Math.abs(a1))}y′ ${a0 < 0 ? '−' : '+'} ${S.fmt(Math.abs(a0))}y = x`, 'قطب‌ها': `${S.cfmt(...P[0])} , ${S.cfmt(...P[1])}`, 'رفتار': `<span style="font-family:Vazirmatn">${nm}</span>` });
      note(`تابع تبدیل: $H(s)=\\dfrac{1}{s^2${a1 < 0 ? '-' : '+'}${S.fmt(Math.abs(a1))}s${a0 < 0 ? '-' : '+'}${S.fmt(Math.abs(a0))}}$. قطب در نیم‌صفحهٔ راست (ناحیهٔ قرمز) یعنی ناپایداری. بخش حقیقی قطب سرعت میرایی و بخش موهومی فرکانس نوسان را می‌سازد.`);
    });
  });

  S.lab('recursion', L => {
    let a1 = .5, a2 = 0, b0 = 1, b1 = 0, y0 = 0, kind = 'imp', n = -1;
    const inp = m => (m < 0 ? 0 : kind === 'imp' ? (m === 0 ? 1 : 0) : kind === 'step' ? 1 : kind === 'n2' ? m * m : Math.cos(PI * m / 6));
    const lim = 24;
    const sim = () => { const y = {}; y[-1] = y0; y[-2] = 0; for (let m = 0; m <= lim; m++) y[m] = a1 * y[m - 1] + a2 * y[m - 2] + b0 * inp(m) + b1 * inp(m - 1); return y; };
    const svg = L.div('', `<svg class="diagram" viewBox="0 0 640 214" role="img" aria-label="نمودار بلوکی معادلهٔ تفاضلی">
      <polyline class="wire" points="44,50 150,50"/><rect class="box" x="150" y="32" width="46" height="36" rx="4"/><text x="173" y="55" text-anchor="middle">b₀</text>
      <polyline class="wire" points="196,50 320,50"/><circle class="box" cx="332" cy="50" r="12"/><text x="332" y="55" text-anchor="middle">+</text>
      <polyline class="wire" points="344,50 590,50"/>
      <polyline class="wire" points="90,50 90,88"/><rect class="box" x="70" y="88" width="40" height="34" rx="4"/><text x="90" y="110" text-anchor="middle">D</text>
      <polyline class="wire" points="90,122 90,150 150,150"/><rect class="box" x="150" y="132" width="46" height="36" rx="4"/><text x="173" y="155" text-anchor="middle">b₁</text>
      <polyline class="wire" points="196,150 322,150 322,61"/>
      <polyline class="wire" points="470,50 470,74"/><rect class="box" x="450" y="74" width="40" height="30" rx="4"/><text x="470" y="94" text-anchor="middle">D</text>
      <polyline class="wire" points="470,104 470,120 410,120"/><rect class="box" x="364" y="104" width="46" height="32" rx="4"/><text x="387" y="125" text-anchor="middle">a₁</text>
      <polyline class="wire" points="364,120 335,120 335,62"/>
      <polyline class="wire" points="470,120 470,144"/><rect class="box" x="450" y="144" width="40" height="30" rx="4"/><text x="470" y="164" text-anchor="middle">D</text>
      <polyline class="wire" points="470,174 470,192 410,192"/><rect class="box" x="364" y="176" width="46" height="32" rx="4"/><text x="387" y="197" text-anchor="middle">a₂</text>
      <polyline class="wire" points="364,192 345,192 345,58"/>
      <text x="6" y="55">x[n]</text><text x="596" y="55">y[n]</text>
      <text class="val" id="v-x" x="52" y="42"></text><text class="val" id="v-x1" x="98" y="142"></text>
      <text class="val" id="v-y" x="520" y="42"></text><text class="val" id="v-y1" x="478" y="116"></text><text class="val" id="v-y2" x="478" y="188"></text>
      <text class="val" id="v-b0" x="150" y="26"></text><text class="val" id="v-b1" x="150" y="126"></text><text class="val" id="v-a1" x="364" y="100"></text><text class="val" id="v-a2" x="364" y="172"></text></svg>`);
    const $ = id => svg.querySelector(id);
    const ns = S.range(-2, lim);
    const row = L.row();
    L.plot({ height: 150, x: [-2.5, lim + .5], y: [-1, 2], intX: true, xlabel: 'n', ylabel: 'x[n]', draw: p => { const v = ns.map(inp); p.autoY(v, 1.2); p.begin(); p.stem(ns, ns.map(m => (m <= n ? inp(m) : NaN)), { color: 'x', r: 2.6 }); } }, row);
    L.plot({ height: 150, x: [-2.5, lim + .5], y: [-1, 2], intX: true, xlabel: 'n', ylabel: 'y[n]', draw: p => { const y = sim(), v = ns.map(m => y[m]); p.autoY(v.map(q => S.clamp(q, -1e4, 1e4)), 1.2); p.begin(); p.stem(ns, ns.map((m, i) => (m <= n ? v[i] : NaN)), { color: 'y', r: 2.6 }); p.stem(ns, ns.map((m, i) => (m > n ? v[i] : NaN)), { color: 'grid', r: 2 }); } }, row);
    let tick = 0;
    const A = L.anim(dt => { tick += dt; if (tick > .75) { tick = 0; n = n >= lim ? -1 : n + 1; L.update(); } }, { auto: false });
    const ui = L.controls();
    ui.button('گام بعدی', () => { if (n < lim) n++; }, 'pri');
    ui.button('شروع دوباره', () => { n = -1; });
    ui.play(A);
    const pr = ui.select('مثال', [
      ['a', 'تمرین ۵.۱۱: y[n]−0.5y[n−1]=x[n]'], ['b', 'تمرین ۵.۷: ورودی n²u[n]، y[−1]=16'],
      ['c', 'تمرین ۴.۹: y[n]=x[n]−x[n−1]'], ['d', 'انباشتگر'], ['e', 'نوسانگر (مرتبه ۲)'], ['f', 'واگرا'],
    ], 'a', v => {
      const t = { a: [.5, 0, 1, 0, 0, 'imp'], b: [.5, 0, 1, 0, 16, 'n2'], c: [0, 0, 1, -1, 0, 'step'], d: [1, 0, 1, 0, 0, 'step'], e: [1.6, -.9, 1, 0, 0, 'imp'], f: [1.1, 0, 1, 0, 0, 'imp'] }[v];
      [a1, a2, b0, b1, y0, kind] = t; s1.set(a1); s2.set(a2); s3.set(b0); s4.set(b1); s5.set(y0); s6.set(kind); n = -1;
    });
    const s6 = ui.select('ورودی', [['imp', 'ضربه δ[n]'], ['step', 'پله u[n]'], ['cos', 'cos(πn/6)u[n]'], ['n2', 'n²u[n]']], kind, v => { kind = v; n = -1; });
    const s1 = ui.slider('$a_1$', { min: -2, max: 2, step: .05, value: a1 }, v => { a1 = v; });
    const s2 = ui.slider('$a_2$', { min: -1, max: 1, step: .05, value: a2 }, v => { a2 = v; });
    const s3 = ui.slider('$b_0$', { min: -2, max: 2, step: .1, value: b0 }, v => { b0 = v; });
    const s4 = ui.slider('$b_1$', { min: -2, max: 2, step: .1, value: b1 }, v => { b1 = v; });
    const s5 = ui.slider('شرط اولیه $y[-1]$', { min: -20, max: 20, step: 1, value: y0 }, v => { y0 = v; });
    const st = L.stats(), note = L.note();
    void pr;
    L.after(() => {
      const y = sim(), m = Math.max(n, 0), sh = n < 0;
      const f = v => (sh ? '' : S.fmt(v, 2));
      $('#v-x').textContent = f(inp(m)); $('#v-x1').textContent = f(inp(m - 1)); $('#v-y').textContent = f(y[m]);
      $('#v-y1').textContent = f(y[m - 1]); $('#v-y2').textContent = f(y[m - 2]);
      $('#v-b0').textContent = f(b0 * inp(m)); $('#v-b1').textContent = f(b1 * inp(m - 1)); $('#v-a1').textContent = f(a1 * y[m - 1]); $('#v-a2').textContent = f(a2 * y[m - 2]);
      const d = a1 * a1 + 4 * a2, r = d >= 0 ? Math.max(Math.abs((a1 + Math.sqrt(d)) / 2), Math.abs((a1 - Math.sqrt(d)) / 2)) : Math.sqrt(-a2);
      st({ 'n': sh ? 'شروع نشده' : n, 'y[n]': sh ? '—' : S.fmt(y[n], 3), 'بیشترین $|z|$ ریشه‌ها': S.fmt(r, 3), 'پایداری': `<span style="font-family:Vazirmatn">${r < 1 ? 'پایدار' : r === 1 ? 'مرز پایداری' : 'ناپایدار'}</span>` });
      note(sh ? 'دکمهٔ «گام بعدی» را بزن تا مقدارها را روی سیم‌ها ببینی.' : `$y[${n}]=${S.fmt(a1, 2)}\\cdot(${S.fmt(y[n - 1], 2)})${a2 ? `+${S.fmt(a2, 2)}\\cdot(${S.fmt(y[n - 2], 2)})` : ''}+${S.fmt(b0, 2)}\\cdot(${S.fmt(inp(n), 2)})${b1 ? `+${S.fmt(b1, 2)}\\cdot(${S.fmt(inp(n - 1), 2)})` : ''}=${S.fmt(y[n], 3)}`.replace(/−/g, '-') + '$');
    });
  });

  S.quiz('ch5', [
    { q: 'پاسخ کل یک معادلهٔ دیفرانسیل خطی از چه ساخته می‌شود؟', o: ['جمع پاسخ همگن و پاسخ خصوصی', 'فقط پاسخ خصوصی', 'ضرب پاسخ همگن و خصوصی', 'مشتق ورودی'], a: 0, e: 'بخش همگن به شرایط اولیه بستگی دارد و بخش خصوصی به ورودی.' },
    { q: 'شرط «سکون اولیه» برای چه لازم است؟', o: ['تا معادله یک سیستم LTI و علی را توصیف کند', 'تا معادله حل‌پذیر شود', 'تا ورودی صفر شود', 'تا سیستم بی‌حافظه شود'], a: 0, e: 'با شرط اولیهٔ غیرصفر، ورودی صفر خروجی غیرصفر می‌دهد و سیستم خطی نیست.' },
    { q: 'پاسخ ضربهٔ $\\dot y+3y=x$ در سکون اولیه چیست؟', o: ['$e^{-3t}u(t)$', '$3e^{-t}u(t)$', '$e^{3t}u(t)$', '$\\delta(t)-3$'], a: 0, e: 'تمرین ۵.۹. ضربه در $t=0^+$ شرط اولیهٔ $y(0^+)=1$ می‌سازد و بعد پاسخ همگن می‌ماند.' },
    { q: 'پاسخ ضربهٔ $\\ddot y+3\\dot y+2y=x$ چیست؟', o: ['$(e^{-t}-e^{-2t})u(t)$', '$(e^{-t}+e^{-2t})u(t)$', '$e^{-3t}u(t)$', '$te^{-t}u(t)$'], a: 0, e: 'قطب‌ها $-1$ و $-2$ هستند. این تمرین ۵.۱۰ است و می‌توانی با کشیدن قطب‌ها آن را ببینی.' },
    { q: 'پاسخ ضربهٔ $y[n]-0.5y[n-1]=x[n]$ چیست؟', o: ['$(0.5)^nu[n]$', '$(-0.5)^nu[n]$', '$0.5\\,\\delta[n]$', '$u[n]$'], a: 0, e: 'با اعمال بازگشتی: $1,\\;0.5,\\;0.25,\\;\\ldots$' },
    { q: 'سیستم پیوسته با قطب‌های $-1\\pm 3j$ چگونه است؟', o: ['پایدار با نوسان میرا', 'ناپایدار', 'بدون نوسان', 'نوسان با دامنهٔ ثابت'], a: 0, e: 'بخش حقیقی منفی است (میرا) و بخش موهومی نوسان می‌سازد.' },
  ]);
})();
