const header = document.getElementById('siteHeader');
const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');
const progress = document.getElementById('pageProgress');
const year = document.getElementById('currentYear');
const heroVideo = document.getElementById('heroVideo');
const visitModal = document.getElementById('visitModal');
const closeVisit = document.getElementById('closeVisit');
const visitForm = document.getElementById('visitForm');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');

if (year) year.textContent = new Date().getFullYear();

// The exported hero video is already slowed down. Keep an extra subtle slow playback
// for browsers that allow programmatic playback-rate control.
if (heroVideo) {
  heroVideo.playbackRate = 0.86;
  heroVideo.addEventListener('loadedmetadata', () => {
    heroVideo.playbackRate = 0.86;
  });
}

const closeMenu = () => {
  menuButton?.classList.remove('is-open');
  mobileNav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
};

menuButton?.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('is-open');
  mobileNav.classList.toggle('is-open', open);
  menuButton.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

mobileNav?.querySelectorAll('a, button').forEach((item) => {
  item.addEventListener('click', closeMenu);
});

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const observedSections = [...document.querySelectorAll('main section[id]')];

function updateScrollState() {
  const scrollTop = window.scrollY;
  header?.classList.toggle('is-scrolled', scrollTop > 18);

  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = pageHeight > 0 ? Math.min(100, (scrollTop / pageHeight) * 100) : 0;
  if (progress) progress.style.width = `${percent}%`;

  let current = 'inicio';
  for (const section of observedSections) {
    if (scrollTop >= section.offsetTop - 170) current = section.id;
  }
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -35px' }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

function openVisitModal() {
  if (!visitModal) return;
  visitModal.showModal();
  document.body.classList.add('modal-open');
  setTimeout(() => document.getElementById('visitorName')?.focus(), 80);
}

function closeVisitModal() {
  visitModal?.close();
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.open-visit').forEach((button) => {
  button.addEventListener('click', openVisitModal);
});
closeVisit?.addEventListener('click', closeVisitModal);
visitModal?.addEventListener('click', (event) => {
  if (event.target === visitModal) closeVisitModal();
});
visitModal?.addEventListener('close', () => document.body.classList.remove('modal-open'));

visitForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('visitorName')?.value.trim();
  const goal = document.getElementById('visitorGoal')?.value;
  if (!name || !goal) {
    visitForm.reportValidity();
    return;
  }
  const message = `Olá Fit House! Meu nome é ${name}. Gostaria de agendar uma visita à academia. Meu objetivo principal é: ${goal}.`;
  window.open(`https://wa.me/5549998060286?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  closeVisitModal();
  visitForm.reset();
});

document.querySelectorAll('[data-gallery]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.gallery;
    const image = button.querySelector('img');
    lightboxImage.alt = image?.alt || 'Imagem ampliada da Fit House';
    lightbox.showModal();
    document.body.classList.add('modal-open');
  });
});

function closeGallery() {
  lightbox?.close();
  document.body.classList.remove('modal-open');
}

closeLightbox?.addEventListener('click', closeGallery);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeGallery();
});
lightbox?.addEventListener('close', () => document.body.classList.remove('modal-open'));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeMenu();
});
