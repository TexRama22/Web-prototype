
document.addEventListener('DOMContentLoaded',()=>{

    // burger menu for mobile
    const burger = document.getElementById('burger');
    const nav = document.querySelector('.nav');
    burger && burger.addEventListener('click',()=> nav.style.display = nav.style.display==='flex' ? 'none' : 'flex');
  
    // scroll to sections from hero icons
    document.querySelectorAll('.icon').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const tgt = btn.getAttribute('data-target');
        document.querySelector(tgt)?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  
    // CTA buttons
    document.getElementById('projectsBtn')?.addEventListener('click',()=> document.querySelector('#projects').scrollIntoView({behavior:'smooth'}));
    document.getElementById('hireBtn')?.addEventListener('click',()=> document.querySelector('#contact').scrollIntoView({behavior:'smooth'}));
  
    // open modal
    const modal = document.getElementById('modal');
    const openModalBtn = document.getElementById('openModal');
    const closeModal = document.getElementById('closeModal');
    openModalBtn && openModalBtn.addEventListener('click',()=> modal.classList.remove('hidden'));
    closeModal && closeModal.addEventListener('click',()=> modal.classList.add('hidden'));
    modal && modal.addEventListener('click', (e)=> { if(e.target === modal) modal.classList.add('hidden'); });
  
    // === PROJECT FILTER FUNCTIONALITY ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projCards = document.querySelectorAll('.proj-card');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        // Filter projects with animation
        projCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            setTimeout(() => card.style.opacity = '1', 10);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.classList.add('hidden'), 300);
          }
        });
      });
    });

    // === ANIMATE SKILL BARS WHEN IN VIEWPORT ===
    const skillBars = document.querySelectorAll('.bar div');
    const animateSkills = () => {
      skillBars.forEach(b=>{
        const level = b.getAttribute('data-level') || b.dataset.level;
        const rect = b.getBoundingClientRect();
        if(rect.top < window.innerHeight - 80) {
          b.style.width = (level ? level : 70) + '%';
        }
      });
    };
    animateSkills();
    window.addEventListener('scroll', animateSkills);

    // === ANIMATED COUNTER FOR STATS ===
    const countElements = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
      if (countersStarted) return;
      countersStarted = true;

      countElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        const increment = Math.ceil(target / 30);
        let current = 0;

        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target;
            clearInterval(counter);
          } else {
            el.textContent = current;
          }
        }, 30);
      });
    };

    // Start counters when stats section is in viewport
    const statsRow = document.querySelector('.stats-row');
    if (statsRow) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startCounters();
          }
        });
      }, { threshold: 0.5 });
      observer.observe(statsRow);
    }

    // === INTERACTIVE TIMELINE ===
    const timelineEvents = document.querySelectorAll('.event');
    
    timelineEvents.forEach(event => {
      event.addEventListener('click', function() {
        // Close other events
        timelineEvents.forEach(e => {
          if (e !== this) {
            const details = e.querySelector('.event-details');
            if (details) details.style.display = 'none';
          }
        });

        // Toggle current event
        const details = this.querySelector('.event-details');
        if (details) {
          const isHidden = details.style.display === 'none';
          details.style.display = isHidden ? 'block' : 'none';
        }
      });
    });

    // === FORM HANDLERS (NO BACKEND) ===
    const contactForm = document.getElementById('contactForm');
    contactForm && contactForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      alert('Merci — message envoyé (simulation).');
      contactForm.reset();
    });
  
    const modalForm = document.getElementById('modalForm');
    modalForm && modalForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      alert('Message envoyé via modal (simulation).');
      modalForm.reset();
      modal.classList.add('hidden');
    });
  
    // === INTERSECTION OBSERVER FOR ANIMATIONS ===
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('inview');
        }
      });
    }, {threshold: 0.15});
    
    document.querySelectorAll('.proj-card, .event, .card, .skill, .stat').forEach(el=> observer.observe(el));

    // === TIMELINE SCROLL TO HIGHLIGHT ===
    const highlightEvent = document.querySelector('.event.highlight');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    
    if (highlightEvent && timelineWrapper) {
      const scrollPosition = highlightEvent.offsetLeft;
      timelineWrapper.scrollTo({
        left: scrollPosition,
        behavior: 'smooth' 
      });
    }
  
});

  