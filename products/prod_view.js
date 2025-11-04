import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase();

const cartBtn = document.querySelector('.cartbtn');
const addToCartBtn = document.querySelector('.addCart');
const tooltip = document.querySelector('.profile-tooltip');
const profIcon = document.querySelector('.prof_icon');
const loginOrAuthBtn = document.querySelector('.login');
const profileName = document.querySelector('.profile_name');
const logoutBtn = document.getElementById('confirmLogout');
const logoutModal = document.getElementById('logoutModal');
const backBtn = document.querySelector('.bi-arrow-left');
const product_info = document.getElementById('product-info');
const loader = document.getElementById('loader-container');
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

document.addEventListener('DOMContentLoaded', () => {
  setupAuthStateChanged();
  setupLogoutButtons();
  setupCartButtonsPath();
  setupCartButtons();
  setupOutsideClickHandler();
  setupFavoriteButtons();
  setUpcartIcon();
  showLoader();
  
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
});

function setUpcartIcon() {
  document.querySelectorAll('.cart').forEach(c => {
    c.innerHTML = cartIcon;
  })
}

// Update setupFavoriteButtons to handle the heart icon click

function setupFavoriteButtons() {
  document.addEventListener('click', async (event) => {
    if (event.target && event.target.matches('.heart-icon')) {
      const favIcon = event.target;
      const productCode = favIcon.getAttribute('data-product-code');
      const userId = getUserId(); // Get current user's ID
      
      if (!userId) {
        showToast('Please log in to favorite products.');
        return;
      }
      
      // Get the current favorite status from Firebase for this product code
      const favoritesRef = ref(db, `users/${userId}/favorites/${productCode}`);
      const snapshot = await get(favoritesRef);
      
      // Retrieve the current state (favorited or not) from Firebase
      let isFavorited = snapshot.exists() ? snapshot.val().favorited : false;
      
      // Toggle the favorite status
      isFavorited = !isFavorited;
      
      // Update heart icon visual state based on the new favorite state
      if (isFavorited) {
        favIcon.classList.add('favorited');
        favIcon.classList.replace('bi-heart', 'bi-heart-fill');
        showToast('Added to wishlist');
      } else {
        favIcon.classList.remove('favorited');
        favIcon.classList.replace('bi-heart-fill', 'bi-heart');
        showToast('Removed from wishlist');
      }
      
      // Save the new favorite status to Firebase
      await saveFavoriteToDatabase(userId, productCode, isFavorited);
    }
  });
}

// Function to get the current user's UID
function getUserId() {
  const user = auth.currentUser; // Check the current user after onAuthStateChanged is called
  return user ? user.uid : null; // Return the user ID or null if no user is logged in
}

// Function to save the favorite product code to Firebase
async function saveFavoriteToDatabase(userId, productCode, isFavorited) {
  const favoriteRef = ref(db, `users/${userId}/favorites/${productCode}`);
  
  try {
    if (isFavorited) {
      await set(favoriteRef, { productCode: productCode, favorited: true });
    } else {
      await remove(favoriteRef);
    }
    console.log('Favorite status saved successfully');
  } catch (error) {
    console.error('Error saving favorite status:', error);
  }
}


function setupOutsideClickHandler() {
  if (window.tooltipEventListenerAdded) return;
  
  document.addEventListener('click', (event) => {
    
    
    if (!tooltip.contains(event.target) && !event.target.closest('.login')) {
      tooltip.style.display = 'none';
    }
  });
  
  window.tooltipEventListenerAdded = true;
}

