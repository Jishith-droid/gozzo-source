import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, set, ref, get, remove } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';
const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const wishlistContainer = document.querySelector('.wishlist-container');
const loader = document.getElementById('loader-container');
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
showLoader();
let userId;
// Fetch and display favorite products on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
     userId = user.uid;
    const favoriteProducts = await getFavoriteProducts(userId);
    retrieveNumberOfCart(userId);
    if (Object.keys(favoriteProducts).length > 0) {
      fetchAndDisplayFavorites(favoriteProducts);
    } else {
      displayEmptyWishlistMessage();
    }
  } else {
    showAlert('Please log in to view your wishlist.');
    window.location.href = '/auth/login.html';
  }
});

(function() {
  document.querySelectorAll('.cart').forEach(c => {
    c.innerHTML = cartIcon;
  })
})();

document.querySelector('.cart').addEventListener('click', ()=> {
  window.location.href = '/cart/cart.html'
});

// Function to retrieve favorite products from Firebase
async function getFavoriteProducts(userId) {
  const favoritesRef = ref(db, `users/${userId}/favorites`);
  const snapshot = await get(favoritesRef);
  
  return snapshot.exists() ? snapshot.val() : {};
}

// Fetch product data and display favorites
async function fetchAndDisplayFavorites(favoriteProducts) {
  showLoader();
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json');
    const data = await response.json();
    const allProducts = Object.values(data.products);
    
    const filteredProducts = allProducts.filter(product => favoriteProducts[product.code]);
    displayProducts(filteredProducts);
    console.log(filteredProducts); // Debugging to see if product.code exists
  } catch (error) {
    console.error('Error fetching product data:', error);
    hideLoader();
    wishlistContainer.textContent = 'error 404';
  } finally {
    hideLoader();
  }
}

function displayProducts(products) {
  wishlistContainer.innerHTML = ''; // Clear the wishlist container
  
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    productDiv.setAttribute('data-product-code', product.code);
    
    productDiv.innerHTML = `
      <div class="products-layout">
        <div class="product-image">
          <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}" />
        </div>
        <div class="product-details">
          <i class="bi bi-heart-fill heart-icon favorited" data-product-code="${product.code}"></i>
          <p class="product-name">${product.name}</p>
          <p class="product-subdescription">${product.subDescription}</p>
          <div class="price">
            <span class="discount-box">${product.discount_percentage}% OFF</span>
            <span class="actual-price">₹${product.actual_price}</span>
            <span class="discounted-price">₹${product.discounted_price}</span>
          </div>
          <div class="save-amount">
            Save ₹${product.actual_price - product.discounted_price}
          </div>
        </div>
      </div>
      <div class="addToCart">
        <button>
          <span>
            <i class="bi bi-cart4"></i>
            Add to cart
          </span>
        </button>
      </div>
    `;
    
    wishlistContainer.appendChild(productDiv);

    // Product view navigation (if clicked outside of heart or cart)
    productDiv.addEventListener('click', (event) => {
      if (event.target.closest('.heart-icon') || event.target.closest('.addToCart')) {
        return;
      }
      window.location.href = `/products/prod_view.html?productCode=${product.code}`;
    });
  });

  // Now using querySelectorAll to handle all add to cart buttons
  document.querySelectorAll('.addToCart button').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();  // Prevent event bubbling to productDiv
      const productDiv = button.closest('.product'); // Get the closest productDiv
      const productCode = productDiv.getAttribute('data-product-code'); // Get the product code
      saveCart(userId, productCode); // Use the product code directly
    });
  });
}

function saveCart(uid, productcode) {
  showLoader();
  const cartRef = ref(db, `users/${uid}/cart-products/${productcode}`);
  
  get(cartRef).then(snapshot => {
    if (snapshot.exists()) {
      hideLoader();
      showToast('Product already added to wishlist!');
      return;
    } else {
      set(cartRef, true)
        .then(() => {
          showToast('Product added to cart!');
          retrieveNumberOfCart(uid);
        })
        .catch((error) => showToast('Failed to add product to cart.'))
        .finally(() => hideLoader());
    }
  });
}

