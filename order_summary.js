import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, update, remove, push } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const getEl = (selector) => document.querySelector(selector);
const getId = (id) => document.getElementById(id);

const addressContainer = getEl('.address-container');
console.log(addressContainer);
const summaryContainer = getEl('.summary-container');
const paymentContainer = getEl('.payment-container');

const circle1 = getEl('.circle1');
const circle2 = getEl('.circle2');
const circle3 = getEl('.circle3');
const loader = getId('loader-container');

const addressForm = getId('addressForm');

const addressElement = getEl('.delivered-to-container');
const discountAmountElement = getEl('.dis-amt');
const finalAmountElement = getEl('.finTotal');
const priceDetailsElement = getEl('.invoice');
const productElement = getId('ordered-product-container');
const orderContinueElement = getEl('.continue-order');
const orderContinueBtn = getEl('.summary-confirm-btn');

const placeOrderCod = getId('placeOrderCOD');
const placeOrderOnline = getId('placeOrderOnline');
const totalAmountElement = getId('totalDivAmt');

let receiptHTML, user, totalAmount, discountAmount, itemCount, address, phone, finalTotal, codOrderId, userId, orderId, paymentId, userName, userEmail;

let ifPlacedFromCod = false;

showLoader();

// back button to navigate /index.html

// Push a fake history state
history.pushState(null, '', location.href);

window.addEventListener('popstate', function(event) {

  window.location.href = "/index.html";
});

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showAddressContainer() {
  addressContainer.style.display = 'block';
}

function hideAddressContainer() {
  addressContainer.style.display = 'none';
}

function showSummaryContainer() {
  summaryContainer.style.display = 'block';
}

function hideSummaryContainer() {
  summaryContainer.style.display = 'none';
}

function showPaymentContainer() {
  paymentContainer.style.display = 'block';
}

function hidePaymentContainer() {
  paymentContainer.style.display = 'none';
}

function checkCircleOne() {
  circle1.classList.add('step-checked1');
  circle1.innerHTML = '<i class="bi bi-check-lg"></i>';
}

function checkCircleTwo() {
  circle2.classList.add('step-checked2');
  circle2.innerHTML = '<i class="bi bi-check-lg"></i>';
}

function checkCircleThree() {
  circle3.classList.add('step-checked3');
  circle3.innerHTML = '<i class="bi bi-check-lg"></i>';
}

function sanitizeInput(input) {
  return input.trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/&/g, "&amp;");
}

function generateOrderID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = ['order_'];
  
  for (let i = 0; i < 14; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }
  
  return result.join('');
}