async function fetchUsername(userid) {
  try {
    const nameRef = ref(db, `users/${userid}/username`);
    const snapshot = await get(nameRef);
    if (snapshot.exists()) {
      return snapshot.val(); // ✅ Returns the name
    } else {
      console.log('No username found');
      return null; // Return null if no data
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
}

async function updateLoginUI(user, userid) {
  loginOrAuthBtn.innerHTML = profileIcon;
  loginOrAuthBtn.classList.add('auth-login');
  loginOrAuthBtn.classList.remove('guest-login');
  profileName.textContent = await fetchUsername(userid);
  
  loginOrAuthBtn.addEventListener('click', () => {
    tooltip.style.display = tooltip.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Update UI for guest user
function updateGuestUI() {
  loginOrAuthBtn.innerHTML = `<i class="bi bi-person"></i><span>Login</span>`;
  loginOrAuthBtn.classList.add('guest-login');
  loginOrAuthBtn.classList.remove('auth-login');
  
  loginOrAuthBtn.addEventListener('click', () => {
    window.location.href = '/auth/login.html';
  });
}

// Function to handle logout
function setupLogoutButtons() {
  logoutBtn.addEventListener('click', () => {
    showLoader();
    auth.signOut()
      .then(() => {
       showToast('Logged out');
        tooltip.style.display = 'none';
        updateGuestUI();
        closeModal();
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      }).finally(() => {
        hideLoader();
      });
  });
}

function closeModal() {
  const modalInstance = bootstrap.Modal.getInstance(logoutModal);
  if (modalInstance) modalInstance.hide();
}

// Function to handle cart button
function setupCartButtonsPath() {
  cartBtn.addEventListener('click', () => {
    showLoader();
    window.location.href = '/cart/cart.html';
  });
}

profIcon.addEventListener('click', () => {
  tooltip.style.display = 'none';
})


window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const productCode = urlParams.get('productCode');
  
  fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      const products = Object.values(data.products); // Convert the object to an array
      // Your code to h
      const product = products.find(p => p.code === productCode); // Find the clicked product
      
      if (product) {
        const currentDate = new Date();
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(currentDate.getDate() + 7); // Adding 7 days for expected delivery
        document.title = `Buy ${product.name || 'products'} at the Best Price | PotItUp</title>
`;
        const productInfo = document.createElement('div');
        productInfo.innerHTML = `
    <!-- carousal -->
<div class="product-view">
  <div class="first-box">
    <div class="custom-carousel-container" tabindex="0" id="carousel-container">
      <i data-product-code="${product.code}" class="bi bi-heart heart-icon"></i>
      <i class="bi bi-share" aria-label="Share"></i>
      <div class="custom-carousel" id="custom-carousel">
        ${product.images && product.images.length > 0 ? 
          product.images.map(img => `<img class="custom-carousel-item" src="${img}" alt="${product.name || 'Product Image'}">`).join('') :
          '<img class="custom-placeholder" src="placeholder.jpg" alt="No Image Available">'}
      </div>
      <div class="custom-indicators" id="custom-indicators"></div>
    </div>

    <div class="nameAndDescription">
      <div class="name">
        <b>${product.name || 'Product name not available'}</b>
      </div>
      <div class="description">
        ${product.subDescription || 'Description not available'}
      </div>
      <button class="btn btn-outline-dark">
        Pack Of ${product.quantity || 'N/A'}
      </button>
    </div> 
  </div> 
</div> 

<!-- section 1 -->
<section class="price-box s1">
  <div>
    <i style="color: green" class="bi bi-arrow-down"></i> 
    <strong>${product.discount_percentage || 'Discount data not available'}%</strong>
  </div>
  <div>
    <s style="color: grey">₹${product.actual_price || 'N/A'}</s>
  </div>
  <div>
    <b>₹${product.discounted_price || 'N/A'}</b>
  </div>
</section>

<!-- section 2 -->
<section class="s2">
  <div id="addressContainer"></div>
</section>

<!-- section 3 -->
<section class="s3">
  <div id="order-info-box" class="container-fluid">
    <div class="order-info-items">
      <i class="bi bi-cart-x order-info-box-no-cancellation"></i>
      <p>Cancellation Not Available</p>
    </div>
    <div class="order-info-items">
      <i class="bi bi-arrow-90deg-left"></i>
      <p>No Return And Replacement Available</p>
    </div>
    <div class="order-info-items">
      <i class="bi bi-cash-coin"></i>
      <p>${product.payment_method.cash_on_delivery ? 'Cash on Delivery Available' : 'Cash on Delivery Not Available'}</p>
    </div>
  </div> 
</section> 

<!-- section 4 -->
<section class="s4">
  <div class="attribute-details">
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#deliveryInfo" aria-control="offcanvasTop" class="row mb-3">
      <div class="col-2 text-end"><i class="bi bi-truck"></i></div>
      <div class="col-8">
        <span style="color: green; font-weight: 700; font-size: 19px;">Delivery 40</span>  
        Delivered by ${expectedDeliveryDate.toLocaleDateString()}
      </div>
      <div class="col-2 text-start"><i class="bi bi-chevron-right"></i></div>
    </a>
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#returnPolicy" aria-control="offcanvasTop" class="row mb-3">
      <div class="col-2 text-end"><i class="bi bi-arrow-return-left"></i></div>
      <div class="col-8">No return allowed</div>
      <div class="col-2 text-start"><i class="bi bi-chevron-right"></i></div>
    </a>
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#codInfo" aria-control="offcanvasTop" class="row mb-3">
      <div class="col-2 text-end"><i class="bi bi-cash-coin"></i></div>
      <div class="col-8">${product.payment_method?.cash_on_delivery ? 'Cash on delivery available' : 'Cash on delivery not available'}</div>
      <div class="col-2 text-start"><i class="bi bi-chevron-right"></i></div>
    </a>
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#refundInfo" aria-control="offcanvasTop" class="row mb-3">
  <div class="col-2 text-end"><i class="bi bi-arrow-counterclockwise"></i></div>
  <div class="col-8">
    Refund is only available if canceled within 24 hours of ordering.  
    Delivery and platform fees are non-refundable.
  </div>
  <div class="col-2 text-start"><i class="bi bi-chevron-right"></i></div>
</a>
    <a href="#" data-bs-toggle="offcanvas" data-bs-target="#replacementInfo" aria-control="offcanvasTop" class="row">
      <div class="col-2 text-end"><i class="bi bi-cart-x"></i></div>
      <div class="col-8">No Replacement allowed</div>
      <div class="col-2 text-start"><i class="bi bi-chevron-right"></i></div>
    </a>
  </div>
</section>

<!-- section 5 -->
<section class="product-highlight accordion s5" id="highlightAccordion">
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingOne">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" 
        data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
        Product Highlights
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#highlightAccordion">
      <div class="accordion-body">
        ${product.images && product.images.length > 0 ? 
          product.images.map(img => `<img src="${img}" alt="Highlight" class="img-fluid">`).join('') : 
          '<p>Highlight images not available</p>'}
      </div>
    </div>
  </div>
</section>

<!-- section 6 -->
<section class="s6">
  <div class="details">
    <b>Additional Details:</b>
    <ul>
      <li>Height: ${product.attributes?.size?.height || 'N/A'}</li>
      <li>Width: ${product.attributes?.size?.width || 'N/A'}</li>
      <li>Weight: ${product.attributes?.size?.weight || 'N/A'}</li>
      <li>Quantity: ${product.quantity || 'N/A'}</li>                                                
      <li>Material: ${product.attributes?.material || 'N/A'}</li>
      <li>Color: ${product.attributes?.color ? product.attributes.color.join(', ') : 'N/A'}</li>
    </ul>
  </div>
</section>

<!-- section 7 -->
<section class="s7">
  <div class="product-details">
    <b>Product Description:</b>
    <p>${product.description || 'N/A'}</p>
  </div>
</section>

<div class="buy-cart">
  <button disabled id="buyNow" class="buy">Buy Now</button>
  <button disabled class="addCart">Add to Cart</button>
</div>
    `;
        
        // Append product info to the body or a specific container
        product_info.appendChild(productInfo);
        
        // Initialize carousel only after the content is fully rendered
        initCarousel();
      
        // Event listener for the dropdown (quantity buttons and address change)
        document.addEventListener('click', (event) => {
          
          // Handle address change button click to navigate
          if (event.target && event.target.id === 'changeAddr') {
            showLoader();
            window.location.href = '/nav/account_settings.html?changeAddress=true';
          }
          
          if (event.target && event.target.id === 'buyNow') {
            showLoader();
            window.location.href = `/nav/order_summary.html?fromProduct=${product.code}`;
          }
          
        });
        
      } else {
        console.error("Product not found!");
      }
    })
    .catch(error => {
      console.error("Error fetching product data:", error);
      product_info.innerHTML = `
      <div class="error-gateway">
        <img src="/assets/vectors/404.svg" alt="404 error">
        <a href="javascript:location.reload();">Reload Page</a>
      </div>
    `;
    }).finally(() => {
      hideLoader();
    })
  
  function initCarousel() {
    let currentIndex = 0;
    const carousel = document.getElementById('custom-carousel');
    const totalSlides = document.querySelectorAll('.custom-carousel-item').length;
    const indicatorsContainer = document.getElementById('custom-indicators');
    const carouselContainer = document.getElementById('carousel-container');
    
    let startX = 0;
    
    // Create carousel indicators
    for (let i = 0; i < totalSlides; i++) {
      const indicator = document.createElement('span');
      indicator.classList.add('custom-indicator');
      indicatorsContainer.appendChild(indicator);
    }
    
    function updateCarousel() {
      const indicators = document.querySelectorAll('.custom-indicator');
      carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
      indicators.forEach((indicator) => indicator.classList.remove('active'));
      indicators[currentIndex].classList.add('active');
    }
    
    function moveSlide(direction) {
      currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
      updateCarousel();
    }
    
    // Handle touch swipe
    carouselContainer.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    carouselContainer.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) moveSlide(diff > 0 ? 1 : -1);
    });
    
// Handle arrow key and tab navigation
carouselContainer.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moveSlide(-1);
  if (e.key === 'ArrowRight') moveSlide(1);
  
  // Handle Tab key navigation
  if (e.key === 'Tab') {
    e.preventDefault(); // Prevent default tabbing behavior
    moveSlide(1); // Move to the next slide
  }
});
    
    updateCarousel();
  }
};


