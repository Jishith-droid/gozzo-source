import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const cartSummary = document.getElementById('cart-summary');
const loader = document.getElementById('loader-container');
const placeOrderContainer = document.getElementById('cart-placeOrder');
const prod_cart = document.getElementById("product-cart");
const disAmt = document.getElementById("dis-amt");
const finTotal = document.getElementById("finTotal");
const addr = document.getElementById('addressContainer');
const asd = "NDA6Mw==";
const iod = atob(asd).split(":").map(Number);
let userId, currentUser;
let selectedPacks = {};
const placeOrderBtn = document.getElementById('placeOrder');
const animationContainer = document.querySelector('.notFoundAnimation');

document.addEventListener('DOMContentLoaded', () => {
hidePlaceOrderContainer();
showLoader();
changeAddressFunc();
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userId = user.uid; 
    await retrieveAddress(userId);
    await handleUser(userId);
  } else {
    elseLogged();
  }
});

function showLoader() {
  loader.style.display = 'flex'; 
}

function hideLoader() {
  loader.style.display = 'none';
}

async function retrieveAddress(userid) {
  try {
  addr.innerHTML = '';
  
  const [usernameSnap, addrSnap] = await Promise.all([get(ref(db, `users/${userid}/username`)), get(ref(db, `users/${userid}/address`))]);

  if (usernameSnap.exists() || addrSnap.exists()) {
  const username = usernameSnap.val() || 'N/A';
  const address = addrSnap.val();
        
    const addrDiv = document.createElement('div');
        addrDiv.innerHTML = `
          <div id="address-view">
            <div class="current-address">
              <span style="color: black;">${username}</span><br>
              <span style="color: grey;">${address || 'No address added yet!'}</span>
            </div>
            <button id="changeAddr" class="ChangeAddr-Btn">Change</button>
          </div>
        `;
        
        addr.appendChild(addrDiv);
      } else {
        addr.innerHTML = '<p>No address or username found.</p>';
      }
    } catch(error) {
      console.error('Error retrieving data:', error);
      addr.innerHTML = '<p>Error retrieving data.</p>';
    }
}

function changeAddressFunc() {
  document.addEventListener('click', (event) => {
    
    if (event.target && event.target.id === 'changeAddr') {
      window.location.href = '/nav/account_settings.html?changeAddress=true';
    }
  });
}

function showAnimationError() {
  animationContainer.style.display = 'block';
}

function saveRecalculatedAmounts(productCode, newActualPrice, newDiscountedPrice, newSavedAmount, finalTotal) {
  const recalculatedAmounts = {
    [productCode]: {
      actualPrice: newActualPrice,
      discountedPrice: newDiscountedPrice,
      savedAmount: newSavedAmount
    },
    finalTotal: finalTotal 
  };
  
  let allAmounts = JSON.parse(sessionStorage.getItem('recalculatedAmounts')) || {};
  
  allAmounts[productCode] = recalculatedAmounts[productCode];
  allAmounts.finalTotal = recalculatedAmounts.finalTotal;
  
  sessionStorage.setItem('recalculatedAmounts', JSON.stringify(allAmounts));
}

let cartData, totalAmount, finalTotal, discountAmount, newActualPrice, newDiscountedPrice, newSavedAmount, productDiv;

async function handleUser(userid) {
  try {
  const snapshot = await get(ref(db, `users/${userid}/cart-products`));
    if (snapshot.exists()) {
      cartData = snapshot.val();
      showPlaceOrderContainer();
      main();
    } else {
     showAnimationError();
    }
  } catch(error) {
    console.error('Error retrieving cart data:', error);
    showModal('Error retrieving cart data. Please refresh the page and try again.', 'danger');
  } finally {
    hideLoader();
  }
}

async function elseLogged() {
  await showModal('Please log in to view and manage your cart.', 'danger');
  setTimeout(() => {
  window.location.href = '/auth/login.html';
  }, 2500);
}