function showModal(message, type) {
  return new Promise((resolve) => {
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
    alertBox.setAttribute('role', 'alert');
    alertBox.style.position = 'fixed';
    alertBox.style.top = '50px';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.width = '75%';
    
    alertBox.innerHTML = `
      ${message}
      <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertBox);
    
    const closeButton = alertBox.querySelector('.btn-close');
    closeButton.addEventListener('click', () => {
      alertBox.classList.remove('show');
      alertBox.classList.add('fade');
      setTimeout(() => alertBox.remove(), 300);
      resolve();
    });
    
    setTimeout(() => {
      alertBox.classList.remove('show');
      alertBox.classList.add('fade');
      setTimeout(() => alertBox.remove(), 300);
      resolve();
    }, 5000);
  });
}

function showToast(content) {
  const toastContainer = document.createElement("div");
  toastContainer.id = "toastContainer";
  toastContainer.style.position = "fixed";
  toastContainer.style.bottom = "40px";
  toastContainer.style.left = "50%";
  toastContainer.style.transform = "translateX(-50%)";
  toastContainer.style.zIndex = "1050";
  document.body.appendChild(toastContainer);
  
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
  
  toastContainer.appendChild(toast);
  new bootstrap.Toast(toast).show();
  
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
}

onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user = currentUser;
    userId = user.uid;
    userName = await fetchUsername(userId);
    userEmail = await fetchEmail(userId);
    address = await fetchAddress(userId);
    await checkAddressExistence(userId);
  } else {
    await showModal('Customers must be authenticated to proceed with placing an order.', 'warning');
    window.location.href = '/auth/login.html';
    return;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  navigateAddress();
  preloadAPI();
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

function navigateAddress() {
  addressElement.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'changeAddr') {
      window.location.href = '/nav/account_settings.html?changeAddress=true';
    }
  });
}

async function preloadAPI() {
  const urls = [
    'https://gozzo.onrender.com/create-order',
    'https://gozzo.onrender.com/verify-payment'
  ];
  
  try {
    await Promise.all(urls.map(url =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
    ));
  } catch (e) {}
  delete window.preloadAPI;
}

async function fetchUsername(userid) {
  try {
    const nameRef = await get(ref(db, `users/${userid}/username`));
    return nameRef.exists() ? nameRef.val() : null;
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
}

async function fetchEmail(userid) {
  try {
    const emailRef = await get(ref(db, `users/${userid}/email`));
    return emailRef.exists() ? emailRef.val() : null;
  } catch (error) {
    console.error("Error fetching email:", error);
    return null;
  }
}

async function fetchAddress(userid) {
  try {
    const addrRef = await get(ref(db, `users/${userid}/address`));
    return addrRef.exists() ? addrRef.val() : null;
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
}

async function checkAddressExistence(userid) {
  try {
    
    const addrSnapshot = await get(ref(db, `users/${userid}/address`));
    const userNameSnapshot = await get(ref(db, `users/${userid}/username`));
    
    if (addrSnapshot.exists() && userNameSnapshot.exists()) {
      checkCircleOne();
      hideAddressContainer();
      showSummaryContainer();
      fetchAndDisplayOrderDetails();
    } else {
      showAddressContainer();
    }
  } catch (error) {
    console.error('Error checking address existence:', error);
    showModal('We encountered an issue while retrieving your address. Please try again later or enter your address manually.', 'danger');
  } finally {
    hideLoader();
  }
}

addressForm.addEventListener('submit', submitAddrForm);

async function submitAddrForm(event) {
  event.preventDefault();
  
  const fullName = sanitizeInput(document.getElementById('fullName').value);
  const phoneNumber = sanitizeInput(document.getElementById('phoneNumber').value);
  const alternativeNumber = sanitizeInput(document.getElementById('altPhoneNumber').value);
  const pincode = sanitizeInput(document.getElementById('pincode').value);
  const streetAddress = sanitizeInput(document.getElementById('addressTextarea').value);
  const city = sanitizeInput(document.getElementById('city').value);
  const state = sanitizeInput(document.getElementById('state').value);
  const landmark = sanitizeInput(document.getElementById('landmark').value) || 'N/A';
  
  const validateInput = (value, regex, errorMsg) => {
    if (!regex.test(value)) {
      hideLoader();
      showToast(errorMsg);
      return false;
    }
    return true;
  };
  
  if (!validateInput(phoneNumber, /^\d{10}$/, 'Invalid phone number')) return;
  if (alternativeNumber && !validateInput(alternativeNumber, /^\d{10}$/, 'Invalid alternative phone number')) return;
  if (!validateInput(pincode, /^\d{6}$/, 'Invalid pincode')) return;
  
  const fullAddress = `${fullName}, ${streetAddress}, ${landmark}, ${city}, ${state}, ${pincode}, ${phoneNumber}`;
  
  if (user) {
    try {
      showLoader();
      const userId = user.uid;

      // Save all fields simultaneously
      await Promise.all([
        set(ref(db, `users/${userId}/phone-no`), phoneNumber),
        set(ref(db, `users/${userId}/altPhone-no`), alternativeNumber),
        set(ref(db, `users/${userId}/address`), fullAddress)
      ]);

      // Wait for data to be fully synced (retry up to 3 times)
      let addressSnapshot, addressValue = "N/A";
      for (let i = 0; i < 3; i++) {
        addressSnapshot = await get(ref(db, `users/${userId}/address`));
        if (addressSnapshot.exists()) {
          addressValue = addressSnapshot.val();
          break;
        }
        await new Promise(r => setTimeout(r, 200)); // wait 200ms
      }
      address = addressValue;

      hideAddressContainer();
      showSummaryContainer();
      checkCircleOne();

      // Add a small wait to let cart and address be available before order summary
      await new Promise(r => setTimeout(r, 300));
      fetchAndDisplayOrderDetails();
      
    } catch (error) {
      console.error('Error saving address:', error);
      showModal('Error saving address. Please try again.', 'danger');
    } finally {
      hideLoader();
    }
  } else {
    showModal('User must be authenticated to save address!', 'danger');
  }
}

async function fetchAndDisplayOrderDetails() {
  try {
    showLoader();
    
    const productsResponse = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")
    
    if (!productsResponse.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await productsResponse.json();
    const products = Object.values(data.products);
    
    displayDeliveryAddress(userName, address);
    
    let cartProducts = null;
for (let attempt = 0; attempt < 3; attempt++) {
  const cartSnapshot = await get(ref(db, `users/${userId}/cart-products`));
  cartProducts = cartSnapshot.val();
  if (cartProducts) break;
  await new Promise(res => setTimeout(res, 300)); // wait 300ms before retry
}

if (!cartProducts) {
  throw new Error("No cart products found after retries");
}
    
    const encrypt = "NDA6Mw==";
    const decrypt = atob(encrypt).split(":").map(Number);
    const [deliveryCharge, platformFee] = decrypt;
    totalAmount = 0;
    discountAmount = 0;
    itemCount = 0;
    
    const urlParams = new URLSearchParams(window.location.search);
    const fromCart = urlParams.get('fromCart') === 'true';
    const fromProductCode = urlParams.get('fromProduct');
    
    if (fromCart) {
      const productMap = new Map(products.map(p => [p.code, p]));
      
      for (const productCode in cartProducts) {
        const product = productMap.get(productCode);
        
        if (product) {
          processProductForDisplay(product);
        }
      }
    } else if (fromProductCode) {
      const product = products.find(p => p.code === fromProductCode);
      if (product) {
        processProductForDisplay(product);
      }
    }
    
    function processProductForDisplay(product) {
      displayProduct(product);
      totalAmount += product.discounted_price;
      discountAmount += product.actual_price - product.discounted_price;
      itemCount++;
    }
    
    finalTotal = totalAmount + platformFee + deliveryCharge;
    displayInvoice(itemCount, totalAmount, discountAmount, platformFee, deliveryCharge, finalTotal);
    applyRecalculatedAmounts();
    
  } catch (error) {
  console.error('Error fetching data:', error);
  productElement.innerHTML = `
    <div class="error-gateway">
      <p>Oops! We're setting up your order details...</p>
      <a href="javascript:location.reload()">Reload page</a>
    </div>
   
  `;
  getEl('.summary-confirm-btn').disabled = true;
} finally {
    hideLoader();
  }
}

function displayDeliveryAddress(username, address) {
  addressElement.innerHTML = `
    <div id="address-view">
      <div class="current-address">
        <span style="color: black;">${username || 'N/A'}</span><br>
        <span style="color: grey;">${address || 'No address saved'}</span>
      </div>
      <button id="changeAddr" class="ChangeAddr-Btn">Change</button>
    </div>
  `;
}

function displayProduct(product) {
  const productDiv = document.createElement('div');
  productDiv.classList.add('product');
  productDiv.setAttribute('data-product-code', product.code);
  
  const selectedPacksString = sessionStorage.getItem('selectedProductPacks');
  const selectedPacks = selectedPacksString ? JSON.parse(selectedPacksString) : {};
  
  const selectedPack = selectedPacks[product.code] || product.quantity;
  console.log(`Selected pack for product ${product.code}: ${selectedPack}`);
  
  productDiv.innerHTML = `
    <div class="products-layout">
      <div class="product-image">
        <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}"/>

        <!-- Show the selected pack or fallback to quantity -->
        <button class="static-packof btn btn-outline-dark">Pack of ${selectedPack}</button> 
      </div>
      <div class="product-details">
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
        <div class="delivery">
          Delivery By ${getDeliveryDate()}
        </div>
      </div>
    </div>
  `;
  
  productElement.appendChild(productDiv);
  
  productDiv.addEventListener('click', (event) => {
    
    if (event.target.closest('.static-packof')) {
      return;
    }
    window.location.href = `/products/prod_view.html?productCode=${product.code}`;
  });
}

function displayInvoice(itemCount, totalAmount, discountAmount, platformFee, deliveryCharge, finalTotal) {
  priceDetailsElement.innerHTML = `
    <div class="orderSummary">
      <h2>Price Details</h2>
      <div class="summaryItem"><p>Price (${itemCount} item(s))</p><b>₹${totalAmount}</b></div>
      <div class="summaryItem"><p>Discount</p><p style="color: grey;">-₹${discountAmount}</p></div>
      <div class="summaryItem"><p>Platform Fee</p><b style="color: grey;">₹${platformFee}</b></div>
      <div class="summaryItem"><p>Delivery Charge</p><b>₹${deliveryCharge}</b></div>
      <hr class="separator">
      <div class="summaryItem totalAmount"><b>Total Amount</b><b>₹${finalTotal}</b></div>
    </div>
  `;
  
  discountAmountElement.innerText = `-₹${discountAmount}`;
  finalAmountElement.innerText = `₹${finalTotal}`;
}

function applyRecalculatedAmounts() {
  const storedData = JSON.parse(sessionStorage.getItem('recalculatedAmounts'));
  
  if (storedData) {
    Object.keys(storedData).forEach(productCode => {
      if (productCode !== 'finalTotal') {
        const productData = storedData[productCode];
        
        const productDiv = document.querySelector(`[data-product-code="${productCode}"]`);
        
        if (productDiv) {
          productDiv.querySelector('.actual-price').innerText = `₹${productData.actualPrice}`;
          productDiv.querySelector('.discounted-price').innerText = `₹${productData.discountedPrice}`;
          productDiv.querySelector('.save-amount').innerText = `Save ₹${productData.savedAmount}`;
        }
      }
    });
    
    finalTotal = storedData.finalTotal;
    let discountAmount = Object.values(storedData)
      .filter(item => item.savedAmount)
      .reduce((acc, item) => acc + item.savedAmount, 0);
    
    document.querySelectorAll('.product').forEach(productElement => {
      const productCode = productElement.dataset.productCode;
      
      if (storedData[productCode]) return;
      const actualPrice = parseFloat(
        productElement.querySelector('.actual-price').innerText.replace('₹', '')
      );
      const discountedPrice = parseFloat(
        productElement.querySelector('.discounted-price').innerText.replace('₹', '')
      );
      
      discountAmount += actualPrice - discountedPrice;
    });
    
    updateInvoice(finalTotal, discountAmount);
  }
}

function updateInvoice(finalTotal, discountAmount) {
  const encrypt = "NDA6Mw==";
  const decrypt = atob(encrypt).split(":").map(Number);
  const [deliveryCharge, platformFee] = decrypt;
  const itemCount = document.querySelectorAll('.product').length;
  
  priceDetailsElement.innerHTML = `
    <div class="orderSummary">
      <h2>Price Details</h2>
      <div class="summaryItem"><p>Price (${itemCount} item(s))</p><b>₹${finalTotal - platformFee - deliveryCharge}</b></div>
      <div class="summaryItem"><p>Discount</p><p style="color: grey;">-₹${discountAmount}</p></div>
      <div class="summaryItem"><p>Platform Fee</p><b style="color: grey;">₹${platformFee}</b></div>
      <div class="summaryItem"><p>Delivery Charge</p><b>₹${deliveryCharge}</b></div>
      <hr class="separator">
      <div class="summaryItem totalAmount"><b>Total Amount</b><b>₹${finalTotal}</b></div>
    </div>
  `;
  
  discountAmountElement.innerText = `-₹${discountAmount}`;
  finalAmountElement.innerText = `₹${finalTotal}`;
}

window.addEventListener('pagehide', function() {
  sessionStorage.removeItem('selectedProductPacks');
});

function getCurrentDate() {
  const orderedDate = new Date();
  const formattedOrderedDate = `${orderedDate.getDate().toString().padStart(2, '0')}-${(orderedDate.getMonth() + 1).toString().padStart(2, '0')}-${orderedDate.getFullYear()}`;
  return formattedOrderedDate;
}

function getDeliveryDate() {
  const currentDate = new Date();
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(currentDate.getDate() + 7);
  
  const day = String(expectedDeliveryDate.getDate()).padStart(2, '0');
  const month = String(expectedDeliveryDate.getMonth() + 1).padStart(2, '0');
  const year = expectedDeliveryDate.getFullYear();
  
  return `${day}/${month}/${year}`;
}

orderContinueBtn.addEventListener('click', () => {
  checkCircleTwo();
  hideSummaryContainer();
  showPaymentContainer();
  
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  totalAmountElement.innerText = `₹${finalTotal}`;
});

function clearRecalculatedAmounts() {
  sessionStorage.removeItem('recalculatedAmounts');
}

window.addEventListener('pagehide', clearRecalculatedAmounts);

placeOrderOnline.addEventListener('click', () => {
  ifPlacedFromCod = false;
  initiatePayment();
});

placeOrderCod.addEventListener('click', () => {
  showLoader();
  ifPlacedFromCod = true;
  codOrderId = generateOrderID();
  initiateCod();
});

async function initiateCod() {
  if (!user && !ifPlacedFromCod) return;
  
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      address = userData.address || 'N/A';
      phone = userData['phone-no'] || 'N/A';
    }
    
    await saveOrder(userId, codOrderId);
    checkCircleThree();
    
    const observer = new MutationObserver((mutationsList, observer) => {
      const receiptDown = document.getElementById('receiptUrlA');
      if (receiptDown) {
        receiptDown.download = `receipt-${codOrderId}.png`;
        receiptDown.click();
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    sendEmail(codOrderId);
    
    showToast('Order placed successfully');
    
    setTimeout(() => {
      window.location.href = `order_confirmed.html?orderId=${codOrderId}`;
    }, 500);
    
  } catch (error) {
    console.error('Error in initiate COD:', error);
    showModal('Something went wrong while processing your COD order. Please try again.', 'danger');
  } finally {
    hideLoader();
  }
}

async function initiatePayment() {
  if (!user) return;
  
  try {
    showLoader();
    
    if (!finalTotal || finalTotal <= 0) {
      showToast('Invalid payment amount.');
      return;
    }
    
    const [snapshot, response] = await Promise.all([
      get(ref(db, `users/${userId}`)),
      fetch("https://gozzo.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      }).catch(err => {
        throw new Error("Network error: Failed to reach payment server.");
      })
    ]);
    
    if (!snapshot.exists()) {
      showModal('User data not found.', 'danger');
      return;
    }
    
    let userData = snapshot.val();
    userName = userData.username;
    userEmail = userData.email;
    phone = userData['phone-no'] || 'N/A';
    address = userData.address || 'N/A';
    
    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText} ${response.status}`);
    }
    
    let result = await response.json();
    
    if (result.error) {
      showModal(`Error: ${result.error.message || result.error || 'Something went wrong! Try again.'}`, 'danger');
      return;
    }
    
    orderId = result.id;
    
    const isSaved = await saveOrder(userId, orderId);
    if (!isSaved) {
      showToast('Error saving order. Please try again.');
      return;
    }
    
    try {
      openRazorpayCheckout(orderId, finalTotal, userName, userEmail, phone, address);
    } catch (checkoutError) {
      console.error('Razorpay Checkout Error:', checkoutError);
      showModal('Something went wrong while opening Razorpay. Please try again.', 'danger');
    }
    
  } catch (error) {
    console.error(`Error in initiatePayment: ${error}`);
    showToast(`Error: ${(error.message || error)}`);
  } finally {
    hideLoader();
  }
}

