// ============================================================
//  CART — gestion du panier Drip 93
// ============================================================

(function () {
  function init() {
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.addEventListener('click', closeCart);
    document.body.appendChild(overlay);

    const sidebar = document.createElement('aside');
    sidebar.id = 'cart-sidebar';
    sidebar.setAttribute('aria-label', 'Panier');
    sidebar.innerHTML = `
      <div class="cart-header">
        <h2>Panier <span id="cart-count"></span></h2>
        <button class="cart-close" onclick="closeCart()" aria-label="Fermer le panier">&times;</button>
      </div>
      <div class="cart-items-scroll" id="cart-items-list"></div>
      <div class="cart-footer" id="cart-footer">
        <div class="cart-total-row">
          <span>Total</span>
          <span id="cart-total-price">0 €</span>
        </div>
        <button class="cart-clear-btn" onclick="clearCart()">Vider le panier</button>
        <a
          href="https://www.snapchat.com/add/elcherif93vg"
          target="_blank"
          rel="noopener noreferrer"
          class="cart-snap-btn"
          aria-label="Commander sur Snapchat — @elcherif93vg"
        >
          <svg class="cart-snap-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12.166 2C9.066 2 6.5 4.48 6.5 7.5v.55c-.67.28-1.5 1.04-1.5 2.2 0 .72.34 1.37.87 1.8-.36 1.14-1.03 2.01-1.87 2.6-.22.15-.3.44-.18.68.34.72 1.65 1.2 3.67 1.38.43.67 1.06 1.79 2.51 1.79s2.08-1.12 2.51-1.79c2.02-.18 3.33-.66 3.67-1.38.12-.24.04-.53-.18-.68-.84-.59-1.51-1.46-1.87-2.6.53-.43.87-1.08.87-1.8 0-1.16-.83-1.92-1.5-2.2V7.5C17.5 4.48 14.934 2 12.166 2z"/>
          </svg>
          <span class="cart-snap-label">Commander sur Snapchat</span>
          <span class="cart-snap-handle">@elcherif93vg</span>
        </a>
      </div>
    `;
    document.body.appendChild(sidebar);

    renderCart();
    updateBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ---- Helpers ---- */

function getCart() {
  try { return JSON.parse(localStorage.getItem('drip93-cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('drip93-cart', JSON.stringify(cart));
}

/* ---- Public API ---- */

function addToCartFromCard(btn) {
  const card  = btn.closest('.product-card');
  const name  = card.dataset.name;
  const price = parseInt(card.dataset.price, 10);
  const image = card.dataset.image;

  const selectedSize = card.querySelector('.product-card-sizes span.selected');
  if (!selectedSize) {
    const sizesEl = card.querySelector('.product-card-sizes');
    sizesEl.classList.remove('shake');
    void sizesEl.offsetWidth;
    sizesEl.classList.add('shake');
    sizesEl.addEventListener('animationend', () => sizesEl.classList.remove('shake'), { once: true });
    return;
  }

  const size = selectedSize.textContent.trim();
  const id   = name + '||' + size;

  const cart     = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, size, image, qty: 1 });
  }

  saveCart(cart);
  renderCart();
  updateBadge();
  openCart();

  btn.textContent = '✓ Ajouté';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = 'Ajouter au panier';
    btn.classList.remove('added');
  }, 1600);
}

function removeItem(encodedId) {
  const id = decodeURIComponent(encodedId);
  saveCart(getCart().filter(item => item.id !== id));
  renderCart();
  updateBadge();
}

/* ---- Quantity controls ---- */

function changeQty(encodedId, delta) {
  const id   = decodeURIComponent(encodedId);
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    saveCart(cart.filter(i => i.id !== id));
  } else {
    saveCart(cart);
  }

  renderCart();
  updateBadge();
}

function clearCart() {
  saveCart([]);
  renderCart();
  updateBadge();
}

/* ---- Render ---- */

function renderCart() {
  const cart    = getCart();
  const list    = document.getElementById('cart-items-list');
  const footer  = document.getElementById('cart-footer');
  const countEl = document.getElementById('cart-count');
  if (!list) return;

  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (countEl) countEl.textContent = totalQty > 0 ? `(${totalQty})` : '';

  if (cart.length === 0) {
    list.innerHTML = `<p class="cart-empty">Ton panier est vide.</p>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'flex';

  list.innerHTML = cart.map(item => {
    const encodedId = encodeURIComponent(item.id);
    const lineTotal = item.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-size">Taille&nbsp;: <strong>${item.size}</strong></p>
          <div class="cart-item-bottom">
            <p class="cart-item-price">${lineTotal}&nbsp;€</p>
            <div class="cart-item-qty-controls">
              <button
                class="cart-qty-btn"
                onclick="changeQty('${encodedId}', -1)"
                aria-label="Diminuer la quantité"
              >−</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button
                class="cart-qty-btn"
                onclick="changeQty('${encodedId}', 1)"
                aria-label="Augmenter la quantité"
              >+</button>
            </div>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeItem('${encodedId}')" aria-label="Retirer l'article">&times;</button>
      </div>
    `;
  }).join('');

  const totalEl = document.getElementById('cart-total-price');
  if (totalEl) totalEl.textContent = totalPrice + ' €';
}

function updateBadge() {
  const cart     = getCart();
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const badge    = document.getElementById('cart-badge');
  if (!badge) return;
  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';
}

/* ---- Open / Close ---- */

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleCart() {
  document.getElementById('cart-sidebar').classList.contains('open')
    ? closeCart()
    : openCart();
}
