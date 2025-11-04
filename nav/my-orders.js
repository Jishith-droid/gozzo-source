import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const loginBtn = document.querySelector('.login');
const cartBtn = document.querySelector('.cart');
const tooltipProf = document.querySelector('.profile-tooltip');
const profileName = document.querySelector('.profile_name');
const profIcon = document.querySelector('.prof_icon');
const logoutBtn = document.getElementById('confirmLogout');
const logoutModal = document.getElementById('logoutModal');
const loader = document.getElementById('loader-container');
const ordersDiv = document.querySelector('.order-section');
const search = document.querySelector('.input');
const searchResult = document.getElementById('searchResults');
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
let currentUser = null;

showLoader();

document.addEventListener('DOMContentLoaded', () => {
  setupOutsideClickHandler();
  setupCartButtons();
  setupAuthStateChanged();
  setupLogoutButtons();
  setupProfileTooltips();
  setUpcartIcon();
  (function() {
  const image = document.querySelector('header img');
  const arrow = document.querySelector('header .bi-arrow-left');
  
  image.addEventListener('click', ()=> {
   window.location.href = '/index.html';
  });
  arrow.addEventListener('click', ()=> {
   window.history.back();
  });
})();
});

function setUpcartIcon() {
  document.querySelectorAll('.cart').forEach(c => {
    c.innerHTML = cartIcon;
  })
}

// Function to handle click outside the aside and tooltips
function setupOutsideClickHandler() {
  if (window.tooltipEventListenerAdded) return;

  document.addEventListener('click', (event) => {
    if (!tooltipProf.contains(event.target) && !event.target.closest('.login')) {
      tooltipProf.style.display = 'none';
    }
  });

  window.tooltipEventListenerAdded = true;
}

// Function to handle cart button click
function setupCartButtons() {
  if (cartBtn) { // Check if the cart button exists
    cartBtn.addEventListener('click', () => {
      window.location.href = '/cart/cart.html';
    });
  }
}

// Firebase Authentication State Change
function setupAuthStateChanged() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      updateLoginUI(user);
      handleUserLogin(user);
      retrieveNumberOfCart(user.uid);
      retrieveOrders(user.uid);
      searchOrders();
    } else {
      updateGuestUI();
      showModal('User should login to view orders!', 'danger');
      setTimeout(() => {
      window.location.href = '/auth/login.html';
      }, 3000);
    }
  });
}

// Update UI for authenticated user
function updateLoginUI(user) {
  if (loginBtn) {
    loginBtn.innerHTML = profileIcon;
    loginBtn.classList.add('auth-login');
    loginBtn.classList.remove('guest-login');
  }
}

// Handle user login: fetch data from Firebase
function handleUserLogin(user) {
  const dbRef = ref(db, 'users/' + user.uid);
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const { username = 'Guest' } = snapshot.val();
      if (profileName) {
        profileName.textContent = `${username}`;
      }
    } else {
      console.log("No user data found");
    }
  }).catch((error) => {
    console.error("Error fetching user data:", error);
  });

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (tooltipProf) {
        tooltipProf.style.display = 'flex';
      }
    });
  }
}

function closeModal() {
  const modalInstance = bootstrap.Modal.getInstance(logoutModal);
  modalInstance.hide();
}

// Update UI for guest user
function updateGuestUI() {
  if (loginBtn) {
    loginBtn.innerHTML = `<i class="bi bi-person"></i><span>Login</span>`;
    loginBtn.classList.add('guest-login');
    loginBtn.classList.remove('auth-login');

    loginBtn.addEventListener('click', () => {
      window.location.href = '/auth/login.html';
    });
  }
}

// Function to handle logout
function setupLogoutButtons() {
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        showLoader();
        showToast('Successfully logged out');
        if (profileName) profileName.textContent = 'Guest';
        if (profIcon) profIcon.click();
        
        resetLoginButton();
        closeModal();
      }).catch((error) => {
        console.error('Error logging out:', error);
      }).finally(() => {
        hideLoader();
      });
    });
  }
}

// Reset login button UI
function resetLoginButton() {
  if (loginBtn) {
    loginBtn.innerHTML = `<i class="bi bi-person"></i><span>Login</span>`;
    loginBtn.classList.remove('auth-login');
  }
}

// Function to close profile tooltip
function setupProfileTooltips() {
  if (profIcon) {
    profIcon.addEventListener('click', () => {
      if (tooltipProf) tooltipProf.style.display = 'none';
    });
  }
}

