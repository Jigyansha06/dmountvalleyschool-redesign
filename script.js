/* =========================================================
   D'MOUNT VALLEY SCHOOL — script.js
   GSAP + ScrollTrigger driven interactions.
   Note: in place of Lenis, we use gsap.ScrollTrigger.normalizeScroll()
   + native smooth scroll-behavior, avoiding an unverified extra
   CDN dependency while keeping scroll buttery and consistent
   across trackpads/mouse wheels.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none)').matches;

  gsap.registerPlugin(ScrollTrigger);
  if(!reduceMotion){ ScrollTrigger.normalizeScroll(true); }

  /* ============ helper: split text into word/line spans ============ */
  function splitLines(el){
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = '';
    words.forEach((w, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'split-line';
      const inner = document.createElement('span');
      inner.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
    return el.querySelectorAll('.split-line > span');
  }

  /* ============ preloader ============ */
  const preloader = document.querySelector('.preloader');
  const preBar = document.querySelector('.preloader-bar span');
  const tlPre = gsap.timeline({
    onComplete: () => {
      preloader.style.pointerEvents = 'none';
      document.body.classList.add('loaded');
      playHeroIntro();
    }
  });
  tlPre.to(preBar, {width:'100%', duration:1.1, ease:'power2.inOut'})
       .to(preloader, {yPercent:-100, duration:.9, ease:'power4.inOut'}, '+=0.1');

  /* ============ custom cursor ============ */
  const cDot = document.querySelector('.cursor-dot');
  const cRing = document.querySelector('.cursor-ring');
  if(!isTouch && cDot && cRing){
    let mx=0,my=0, rx=0, ry=0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cDot.style.left = mx+'px'; cDot.style.top = my+'px'; });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      cRing.style.left = rx + 'px'; cRing.style.top = ry + 'px';
    });
    document.querySelectorAll('a, button, .magnetic, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cRing.classList.remove('is-active'));
    });
  }

  /* ============ magnetic buttons ============ */
  if(!isTouch && !reduceMotion){
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        gsap.to(el, {x:x*0.35, y:y*0.4, duration:.5, ease:'power3.out'});
      });
      el.addEventListener('mouseleave', () => gsap.to(el, {x:0, y:0, duration:.6, ease:'elastic.out(1,0.4)'}));
    });
  }

  /* ============ nav scroll state + burger ============ */
  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    start:'top -60',
    onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 40)
  });
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if(burger){
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      burger.classList.toggle('open');
    });
    mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileNav.classList.remove('open'); burger.classList.remove('open');
    }));
  }

  /* ============ scroll progress rail ============ */
  const railFill = document.querySelector('.scroll-rail span');
  if(railFill){
    ScrollTrigger.create({
      start:0, end:'max',
      onUpdate: self => railFill.style.height = (self.progress*100)+'%'
    });
  }

  /* ============ hero intro sequence ============ */
  function playHeroIntro(){
    const heroTitle = document.querySelector('.hero-title');
    const lines = splitLines(heroTitle);
    const tl = gsap.timeline({defaults:{ease:'power4.out'}});
    tl.set(heroTitle, {opacity:1})
      .from(lines, {yPercent:120, duration:1.1, stagger:0.06})
      .from('.hero-eyebrow', {opacity:0, y:16, duration:.7}, '-=0.7')
      .from('.hero-lead', {opacity:0, y:20, duration:.8}, '-=0.6')
      .from('.hero-ctas .btn', {opacity:0, y:20, duration:.7, stagger:0.1}, '-=0.55')
      .from('.hero-card', {opacity:0, y:24, duration:.8}, '-=0.5')
      .from('.hero-scroll-cue', {opacity:0, duration:.6}, '-=0.4')
      .from('.marquee-strip', {yPercent:100, duration:.8, ease:'power3.out'}, '-=0.5');

    // ambient particles
    const field = document.querySelector('.hero-particles');
    if(field && !reduceMotion){
      for(let i=0;i<22;i++){
        const p = document.createElement('span');
        const size = 3 + Math.random()*6;
        p.style.width = size+'px'; p.style.height = size+'px';
        p.style.left = Math.random()*100+'%';
        field.appendChild(p);
        gsap.to(p, {
          y: -(400 + Math.random()*500), x: (Math.random()-0.5)*160,
          opacity: 0.7, duration: 6+Math.random()*8, repeat:-1, delay: Math.random()*6,
          ease:'sine.inOut',
          onRepeat(){ gsap.set(p, {y:0, opacity:0}); }
        });
      }
    }
  }
  if(reduceMotion){
    document.querySelectorAll('[data-fade],[data-scale],[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform='none'; });
  }

  /* ============ hero parallax on scroll + mouse ============ */
  const heroBgImg = document.querySelector('.hero-bg img');
  if(heroBgImg && !reduceMotion){
    gsap.to(heroBgImg, {
      scale:1, yPercent:8, ease:'none',
      scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}
    });
    if(!isTouch){
      document.querySelector('.hero').addEventListener('mousemove', e => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - 0.5;
        const py = (e.clientY - r.top)/r.height - 0.5;
        gsap.to(heroBgImg, {x: px*-26, duration:1, ease:'power2.out'});
        gsap.to('.hero-card', {x: px*14, y: py*14, duration:1, ease:'power2.out'});
      });
    }
  }

  /* ============ generic reveal system ============ */
  gsap.utils.toArray('[data-fade]').forEach(el => {
    gsap.to(el, {
      opacity:1, y:0, duration:1, ease:'power3.out',
      scrollTrigger:{trigger:el, start:'top 85%'}
    });
  });
  gsap.utils.toArray('[data-scale]').forEach(el => {
    gsap.to(el, {
      opacity:1, scale:1, duration:1.1, ease:'power3.out',
      scrollTrigger:{trigger:el, start:'top 85%'}
    });
  });
  gsap.utils.toArray('[data-stagger]').forEach(group => {
    const kids = group.children;
    gsap.from(kids, {
      opacity:0, y:34, duration:.9, stagger:0.1, ease:'power3.out',
      scrollTrigger:{trigger:group, start:'top 82%'}
    });
  });
  gsap.utils.toArray('.split-reveal').forEach(el => {
    const lines = splitLines(el);
    gsap.set(el, {opacity:1});
    gsap.from(lines, {
      yPercent:110, duration:1, stagger:0.03, ease:'power4.out',
      scrollTrigger:{trigger:el, start:'top 88%'}
    });
  });

  /* ============ philosophy stat count-up ============ */
  gsap.utils.toArray('.philo-stat strong[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = {val:0};
    ScrollTrigger.create({
      trigger:el, start:'top 85%', once:true,
      onEnter:() => gsap.to(obj, {val:end, duration:1.6, ease:'power2.out', onUpdate:() => {
        el.textContent = (Number.isInteger(end) ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
      }})
    });
  });

  /* ============ timeline spine fill + active node ============ */
  const spineFill = document.querySelector('.timeline-spine-fill');
  if(spineFill){
    gsap.to(spineFill, {
      height:'100%', ease:'none',
      scrollTrigger:{trigger:'.timeline', start:'top 60%', end:'bottom 70%', scrub:true}
    });
  }
  gsap.utils.toArray('.timeline-item').forEach(item => {
    ScrollTrigger.create({
      trigger:item, start:'top 55%', end:'bottom 45%',
      onEnter:() => item.classList.add('is-active'),
      onLeaveBack:() => item.classList.remove('is-active')
    });
    gsap.from(item.querySelector('.tl-figure'), {
      opacity:0, scale:0.9, duration:1, ease:'power3.out',
      scrollTrigger:{trigger:item, start:'top 80%'}
    });
    gsap.from(item.querySelectorAll('.tl-stage, .tl-title, .tl-desc'), {
      opacity:0, y:24, duration:.8, stagger:0.08, ease:'power3.out',
      scrollTrigger:{trigger:item, start:'top 78%'}
    });
  });

  /* ============ campus media parallax ============ */
  if(!reduceMotion){
    gsap.to('.cm-main', {yPercent:-6, ease:'none', scrollTrigger:{trigger:'.campus', start:'top bottom', end:'bottom top', scrub:true}});
    gsap.to('.cm-float', {yPercent:8, ease:'none', scrollTrigger:{trigger:'.campus', start:'top bottom', end:'bottom top', scrub:true}});
    gsap.to('.cm-ring', {rotate:80, ease:'none', scrollTrigger:{trigger:'.campus', start:'top bottom', end:'bottom top', scrub:true}});
  }

  /* ============ bento card entrance ============ */
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.from(card, {
      opacity:0, y:50, duration:.9, ease:'power3.out', delay: (i%3)*0.05,
      scrollTrigger:{trigger:card, start:'top 88%'}
    });
  });

  /* ============ why-us feature rows ============ */
  gsap.utils.toArray('.why-feature').forEach(row => {
    gsap.from(row.children, {
      opacity:0, y:26, duration:.8, stagger:0.08, ease:'power3.out',
      scrollTrigger:{trigger:row, start:'top 85%'}
    });
  });

  /* ============ leadership rows ============ */
  gsap.utils.toArray('.leader-row').forEach(row => {
    const photo = row.querySelector('.lr-photo');
    const copy = row.querySelector('.lr-copy');
    const fromX = row.classList.contains('reverse') ? 40 : -40;
    gsap.from(photo, {opacity:0, x:fromX, duration:1, ease:'power3.out', scrollTrigger:{trigger:row, start:'top 82%'}});
    gsap.from(copy.children, {opacity:0, y:24, duration:.8, stagger:0.08, ease:'power3.out', scrollTrigger:{trigger:row, start:'top 80%'}});
  });

  /* ============ achievements cards ============ */
  gsap.utils.toArray('.ach-card').forEach((card,i) => {
    gsap.from(card, {opacity:0, y:40, duration:.8, delay:i*0.05, ease:'power3.out', scrollTrigger:{trigger:card, start:'top 88%'}});
  });

  /* ============ news rows ============ */
  gsap.utils.toArray('.news-row').forEach(row => {
    gsap.from(row, {opacity:0, y:24, duration:.8, ease:'power3.out', scrollTrigger:{trigger:row, start:'top 90%'}});
  });

  /* ============ footer stars ============ */
  const starsField = document.querySelector('.footer-stars');
  if(starsField){
    for(let i=0;i<50;i++){
      const s = document.createElement('span');
      s.style.left = Math.random()*100+'%';
      s.style.top = Math.random()*70+'%';
      s.style.animationDelay = (Math.random()*4)+'s';
      starsField.appendChild(s);
    }
  }

  /* ============ smooth in-page anchor scroll ============ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if(id.length > 1){
        const target = document.querySelector(id);
        if(target){
          e.preventDefault();
          gsap.to(window, {duration:1.1, scrollTo:{y:target, offsetY:80}, ease:'power3.inOut'});
        }
      }
    });
  });

  /* ============ contact form (front-end only) ============ */
  const form = document.querySelector('.contact-form form');
  if(form){
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Message sent ✓';
      setTimeout(() => { btn.textContent = original; form.reset(); }, 2400);
    });
  }

  ScrollTrigger.refresh();
});