let currentUser = null;

function setupAuthStateChanged() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      
      updateLoginUI(user, user.uid);
      retrieveFavorites(user.uid);
      retrieveNumberOfCart(user.uid);
      retrieveAddress(user.uid);
      enableBtns();
    } else {
      updateGuestUI();
    }
  });
}

// Remove the click event listener setup from retrieveFavorites

async function retrieveFavorites(userId) {
  const favoritesRef = ref(db, `users/${userId}/favorites`);
  
  try {
    const snapshot = await get(favoritesRef);
    if (snapshot.exists()) {
      const favorites = snapshot.val();
      
      // Update the heart icons based on saved favorites
      document.querySelectorAll('.heart-icon').forEach(favIcon => {
        const productCode = favIcon.getAttribute('data-product-code');
        
        // If the product code exists in the favorites, update the heart icon state
        if (favorites[productCode]) {
          const isFavorited = favorites[productCode].favorited;
          
          // Update the heart icon based on favorite status
          if (isFavorited) {
            favIcon.classList.add('favorited');
            favIcon.classList.replace('bi-heart', 'bi-heart-fill');
          } else {
            favIcon.classList.remove('favorited');
            favIcon.classList.replace('bi-heart-fill', 'bi-heart');
          }
        }
      });
    } else {
      console.log('No favorites found');
    }
  } catch (error) {
    console.error('Error retrieving favorite products:', error);
  }
}


