import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, remove, update } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';
const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const cartBtn = document.querySelector('.cart');
const tooltip = document.querySelector('.profile-tooltip');
const profIcon = document.querySelector('.prof_icon');
const loginOrAuthBtn = document.querySelector('.login');
const profileName = document.querySelector('.profile_name');
const logoutBtn = document.getElementById('confirmLogout');
const logoutModal = document.getElementById('logoutModal');
const backBtn = document.querySelector('.bi-arrow-left');
const loader = document.getElementById('loader-container');
const main = document.querySelector('#main-container'); 
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

let currentUser, userId, address, userName, orderIdNo;

document.addEventListener('DOMContentLoaded', () => {
  setupAuthStateChanged();
  setupLogoutButtons();
  setupCartButtonsPath();
  setupOutsideClickHandler();
  showLoader();
  setUpcartIcon();
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


function setupAuthStateChanged() {
  onAuthStateChanged(auth, async (user) => {
    
    if (user) {
      currentUser = user;
      userId = currentUser.uid;
      await displayOrder(userId);
      await retrieveNumberOfCart(userId);
     userName = await fetchUserName(userId);
      await updateLoginUI(user);
      await fetchUserAddress(userId);
      setupCancelBtn(userId);
    } else {
      updateGuestUI();
    }
  });
}

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
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

function updateLoginUI(user) {
  loginOrAuthBtn.innerHTML = profileIcon;
  loginOrAuthBtn.classList.add('auth-login');
  loginOrAuthBtn.classList.remove('guest-login');
  profileName.textContent = userName || 'Anonymous';
  
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
        showToast('successfully logged out');
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
    window.location.href = '/cart/cart.html';
  });
}

profIcon.addEventListener('click', () => {
  tooltip.style.display = 'none';
});


// Function to retrieve orders based on userId
function retrieveOrders(userid) {
  return new Promise((resolve, reject) => {
    const orderRef = ref(db, `users/${userid}/orders/${orderIdNo}`);
    console.log(userid);
    
    get(orderRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          const allOrders = snapshot.val();
          resolve(allOrders);
        } else {
          console.log('No orders found');
          resolve(null);
        }
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        reject(error);
      });
  });
}

// Function to fetch user address with Promise
function fetchUserAddress(userid) {
  return new Promise((resolve, reject) => {
    
    const addrRef = ref(db, `users/${userid}/address`);
    get(addrRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          address = snapshot.val();
          console.log('Address fetched:', address); // For debugging
          resolve(address); // Resolve with the address
        } else {
          console.log('No address found!');
          resolve(null); // Resolve with null if no address
        }
      })
      .catch((e) => {
        console.error('Error fetching address', e);
        reject(e); // Reject on error
      });
    
  });
  
}

// Function to fetch user address with Promise
function fetchUserName(userid) {
  return new Promise((resolve, reject) => {
    
    const nameRef = ref(db, `users/${userid}/username`);
    get(nameRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          userName = snapshot.val();
          console.log('username fetched:', userName); // For debugging
          resolve(userName); // Resolve with the address
        } else {
          console.log('No username found!');
          resolve(null); // Resolve with null if no address
        }
      })
      .catch((e) => {
        console.error('Error fetching username', e);
        reject(e); // Reject on error
      });
    
  });
  
}

