// Código responsable de animaciones y carga lazy.
// Mantenerlo ligero: inicializamos animaciones sólo cuando es necesario.

document.addEventListener('DOMContentLoaded', ()=>{
  // Observer para añadir clase visible a elementos con .will-animate
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },{threshold:0.12});

  document.querySelectorAll('.will-animate').forEach(el=>io.observe(el));

  // Animación hero visual con GSAP, inicializada sólo si existe
  const visual = document.getElementById('visual-card');
  if(visual && window.gsap){
    // animación sutil y eficiente: transformaciones en GPU
    gsap.fromTo(visual.querySelector('.fabric'),{y:-8, x:-6},{y:8,x:6,duration:8,yoyo:true,repeat:-1,ease:'sine.inOut'});
    gsap.fromTo(visual,{scale:0.985,opacity:0.85},{scale:1,opacity:1,duration:0.9,ease:'power2.out'});
  }

  // Animación de tarjetas preview al entrar en viewport (con GSAP si disponible)
  const cards = document.querySelectorAll('#preview-cards .card');
  if(cards.length){
    cards.forEach((c,i)=>{
      c.style.transitionDelay = (i*80)+'ms';
      c.classList.add('will-animate');
    });
  }

  // Contact form: demo handling (no envío real)
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.textContent = 'Enviando...';
      setTimeout(()=>{ btn.textContent = 'Enviar'; alert('Gracias — el formulario se ha enviado (demo).') },800);
    });
  }

  // Tienda: init placeholder rendering (shopify.js puede reemplazarlo)
  if(document.getElementById('store-grid')){
    // marcar productos placeholders para animar
    document.querySelectorAll('#store-grid .product').forEach(p=>p.classList.add('will-animate'));
  }
});