async function main() {
  try {
 const productData = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")
  const data = await productData.json();
      const products = Object.values(data.products);
      
      totalAmount = 0;
      discountAmount = 0;
      let itemCount = 0; 
      const [deliveryCharge, platformFee] = iod;
      
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentDate = new Date();
const expectedDeliveryDate = new Date();
expectedDeliveryDate.setDate(currentDate.getDate() + 7);
const deliveryDate = `${months[expectedDeliveryDate.getMonth()]} ${expectedDeliveryDate.getDate()}`;

for (const productCode in cartData) {
  const productInCart = cartData[productCode];
  const product = products.find(p => p.code === productCode);

  if (!product) {
    showModal('Error retrieving cart data! Please refresh the page and try again.', 'danger');
    return;
  }

  itemCount++;
  const productTotal = product.discounted_price;
  totalAmount += productTotal;

  discountAmount += product.actual_price - product.discounted_price;

  productDiv = document.createElement('div');
  productDiv.classList.add('product');
  productDiv.setAttribute('data-product-code', product.code);

  productDiv.innerHTML = `
    <div class="products-layout">
      <div class="product-image">
        <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}" />
        <div class="container my-5">
          <div class="dropdown">
            <button class="btn btn-outline-dark dropdown-toggle" type="button" id="dropdownMenuButton-${product.code}" data-bs-toggle="dropdown" aria-expanded="false">
              Pack of <span id="current-pack-${product.code}">${product.quantity}</span>
            </button>
            <ul class="dropdown-menu p-3" aria-labelledby="dropdownMenuButton-${product.code}">
              <li>
                <div class="dropdown-item d-flex justify-content-between align-items-center">
                  <span>Pack Size</span>
                  <div>
                    <select id="pack-size-dropdown-${product.code}" class="form-select"></select>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="product-details">
        <p class="product-name">${product.name}</p>
        <p class="product-subdescription">${product.subDescription}</p>
        <div class="price">
          <span class="discount-box">${product.discount_percentage}% OFF</span>
          <span class="actual-price">₹${product.actual_price}</span>
          <span class="discounted-price">₹${product.discounted_price}</span>
        </div>
        <div class="save-amount">Save ₹${product.actual_price - product.discounted_price}</div>
        <div class="delivery">Delivery By ${deliveryDate}</div>
      </div>
    </div>
    <div class="cart-btns">
      <button class="cart-btn" data-product-code="${product.code}">
        <i class="bi bi-trash"></i> Remove from Cart
      </button>
    </div>
  `;

  prod_cart.appendChild(productDiv);

  productDiv.addEventListener('click', (event) => {
    if (event.target.closest(`#dropdownMenuButton-${product.code}`) || event.target.closest(`#pack-size-dropdown-${product.code}`) || event.target.closest('.cart-btn')) {
      return;
    }
    window.location.href = `/products/prod_view.html?productCode=${product.code}`;
  });

  const packSizeDropdown = document.getElementById(`pack-size-dropdown-${product.code}`);
  if (packSizeDropdown) {
    let optionsHTML = `<option value="${product.quantity}">Pack of ${product.quantity}</option>`;
    for (let i = product.quantity * 2; i <= product.quantity * 10; i += product.quantity) {
      optionsHTML += `<option value="${i}">Pack of ${i}</option>`;
    }
    packSizeDropdown.innerHTML = optionsHTML;

    packSizeDropdown.addEventListener('change', (event) => {
      event.stopPropagation();
      const selectedPack = parseInt(event.target.value);
      selectedPacks[product.code] = selectedPack;
      document.getElementById(`current-pack-${product.code}`).innerText = selectedPack;

      updatePrices(product, selectedPack);
      updateInvoiceSummary();
      saveRecalculatedAmounts(product.code, newActualPrice, newDiscountedPrice, newSavedAmount, finalTotal);

      sessionStorage.setItem('selectedProductPacks', JSON.stringify(selectedPacks));
    });
  }
}

placeOrderBtn.addEventListener('click', () => {
  window.location.href = '/nav/order_summary.html?fromCart=true';
});
      
      finalTotal = totalAmount + platformFee + deliveryCharge;
      
      const cartSummaryDiv = document.createElement('div');
      cartSummaryDiv.classList.add('orderSummary');
      cartSummaryDiv.innerHTML = `
              <h2>Price Details</h2>
              <div class="summaryItem">
                <p>Price(${itemCount} item(s))</p>
                <b>₹${totalAmount}</b>
              </div>
              <div class="summaryItem">
                <p>Discount</p>
                <p style="color: grey; margin: 0;">-₹${discountAmount}</p>
              </div>
              <div class="summaryItem">
                <p>Platform Fee</p>
                <b style="color: grey;">₹${platformFee}</b>
              </div>
              <div class="summaryItem">
                <p>Delivery Charge</p>
                <b>₹${deliveryCharge}</b>
              </div>
              <hr class="separator">
              <div class="summaryItem totalAmount">
                <b>Total Amount</b>
                <b>₹${finalTotal}</b>
              </div>
            `;
      cartSummary.appendChild(cartSummaryDiv);
      disAmt.innerText = `₹${discountAmount}`;
      finTotal.innerText = `₹${finalTotal}`;
      
      function updatePrices(product, selectedPack) {
        newActualPrice = product.actual_price * (selectedPack / product.quantity);
        newDiscountedPrice = product.discounted_price * (selectedPack / product.quantity);
        newSavedAmount = newActualPrice - newDiscountedPrice;
        
        const productDiv = document.querySelector(`[data-product-code="${product.code}"]`);
        if (productDiv) {
          productDiv.querySelector('.actual-price').innerText = `₹${newActualPrice}`;
          productDiv.querySelector('.discounted-price').innerText = `₹${newDiscountedPrice}`;
          productDiv.querySelector('.save-amount').innerText = `Save ₹${newSavedAmount}`;
        }
      }
      
      function updateInvoiceSummary() {
        totalAmount = 0;
        discountAmount = 0;
        let itemCount = 0;
        
        document.querySelectorAll('.product').forEach(productDiv => {
          const productCode = productDiv.getAttribute('data-product-code');
          const packSize = parseInt(productDiv.querySelector(`#current-pack-${productCode}`).innerText);
          const product = products.find(p => p.code === productCode);
          
          if (product) {
            const newActualPrice = product.actual_price * (packSize / product.quantity);
            const newDiscountedPrice = product.discounted_price * (packSize / product.quantity);
            
            totalAmount += newDiscountedPrice;
            discountAmount += newActualPrice - newDiscountedPrice;
            itemCount++;
          }
        });
        
        finalTotal = totalAmount + platformFee + deliveryCharge;
        
        disAmt.innerText = `₹${discountAmount}`;
        finTotal.innerText = `₹${finalTotal}`;
        
        document.querySelector('.orderSummary').innerHTML = `
                <h2>Price Details</h2>
                <div class="summaryItem">
                  <p>Price(${itemCount} item(s))</p>
                  <b>₹${totalAmount}</b>
                </div>
                <div class="summaryItem">
                  <p>Discount</p>
                  <p style="color: grey; margin: 0;">-₹${discountAmount}</p>
                </div>
                <div class="summaryItem">
                  <p>Platform Fee</p>
                  <b style="color: grey;">₹${platformFee}</b>
                </div>
                <div class="summaryItem">
                  <p>Delivery Charge</p>
                  <b>₹${deliveryCharge}</b>
                </div>
                <hr class="separator">
                <div class="summaryItem totalAmount">
                  <b>Total Amount</b>
                  <b>₹${finalTotal}</b>
                </div>
              `;
      }
      
      document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', (event) => {
    showConfirmDelete(async () => {
      const button = event.target.closest('button');
      const productCode = button.getAttribute('data-product-code');

      if (productCode) {
        try {
          showLoader();
          const cartRef = ref(db, `users/${userId}/cart-products/${productCode}`);
          await remove(cartRef);
          await showModal('Product removed from cart', 'success');

          // Check if this is the last product in the cart
          const allProducts = document.querySelectorAll('.product');
          
          if (allProducts.length === 1) {
            location.reload(); 
          } else {
            const productDiv = document.querySelector(`.product[data-product-code="${productCode}"]`);
            if (productDiv) {
              productDiv.remove();
            }
          }

        } catch (error) {
          console.error('Error removing product from cart:', error);
        } finally {
          hideLoader();
        }
      }
    });
  });
});
      
    } catch(error) {
      console.error('Error fetching products:', error);
    };
}