async function displayOrder(userid) {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get product codes (single or multiple)
  const productCodes = urlParams.get('productCode');
  
  // Convert productCodes into an array if it's a comma-separated string
  let productCodeArray = productCodes ? productCodes.split(',') : [];
  
  orderIdNo = urlParams.get('orderId');
  const orderIdElement = document.getElementById('order-id');
  if (orderIdElement) {
    orderIdElement.textContent = `Order ID - ${orderIdNo}` || 'N/A';
  }
  try {
    // Fetch product data
    const response = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json");
    const data = await response.json();
    const products = Object.values(data.products); // Convert object to an array
    
    let totalAmount = 0;
    let sumListPrice = 0;
    let sumSellingPrice = 0;
    let sumDiscount = 0;
    
    // Fetch user's order
    const order = await retrieveOrders(userid);
    if (!order || !order.products) {
      console.error("No products found for this order");
      return;
    }
    
    // Fetch user's address
    const address = await fetchUserAddress(userid);
    
    // Extract order details
    let orderStatus = order["order-status"];
    const orderTime = order["order-time"];
    const paymentStatus = order["payment-status"];
    const dispatchTime = order["dispatched-time"] || false;
    const deliveredTime = order["delivered-time"] || false;
    
    
    
    // Get the main container from the DOM
    const mainContainer = document.getElementById("main-container");
    const orderContainer = document.createElement("div");
    orderContainer.classList.add("order-container");
    
    if (orderStatus === "cancelled") {
      disableCancelBtn();
    }
    
    // Set the order structure
    orderContainer.innerHTML = `
    <section class="st">
    <b>Order Status: ${orderStatus}</b>
    </section>
      <section class="order-status">
        <div class="status-left">
          <div class="status-circle">
            <div class="circle ${orderStatus === "order placed" || orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}">
              <i class="bi bi-check"></i>
            </div>
            <div class="line ${orderStatus === "order placed" || orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}"></div>
            <div class="circle ${orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}">
              <i class="bi bi-check"></i>
            </div>
            <div class="line ${orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}"></div>
            <div class="circle ${orderStatus === "delivered" ? "active" : "inactive"}">
              <i class="bi bi-check"></i>
            </div>
          </div>
        </div>
        <div class="status-right">
          <div class="status-text">
            <p class="${orderStatus === "order placed" || orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}">
              Order Placed <span class="order-time">${formatOrderTime(orderTime) || "Date and time not available"}</span>
            </p>
            <p class="${orderStatus === "dispatched" || orderStatus === "delivered" ? "active" : "inactive"}">
              Order Dispatched <span class="dispatch-time">${dispatchTime ? formatOrderTime(dispatchTime) : ""}</span>
            </p>
            <p class="${orderStatus === "delivered" ? "active" : "inactive"}">
              Order Delivered <span class="deliver-time">${deliveredTime ? formatOrderTime(deliveredTime) : ""}</span>
            </p>
          </div>
        </div>
      </section>
      
      <section class="cancellation">
       <div>
        <p>No longer need this order?</p><button class="btn btn-bg-transparent" data-bs-toggle="modal" data-bs-target="#cancelOrderModal"> Cancel Now </button>
        </div>

      </section>

      <section class="address">
        <p style="color: grey; margin: 0">Shipping Address</p>
        <hr />
        <address>
          ${address.split(",").slice(0, 2).join(", ") + "<br>" + address.split(",").slice(2).join(", ").trim()}
        </address>
      </section>

      <section class="price-details">
        <p class="section-title">Price Details</p>
        <hr />
        <div class="price-grid">
          <div class="price-left">
            <p>List Price</p>
            <p>Selling Price</p>
            <p>Discount</p>
            <p>Delivery Charge</p>
            <p>Platform Fee</p>
            <div class="dashed-border"></div>
            <p class="total-label">Total Amount</p>
          </div>
          <div class="price-right">
            <p class="actual-amount"></p>
            <p class="selling-amount"></p>
            <p class="discount-amount"></p>
            <p class="delivery-charge">₹40</p>
            <p>₹3</p>
            <div class="dashed-border"></div>
            <p class="total-amount"><b></b></p>
          </div>
        </div>
      </section>
    `;
    
    // Loop through products in the order
    for (let productCode in order.products) {
      const matchedProduct = products.find(product => product.code === productCode);
      const productOrderData = order.products[productCode];
      
      if (matchedProduct) {
        sumListPrice += matchedProduct.actual_price;
        sumSellingPrice += matchedProduct.discounted_price;
        sumDiscount += matchedProduct.actual_price - matchedProduct.discounted_price;
        
        const orderProductSection = document.createElement("div");
        orderProductSection.classList.add("order-product-section");
        
        orderProductSection.innerHTML = `
          <div class="product-details">
            <div class="name">
              <p>${matchedProduct.name}</p>
              <b class="amount">₹${matchedProduct.discounted_price}</b>
            </div>
            <div class="image">
              <img src="${matchedProduct.images[Math.min(Math.floor(Math.random() * 4), matchedProduct.images.length - 1)]}" alt="${matchedProduct.name}">
            </div>
          </div>
        `;
        
        // Prepend the product section to the order container
        orderContainer.prepend(orderProductSection);
      } else {
        console.error("Product not found with the given product code:", productCode);
      }
    }
    
    // Append order container to the main container
    mainContainer.appendChild(orderContainer);
    
    // Update price details in the DOM
    document.querySelector(".actual-amount").innerText = `₹${sumListPrice}`;
    document.querySelector(".selling-amount").innerText = `₹${sumSellingPrice}`;
    document.querySelector(".discount-amount").innerText = `-₹${sumDiscount}`;
    var yu = (function() {
      var _ = "NDA="; // Base64 for "40"
      var __ = "Mw=="; // Base64 for "3"
      
      var $ = function(a) { return parseInt(atob(a), 10); };
      
      return {
        [atob("cmVzdWx0")]: $(_), // result = 40
        [atob("eg==")]: $(__) // z = 3
      };
    })();
    
    
    document.querySelector(".total-amount").innerText = `₹${sumSellingPrice + yu.result + yu.z}`;
    
  } catch (error) {
    console.error("Error fetching data:", error);
    hideLoader();
  } finally {
    hideLoader();
  }
}

function formatOrderTime(orderTime) {
  if (!orderTime) {
    return 'Date and time not available'; // Default message if no order time is provided
  }
  
  // Parse the order time string manually if needed
  const [datePart, timePart] = orderTime.split(', '); // Split date and time
  
  const [day, month, year] = datePart.split('/'); // Split the date into day, month, and year
  const [hourMinute, period] = timePart.split(' '); // Split the time into hour:minute and period (am/pm)
  const [hour, minute, second] = hourMinute.split(':'); // Further split hour, minute, second
  
  // Map month number to abbreviated month name
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[parseInt(month) - 1]; // Adjust month to 0-based index
  
  // Format the output string
  const formattedTime = `${monthName} ${parseInt(day)}, ${year}, ${hour}:${minute}:${second} ${period}`;
  
  return formattedTime;
}

