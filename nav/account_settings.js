import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  update
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js'

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const cartBtn = document.querySelector('.cart');
const deleteAcBtn = document.getElementById('accountDeleteButton');
const addressForm = document.getElementById('addressForm');
const updateForm = document.getElementById('updateForm');
const logoutBtn = document.querySelector('.logout');
const addrContainer = document.getElementById('addr');
let userId, currentUser, address, username;
const loader = document.getElementById('loader-container');
const notificationSwitch = document.getElementById('notificationSwitch');
const notiForm = document.getElementById('notiForm');

const cartIcon = `
<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->

<svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#fff" stroke-width="1.5"/>
<path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#fff" stroke-width="1.5"/>
<path d="M11 9H8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2 3L2.26491 3.0883C3.58495 3.52832 4.24497 3.74832 4.62248 4.2721C5 4.79587 5 5.49159 5 6.88304V9.5C5 12.3284 5 13.7426 5.87868 14.6213C6.75736 15.5 8.17157 15.5 11 15.5H13M19 15.5H17" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
<path d="M5 6H8M5.5 13H16.0218C16.9812 13 17.4609 13 17.8366 12.7523C18.2123 12.5045 18.4013 12.0636 18.7792 11.1818L19.2078 10.1818C20.0173 8.29294 20.4221 7.34853 19.9775 6.67426C19.5328 6 18.5054 6 16.4504 6H12" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`;

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none'; 
}

document.addEventListener('DOMContentLoaded', ()=> {
  addPasswordToggle();
  (function() {
  document.querySelectorAll('.cart').forEach(c => {
    c.innerHTML = cartIcon;
  })
})();
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid; 
    currentUser = user; 
    await disableProfileFieldsIfNeeded(user);
    await retrieveNumberOfCart(userId);
    address = await fetchUserAddress(userId);
    username = await fetchUsername();
    updateAddressUI(address);
  }
});

notiForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  if (!currentUser) {
    console.error("User not authenticated");
    return;
  }
  
  try {
    showLoader();
    await set(ref(db, `users/${userId}/Notification-Enabled`), true);
    hideLoader();
    showModal("Notification setting updated successfully", "success");
    let modal = bootstrap.Modal.getInstance(document.getElementById("notificationModal"));
    modal?.hide();
  } catch (error) {
    console.error("Error updating notification setting:", error);
    hideLoader();
    showModal("Error updating notification setting. Please try again!", "danger");
  }
});

function sanitizeInput(input) {
  return input.trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/&/g, "&amp;");
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
  
  if (!currentUser) {
    showModal('User must be authenticated to save address!', 'danger');
    return;
  }
    try {
      showLoader();
      
      const [phoneResult, altPhoneResult, addressResult] = await Promise.all([
        set(ref(db, `users/${userId}/phone-no`), phoneNumber),
        set(ref(db, `users/${userId}/altPhone-no`), alternativeNumber),
        set(ref(db, `users/${userId}/address`), fullAddress)
      ]);
      showModal('Address saved successfully.', 'success');
      
    } catch (error) {
      console.error('Error saving address:', error);
      showModal('Error saving address. Please try again.', 'danger');
    } finally {
      hideLoader();
      addressForm.reset();
    }
}

updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const password = sanitizeInput(document.getElementById('passwordInput').value);
  const phone = sanitizeInput(document.getElementById('phoneInput').value);
  const name = sanitizeInput(document.getElementById('nameInput').value);
  const currentPassword = sanitizeInput(document.getElementById('currentPasswordInput').value);

  if (phone && !/^\d{10}$/.test(phone)) {
    return showModal('Invalid phone number. Must be 10 digits.', 'danger');
  }

  if (name && !/^[a-zA-Z\s]{2,50}$/.test(name)) {
    return showModal('Invalid name. Only alphabets allowed (2-50 characters).', 'danger');
  }

  if (password && !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
    return showModal('Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.', 'danger');
  }

  try {
    showLoader();

    if (password) {
      if (!currentPassword) {
        return showModal('Current password is required to update the password', 'danger');
      }
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, password);
      showModal('Password updated successfully', 'success');
    }

    const updates = {
      ...(phone && { [`users/${userId}/phone-no`]: phone }),
      ...(name && { [`users/${userId}/username`]: name })
    };

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      showModal('Profile updated successfully', 'success');
    }

  } catch (e) {
    console.error(e);
    console.log('Error: ' + e.message, 'danger');
    showErrorMessage(e);
  } finally {
    hideLoader();
    updateForm.reset(); 
  }
});