function openRazorpayCheckout(orderid, finaltotal, name, email, phone, address) {
  if (!finaltotal || finaltotal <= 0) {
    showModal('An error occurred! Please refresh the page and try again', 'danger');
    return;
  }
  
  function _0x44db() { var _0x3beef4 = ['Exclusive\x20decorative\x20items\x20for\x20your\x20home\x20and\x20office.\x20Delivered\x20across\x20Kerala.', '4508eCPLkk', 'Payment\x20failed.\x20Razorpay\x20response:', '286dePLQR', 'Payment\x20Successful!', '78155GQxXkX', '4250490icDxGS', '737674rNpVbY', '43408FaAENP', '299900VfqDqq', 'Payment\x20Failed!\x20Please\x20try\x20again.', 'danger', 'https://cdn.jsdelivr.net/gh/Jishith-MP/test@main/logo%20(1).png', '36aqVaZE', 'GOZZO', '804jKoAzb', '1438JndyOO', '#4d55cc', 'razorpay_payment_id', '89xRqZoN', '72vLHwQN', 'error', 'N/A', '9iVInCx', '581gMqyJp', 'INR'];
    _0x44db = function() { return _0x3beef4; }; return _0x44db(); }
  var _0xaf485b = _0x357e;
  
  function _0x357e(_0x4dedf3, _0x1ee2b0) { var _0x44dbe2 = _0x44db(); return _0x357e = function(_0x357e78, _0x301805) { _0x357e78 = _0x357e78 - 0xbe; var _0x1778a2 = _0x44dbe2[_0x357e78]; return _0x1778a2; }, _0x357e(_0x4dedf3, _0x1ee2b0); }(function(_0x139e1f, _0x380a4d) { var _0x81f36 = _0x357e,
      _0x571086 = _0x139e1f(); while (!![]) { try { var _0x111fe5 = -parseInt(_0x81f36(0xd5)) / 0x1 * (-parseInt(_0x81f36(0xd2)) / 0x2) + parseInt(_0x81f36(0xd6)) / 0x3 * (parseInt(_0x81f36(0xc3)) / 0x4) + parseInt(_0x81f36(0xcb)) / 0x5 * (parseInt(_0x81f36(0xcf)) / 0x6) + -parseInt(_0x81f36(0xc0)) / 0x7 * (parseInt(_0x81f36(0xca)) / 0x8) + parseInt(_0x81f36(0xbf)) / 0x9 * (-parseInt(_0x81f36(0xc8)) / 0xa) + parseInt(_0x81f36(0xc7)) / 0xb * (-parseInt(_0x81f36(0xd1)) / 0xc) + -parseInt(_0x81f36(0xc5)) / 0xd * (-parseInt(_0x81f36(0xc9)) / 0xe); if (_0x111fe5 === _0x380a4d) break;
        else _0x571086['push'](_0x571086['shift']()); } catch (_0x1c8ae1) { _0x571086['push'](_0x571086['shift']()); } } }(_0x44db, 0x3f277));
  var options = { 'key': 'rzp_test_rqyEt4JBEaIvKb', 'amount': finaltotal * 0x64, 'currency': _0xaf485b(0xc1), 'name': _0xaf485b(0xd0), 'description': _0xaf485b(0xc2), 'image': _0xaf485b(0xce), 'order_id': orderid, 'handler': function(_0x5f1ab1) { var _0x45f814 = _0xaf485b; if (_0x5f1ab1 && _0x5f1ab1[_0x45f814(0xd4)]) { let _0x1d7a63 = _0x5f1ab1[_0x45f814(0xd4)] || _0x45f814(0xbe);
        savePaymentId(userId, orderid, _0x1d7a63), showToast(_0x45f814(0xc6)), verifyPayment(_0x1d7a63, orderid, userId); } else console[_0x45f814(0xd7)](_0x45f814(0xc4), _0x5f1ab1), showModal(_0x45f814(0xcc), _0x45f814(0xcd)); }, 'prefill': { 'name': name, 'email': email, 'contact': phone }, 'notes': { 'address': address, 'order_id': orderid }, 'theme': { 'color': _0xaf485b(0xd3) }, 'modal': { 'ondismiss': function() { deleteOrderDetails(userId, orderid); } } };
  
  try {
    let rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Razorpay initialization failed:", error);
    showModal("Payment gateway failed to initialize. Please try again.", "danger");
  }
}

