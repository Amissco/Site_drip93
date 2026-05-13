// ============================================================
//  LIGHTBOX — affichage plein écran au clic sur un article
// ============================================================

(function () {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.innerHTML = `
    <button id="lightbox-close" aria-label="Fermer">&times;</button>
    <img id="lightbox-img" src="" alt="Article" />
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-img').addEventListener('click', function (e) {
    e.stopPropagation();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();

function openLightbox(src) {
  const overlay = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
//  SÉLECTION DE TAILLE
// ============================================================

document.addEventListener('click', function (e) {
  const size = e.target.closest('.product-card-sizes span');
  if (!size) return;

  const siblings = size.parentElement.querySelectorAll('span');
  siblings.forEach(s => s.classList.remove('selected'));
  size.classList.add('selected');
});
