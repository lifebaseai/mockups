(function(){
  // The menu on phones and small screens.
  var top=document.querySelector('header.top');
  var menu=document.querySelector('.menu-btn');
  if(top&&menu){
    menu.addEventListener('click',function(){
      var open=!top.classList.contains('open');
      top.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&top.classList.contains('open')){top.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
    top.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(){top.classList.remove('open');menu.setAttribute('aria-expanded','false');});});
  }

  // The booking planner (home and contact): taps write the note to Ben.
  var form=document.getElementById('noteForm');
  if(form){
    var state={door:'speak',role:'speak',size:'100 to 500',topics:['human performance','business'],when:'in the next few months',kind:'a TV project'};
    var labels={speak:'Event name, date and place',pod:'Your podcast\'s name',media:'A line about the project',free:'Anything else?'};
    var letter=document.getElementById('letter');
    var extra=document.getElementById('extra');
    var extraL=document.getElementById('extra-l');
    var nm=document.getElementById('nm');
    var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
    var m=function(s){return '<mark>'+esc(s)+'</mark>';};
    var list=function(a){
      if(!a.length) return null;
      var w=a.map(m);
      if(w.length===1) return w[0];
      return w.slice(0,-1).join(', ')+' and '+w[w.length-1];
    };
    var render=function(){
      var t, name=nm.value.trim(), x=extra.value.trim();
      if(state.door==='speak'){
        t='Hi Ben, we\'d love you to '+m(state.role)+' at our event. We\'re expecting '+m(state.size)+' people. Could we talk about dates?';
      }else if(state.door==='pod'){
        var l=list(state.topics);
        t='Hi Ben, we\'d love to have you on our podcast'+(l?' to talk about '+l:'')+'. We\'re looking to record '+m(state.when)+'. Could we find a date?';
      }else if(state.door==='media'){
        t='Hi Ben, we\'d love to work with you on '+m(state.kind)+'. Could we talk about it?';
      }else{
        t='Hi Ben, I\'m new to your work and starting with your podcast. Which podcast episode should I listen to first?';
      }
      if(x) t+=' '+esc(x);
      if(name) t+='<br>'+esc(name);
      letter.innerHTML=t;
    };
    var setDoor=function(d){
      if(!labels[d]) d='speak';
      state.door=d;
      document.querySelectorAll('.door').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.door===d));});
      document.querySelectorAll('.branch').forEach(function(b){b.hidden=b.dataset.branch!==d;});
      extraL.firstChild.nodeValue=labels[d]+' ';
      render();
    };
    document.querySelectorAll('.door').forEach(function(b){b.addEventListener('click',function(){setDoor(b.dataset.door);});});
    document.querySelectorAll('[data-multi]').forEach(function(g){
      g.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){
        var on=c.getAttribute('aria-pressed')!=='true';c.setAttribute('aria-pressed',String(on));
        state[g.dataset.multi]=[].slice.call(g.querySelectorAll('.chip[aria-pressed="true"]')).map(function(e){return e.dataset.v;});
        render();
      });});
    });
    document.querySelectorAll('[data-one]').forEach(function(g){
      g.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){
        g.querySelectorAll('.chip').forEach(function(e){e.setAttribute('aria-pressed','false');});
        c.setAttribute('aria-pressed','true');state[g.dataset.one]=c.dataset.v;render();
      });});
    });
    extra.addEventListener('input',render);nm.addEventListener('input',render);
    document.querySelectorAll('a[href="#start"][data-path]').forEach(function(a){a.addEventListener('click',function(){setDoor(a.dataset.path);});});
    document.querySelectorAll('a[href="#start"]:not([data-path])').forEach(function(a){a.addEventListener('click',function(){if(state.door==='free')setDoor('speak');});});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var old=form.querySelector('.sent');if(old)old.remove();
      var p=document.createElement('p');p.className='sent';p.setAttribute('role','status');
      p.textContent='Thanks. This is a preview, so nothing was sent.';
      form.appendChild(p);
    });
    var asked=new URLSearchParams(location.search).get('for');
    setDoor(asked||'speak');
  }

  // Sections rise in as they scroll into view.
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && 'IntersectionObserver' in window){
    var els=document.querySelectorAll('.sec .wrap > *, .award, .quotes figure, .timeline li, .card, .jobs li, .end .wrap > *, .post-card, .offer');
    var vh=window.innerHeight;
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.remove('will-rise');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){
      if(el.getBoundingClientRect().top>vh){el.classList.add('will-rise');el.offsetWidth;el.classList.add('rise-ready');io.observe(el);}
    });
  }
})();
