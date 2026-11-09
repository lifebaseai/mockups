/* phone-site-v1 (2026-11-09): the bar, the reveals, the picture of a demo
   and the one form. A file of its own: the live server runs no inline
   script (server.js, Content-Security-Policy). */
(() => {
  const html = document.documentElement;
  html.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);

  /* The bar turns to glass once the page moves. */
  const bar = $('bar');
  const onScroll = () => bar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Each part rises in as it comes into view. */
  const seen = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => seen.observe(el));

  /* The picture of a demo: a made-up roofer's page, its call shown as words
     only (no sound), clearly labeled. It runs only while it is on screen,
     and not at all for anyone who asks for less motion: they see the end,
     the lead. */
  const screen = $('screen');
  const steps = [...document.querySelectorAll('.step')];
  const scenes = Object.fromEntries([...document.querySelectorAll('[data-scene]')].map(s => [s.dataset.scene, s]));
  const LINES = [
    { who: 'sofie', text: "Hi, you've reached Ironleaf Roofing. This is Sofie, their AI assistant, and this call may be recorded. How can I help you today?" },
    { who: 'caller', text: "Water's coming through the ceiling at our warehouse. Can someone come out tonight?" },
    { chips: true },
    { who: 'sofie', text: "I'll get this to the team right away. Can I get your name?" },
    { who: 'caller', text: 'Dana Whitfield. Roughly what does a leak repair cost?' },
    { who: 'sofie', text: "I don't have pricing for that, so the team will give you an exact quote. What's the best number for you?" },
    { who: 'caller', text: '555 214 7788.' },
    { who: 'sofie', text: "That's 555-214-7788. Is that right?" },
    { who: 'caller', text: "Yes, that's right." },
  ];
  if (!screen || still) return form();
  html.classList.add('anim');

  const NAME = { sofie: 'Sofie', caller: 'AI customer' };
  const orbs = { sofie: $('o-sofie'), caller: $('o-caller') };
  const level = { sofie: 0, caller: 0 }, target = { sofie: 0, caller: 0 };
  let speaking = null, visible = false, timer = null, frameOn = false, clockAt = 0, clockTimer = null, run = 0;

  const show = name => {
    for (const [key, el] of Object.entries(scenes)) el.hidden = key !== name;
    steps.forEach((s, i) => s.classList.toggle('on', i === { reading: 0, call: 1, lead: 2 }[name]));
    scenes.lead.classList.toggle('landed', name === 'lead');
  };
  const wait = ms => new Promise(resolve => { timer = setTimeout(resolve, ms); });
  const tick = () => { const s = Math.floor((Date.now() - clockAt) / 1000); $('clock').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function frame() {
    if (!visible) { frameOn = false; return; }
    const t = performance.now() / 1000;
    for (const who of ['sofie', 'caller']) {
      if (speaking === who) target[who] = .28 + .5 * Math.abs(Math.sin(t * 7.3 + (who === 'sofie' ? 0 : 1.7))) * (.6 + .4 * Math.sin(t * 2.1));
      level[who] += (target[who] - level[who]) * .3;
      target[who] *= .9;
      orbs[who].style.setProperty('--level', Math.max(0, Math.min(1, level[who])).toFixed(3));
      orbs[who].classList.toggle('talking', speaking === who);
    }
    requestAnimationFrame(frame);
  }

  async function play(mine) {
    const alive = () => mine === run && visible;
    // 1. Her facts, read from their website and listing.
    show('reading');
    const facts = [...scenes.reading.querySelectorAll('.fact')];
    facts.forEach(f => f.classList.remove('in'));
    await wait(700);
    for (const f of facts) { if (!alive()) return; f.classList.add('in'); await wait(420); }
    await wait(1600);
    if (!alive()) return;
    // 2. The call, line by line, with one click to steer the caller.
    show('call');
    const chips = $('chips'), first = chips.querySelector('.chip');
    chips.classList.remove('in'); first.classList.remove('press', 'sent'); first.textContent = first.dataset.label;
    $('w-before').textContent = ''; $('w-who').textContent = ''; $('w-now').textContent = '';
    clockAt = Date.now(); tick(); clockTimer = setInterval(tick, 500);
    await wait(900);
    let said = '';
    for (const line of LINES) {
      if (!alive()) break;
      if (line.chips) {
        chips.classList.add('in');
        await wait(1300); if (!alive()) break;
        first.classList.add('press');
        await wait(420);
        first.classList.remove('press'); first.classList.add('sent'); first.textContent = 'Sent · the caller says it next';
        await wait(900);
        continue;
      }
      if (said) $('w-before').textContent = said;
      $('w-who').textContent = NAME[line.who];
      $('w-now').textContent = line.text;
      said = NAME[line.who] + ': ' + line.text;
      speaking = line.who;
      await wait(Math.min(4600, Math.max(1500, line.text.length * 42)));
      speaking = null;
      await wait(380);
    }
    clearInterval(clockTimer);
    if (!alive()) return;
    // 3. The lead, the moment she saves it.
    show('lead');
    await wait(7000);
    if (alive()) play(mine);
  }

  const start = () => { if (!frameOn) { frameOn = true; requestAnimationFrame(frame); } play(++run); };
  const stop = () => { run++; clearTimeout(timer); clearInterval(clockTimer); speaking = null; };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !visible) { visible = true; start(); }
    else if (!e.isIntersecting && visible) { visible = false; stop(); }
  }, { threshold: .35 }).observe(screen);

  form();

  /* The one form: their website and email for a free demo. On the hidden
     preview (GitHub Pages) there is nowhere to send it, so it says so. */
  function form() {
    const f = $('demo-form');
    if (!f) return;
    const opened = Date.now();
    const button = f.querySelector('button[type="submit"]');
    const line = $('form-status');
    const preview = /\.github\.io$/.test(location.hostname) || location.protocol === 'file:';
    if (preview) { button.disabled = true; line.textContent = 'This is a preview: the form works once the site is live.'; }
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (preview) return;
      const website = f.website.value.trim(), email = f.email.value.trim(), name = f.name.value.trim();
      if (!website) { line.textContent = 'Add your website, so she can be built from it.'; return f.website.focus(); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { line.textContent = 'Add an email I can send your demo to.'; return f.email.focus(); }
      button.disabled = true; line.textContent = 'Sending…';
      try {
        const res = await fetch('/api/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, email, website, message: `Free demo request for ${website}.`, kind: 'demo', fax: f.fax.value, t: Date.now() - opened, page: location.pathname }),
        });
        if (res.status === 429) throw new Error("That's a few in a row. Please try again in a few minutes.");
        if (!res.ok) throw new Error("That didn't go through. Please try again in a minute.");
        const done = $('form-done');
        $('done-email').textContent = email;
        f.hidden = true; done.hidden = false;
        done.querySelector('h3').focus();
      } catch (error) {
        line.textContent = error.message.startsWith('That') ? error.message : "That didn't go through. Please try again in a minute.";
        button.disabled = false;
      }
    });
  }
})();