function retrieveNumberOfCart(userid) {
  if (userid) {
    const cartRef = ref(db, `users/${userid}/cart-products`);
    
    get(cartRef).then(snapshot => {
      if (snapshot.exists()) {
        const cartData = snapshot.val();
        const numberOfProducts = Object.keys(cartData).length;
        
        const cartIcon = document.querySelector('.header .cart');
        console.log(cartIcon)
        if (cartIcon) {
          const badge = document.createElement('span');
          badge.classList.add('cart-badge');
          badge.innerText = numberOfProducts;
          cartIcon.appendChild(badge);
        }
      }
    }).catch(error => console.error('Error retrieving cart data:', error));
  }
}

// Function to observe changes in the wishlist container
const observer = new MutationObserver(() => {
  if (wishlistContainer.children.length === 0) {
    displayEmptyWishlistMessage();
  }
});

// Start observing for child removals
observer.observe(wishlistContainer, { childList: true });

// Handle unfavorite functionality
wishlistContainer.addEventListener('click', async (event) => {
  if (event.target && event.target.matches('.heart-icon')) {
    event.stopPropagation();
    const favIcon = event.target;
    const productCode = favIcon.getAttribute('data-product-code');
    const user = auth.currentUser;
    
    if (user) {
      const userId = user.uid;
      
      // Remove the product from Firebase
      await remove(ref(db, `users/${userId}/favorites/${productCode}`));
      
      // Remove the product from the UI
      const productDiv = favIcon.closest('.product');
      productDiv.remove();
      
      showToast('Product removed from favourites', 'warning');
      
    } else {
      showAlert('Please log in to modify your wishlist.', 'danger');
    }
  }
});

// Improved Alert Display Function
function showAlert(message, type = 'danger') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '40px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '1050';
  
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-dismiss alert after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => {
      alertDiv.remove();
    }, 150);
  }, 5000);
}

// Empty Wishlist Message
function displayEmptyWishlistMessage() {
  const animationContainer = document.querySelector('.no-item-div');
  console.log(animationContainer);
  // Load Lottie Animation
  lottie.loadAnimation({
    container: animationContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/assets/videos/wishlist-notfound.json'
  });
  hideLoader();
  // Create 'Go to Home' link
  const link = document.createElement('a');
  link.href = "/products/prod_list.html";
  link.textContent = "Explore Products";
  link.style.display = "block"; // Ensures it appears on a new line
  link.style.textAlign = "center"; // Centers the text
  
  // Append after the animation
  setTimeout(() => {
    animationContainer.appendChild(link);
  }, 100); // Small delay to ensure Lottie is loaded
}

// Show the loader
function showLoader() {
  loader.style.display = 'flex'; // Show the loader
}

// Hide the loader
function hideLoader() {
  loader.style.display = 'none'; // Hide the loader
}

(function() {
  const image = document.querySelector('header img');
  const arrow = document.querySelector('header .bi-arrow-left');
  
  image.addEventListener('click', () => {
    window.location.href = '/index.html';
  });
  arrow.addEventListener('click', () => {
    window.history.back();
  });
})();

function showToast(content) {
    // Create the toast container if it doesn't exist
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.style.position = "fixed";
        toastContainer.style.bottom = "30px";
        toastContainer.style.left = "50%";
        toastContainer.style.transform = "translateX(-50%)";
        toastContainer.style.zIndex = "1050";
        document.body.appendChild(toastContainer);
    }

    // Create the toast element
    const toast = document.createElement("div");
    toast.className = "toast align-items-center text-white bg-dark border-0 show";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${content}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Append to the container
    toastContainer.appendChild(toast);

    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove the toast after it's hidden
    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove();
    });
}