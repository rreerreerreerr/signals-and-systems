(function () {
  const S = SS, PI = Math.PI;

  S.lab('real-exp', L => {
    let mode = 'ct', C = 1, a = -.5, al = .8;
    const ns = S.range(-2, 14);
    L.plot({ height: 230, x: [-2, 6], y: [-1, 4], xlabel: 't', ylabel: 'x', draw: p => {
      if (mode === 'ct') {
        p.o.intX = false; p.o.xlabel = 't'; p.setX(-2, 6);
        p.setY(Math.min(0, C) * 1.3 - .15, Math.max(0, C) * 3 + .4); p.begin();
        p.fn(t => C * Math.exp(a * t), { color: 'x', w: 2.4 });
        if (a) p.vline(1 / Math.abs(a));
      } else {
        p.o.intX = true; p.o.xlabel = 'n'; p.setX(-2.5, 14.5);
        const vals = ns.map(n => C * al ** n); p.autoY(vals.map(v => S.clamp(v, -6, 6)), 2); p.begin();
        p.stem(ns, vals, { color: 'x' });
      }
    } });
    const ui = L.controls();
    ui.seg('نوع', [['ct', '$Ce^{at}$'], ['dt', '$C\\alpha^n$']], mode, v => { mode = v; vis(); });
    ui.slider('دامنه $C$', { min: -2, max: 2, step: .1, value: C }, v => { C = v; });
    const sa = ui.slider('نرخ $a$', { min: -2, max: 2, step: .05, value: a }, v => { a = v; });
    const sb = ui.slider('پایه $\\alpha$', { min: -1.4, max: 1.4, step: .02, value: al }, v => { al = v; });
    function vis() { sa.el.style.display = mode === 'ct' ? '' : 'none'; sb.el.style.display = mode === 'ct' ? 'none' : ''; }
    vis();
    const note = L.note();
    L.after(() => {
      if (mode === 'ct') note(a < 0 ? `میراست. ثابت زمانی $\\tau=1/|a|=${S.fmt(1 / -a)}$ است: بعد از این زمان سیگنال به حدود ۳۷٪ می‌رسد (خط‌چین).` : a > 0 ? `رشد می‌کند و هر ${S.fmt(Math.log(2) / a)} ثانیه دو برابر می‌شود.` : 'با $a=0$ فقط یک مقدار ثابت داری.');
      else note(al < 0 ? 'پایهٔ منفی علامت را در هر گام عوض می‌کند. این رفتار معادل پیوستهٔ حقیقی ندارد.' + (Math.abs(al) > 1 ? ' اندازه هم رشد می‌کند.' : '') : al > 1 ? 'چون $\\alpha>1$ سیگنال رشد می‌کند.' : al === 1 ? 'مقدار ثابت.' : 'چون $|\\alpha|<1$ سیگنال میراست.');
    });
  });

  S.lab('complex-exp', L => {
    let sg = -.15, w = 2, ph = 0, t = 0;
    const x = tt => { const m = Math.exp(sg * tt); return [m * Math.cos(w * tt + ph), m * Math.sin(w * tt + ph)]; };
    const TM = 10;
    const row = L.row();
    const pz = L.plot({ height: 300, x: [-1.4, 1.4], y: [-1.4, 1.4], equal: true, xlabel: 'Re', ylabel: 'Im', title: 'صفحهٔ مختلط', draw: p => {
      p.circle(0, 0, 1, { dash: [3, 4] });
      const ts = S.linspace(0, t, Math.max(2, Math.ceil(t * 40)));
      p.line(ts.map(q => x(q)[0]), ts.map(q => x(q)[1]), { color: 'a', w: 1.6 });
      const v = x(t); p.arrow(0, 0, v[0], v[1], { color: 'ink', w: 2 }); p.dot(v[0], 0, { color: 'x', r: 4 }); p.dot(0, v[1], { color: 'h', r: 4 });
      p.seg(v[0], v[1], v[0], 0, { color: 'x', w: 1, dash: [3, 3] }); p.seg(v[0], v[1], 0, v[1], { color: 'h', w: 1, dash: [3, 3] });
    } }, row);
    const pt = L.div('', '', row);
    const pr = L.plot({ height: 142, x: [0, TM], y: [-1.5, 1.5], xlabel: 't', ylabel: 'Re', draw: p => { p.fn(q => x(q)[0], { color: 'x' }); p.vline(t); p.dot(t, x(t)[0], { color: 'x' }); } }, pt);
    const pi = L.plot({ height: 142, x: [0, TM], y: [-1.5, 1.5], xlabel: 't', ylabel: 'Im', draw: p => { p.fn(q => x(q)[1], { color: 'h' }); p.vline(t); p.dot(t, x(t)[1], { color: 'h' }); } }, pt);
    const redraw = () => { [pz, pr, pi].forEach(p => p.render()); };
    const A = L.anim(dt => { t += dt * 1.1; if (t > TM) t = 0; ts.set(t); redraw(); });
    const ui = L.controls();
    ui.slider('میرایی $\\sigma$', { min: -.6, max: .15, step: .01, value: sg }, v => { sg = v; });
    ui.slider('فرکانس زاویه‌ای $\\omega$', { min: -6, max: 6, step: .1, value: w }, v => { w = v; });
    ui.slider('فاز $\\phi$', { min: -3.14, max: 3.14, step: .01, value: ph }, v => { ph = v; });
    const ts = ui.slider('زمان $t$', { min: 0, max: TM, step: .01, value: 0 }, v => { t = v; A.set(false); });
    ui.play(A);
    const note = L.note();
    L.after(() => {
      ts.set(t);
      note(`$\\sigma$ شعاع را کم و زیاد می‌کند و $\\omega$ سرعت چرخش را تعیین می‌کند. دورهٔ چرخش $T_0=2\\pi/|\\omega|=${w ? S.fmt(2 * PI / Math.abs(w)) : '\\infty'}$ است. ${sg < 0 ? 'با $\\sigma<0$ مارپیچ به داخل می‌رود.' : sg > 0 ? 'با $\\sigma>0$ مارپیچ به بیرون می‌رود.' : 'با $\\sigma=0$ نقطه روی دایرهٔ واحد می‌ماند و سیگنال متناوب است.'}`);
    });
  });

  S.lab('harmonics', L => {
    const ks = [0, 1, 2, 3, 4, 5, -1, -2];
    let t = 0, k = 2;
    const T0 = 2 * PI;
    const wheels = L.plot({ height: 150, x: [0, 8], y: [0, 2.05], title: 'همهٔ این چرخ‌ها بعد از یک دورهٔ T₀ با هم به نقطهٔ شروع برمی‌گردند', m: [4, 6, 4, 6], draw: p => {
      const w = (p.R - p.L) / 8, h = p.B - p.T, g = p.g; const r = Math.min(w, h * .8) * .42;
      ks.forEach((q, i) => {
        const cx = p.L + w * (i + .5), cy = p.T + h * .46, on = q === k;
        g.strokeStyle = S.col(on ? 'h' : 'axis'); g.lineWidth = on ? 2 : 1; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
        const a = q * t, dx = r * Math.cos(a), dy = -r * Math.sin(a);
        g.strokeStyle = S.col(on ? 'h' : 'x'); g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx, cy + dy); g.stroke();
        g.fillStyle = S.col(on ? 'h' : 'x'); g.beginPath(); g.arc(cx + dx, cy + dy, 3.5, 0, 7); g.fill();
        g.fillStyle = S.col('ink'); g.font = 'italic 13px serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('k=' + String(q).replace('-', '−'), cx, cy + r + 5);
      });
    } });
    const pl = L.plot({ height: 170, x: [0, T0], y: [-1.3, 1.3], xpi: true, xlabel: 'ω₀t', ylabel: 'Re Φₖ', draw: p => { p.fn(q => Math.cos(k * q), { color: 'h', q: 2 }); p.vline((t % T0)); } });
    const A = L.anim(dt => { t += dt * .9; wheels.render(); pl.render(); });
    const ui = L.controls();
    ui.slider('هارمونیک $k$', { min: -5, max: 5, step: 1, value: k }, v => { k = v; });
    ui.play(A);
    const st = L.stats();
    L.after(() => st({ 'فرکانس': `${k === 0 ? '0' : Math.abs(k) + 'ω₀'}`, 'دورهٔ اصلی': k === 0 ? 'ثابت' : `T₀/${Math.abs(k)}`, 'چرخش': k === 0 ? '—' : `${k > 0 ? 'پادساعتگرد' : 'ساعتگرد'}` }));
  });

  S.lab('dt-alias', L => {
    let O = PI / 4;
    const ns = S.range(0, 24), row = L.row();
    L.plot({ height: 260, x: [-1.3, 1.3], y: [-1.3, 1.3], equal: true, title: 'محل نقطه‌ها روی دایرهٔ واحد', draw: p => {
      p.circle(0, 0, 1, { dash: [3, 4] });
      ns.forEach(n => p.dot(Math.cos(O * n), Math.sin(O * n), { color: 'x', r: n === 1 ? 5.5 : 3.5 }));
      p.seg(0, 0, Math.cos(O), Math.sin(O), { color: 'h' });
    } }, row);
    L.plot({ height: 260, x: [-.5, 24.5], y: [-1.3, 1.3], intX: true, xlabel: 'n', ylabel: 'cos Ωn', title: 'مقدار سیگنال', draw: p => {
      p.fn(t => Math.cos(O * t), { color: 'axis', w: 1, q: 2 });
      p.stem(ns, ns.map(n => Math.cos(O * n)), { color: 'x' });
    } }, row);
    const ui = L.controls();
    const s = ui.slider('$\\Omega$ (بر حسب $\\pi$)', { min: 0, max: 4, step: .01, value: .25, fmt: v => S.fmt(v, 2) + 'π' }, v => { O = v * PI; });
    ui.button('π/4', () => { s.set(.25); O = PI / 4; });
    ui.button('π/4 + 2π', () => { s.set(2.25); O = 2.25 * PI; });
    ui.button('π (سریع‌ترین)', () => { s.set(1); O = PI; });
    ui.button('2π (ثابت!)', () => { s.set(2); O = 2 * PI; });
    const note = L.note();
    L.after(() => {
      const r = ((O % (2 * PI)) + 2 * PI) % (2 * PI), eff = r > PI ? 2 * PI - r : r;
      note(`این سیگنال با $\\Omega=${S.fmt(eff / PI, 2)}\\pi$ هیچ فرقی ندارد. فرکانس مؤثر در بازهٔ $[0,\\pi]$ جا می‌گیرد: ${eff < .3 ? 'نزدیک $0$ یا $2\\pi$ سیگنال کند است.' : eff > 2.84 ? 'نزدیک $\\pi$ سیگنال در هر گام علامت عوض می‌کند و سریع‌ترین حالت است.' : 'بالا بردن $\\Omega$ از $\\pi$ به بعد سیگنال را دوباره کند می‌کند.'}`);
    });
  });

  S.lab('impulse-limit', L => {
    let D = 1, t0 = 1, k = 'exp';
    const sigs = { exp: ['e^{t/2}', t => Math.exp(t / 2)], cos: ['\\cos(2t)+1.5', t => Math.cos(2 * t) + 1.5], par: ['t+2', t => t + 2] };
    const row = L.row();
    L.plot({ height: 210, x: [-3, 3], y: [-.5, 6], xlabel: 't', title: 'تابع و پالس باریک با پهنای Δ', draw: p => {
      const f = sigs[k][1], h = 1 / D;
      p.setY(-.3, Math.max(h, 4) * 1.1); p.begin();
      p.fn(f, { color: 'x' });
      const xs = [t0 - D / 2, t0 - D / 2, t0 + D / 2, t0 + D / 2];
      p.line(xs, [0, h, h, 0], { color: 'h' }); p.area(xs, [0, h, h, 0], { color: 'h' });
      p.dot(t0, f(t0), { color: 'x' });
    } }, row);
    L.plot({ height: 210, x: [-3, 3], y: [-.5, 6], xlabel: 't', title: 'حاصل‌ضرب تابع در پالس؛ انتگرالش مساحت همین است', draw: p => {
      const f = sigs[k][1], h = 1 / D;
      p.setY(-.3, Math.max(h * f(t0), 3) * 1.25); p.begin();
      const xs = S.linspace(t0 - D / 2, t0 + D / 2, 60);
      const ys = xs.map(t => f(t) * h);
      p.area(xs, ys, { color: 'y' }); p.line([xs[0], ...xs, xs[59]], [0, ...ys, 0], { color: 'y' });
    } }, row);
    const ui = L.controls();
    ui.select('تابع', [['exp', 'e^(t/2)'], ['cos', 'cos(2t)+1.5'], ['par', 't+2']], k, v => { k = v; });
    ui.slider('پهنای پالس $\\Delta$', { min: .02, max: 2, step: .01, value: D }, v => { D = v; });
    ui.slider('محل ضربه $t_0$', { min: -2, max: 2, step: .05, value: t0 }, v => { t0 = v; });
    const st = L.stats();
    L.after(() => {
      const f = sigs[k][1]; let I = 0; for (let i = 0; i < 400; i++) I += f(t0 - D / 2 + (i + .5) * D / 400) * (1 / D) * (D / 400);
      st({ 'ارتفاع پالس $1/\\Delta$': S.fmt(1 / D, 2), 'مساحت پالس': '1', '$\\int x(t)\\delta_\\Delta(t-t_0)dt$': S.fmt(I, 4), '$x(t_0)$': S.fmt(f(t0), 4), 'اختلاف': S.fmt(Math.abs(I - f(t0)), 4) });
    });
  });

  S.lab('lego', L => {
    let terms = [[2, 1], [-1, 2], [-1, 5]];
    const val = t => terms.reduce((s, [a, c]) => s + a * S.u(t - c), 0);
    const row = L.row();
    L.plot({ height: 200, x: [-4, 8], y: [-3, 3], xlabel: 't', ylabel: 'x(t) = Σ Aᵢ u(t−tᵢ)', draw: p => {
      const vs = S.linspace(-4, 8, 500).map(val); p.autoY(vs, 2); p.begin(); p.fn(val, { color: 'x', fill: true, q: 2 });
    } }, row);
    L.plot({ height: 200, x: [-4, 8], y: [-3, 3], xlabel: 't', ylabel: 'dx/dt = Σ Aᵢ δ(t−tᵢ)', draw: p => {
      p.autoY(terms.map(q => q[0]), 2); p.begin(); terms.forEach(([a, c]) => { if (a) p.arrowUp(c, a, { color: 'h' }); });
    } }, row);
    const list = L.div('terms');
    const ui = L.controls();
    const paint = () => {
      list.textContent = '';
      const u = L.controls(list);
      terms.forEach((q, i) => {
        u.slider(`پله ${(i + 1).toLocaleString('fa-IR')}: دامنه $A$`, { min: -3, max: 3, step: .5, value: q[0] }, v => { q[0] = v; });
        u.slider('محل $t_i$', { min: -4, max: 8, step: .5, value: q[1] }, v => { q[1] = v; });
      });
    };
    ui.button('＋ پلهٔ جدید', () => { if (terms.length < 6) { terms.push([1, 0]); paint(); } });
    ui.button('حذف آخری', () => { terms.pop(); paint(); });
    ui.button('تمرین ۲.۱۷', () => { terms = [[2, 1], [-1, 2], [-1, 5]]; paint(); });
    ui.button('تمرین ۲.۱۸', () => { terms = [[1, -2], [1, 1], [-1, 5], [-1, 6]]; paint(); });
    paint();
    const st = L.stats();
    L.after(() => st({ 'رابطه': terms.map(([a, c]) => `${a < 0 ? '−' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}u(t${c ? (c > 0 ? '−' : '+') + Math.abs(c) : ''})`).join(' ').replace(/^\+/, '') || '0' }));
  });

  S.lab('running-sum', L => {
    const ns = S.range(-6, 10), x = ns.map(n => (n === 0 ? 1 : 0));
    const sum = () => { let s = 0; return x.map(v => (s += v)); };
    const dif = () => x.map((v, i) => v - (i ? x[i - 1] : 0));
    const p1 = L.plot({ height: 160, x: [-6.5, 10.5], y: [-2.3, 2.3], intX: true, xlabel: 'n', ylabel: 'x[n]', title: 'نمونه‌ها را بالا و پایین بکش', draw: p => p.stem(ns, x, { color: 'x', r: 4 }) });
    p1.editStems(ns, x, L.update, { snap: .5, max: 2 });
    const row = L.row();
    L.plot({ height: 150, x: [-6.5, 10.5], y: [-3, 3], intX: true, xlabel: 'n', ylabel: 'Σ x[k]', title: 'جمع انباشته (انتگرال گسسته)', draw: p => { const v = sum(); p.autoY(v, 2); p.begin(); p.stem(ns, v, { color: 'y' }); } }, row);
    L.plot({ height: 150, x: [-6.5, 10.5], y: [-3, 3], intX: true, xlabel: 'n', ylabel: 'x[n]−x[n−1]', title: 'تفاضل اول (مشتق گسسته)', draw: p => { const v = dif(); p.autoY(v, 2); p.begin(); p.stem(ns, v, { color: 'h' }); } }, row);
    const ui = L.controls();
    const set = f => ns.forEach((n, i) => { x[i] = f(n); });
    ui.button('ضربه δ[n]', () => set(n => (n === 0 ? 1 : 0)));
    ui.button('پله u[n]', () => set(n => (n >= 0 ? 1 : 0)));
    ui.button('تمرین ۲.۱۳', () => set(n => (n === 1 ? 2 : n === 2 ? -1 : 0)));
    ui.button('صفر', () => set(() => 0));
  });

  S.quiz('ch2', [
    { q: 'سیگنال $x(t)=e^{(-2+j5)t}$ در صفحهٔ مختلط چه شکلی می‌سازد؟', o: ['مارپیچی که به مرکز می‌رسد', 'دایرهٔ کامل', 'خط راست', 'مارپیچ رو به بیرون'], a: 0, e: 'بخش حقیقی نما ($-2$) شعاع را کم می‌کند و بخش موهومی ($5$) می‌چرخاند.' },
    { q: 'کدام گزینه برای $e^{j\\Omega n}$ درست است؟', o: ['$\\Omega$ و $\\Omega+2\\pi$ دقیقاً یک سیگنال می‌سازند', 'هرچه $\\Omega$ بزرگ‌تر، نوسان سریع‌تر', 'همیشه متناوب است', 'دورهٔ آن همیشه $2\\pi/\\Omega$ است'], a: 0, e: 'چون $e^{j2\\pi n}=1$ برای هر $n$ صحیح. این فرق بزرگ زمان گسسته با پیوسته است.' },
    { q: '$\\sum_n (n-2)\\delta[n-2]$ چند است؟', o: ['۰', '۱', '$-2$', '$n-2$'], a: 0, e: 'ضربه مقدار ضریب را در $n=2$ نمونه می‌گیرد و آنجا $n-2=0$ است.' },
    { q: '$\\int_{-\\infty}^{\\infty}(t+2)\\delta(t)\\,dt$ چند است؟', o: ['۲', '۰', '۱', '$t+2$'], a: 0, e: 'خاصیت غربال: مقدار تابع را در محل ضربه برمی‌دارد.' },
    { q: 'رابطهٔ درست بین پله و ضربهٔ گسسته کدام است؟', o: ['$\\delta[n]=u[n]-u[n-1]$', '$u[n]=\\delta[n]-\\delta[n-1]$', '$\\delta[n]=u[n]\\,u[n-1]$', '$u[n]=\\delta[n]$'], a: 0, e: 'تفاضل اول پله ضربه است، و جمع انباشتهٔ ضربه پله است.' },
    { q: 'سیگنال $2u(t-1)-u(t-2)-u(t-5)$ در بازهٔ $2<t<5$ چه مقداری دارد؟', o: ['۱', '۲', '۰', '$-1$'], a: 0, e: 'تا این بازه پله‌های $t=1$ و $t=2$ فعال شده‌اند: $2-1=1$.' },
  ]);
})();