async function savePaymentId(userid, orderid, paymentid) {
  if (!userid || !orderid || typeof paymentid !== "string" || paymentid.trim() === "") {
    console.error("Invalid payment ID. Skipping save.");
    return;
  }
  
  try {
    await push(ref(db, `users/${userid}/orders/${orderid}/paymentIds`), paymentid);
  } catch (error) {
    console.error("Error saving payment ID:", error);
  }
}

async function saveOrder(userid, orderid) {
  try {
    const response = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json");
    const data = await response.json();
    
    if (!data) {
      showToast("Error fetching products. Please try again.");
      return false;
    }
    
    const products = Object.values(data.products);
    const cartSnapshot = await get(ref(db, `users/${userid}/cart-products`));
    
    const urlParams = new URLSearchParams(window.location.search);
    const fromCart = urlParams.get('fromCart') === 'true';
    const fromProductCode = urlParams.get('fromProduct');
    let selectedPacks = JSON.parse(sessionStorage.getItem('selectedProductPacks')) || {};
    
    if (fromCart && cartSnapshot.exists()) {
      const cartProducts = cartSnapshot.val();
      let allProducts = [];
      
      const saveTasks = Object.keys(cartProducts).map(async (productCode) => {
        const product = products.find(p => p.code === productCode);
        if (product) {
          allProducts.push(product);
          return saveOrderDetailsForCart(userid, product.code, orderid, product.quantity);
        }
      });
      
      await Promise.all(saveTasks);
      
      if (allProducts.length > 0) {
        generateInvoice(
          userid,
          Object.keys(cartProducts),
          orderid,
          Object.keys(cartProducts).map(productCode => selectedPacks[productCode] || allProducts.find(p => p.code === productCode)?.quantity || 0),
          allProducts
        );
      }
      
    } else if (fromProductCode) {
      const product = products.find(p => p.code === fromProductCode);
      if (product) {
        await saveOrderDetailsForSingleProd(userid, product.code, orderid, product.quantity);
        generateInvoice(userid, [product.code], orderid, [selectedPacks[fromProductCode] || product.quantity], [product]);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error fetching products or saving order:', error);
    showToast('An error occurred. Please try again!');
    return false;
  }
}

let receiptUrl;

async function generateInvoice(uid, productCodes, orderid, productQuantities, products) {
  let finalTotal = 0;
  let selectedPacks = JSON.parse(sessionStorage.getItem('selectedProductPacks')) || {};
  let expDate;
  const comName = 'GOZZO';
  const comEmail = 'GOZZOspprt@gmail.com';
  const comPhone = '+91 8606564151';
  let currentDate = getCurrentDate();
  
  expDate = getDeliveryDate() || 'N/A';
  
  let receiptHTML = `
  <div class="nameAndLogo">
       <div class="company-logo">
          <img src="https://cdn.jsdelivr.net/gh/Jishith-MP/test@main/logo%20(1).png" alt="Logo">
       </div>
    <h2 class="company-name">GOZZO</h2>
   </div>
   <div class="receipt-header">
      <div class="receipt-order">
        <h2>Order Summary</h2>
        <div>Order ID: <span>${orderid}</span></div>
     </div>
   </div>
    
   <div class="dateAndAddress">
    <div>
      <b>Order placed date: ${currentDate}</b><br>
        <b>Expected Delivery Date: ${expDate}</b>
    </div>
    <div>
     <b>Delivery Address:</b><br>
        <address>
          ${address || 'N/A'}
        </address>
     </div>
    </div>
    
    <div class="info">
      <div>
        <div><strong>Name:</strong> ${userName}</div><br>
         <div><strong>Email:</strong> ${userEmail}</div>
         <div><strong>Phone No:</strong> ${phone}</div>
      </div>
    <div>
  <div><strong>Company Name:</strong> ${comName}</div><br>
    <div><strong>Support:</strong> ${comEmail}</div>
    <div><strong>Contact No:</strong> ${comPhone}</div>
    </div>
  </div>

  <div class="receipt-description">
    <div>
      <span class="description"><strong>Product Name</strong></span>
        <span class="pricing">
          <span><strong>Unit Price</strong></span>
          <span><strong>Pack of (Qty)</strong></span>
          <span><strong>Amount</strong></span>
      </span>
  </div>
  `;
  
  if (!Array.isArray(productCodes)) {
    productCodes = [productCodes];
    productQuantities = [productQuantities];
    products = [products];
  }
  
  const maxDisplay = 6;
  const displayProducts = productCodes.slice(0, maxDisplay);
  const remainingProducts = productCodes.length - maxDisplay;
  
  displayProducts.forEach((productCode, index) => {
    const product = products[index];
    const quantity = productQuantities[index];
    
    if (!product) {
      console.warn(`Product with code ${productCode} not found.`);
      return;
    }
    
    const unitPrice = product.discounted_price;
    let totalAmount = unitPrice;
    
    if (selectedPacks[productCode]) {
      let selectedQuantity = selectedPacks[productCode];
      const defaultQuantity = product.quantity;
      
      if (selectedQuantity % defaultQuantity === 0) {
        totalAmount = unitPrice * (selectedQuantity / defaultQuantity);
      }
    } else {
      totalAmount = unitPrice;
    }
    
    finalTotal += totalAmount;
    
    receiptHTML += `
      <div>
        <span class="description">${product.name}</span>
        <span class="pricing">
          <span>₹${unitPrice}</span>
          <span>${quantity}</span>
          <span>₹${totalAmount}</span>
        </span>
      </div>
    `;
  });
  
  const hiddenProducts = productCodes.slice(maxDisplay);
  hiddenProducts.forEach((productCode, index) => {
    const product = products[maxDisplay + index];
    const quantity = productQuantities[maxDisplay + index];
    
    if (!product) {
      console.warn(`Product with code ${productCode} not found.`);
      return;
    }
    
    const unitPrice = product.discounted_price;
    let totalAmount = unitPrice;
    
    if (selectedPacks[productCode]) {
      let selectedQuantity = selectedPacks[productCode];
      const defaultQuantity = product.quantity;
      
      if (selectedQuantity % defaultQuantity === 0) {
        totalAmount = unitPrice * (selectedQuantity / defaultQuantity);
      }
    } else {
      totalAmount = unitPrice;
    }
    
    finalTotal += totalAmount;
  });
  
  if (remainingProducts > 0) {
    receiptHTML += `
      <div class="more-products">
        <strong>+ ${remainingProducts} more products...</strong>
      </div>
    `;
  }
  
  receiptHTML += `
   </div>
    <div class="total-summary">
      <div><strong>Total</strong></div>
      <div><strong>₹${finalTotal + 40 + 3} <small> (Including delivery charge (₹40) & platform charge (₹3))</small></strong></div>
    </div>

    <div class="receipt-policy">
      <p>No returns, replacements, or refunds.</p>
      <b>This receipt is issued by Pot It Up for order tracking purposes only. It is not intended for any commercial, legal, or other official use.*</b>
    </div>

    <div class="receipt-footer">
      <p>&copy; 2025 Pot It Up. All rights reserved.</p>
    </div>
  `;
  
  const receiptDiv = document.createElement('div');
  receiptDiv.id = 'receiptDiv';
  receiptDiv.style.position = 'absolute';
  receiptDiv.style.left = '-9999px';
  receiptDiv.innerHTML = receiptHTML;
  document.body.appendChild(receiptDiv);
  
  html2canvas(receiptDiv, {
    logging: true,
    useCORS: true,
  }).then(function(canvas) {
    receiptUrl = canvas.toDataURL("image/png");
    
    const downloadLink = document.createElement('a');
    downloadLink.id = 'receiptUrlA';
    downloadLink.href = receiptUrl;
    downloadLink.download = "receipt.png";
    document.body.appendChild(downloadLink);
    
    document.body.removeChild(receiptDiv);
  }).catch(function(error) {
    console.error('Error capturing the content:', error);
    document.body.removeChild(receiptDiv);
  });
}

async function saveOrderDetailsForCart(userid, productCodes, orderid, defaultQuantity) {
  try {
    const currentUrl = window.location.href;
    const orderTimestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    const qrCode = `${currentUrl}?uid=${userid}`;
    
    if (!Array.isArray(productCodes)) {
      productCodes = [productCodes];
    }
    
    const selectedPacks = JSON.parse(sessionStorage.getItem('selectedProductPacks')) || {};
    
    const paymentMethod = ifPlacedFromCod ? "COD" : "OP";
    const orderStatus = ifPlacedFromCod ? "order placed" : "inactive";
    
    const orderData = {
      "order-status": orderStatus,
      "order-time": orderTimestamp,
      "payment-status": "pending",
      "qrcode": qrCode,
      "payment-mode": paymentMethod,
      "total-amount": finalTotal - 43,
      "final-total-Amount": finalTotal
    };
    
    let updateData = { ...orderData };
    
    productCodes.forEach((productCode) => {
      const selectedPack = selectedPacks[productCode] || defaultQuantity;
      updateData[`products/${productCode}`] = {
        "product-code": productCode,
        "status": "added",
        "quantity": selectedPack
      };
    });
    
    await update(ref(db, `users/${userid}/orders/${orderid}`), updateData);
    console.log("Cart order saved successfully:", updateData);
  } catch (error) {
    console.error("Error saving cart order:", error);
  }
}

async function saveOrderDetailsForSingleProd(userid, productCode, orderid, defaultQuantity) {
  try {
    const currentUrl = window.location.href;
    const orderTimestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    const qrCode = `${currentUrl}?uid=${userid}`;
    const selectedPacks = JSON.parse(sessionStorage.getItem('selectedProductPacks')) || {};
    const selectedPack = selectedPacks[productCode] || defaultQuantity;
    
    const paymentMethod = ifPlacedFromCod ? "COD" : "OP";
    const orderStatus = ifPlacedFromCod ? "order placed" : "inactive";
    
    const orderData = {
      "order-status": orderStatus,
      "order-time": orderTimestamp,
      "payment-status": "pending",
      "qrcode": qrCode,
      "payment-mode": paymentMethod,
      "total-Amount": finalTotal,
      [`products/${productCode}`]: {
        "product-code": productCode,
        "status": "added",
        "quantity": selectedPack
      }
    };
    
    await update(ref(db, `users/${userid}/orders/${orderid}`), orderData);
    console.log("Single product order saved successfully:", orderData);
  } catch (error) {
    console.error("Error saving single product order:", error);
  }
}

async function verifyPayment(paymentid, orderid, userid) {
  try {
    const response = await fetch('https://gozzo.onrender.com/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentid })
    });
    paymentId = paymentid;
    const result = await response.json();
    if (result.success) {
      const receiptDown = document.getElementById('receiptUrlA');
      if (receiptDown) {
        receiptDown.download = `receipt-${orderid}.png`;
        receiptDown.click();
      }
      
      await Promise.all([
        updatePaymentStatus(userid, orderid, paymentid),
        checkCircleThree(),
        sendEmail(orderid)
      ]);
      
      setTimeout(() => {
        window.location.href = `order_confirmed.html?orderId=${orderid}`;
      }, 2500);
      
    } else {
      await deleteOrderDetails(userid, orderid);
      showModal('Payment Verification Failed!', 'danger');
    }
  } catch (error) {
    showModal(`Error verifying payment: ${error}`, 'danger');
  }
}

async function deleteOrderDetails(userid, orderid) {
  if (!userid || !orderid) {
    console.error("User UID or Order ID is missing!");
    return;
  }
  
  try {
    await remove(ref(db, `users/${userid}/orders/${orderid}`));
  } catch (error) {
    console.error("Error deleting order details:", error);
  }
}

async function sendEmail(orderid) {
  if (!userEmail || !userName) {
    console.error("Missing email or customer name. Email not sent.");
    return;
  }
  
  let currentDate = getCurrentDate();
  
  const expectedDeliveryDate = getDeliveryDate();
  
  const emailData = {
    email: userEmail,
    customer_name: userName,
    order_id: orderid,
    order_date: currentDate,
    expiry_date: expectedDeliveryDate,
    total_amount: finalTotal
  };
  
  try {
    const response = await fetch('https://gozzo.onrender.com/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    const data = await response.json();
    
    if (data.status === "success") {
      console.log('Email sent successfully!');
    } else {
      showToast(`Error sending email: ${data.message}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    showToast("An error occurred while sending the email.");
  }
}

async function updatePaymentStatus(userid, orderid, paymentid) {
  if (!user || !userid) {
    console.error("User is not authenticated.");
    return;
  }
  
  const snapshot = await get(ref(db, `users/${userid}/orders`));
  
  if (!snapshot.exists()) {
    console.error("No orders found for this user.");
    return;
  }
  
  const orders = snapshot.val();
  const urlParams = new URLSearchParams(window.location.search);
  const fromCart = urlParams.get('fromCart') === 'true';
  const fromProductCode = urlParams.get('fromProduct');
  
  try {
    const response = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json");
    const data = await response.json();
    const products = Object.values(data.products);
    
    if (!ifPlacedFromCod) {
      
      if (orders[orderid]) {
        await update(ref(db, `users/${userid}/orders/${orderid}`), {
          "order-status": "order placed",
          "payment-status": "paid"
        });
      } else {
        console.error("Order not found for orderId:", orderid);
      }
    }
    
  } catch (error) {
    console.error("Error fetching product data or updating payment status:", error);
  }
}