function setupCancelBtn(userid) {
  const cancelBtn = document.querySelector(".cancellationButton");
  
  cancelBtn.addEventListener('click', ()=> {
    retrieveAndProcessOrder(userid)
  })
}

async function retrieveAndProcessOrder(userid) {
  let modalElement = document.getElementById("cancelOrderModal");
      console.log(modalElement)
let modalInstance = bootstrap.Modal.getInstance(modalElement);
if (modalInstance) {
    modalInstance.hide(); 
    console.log(modalElement, 'hiding modal');
} else {
  console.log('no modal')
}
  const orderRef = ref(db, `users/${userid}/orders/${orderIdNo}`);
  await get(orderRef).then(snapshot => {
    if (snapshot.exists()) {
      const order = snapshot.val();
      const status = order["order-status"];
      if (status === "order placed") {
        console.log('initiated order placed and check cancel status');
        cancelOrder(userid, orderIdNo);
      } else if (status === "cancelled") {
        console.log("initiated else if block")
        showToast("your order already cancelled!");
        disableCancelBtn();
      } else {
        showModal("Your order has already been dispatched or delivered or inactive and is no longer eligible for cancellation.", "danger");
      }
    }
  })
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

function disableCancelBtn() {
  setTimeout(() => {
  const cancelBtn = document.querySelector('.cancellation button');
  if (cancelBtn) {
  cancelBtn.style.filter = "grayscale(100%)";
  cancelBtn.disabled = true;
  } 
  }, 100);
}

async function cancelOrder(userid, orderid) {
  showLoader()
 
    const orderRef = ref(db, `users/${userid}/orders/${orderid}`);
    
    try {
      const snapshot = await get(orderRef);
      
      // If the order doesn't exist, return false
      if (!snapshot.exists()) {
        console.log('Order does not exist.');
        return false;
      }
      
      const orderData = snapshot.val();
      const orderTimeStr = orderData['order-time']; // Get the order-time string
      const orderTime = parseOrderTime(orderTimeStr); // Parse it to a Date object
      
      console.log('Order Time:', orderTime);
      
      const currentTime = new Date();
      const timeDifference = currentTime - orderTime; // Difference in milliseconds
      
      // 24 hours in milliseconds
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      
      // Check if the order is within 24 hours
      const orderStatusRef = orderData['order-status'];
      let now = new Date();

let cancelled_time = now.toLocaleString('en-IN', {   
  day: '2-digit',   
  month: '2-digit',   
  year: 'numeric',   
  hour: '2-digit',   
  minute: '2-digit',   
  second: '2-digit',   
  hour12: true   
});

console.log(cancelled_time);
      const cancelRef = ref(db, `users/${userid}/orders/${orderIdNo}/cancelled-time`);
      console.log(orderStatusRef);
      if (timeDifference <= twentyFourHoursInMs) {
        if (orderStatusRef === "order placed") {
          await update(orderRef, { "order-status": "cancelled",
          });
          await set(cancelRef, cancelled_time);
        hideLoader();
        showToast('Order cancelled successfully.');
        setTimeout(()=> {
        window.location.reload();
        }, 2000);
        const refundRef = ref(db, `users/${userId}/orders/${orderIdNo}/refund-Initiated`); 
          await set(refundRef, true);
        }
        return true; // Order canceled successfully
      } else {
        console.log('Order cancellation not allowed (over 24 hours).');
        showModal('Cancellation period has expired. Orders can only be cancelled within 24 hours of placing them.', 'danger');
        return false; // Cancellation not allowed
        hideLoader();
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error; // Re-throw the error to be handled by the caller
      hideLoader();
    } finally {
      hideLoader();
    }
  }
  
  function parseOrderTime(orderTimeStr) {
    // The order time format is "6/2/2025, 11:45:40 pm"
    const [datePart, timePart] = orderTimeStr.split(', '); // Split by ", "
    
    // Split the date part into [day, month, year]
    const [day, month, year] = datePart.split('/'); // Split by "/"
    
    // Split the time part into [time, period]
    const [time, period] = timePart.split(' '); // Split time and period (AM/PM)
    let [hours, minutes, seconds] = time.split(':'); // Split time into hours, minutes, and seconds
    
    // Convert to 24-hour format
    if (period === 'pm' && hours !== '12') {
      hours = (parseInt(hours) + 12).toString(); // Convert PM hours to 24-hour format
    }
    if (period === 'am' && hours === '12') {
      hours = '00'; // Convert midnight (12:00 AM) to 00:00
    }
    
    // Construct a valid date-time string in ISO format
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}`;
    
    // Parse and return the Date object
    return new Date(formattedDate);
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