function setupCartButtons() {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('addCart')) {
      const urlParams = new URLSearchParams(window.location.search);
      const productCode = urlParams.get('productCode');
      if (!productCode) return showToast('Invalid product code.');
      if (currentUser) {
        saveInCart(currentUser.uid, productCode);
      } else {
        showToast('You must be logged in to add items to the cart.');
        setTimeout(() => {
        window.location.href = '/auth/login.html';
        }, 2000);
      }
    }
  });
}

function saveInCart(uid, productCode)
{
  showLoader();
  const cartRef = ref(db, `users/${uid}/cart-products/${productCode}`);
  get(cartRef).then(snapshot => {
    if (snapshot.exists()) {
      hideLoader();
      showToast('Product already added to cart!');
    } else {
      set(cartRef, true)
    .then(() => {
      showToast('Product added to cart!')
    retrieveNumberOfCart(uid);
   }).catch((error) => showToast('Failed to add product to cart.')).finally(() => {
      hideLoader();
    });
    }
  })
  
}

document.addEventListener('click', async (event) => {
  if (event.target && event.target.classList.contains('bi-share')) {
    // Prevent default behavior if necessary
    event.preventDefault();
    
    // Get the current URL
    const currentUrl = window.location.href;
    
    // Check if the browser supports the Web Share API
    if (navigator.share) {
      try {
        // Use the Web Share API
        await navigator.share({
          title: document.title, // Page title
          text: `Check this out!\n`, // Optional text
          url: currentUrl, // Current URL
        });
        console.log('Successfully shared!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      showToast(`Share this URL: ${currentUrl}`);
    }
  }
});

function retrieveNumberOfCart(userid) {
  if (userid) {
    // Reference to the cart-products node for the specific user
    const cartRef = ref(db, `users/${userid}/cart-products`);
    
    // Get the data for the cart
    get(cartRef).then(snapshot => {
      if (snapshot.exists()) {
        // Get all the keys (product codes) inside the cart
        const cartData = snapshot.val();
        
        // Count the number of products in the cart
        const numberOfProducts = Object.keys(cartData).length;
        
        // Update the cart icon with the product count (if numberOfProducts > 0)
        const cartIcon = document.querySelector('.cart');
        if (cartIcon) {
          // Set the count dynamically using a pseudo-class with ::after
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
// Show the loader
function showLoader() {
  loader.style.display = 'flex'; // Show the loader
}

// Hide the loader
function hideLoader() {
  loader.style.display = 'none'; // Hide the loader
}



function retrieveAddress(userid) {
  const addrRef = ref(db, `users/${userid}/address`);
  const usernameRef = ref(db, `users/${userid}/username`);
  
  // Retrieve the addr DOM element dynamically
  const addr = document.getElementById('addressContainer');
  
  if (!addr) {
    console.error('Address container not found.');
    return;
  }
  
  // Clear existing content to prevent stacking
  addr.innerHTML = '';
  
  // Retrieve both username and address
  Promise.all([get(usernameRef), get(addrRef)])
    .then(([usernameSnap, addrSnap]) => {
      if (usernameSnap.exists() || addrSnap.exists()) {
        const username = usernameSnap.val();
        const address = addrSnap.val();
        
        // Create the address display
        const addrDiv = document.createElement('div');
        addrDiv.innerHTML = `
          <div id="address-view">
            <div class="current-address">
              <span style="color: black;"><span style="font-weight: 700;">Delivered To:</span> <br>${username}</span><br>
              <span style="color: grey;">${address || 'No address saved'}</span>
            </div>
            <button id="changeAddr" class="ChangeAddr-Btn">Change</button>
          </div>
        `;
        
        addr.appendChild(addrDiv);
      } else {
        addr.innerHTML = '<p>No address or username found.</p>';
      }
    })
    .catch((error) => {
      console.error('Error retrieving data:', error);
      addr.innerHTML = '<p>Error retrieving data.</p>';
    });
}

function enableBtns() {
  const buy = document.querySelector('.buy');
  const cart = document.querySelector('.addCart');
  buy.disabled = false;
  cart.disabled = false;
  buy.style.filter = 'grayscale(0%)';
  cart.style.filter = 'grayscale(0%)';
}

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

// Example Usage
// showToast("Product added to cart!");
