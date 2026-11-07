/* صفحهٔ اصلی: فهرست فصل‌ها و نمایش زندهٔ بالای صفحه */
document.addEventListener('DOMContentLoaded', () => {
  const S = SS, PI = Math.PI;
  const labsOf = {
    ch1: 'دیجیتال‌سازی، انرژی و توان، شیفت و مقیاس، تناوب گسسته، زوج و فرد، صفحهٔ مختلط',
    ch2: 'نمایی، مارپیچ مختلط، چرخ‌های هارمونیک، ضربه به‌عنوان حد، لگوی پله',
    ch3: 'اتصال سری و موازی، آزمایشگر خواص سیستم، بلوک‌های پایه، پرسپترون',
    ch4: 'جمع آثار، کانولوشن گسسته و پیوسته، رادار با همبستگی، خواص h، تشخیص رقم',
    ch5: 'پاسخ همگن و خصوصی، پدال و سرعت، کشیدن قطب‌ها، معادلهٔ تفاضلی گام به گام',
    ch6: 'سینت‌سایزر با صدا، چرخ‌های فوریه، گیبس، معادلهٔ تحلیل، خواص، فیلتر',
    ch7: 'جدول تعامد، ویرایشگر سری گسسته، موج مربعی، خواص، سیستم LTI گسسته',
    ch8: 'از سری به تبدیل، کاوشگر طیف، باند محدود، پاسخ فرکانسی، فیلتر کردن',
  };
  const list = document.getElementById('path');
  S.CHAPTERS.forEach((c, i) => {
    const li = document.createElement('li');
    const sc = S.store.get('quiz:' + c.id);
    li.innerHTML = `<span class="node" aria-hidden="true">${(i + 1).toLocaleString('fa-IR')}</span><a class="ch-card" href="${c.id}.html">${sc ? `<span class="ch-score">آزمونک: ${(+sc).toLocaleString('fa-IR')} درست</span>` : ''}<h2>${c.t}</h2><p>${c.s}</p><div class="labs">${labsOf[c.id]}</div></a>`;
    list.appendChild(li);
  });

  let N = 3, t = 0;
  const part = q => { let s = 0; for (let k = 1; k <= N; k++) s += Math.sin((2 * k - 1) * q) / (2 * k - 1); return 4 / PI * s; };
  const p = new S.Plot(document.getElementById('hero'), { height: 250, x: [0, 4 * PI], y: [-1.5, 1.5], xpi: true, xlabel: 't', draw: q => {
    for (let k = 1; k <= Math.min(N, 5); k++) q.fn(v => 4 / PI * Math.sin((2 * k - 1) * (v - t)) / (2 * k - 1), { color: 'grid', w: 1.2 });
    q.fn(v => (Math.sin(v - t) >= 0 ? 1 : -1), { color: 'axis', w: 1 });
    q.fn(v => part(v - t), { color: 'h', w: 2.6, q: 2 });
  } });
  const inp = document.getElementById('hero-n'), out = document.getElementById('hero-o');
  inp.addEventListener('input', () => { N = +inp.value; out.textContent = (2 * N - 1) + 'ω'; p.render(); });
  out.textContent = (2 * N - 1) + 'ω';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loop = () => { t += .006; p.render(); requestAnimationFrame(loop); };
  if (still) p.render(); else loop();
});
