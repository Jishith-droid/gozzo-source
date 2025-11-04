import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

const resetPass = document.querySelector('.forgot-password-link');
const googleBtn = document.querySelector('.login-with-google-btn');

//  Set persistence only once
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistence set to LOCAL STORAGE"))
  .catch(error => console.error("Persistence error:", error));

const loader = document.getElementById('loader-container');
const form = document.getElementById('login_form');
const resendLink = document.querySelector('.resend_verification');
const verification = document.querySelector('.verification');
const emailInput = document.getElementById('email');
let user = null;
let promptInput = null;

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    window.location.href = '/index.html';
  }
});

let debounceTimeout;
emailInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(validateEmail, 500); 
});

function validateEmail() {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const existingError = document.getElementById('email-error');

  if (existingError) existingError.remove();

  if (!emailPattern.test(emailInput.value)) {
    const errorMessage = document.createElement('small');
    errorMessage.id = 'email-error';
    errorMessage.className = 'error';
    errorMessage.textContent = 'Please enter a valid email address.';
    emailInput.insertAdjacentElement('afterend', errorMessage);
  }
}

verification.addEventListener('click', async () => {
  if (user) {
    try {
      await sendEmailVerification(user);
      showToast('Verification email sent!');
    } catch (error) {
      showToast(`Failed to send verification email: ${error.message}`);
    }
  }
});

function showResendVerification() {
  resendLink.style.display = 'block';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showLoader();

  validateEmail();
  if (document.getElementById('email-error')) {
    hideLoader();
    return;
  }

  const password = document.getElementById('password').value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, password);
    user = userCredential.user;

    const verifyRef = ref(db, `users/${user.uid}/verified`);

    if (!user.emailVerified) {
      showModal('Please verify your email before logging in.', 'danger');
      showResendVerification();
      await set(verifyRef, false);
      await auth.signOut();
      hideLoader();
      return;
    }

    await set(verifyRef, true);
    showToast('Login successful!');
    setTimeout(() => {
    window.location.href = '/index.html';
    });
  } catch (error) {
    handleLoginError(error);
  } finally {
    hideLoader();
  }
});

function handleLoginError(error) {
  
  let errorMessage = "Login failed. Please try again.";

  if (error && error.code) {  
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No account found with this email.";
        break;
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
  hideLoader();
}

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

const animationContainer = document.querySelector('.signinAnimation');
lottie.loadAnimation({
    container: animationContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/assets/videos/signin.json'
});

(function(inputId) {
  const passwordInput = document.getElementById(inputId);
  
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
})('password')

resetPass.addEventListener('click', resetPassword);

googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
     user = result.user;
    const verifyRef = ref(db, `users/${user.uid}/verified`);
    const userRef = ref(db, 'users/' + user.uid);
    await set(userRef, { 
      username: user.displayName,
      email: user.email  
    });

    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      await set(verifyRef, true);
    } 
   setTimeout(() => {
   window.location.href = '/index.html';
   }, 2500);
  } catch (error) {
    console.error("Error:", error);
    await set(verifyRef, false);
  }
});

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

async function resetPassword() {
    let email = await showPrompt('Please enter your registered email address to reset your password');
    email = email.trim();
    if (!validateEmailForPrompt(email)) {
        showModal('Please enter a valid email address', 'danger');
        return;
    }

    try {
      showLoader();
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset email sent. Please check your email');
    } catch (error) {
        showModal(`Error: ${error.message}`, 'danger');
    } finally {
      hideLoader();
    }
}

function validateEmailForPrompt(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function showToast(content) {
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

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove();
    });
}

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