function showConfirmDelete(callback) {
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteCartItemModal"));
  
  deleteModal.show();
  
  document.getElementById("confirmDelete").onclick = function() {
    deleteModal.hide(); 
    if (callback) callback(); 
  };
  
  document.getElementById("cancelDelete").onclick = function() {
    deleteModal.hide(); 
  };
}

function showModal(message, type) {
  return new Promise((resolve) => {
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
            </div>
            <div class="modal-body" id="alertMessage" style="color: ${type === 'success' ? 'green' : 'red'};">
              ${message}
            </div>
            <div class="modal-footer">
              <button id="modal-ok-btn" class="btn btn-primary">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('alertModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    document.getElementById('modal-ok-btn').addEventListener('click', () => {
      modal.hide();
      resolve(); 
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
      modalElement.remove();
    });
  });
}

function showPlaceOrderContainer() {
  placeOrderContainer.style.display = 'flex';
}

function hidePlaceOrderContainer() {
  placeOrderContainer.style.display = 'none';
}

lottie.loadAnimation({
  container: animationContainer,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/assets/videos/cartNotFound.json'
});

const link = document.createElement('a');
link.href = "/products/prod_list.html";
link.textContent = "Explore Products";
link.style.display = "block"; 
link.style.textAlign = "center"; 

setTimeout(() => {
  animationContainer.appendChild(link);
}, 200);