async function retrieveNumberOfCart(userid) {
  if (userid) {
    const cartRef = ref(db, `users/${userid}/cart-products`);

  await get(cartRef).then(snapshot => {
      if (snapshot.exists()) {
        const cartData = snapshot.val();
        const numberOfProducts = Object.keys(cartData).length;

        const cartIcon = document.querySelector('.cart');
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

function showLoader() {
  loader.style.display = 'flex'; // Show the loader
}

// Hide the loader
function hideLoader() {
  loader.style.display = 'none'; // Hide the loader
}

async function retrieveOrders(userid) {
  try {
    // Fetching product data from the external source
    const productsResponse = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")

    if (!productsResponse.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await productsResponse.json();


    const products = Object.values(data.products); // Convert the object to an array
    // Your code to h

    // Fetching user's orders from Firebase
    const ordersRef = ref(db, `users/${userid}/orders/`);
    const orderSnapshot = await get(ordersRef);

    if (orderSnapshot.exists()) {
      const orders = orderSnapshot.val(); // Getting the orders data

      // Loop through each order
      for (let orderId in orders) {
        const order = orders[orderId]; // Order object
        const orderProducts = order.products || {}; // Retrieve products from the 'products' node

        let productCodes = [];
        let productNames = [];
        let productImages = [];
        let productCount = Object.keys(orderProducts).length; // Number of products in the order
        let orderStatus = order["order-status"] || "Unknown"; // Fetch order status
        
        let orderTime = order["order-time"] || "Unknown"; // Fetch order time
        let dispatchTime = order["dispatched-time"] || "Unknown"; // Fetch order time
        let deliveredTime = order["delivered-time"] || "Unknown"; // Fetch order time
        let cancelledTime = order["cancelled-time"] || "Unknown"; // Fetch order time

        // Loop through each product in the order
        for (let productCode in orderProducts) {
          const product = products.find(p => p.code === productCode);

          if (product) {
            productCodes.push(product.code);
            productNames.push(product.name);
            productImages.push(product.images[0]); // Use first image as the main image
          } else {
            console.log(`No matching product found for code: ${productCode}`);
          }
        }

        // If there are products, create an order entry
        if (productCodes.length > 0) {
          const orderDiv = document.createElement('div');
          orderDiv.classList.add('orders-div');
          orderDiv.setAttribute('data-product-code', productCodes.join(',')); // Store product codes as data attribute

          // Create image overlay content
          let imageContent = `
            <div class="img">
              <img src="${productImages[0]}" alt="Product Image" />
            </div>
          `;

          if (productCount > 1) {
            imageContent = `
              <div class="img">
                <img src="${productImages[0]}" alt="Product Image" />
                <div class="overlay">
                  <span>+${productCount - 1}</span>
                </div>
              </div>
            `;
          }

          // Create the order HTML
          orderDiv.innerHTML = `
            ${imageContent}
            <div class="order-details">
            <p class="order-status ${(orderStatus !== 'cancelled' && orderStatus !== 'inactive') ? 'statusOk' : 'statusNo'}">Order Status - ${orderStatus}</p>
              <b class="order-date">
${getOrderStatus(orderStatus, 
  orderStatus === 'order placed' ? orderTime : 
  orderStatus === 'dispatched' ? dispatchTime : 
  orderStatus === 'delivered' ? deliveredTime : 
  orderStatus === 'cancelled' ? cancelledTime : 
  orderStatus === 'inactive' ?
   'N/A' : null
  )}
 <!-- Display the status message -->
              </b>
              <p class="order-product-name">
                ${productCount === 1 ? productNames[0] : productNames.join(', ')}
              </p>
            </div>
            <div class="chevron">
              <i class="bi bi-chevron-right"></i>
            </div>
          `;

          // Append orderDiv to the orders container
          ordersDiv.appendChild(orderDiv);

          // Event listener for navigating to the product page on click
          orderDiv.addEventListener('click', () => {
            const productCodes = orderDiv.getAttribute('data-product-code');
            window.location.href = `/nav/order_view.html?productCode=${productCodes}&orderId=${orderId}`;
          });
        }
      }
    } else {
      console.log("No orders found for this user");
      ordersDiv.innerHTML = `
      <div class="error-gateway">
        <img src="/assets/images/no-order.png" alt="No orders found">
        <div class="order-found">No orders found
        <a href="/products/prod_list.html">Explore products</a>
        </div>
      </div>
    `;
    }
  } catch (e) {
    console.error('Error retrieving orders or products:', e);
    ordersDiv.innerHTML = `
      <div class="error-gateway">
        <img src="/assets/vectors/404.svg" alt="404 error">
        <a href="javascript:location.reload()">Reload page</a>
        </div>
      </div>
    `;
  } finally {
    hideLoader();
  }
}
// Helper function to handle order status messages
function getOrderStatus(orderStatus, orderTime) {
  let statusMessage = '';
  let statusDate = '';

  // Get the appropriate message and status time based on the order status
  statusMessage = getStatusMessage(orderStatus);
  if (orderTime === 'N/A') {
    statusDate = '____ ____'
  } else {
  statusDate = formatDate(orderTime) || 'N/A'; // Use the order-time field
  }
  return `${statusMessage} ${statusDate}`;
}

// Helper function to return the appropriate status message
function getStatusMessage(orderStatus) {
  let statusMessage = '';
  if (orderStatus === 'order placed') {
    statusMessage = 'Order placed on';
  } else if (orderStatus === 'dispatched') {
    statusMessage = 'Dispatched on';
  } else if (orderStatus === 'delivered') {
    statusMessage = 'Delivered on';
  } else if (orderStatus === 'cancelled') {
    statusMessage = 'Cancelled on'
  } else if (orderStatus === 'inactive') {
    statusMessage = '____'
  } else {
    statusMessage = 'Status unknown';
  }
  return statusMessage;
}

// Function to format the date
function formatDate(dateString) {
  if (!dateString) {
    return 'N/A'; // Return a default value if the date is invalid or missing
  }

  const [datePart, timePart] = dateString.split(', ');
  if (!timePart) {
    return 'Invalid Date Format'; // Return a default value if time part is missing
  }

  const [day, month, year] = datePart.split('/');
  const formattedDateString = `${month}/${day}/${year} ${timePart}`;

  const date = new Date(formattedDateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
   
function searchOrders() {
  search.addEventListener('input', async function () {
    const query = search.value.toLowerCase().trim();

    // If the search query is empty, hide the search results
    if (!query) {
      searchResult.style.display = 'none';
      searchResult.innerHTML = ''; // Clear the search results
      return;
    }

    try {
      // Fetching product data from the external source
      const productsResponse = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json");
      const productsData = await productsResponse.json();
      const products = Object.values(productsData.products);

      // Fetching user's orders from Firebase
      const ordersRef = ref(db, `users/${currentUser.uid}/orders/`);
      const orderSnapshot = await get(ordersRef);

      searchResult.innerHTML = ''; // Clear previous search results

      if (orderSnapshot.exists()) {
        const orders = orderSnapshot.val(); // Getting the orders data

        for (let orderId in orders) {
          const order = orders[orderId]; // Order object
          const orderProducts = order.products || {}; // Get products from 'products' node

          for (let productCode in orderProducts) {
            // Find the product from the fetched product list
            const product = products.find(p => p.code === productCode);

            if (product && product.name.toLowerCase().includes(query)) {
              // Create a search result div for the purchased product
              const productDiv = document.createElement('div');
              productDiv.classList.add('search-div');
              productDiv.setAttribute('data-product-code', product.code);
              productDiv.setAttribute('data-order-id', orderId); // Set the unique orderId

              productDiv.innerHTML = `
                <div class="product-container">
                  <div class="search-img">
                    <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}">
                  </div>
                  <div class="search-name">
                    <p>${product.name}<br><small>${orderId}</small></p>
                  </div>
                </div>
              `;

              searchResult.style.display = 'block';
              searchResult.appendChild(productDiv);

              // Event listener to navigate to the product's order view page
              productDiv.addEventListener('click', () => {
                const productCode = productDiv.getAttribute('data-product-code');
                const orderID = productDiv.getAttribute('data-order-id');
                window.location.href = `/nav/order_view.html?productCode=${productCode}&orderId=${orderID}`;
                search.value = '';
              });
            }
          }
        }
      } else {
        console.log('No orders found for this user');
      }
    } catch (e) {
      console.error('Error fetching products:', e);
      searchResult.innerHTML = '<p>Sorry, there was an error fetching the products.</p>';
      searchResult.style.display = 'block';
    }
  });
  
}

// Modal creation and display
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
  modalElement.addEventListener('hidden.bs.modal', function() {
    modalElement.remove();
  });
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