function showErrorMessage(error) {

  let errorMessage = "Something went wrong! Please try again.";

  if (error && error.code) {  
    switch (error.code) {
      case 'auth/wrong-password':
        errorMessage = "Incorrect password.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      case 'auth/invalid-credential': 
        errorMessage = "Invalid email or password. Please check and try again.";
        break;
      default:
        errorMessage = `Unexpected error: ${error.message}`;
    }
  } else {
    console.warn("Error object missing 'code' property.");
  }

  showModal(errorMessage, 'danger');
}

deleteAcBtn.addEventListener('click', async () => {
  if (!currentUser) {
    showModal('User must be authenticated to delete account!', 'warning');
    return;
  }
    try {
      const currentPassword = await showPrompt('Please enter your password to confirm account deletion');
      showLoader();
      
      var myModalEl = document.getElementById('deleteAccountModal');
      var modalInstance = bootstrap.Modal.getInstance(myModalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
      
      if (!currentPassword) {
        hideLoader();
        showModal('Password is required to delete your account', 'danger');
        return;
      }
      
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      const userRef = ref(db, `users/${userId}`);
      await set(userRef, null);
      await currentUser.delete();
      showModal('Your account has been deleted successfully', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2500);
    } catch (error) {
      showModal('Error: ' + error.message, 'danger');
    } finally {
      hideLoader();
    }
});

function showModal(message, type) {
  return new Promise((resolve) => {
    const alertBox = document.createElement('div');
    alertBox.style.zIndex = '1999';
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

function disableProfileFieldsIfNeeded(user) {
  const fields = ['passwordInput', 'phoneInput', 'nameInput', 'currentPasswordInput'];
  
  fields.forEach((id) => {
    const field = document.getElementById(id);
    if (!user) {
      field.disabled = true;
    }
  });
}

async function fetchUsername() {
  try {
    const snapshot = await get(ref(db, `users/${userId}/username`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No username found');
      return null; 
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
}


async function updateAddressUI(address) {
  if (addrContainer) {
    addrContainer.innerHTML = `
      <div class="d-flex justify-content-between align-items-center border rounded p-3 mb-2" id="address-block">
        <div>
          <p class="mb-0 fw-bold">${username || 'Anonymous'}</p>
          <p class="mb-0" id="address-text">${address || 'No saved address yet!'}</p>
        </div>
        <div class="addrpop position-relative">
          <i class="addr-dots bi bi-three-dots-vertical"></i>
          <div class="addrPopup border p-4 bg-black shadow-sm position-absolute d-none">
            <span class="d-flex align-items-center delete-address">
              <i class="bi bi-trash me-2 mr-2"></i> Delete
            </span>
          </div>
        </div>
      </div>`;
    
    document.querySelector(".addr-dots").addEventListener("click", function() {
      document.querySelector(".addrPopup").classList.toggle("d-none");
    });
    
    document.querySelector(".delete-address").addEventListener("click", async function() {
      
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }
     
     const checkAddrExistence = await get(ref(db, `users/${userId}/address`)).then(snapshot => snapshot.exists());
      if (checkAddrExistence) {
        try {
          showLoader();
          await remove(ref(db, `users/${userId}/address`));
          console.log("Address deleted successfully", 'success');
          
          document.getElementById("address-block").remove();
          
          addrContainer.textContent = "No address saved!"; 
          
          showModal("Address deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting address:", error);
          showModal("Error deleting address", "danger");
        } finally {
          hideLoader();
        }
      }
    });
  }
}

// Navigation functions
function goto(path, reference) {
  reference.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = path;
  });
}

goto("/cart/cart.html", cartBtn);

logoutBtn.addEventListener("click", () => {
  showLoader();
  auth.signOut()
    .then(() => {
      var myModalEl = document.getElementById("logoutModal");
      var modalInstance = bootstrap.Modal.getInstance(myModalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
      showModal("Successfully logged out", "success");
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2500);
    })
    .catch((e) => {
      console.error("Error logging out", e);
    })
    .finally(() => {
      hideLoader();
    });
});

function retrieveNumberOfCart(userid) {
  if (!userid) return;
    
    get(ref(db, `users/${userid}/cart-products`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const cartData = snapshot.val();
          const numberOfProducts = Object.keys(cartData).length;
          const cartIcon = document.querySelector(".cart");
          if (cartIcon) {
            const badge = document.createElement("span");
            badge.classList.add("cart-badge");
            badge.innerText = numberOfProducts;
            cartIcon.appendChild(badge);
          }
        } else {
          console.log("No products in cart.");
        }
      })
      .catch((error) => {
        console.error("Error retrieving cart data:", error);
      });
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has("changeAddress")) {
    const changeAddress = urlParams.get("changeAddress");
    console.log("Navigated from a page with changeAddress parameter:", changeAddress);
    
    if (changeAddress === "true") {
      const addressBtn = document.getElementById("addressBtn");
      if (addressBtn) {
        addressBtn.click();
      }
    }
  }
}

const saveAddressBtn = document.getElementById("saveAddressBtn");
const savedAddressBtn = document.getElementById("savedAddressBtn");
const saveAddressSection = document.getElementById("saveAddressSection");
const savedAddressSection = document.getElementById("savedAddressSection");

function toggleAddressSelection(activeBtn, inactiveBtn, showSection, hideSection) {
  showSection.classList.remove("d-none");
  hideSection.classList.add("d-none");

  activeBtn.classList.add("btn-primary");
  activeBtn.classList.remove("btn-outline-primary", "btn-outline-secondary");

  inactiveBtn.classList.remove("btn-primary");
  inactiveBtn.classList.add("btn-outline-primary", "btn-outline-secondary");
}

saveAddressBtn.addEventListener("click", () => {
  toggleAddressSelection(saveAddressBtn, savedAddressBtn, saveAddressSection, savedAddressSection);
});

savedAddressBtn.addEventListener("click", () => {
  toggleAddressSelection(savedAddressBtn, saveAddressBtn, savedAddressSection, saveAddressSection);
});

function fetchUserAddress(userid) {
  return new Promise((resolve, reject) => {
    get(ref(db, `users/${userId}/address`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          address = snapshot.val();
          resolve(address); 
        } else {
          console.log("No address found!");
          resolve(null); 
        }
      })
      .catch((e) => {
        console.error("Error fetching address", e);
        reject(e);
      });
  });
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

function showPrompt(message) {
  return new Promise((resolve) => {

    let existingModal = document.getElementById('customPrompt');
    if (existingModal) existingModal.remove();
    
    let modal = document.createElement('div');
    modal.id = 'customPrompt';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Prompt</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <input type="text" id="promptInput" class="form-control">
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="promptOk">OK</button>
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    
    document.body.appendChild(modal);
    
    let bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    document.getElementById('promptOk').addEventListener('click', () => {
      let userInput = document.getElementById('promptInput').value;
      bsModal.hide();
      resolve(userInput); 
    });
  });
}

function addPasswordToggle() {
  const passwordInputs = document.querySelectorAll('.passwordInput');
  
  passwordInputs.forEach(passwordInput => {
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'bi bi-eye-slash'; 
    eyeIcon.style.position = 'absolute';
    eyeIcon.style.right = '10px';
    eyeIcon.style.top = '50%';
    eyeIcon.style.transform = 'translateY(-50%)';
    eyeIcon.style.cursor = 'pointer';
    eyeIcon.style.fontSize = '1.2rem';
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';
    
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
    wrapper.appendChild(eyeIcon);
    
    eyeIcon.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'bi bi-eye';
      } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'bi bi-eye-slash'; 
      }
    });
  });
}