import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const aside = document.querySelector('aside');
const searchPlaceholder = document.querySelector('.placeholder');
const searchbarMob = document.querySelector('.search_mobile');
const logoutBtn = document.getElementById('confirmLogout');
const logoutModal = document.getElementById('logoutModal');
const loader = document.getElementById('loader-container');
const authAlert = document.querySelector('.auth-alert');
const authAlertClose = authAlert?.querySelector('i');
const authAlertSignUp = authAlert?.querySelector('.signup');
const authAlertGuest = authAlert?.querySelector('.guest');
let authAlertShown = localStorage.getItem('authAlertBox_shown');
const profileIcon = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.6" d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.69998 10.1807 6.22998 12.0007 6.22998C13.8107 6.22998 15.2807 7.69998 15.2807 9.50998C15.2707 11.28 13.8807 12.72 12.1207 12.78Z" stroke="#211c84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path opacity="0.6" d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z" stroke="#211c84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const cartIcon = `
<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->

<svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#1C274C" stroke-width="1.5"/>
<path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#1C274C" stroke-width="1.5"/>
<path d="M11 9H8" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2 3L2.26491 3.0883C3.58495 3.52832 4.24497 3.74832 4.62248 4.2721C5 4.79587 5 5.49159 5 6.88304V9.5C5 12.3284 5 13.7426 5.87868 14.6213C6.75736 15.5 8.17157 15.5 11 15.5H13M19 15.5H17" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
<path d="M5 6H8M5.5 13H16.0218C16.9812 13 17.4609 13 17.8366 12.7523C18.2123 12.5045 18.4013 12.0636 18.7792 11.1818L19.2078 10.1818C20.0173 8.29294 20.4221 7.34853 19.9775 6.67426C19.5328 6 18.5054 6 16.4504 6H12" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`;

// Query multiple elements efficiently
const [asideToggle, loginBtn, cartBtn, tooltipProf, profileName, profIcon] = [
  document.querySelectorAll('.nav'),
  document.querySelectorAll('.login'),
  document.querySelectorAll('.cart'),
  document.querySelectorAll('.profile-tooltip'),
  document.querySelectorAll('.profile_name'),
  document.querySelectorAll('.prof_icon'),
];

document.addEventListener('DOMContentLoaded', () => {
  setupAsideToggle();
  setupOutsideClickHandler();
  setupPlaceholderText();
  setupCartButtons();
  setupAuthStateChanged();
  setupLogoutButtons();
  setupProfileTooltips();
  handleCategoryClick();
  setUpcartIcon();
});

function setUpcartIcon() {
  document.querySelectorAll('.cart').forEach(c => {
    c.innerHTML = cartIcon;
  })
}

// Function to toggle aside visibility
function setupAsideToggle() {
  asideToggle.forEach(toggle => {
    toggle.addEventListener('click', () => {
      aside.classList.add('animate__animated', 'animate__slideInRight');
      aside.classList.toggle('asideToggle');
    });
  });

  aside.addEventListener('animationend', () => {
    aside.classList.remove('animate__animated', 'animate__slideInRight');
  });
}

// Function to handle click outside the aside and tooltips
function setupOutsideClickHandler() {
  if (window.asideEventListenerAdded) return;

  document.addEventListener('click', (event) => {
    if (!aside.contains(event.target) && !event.target.closest('.nav')) {
      aside.classList.remove('asideToggle');
    }

    tooltipProf.forEach(tooltip => {
      if (!tooltip.contains(event.target) && !event.target.closest('.login')) {
        tooltip.style.display = 'none';
      }
    });
  });

  window.asideEventListenerAdded = true;
}


function setupPlaceholderText() {
  const placeholders = [
    'Search Flower Vases...', 'Search Gardening Pots...', 'Search Hanging Pots...',
    'Search Home Decor...', 'Search Countertop Items...', 'Search Planters...',
    'Search Decorative Pots...', 'Search Indoor Pots...', 'Search Outdoor Planters...',
    'Search Vases...'
  ];

  let currentIndex = 0;

  function changePlaceholder() {
    searchPlaceholder.classList.add('placeholder_slideout');

    searchPlaceholder.onanimationend = () => {
      searchPlaceholder.classList.remove('placeholder_slideout');

      currentIndex = (currentIndex + 1) % placeholders.length;
      searchPlaceholder.textContent = placeholders[currentIndex];

      searchPlaceholder.classList.add('placeholder_slidein');

      searchPlaceholder.onanimationend = () => {
        searchPlaceholder.classList.remove('placeholder_slidein');
      };
    };
  }

  searchPlaceholder.textContent = placeholders[currentIndex];
  setInterval(changePlaceholder, 5000);

  searchbarMob.addEventListener('input', () => {
    searchPlaceholder.style.display = searchbarMob.value === '' ? 'block' : 'none';
  });
}

// Function to handle cart button click
function setupCartButtons() {
  cartBtn.forEach(cartButton => {
    cartButton.addEventListener('click', () => {
      window.location.href = 'cart/cart.html';
    });
  });
}

// Firebase Authentication State Change
function setupAuthStateChanged() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateLoginUI(user);
      handleUserLogin(user);
      retrieveNumberOfCart(user.uid);
      hideAuthAlert();
    } else {
      updateGuestUI();
    }
  });
}

// Update UI for authenticated user
function updateLoginUI(user) {
  loginBtn.forEach(login => {
    login.innerHTML = profileIcon;
    login.classList.add('auth-login');
    login.classList.remove('guest-login');
  });
}

// Handle user login: fetch data from Firebase
function handleUserLogin(user) {
  const dbRef = ref(db, 'users/' + user.uid);
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const { username = 'Guest' } = snapshot.val();
      profileName.forEach(nameElement => {
        nameElement.textContent = `${username}`;
      });
    } else {
      console.log("No user data found");
    }
  }).catch((error) => {
    console.error("Error fetching user data:", error);
  });

  loginBtn.forEach(login => {
    login.addEventListener('click', () => {
      tooltipProf.forEach(tooltip => {
        tooltip.style.display = 'flex';
      });
    });
  });
}

function closeModal() {
  var myModalEl = document.querySelector('.btn-close');
      if (myModalEl) {
        myModalEl.click();
      }
}

// Update UI for guest user
function updateGuestUI() {
  loginBtn.forEach(login => {
    login.innerHTML = `<button class="login">Login</button>`;
    login.classList.add('guest-login');

    login.classList.remove('auth-login');

    login.addEventListener('click', () => {
      window.location.href = 'auth/login.html';
    });
  });
}

// Function to handle logout
function setupLogoutButtons() {
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      showLoader();
      localStorage.setItem('authAlertBox_shown', "false");
      showModal('Logged out');
      clearCartBadge();
      profileName.forEach(nameElement => nameElement.textContent = 'Guest');
      profIcon.forEach(icon => {
        icon.click();
      })
     
      resetLoginButton();
      closeModal();

    }).catch((error) => {
      console.error('Error logging out:', error);
    }).finally(() => {
      hideLoader();
    });
  });
}

function clearCartBadge() {
    const existingBadge = document.querySelector('.cart-badge');
    if (existingBadge) existingBadge.remove();
}

// Show the loader
function showLoader() {
  loader.style.display = 'flex'; 
}

// Hide the loader
function hideLoader() {
  loader.style.display = 'none';
}

// Reset login button UI
function resetLoginButton() {
  loginBtn.forEach(login => {
    login.innerHTML = `<button class="login">Login</button>`;
    login.classList.remove('auth-login');
  });
}

// Function to close profile tooltip
function setupProfileTooltips() {
  profIcon.forEach(icon => {
    icon.addEventListener('click', () => {
      tooltipProf.forEach(tooltip => {
        tooltip.style.display = 'none';
      });
    });
  });
}

function retrieveNumberOfCart(userid) {
    const cartIcon = document.querySelector('.cart');

    // Remove old badge if it exists
    const existingBadge = document.querySelector('.cart-badge');
    if (existingBadge) existingBadge.remove();

    if (userid) {
        const cartRef = ref(db, `users/${userid}/cart-products`);

        // Get the data for the cart
        get(cartRef).then(snapshot => {
            if (snapshot.exists()) {
                const cartData = snapshot.val();
                const numberOfProducts = Object.keys(cartData).length;

                if (cartIcon) {
                    const badge = document.createElement('span');
                    badge.classList.add('cart-badge');
                    badge.innerText = numberOfProducts;
                    cartIcon.appendChild(badge);
                }
            } else {
                console.log('No products in cart.');
            }
        }).catch(error => {
            console.error('Error retrieving cart data:', error);
        });
    }
}

 function handleCategoryClick() {
    document.querySelector(".scroll-container").addEventListener("click", (event) => {
        const item = event.target.closest(".scroll-item"); 
        if (item) {
            const data = item.getAttribute("data-path");
            if (data) {
                window.location.href = `/products/prod_list.html?category=${encodeURIComponent(data)}`;
            }
        }
    });
}

const carousels = document.querySelectorAll('.custom-carousel-item');
const featured = document.querySelector('.featured');
carousels.forEach(carousel => {
  const code = carousel.getAttribute('data-code');
  const featureCode = featured.getAttribute('data-code');
  if (code) {
  carousel.addEventListener('click', ()=> {
    window.location.href = `/products/prod_view.html?productCode=${code}`;
  })
  } else {
    console.log('cannot retrieve code from attr');
  }
  if (featureCode) {
    featured.addEventListener('click', ()=> {
      window.location.href = `/products/prod_view.html?productCode=${featureCode}`;
    })
  }
});

authAlertSignUp.addEventListener('click', ()=> {
  window.location.href = '/auth/signup.html';
});

authAlertGuest.addEventListener('click', ()=> {
  authAlert.remove();
  hideAuthAlert();
});

if (authAlertShown === 'true') {
  authAlert.remove();
  hideAuthAlert();
} else {
  showAuthAlert();
}

// Function to toggle shake animation
setInterval(() => {
  authAlert.classList.remove('animate__shakeX');

  setTimeout(() => {
    authAlert.classList.add('animate__shakeX');
  }, 4000); 

}, 8000); 

function hideAuthAlert() {
  authAlert.style.display = 'none';
}

function showAuthAlert() {
  authAlert.style.display = 'block';
}

// Store in localStorage when shown
if (authAlert.style.display === 'block') {
  localStorage.setItem('authAlertBox_shown', 'true'); 
}

authAlertClose.addEventListener('click', ()=> {
  hideAuthAlert();
});

function showModal(message, type) {
  const existingModal = document.getElementById('alertModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalHtml = `
    <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="alertModalLabel">Alert</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="alertMessage" style="color: ${type === 'success' ? 'green' : 'red'};">
            ${message}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('alertModal'));
  modal.show();
  
  const modalElement = document.getElementById('alertModal');
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
  });
}
