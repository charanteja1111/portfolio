import { portfolioConfig } from './portfolio.config.js';

(() => {
  'use strict';
  
  const q = (s, sc = document) => sc.querySelector(s);
  const qa = (s, sc = document) => sc.querySelectorAll(s);
  const raf = cb => requestAnimationFrame(cb);
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Configuration Population ----------------------------------------------
  function renderPortfolioConfig() {
    const c = portfolioConfig;
    if (!c) return;

    // 1. Meta / Head Tags
    if (c.name) {
      document.title = `${c.name} | Portfolio`;
      
      const ogTitle = q('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${c.name} | Portfolio`);
      
      const canonical = q('link[rel="canonical"]');
      if (canonical && c.github) canonical.setAttribute('href', c.github);
      
      const ogUrl = q('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', c.github || '');
      
      const preload = q('link[rel="preload"][as="image"]');
      if (preload && c.profileImage) {
        preload.setAttribute('href', c.profileImage);
        if (c.profileImage.endsWith('.png')) {
          preload.setAttribute('type', 'image/png');
        } else if (c.profileImage.endsWith('.webp')) {
          preload.setAttribute('type', 'image/webp');
        } else if (c.profileImage.endsWith('.jpg') || c.profileImage.endsWith('.jpeg')) {
          preload.setAttribute('type', 'image/jpeg');
        }
      }
      
      const ogImage = q('meta[property="og:image"]');
      if (ogImage && c.profileImage && c.github) {
        ogImage.setAttribute('content', `${c.github}/${c.profileImage}`);
      }
    }
    
    if (c.aboutIntro) {
      const metaDesc = q('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', c.aboutIntro);
      const ogDesc = q('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', c.aboutIntro);
    }

    // 2. Simple Field Replacements
    qa('[data-field]').forEach(el => {
      const field = el.getAttribute('data-field');
      const val = c[field];
      if (val === undefined) return;

      if (el.tagName === 'A') {
        if (field === 'email') {
          el.setAttribute('href', `mailto:${val}`);
        } else {
          el.setAttribute('href', val);
        }
        if (el.textContent.includes('PLACEHOLDER') || el.textContent === '') {
          el.textContent = val;
        }
      } else if (el.tagName === 'IMG' || el.tagName === 'SOURCE' || el.tagName === 'IFRAME') {
        if (el.tagName === 'IMG') {
          el.setAttribute('src', val);
          el.setAttribute('alt', `Portrait of ${c.name || 'Developer'}`);
        } else if (el.tagName === 'IFRAME') {
          el.setAttribute('src', val);
        } else if (el.tagName === 'SOURCE') {
          el.setAttribute('srcset', val);
          if (val.endsWith('.png')) {
            el.setAttribute('type', 'image/png');
          } else if (val.endsWith('.webp')) {
            el.setAttribute('type', 'image/webp');
          } else if (val.endsWith('.jpg') || val.endsWith('.jpeg')) {
            el.setAttribute('type', 'image/jpeg');
          }
        }
      } else if (el.classList.contains('typewriter')) {
        el.setAttribute('data-text', val);
        el.textContent = val;
      } else if (el.classList.contains('typewriter-subtitle')) {
        const textsVal = Array.isArray(c.roles) ? c.roles.join(',') : '';
        el.setAttribute('data-texts', textsVal);
        el.textContent = Array.isArray(c.roles) ? c.roles[0] : '';
      } else {
        el.textContent = val;
      }
    });

    // 3. Dynamic Section Injectors
    
    // Education details
    const eduContainer = q('#education-details-hook');
    if (eduContainer && c.education) {
      eduContainer.innerHTML = `
        <h4>${c.education.degree || ''}</h4>
        <dl class="edu-list">
          <dt>Specialization</dt><dd>${c.education.specialization || ''}</dd>
          <dt>College</dt><dd>${c.education.college || ''}</dd>
          <dt>Location</dt><dd>${c.education.location || ''}</dd>
          <dt>CGPA</dt><dd>${c.education.cgpa || ''}</dd>
          <dt>Timeline</dt><dd>${c.education.timeline || ''}</dd>
        </dl>
      `;
    }
    
    // Stats grid
    const statsContainer = q('#about-stats-hook');
    if (statsContainer && c.stats) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-number">${c.stats.cgpa || ''}</div>
          <div class="stat-label">CGPA</div>
          <div class="stat-sublabel">Current Academic Standing</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${c.stats.internshipsCount || ''}</div>
          <div class="stat-label">Internships Completed</div>
          <div class="stat-sublabel">Professional Experience</div>
        </div>
      `;
    }

    // Experiences Timeline
    const expContainer = q('#experience-timeline-hook');
    if (expContainer && Array.isArray(c.experiences)) {
      expContainer.innerHTML = c.experiences.map(exp => `
        <div class="timeline-item">
          <div class="timeline-date">${exp.timeline || ''}</div>
          <div class="timeline-content">
            <h3>${exp.role || ''}</h3>
            <h4>${exp.company || ''} | ${exp.location || ''}</h4>
            <ul class="responsibilities">
              ${(exp.responsibilities || []).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('');
    }

    // Projects Grid
    const projContainer = q('#projects-grid-hook');
    if (projContainer && Array.isArray(c.projects)) {
      projContainer.innerHTML = c.projects.map(proj => `
        <div class="project-card">
          <div class="project-header">
            <h3>${proj.title || ''}</h3>
            <div class="project-tech">
              ${(proj.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="project-description">
            <p>${proj.description || ''}</p>
          </div>
          <div class="project-footer">
            <a href="${proj.link || '#'}" target="_blank" class="project-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              View Code
            </a>
          </div>
        </div>
      `).join('');
    }

    // Skills
    if (c.skills) {
      const renderSkills = (selector, list) => {
        const el = q(selector);
        if (el && Array.isArray(list)) {
          el.innerHTML = list.map(s => `<li class="pill">${s}</li>`).join('');
        }
      };
      renderSkills('#skills-languages-hook', c.skills.languages);
      renderSkills('#skills-aiml-hook', c.skills.aiml);
      renderSkills('#skills-frameworks-hook', c.skills.development);
      renderSkills('#skills-databases-hook', c.skills.databases);
      renderSkills('#skills-tools-hook', c.skills.tools);
    }

    // Certifications
    const certContainer = q('#certifications-grid-hook');
    if (certContainer && Array.isArray(c.certifications)) {
      certContainer.innerHTML = c.certifications.map(cert => `
        <div class="achievement-card">
          <div class="achievement-icon">${cert.icon || ''}</div>
          <h3>${cert.title || ''}</h3>
          <h4>${cert.organization || ''}</h4>
          <p>${cert.description || ''}</p>
        </div>
      `).join('');
    }
  }

  // --- Typewriter ------------------------------------------------------------
  function typewriter(){
    const title=q('.typewriter'); const sub=q('.typewriter-subtitle');
    if(!title && !sub) return;
    if(prefersReduce){ if(title) title.textContent=title.dataset.text||''; if(sub){ const f=(sub.dataset.texts||'').split(',')[0]; if(f) sub.textContent=f; } return; }
    if(title){
      const text=title.dataset.text||''; let i=0; const start=performance.now()+600; const speed=90;
      const step=t=>{ if(document.hidden) return raf(step); if(t<start) return raf(step); const tgt=Math.min(text.length,Math.floor((t-start)/speed)); if(tgt!==i){ i=tgt; title.textContent=text.slice(0,i); } if(i<text.length) raf(step); };
      title.textContent=''; raf(step);
    }
    if(sub){
      const words=(sub.dataset.texts||'').split(',').map(w=>w.trim()).filter(Boolean); if(!words.length) return;
      let wi=0, chars=0, del=false, pause=0, last=performance.now();
      const loop=t=>{ if(document.hidden){ last=t; return raf(loop);} const dt=t-last; last=t; const w=words[wi]; if(!del){ chars+=dt/140; if(chars>=w.length){ chars=w.length; del=true; pause=t+1800; } } else if(t>pause){ chars-=dt/110; if(chars<=0){ chars=0; del=false; wi=(wi+1)%words.length; } } sub.textContent=w.slice(0,Math.floor(Math.max(0,Math.min(w.length,chars)))); raf(loop); };
      raf(loop);
    }
  }

  // --- Navigation + Highlight ------------------------------------------------
  function navigation(){
    const hamburger=q('#hamburger'); const menu=q('#nav-menu'); const links=qa('.nav-link'); const navbar=q('.navbar');
    if(hamburger && menu){
      hamburger.addEventListener('click',()=>{ hamburger.classList.toggle('active'); menu.classList.toggle('active'); document.body.style.overflow=menu.classList.contains('active')?'hidden':''; });
      document.addEventListener('click',e=>{ if(!hamburger.contains(e.target)&&!menu.contains(e.target)){ hamburger.classList.remove('active'); menu.classList.remove('active'); document.body.style.overflow=''; } });
    }
    links.forEach(a=>a.addEventListener('click',e=>{ if(a.getAttribute('href')==='#') e.preventDefault(); if(menu&&menu.classList.contains('active')){ hamburger.classList.remove('active'); menu.classList.remove('active'); document.body.style.overflow=''; }}));
    const sections=qa('section[id]'); if(sections.length){
      const io=new IntersectionObserver(es=>{
        es.forEach(en=>{ if(!en.isIntersecting) return; const id=en.target.id; links.forEach(l=>{ const match=l.getAttribute('href')===`#${id}`; l.classList.toggle('active',match); match?l.setAttribute('aria-current','true'):l.removeAttribute('aria-current'); }); });
      },{threshold:.5}); sections.forEach(s=>io.observe(s));
    }
    if(navbar){ let ticking=false; const onScroll=()=>{ if(ticking) return; ticking=true; raf(()=>{ navbar.classList.toggle('navbar--scrolled',window.scrollY>50); ticking=false; }); }; window.addEventListener('scroll',onScroll,{passive:true}); onScroll(); }
    let rT; window.addEventListener('resize',()=>{ clearTimeout(rT); rT=setTimeout(()=>{ if(window.innerWidth>768 && menu){ hamburger.classList.remove('active'); menu.classList.remove('active'); document.body.style.overflow=''; } },180); },{passive:true});
  }

  // --- Parallax (pointer + subtle scroll) ------------------------------------
  function parallax(){ if(prefersReduce) return; const hero=q('.hero'); if(!hero) return; const particles=qa('.particle',hero); let rect=hero.getBoundingClientRect(); const upd=()=>rect=hero.getBoundingClientRect(); window.addEventListener('resize',upd,{passive:true});
    let pmTick=false; hero.addEventListener('pointermove',e=>{ if(pmTick) return; pmTick=true; raf(()=>{ if(document.hidden){ pmTick=false; return; } const x=(e.clientX-rect.left-rect.width/2)/(rect.width/2); const y=(e.clientY-rect.top-rect.height/2)/(rect.height/2); particles.forEach((p,i)=>{ const f=(i%2?0.3:0.5)*((i%3)+1); p.style.transform=`translate3d(${(x*14*f).toFixed(2)}px, ${(y*10*f).toFixed(2)}px,0)`; }); pmTick=false; }); },{passive:true}); hero.addEventListener('pointerleave',()=>particles.forEach(p=>p.style.transform='')); let scTick=false; const onScroll=()=>{ if(scTick) return; scTick=true; raf(()=>{ if(window.innerWidth>768 && !document.hidden){ const s=window.pageYOffset; if(s<window.innerHeight) hero.style.transform=`translateY(${(s*-0.09).toFixed(2)}px)`; } scTick=false; }); }; window.addEventListener('scroll',onScroll,{passive:true}); upd(); }

  // --- Horizontal Scroll Sections -------------------------------------------
  function horizontalScroll(){ const defs=[['.skills.skills--hscroll','.skills.skills--hscroll .skills-grid-min','--hscroll-height'],['#certifications.achievements--hscroll','#certifications.achievements--hscroll .achievements-grid','--ach-h']]; const navH=()=>q('.navbar')?.offsetHeight||70; const setup=(wrapSel,rowSel,cssVar)=>{ const wrap=q(wrapSel); const row=q(rowSel); if(!wrap||!row) return; let enabled=false,maxX=0,start=0,end=0; function layout(){ enabled=window.innerWidth>900; if(!enabled){ wrap.style.removeProperty(cssVar); wrap.removeAttribute('data-hscroll-ready'); row.style.transform=''; return; } const container=wrap.querySelector('.container'); maxX=Math.max(0,row.scrollWidth-container.clientWidth); const travel=maxX*1.8+300; wrap.style.setProperty(cssVar,`${Math.max(travel,window.innerHeight-navH()+200)}px`); wrap.setAttribute('data-hscroll-ready','true'); start=navH(); end=window.innerHeight; } let tick=false; function onScroll(){ if(!enabled||tick) return; tick=true; raf(()=>{ const r=wrap.getBoundingClientRect(); const total=r.height-end+start; if(r.top<=start && r.bottom>end){ const prog=Math.min(1,Math.max(0,(start-r.top)/Math.max(1,total))); row.style.transform=`translate3d(${-prog*maxX}px,0,0)`; } else if(r.top>start){ row.style.transform='translate3d(0,0,0)'; } else if(r.bottom<=end){ row.style.transform=`translate3d(${-maxX}px,0,0)`; } tick=false; }); } layout(); onScroll(); window.addEventListener('resize',()=>{ layout(); onScroll(); },{passive:true}); window.addEventListener('scroll',onScroll,{passive:true}); }; defs.forEach(d=>setup(...d)); }

  // --- Ripple (delegated) ---------------------------------------------------
  function rippleDelegated(){ document.addEventListener('click',e=>{ const btn=e.target.closest('.btn'); if(!btn) return; const r=btn.getBoundingClientRect(); const size=Math.max(r.width,r.height); const span=document.createElement('span'); span.className='ripple-circle'; span.style.width=span.style.height=size+'px'; span.style.left=(e.clientX-r.left-size/2)+'px'; span.style.top=(e.clientY-r.top-size/2)+'px'; btn.appendChild(span); setTimeout(()=>span.remove(),520); }); }

  // --- Notifications + Contact Form ----------------------------------------
  function contact(){ const form=q('#contact-form'); if(!form) return; const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; let note=null; const show=(msg,type='info')=>{ if(!note){ note=document.createElement('div'); document.body.appendChild(note); } note.className=`notification notification--${type}`; note.setAttribute('role','status'); note.setAttribute('aria-live','polite'); note.innerHTML=`<div class="notification-content"><span class="notification-message">${msg}</span><button class="notification-close" type="button" aria-label="Close">×</button></div>`; requestAnimationFrame(()=>note.classList.add('notification--visible')); clearTimeout(show._t); show._t=setTimeout(()=>{ hide(); },4800); }; const hide=()=>{ if(note){ note.classList.remove('notification--visible'); setTimeout(()=>note&&note.remove(),280); note=null; } }; document.addEventListener('click',e=>{ if(e.target.closest('.notification-close')) hide(); }); form.addEventListener('submit',e=>{ e.preventDefault(); const fd=new FormData(form); const data={ name:fd.get('name')?.trim(), email:fd.get('email')?.trim(), subject:fd.get('subject')?.trim(), message:fd.get('message')?.trim() }; if(Object.values(data).some(v=>!v)){ show('Please fill in all fields.','error'); return; } if(!email.test(data.email)){ show('Please enter a valid email address.','error'); return; } const btn=form.querySelector('button[type="submit"]'); const orig=btn.textContent; btn.textContent='Sending...'; btn.disabled=true; btn.style.opacity='0.7'; setTimeout(()=>{ show('Thank you for your message! I\'ll get back to you soon.','success'); form.reset(); btn.textContent=orig; btn.disabled=false; btn.style.opacity='1'; },1400); }); }

  // --- Init (critical first, extras deferred) --------------------------------
  document.addEventListener('DOMContentLoaded',()=>{
    renderPortfolioConfig();
    typewriter();
    navigation();
    contact();
    (window.requestIdleCallback?requestIdleCallback:fn=>setTimeout(fn,50))(()=>{ parallax(); horizontalScroll(); rippleDelegated(); });
    document.body.classList.add('loaded');
  });

})();
