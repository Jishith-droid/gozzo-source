import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, update } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';
const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const loader = document.getElementById('loader-container');
const form = document.getElementById('signup-form');
const googleBtn = document.querySelector('.login-with-google-btn');
const provider = new GoogleAuthProvider();
const verifyBtn = document.getElementById('check-verification-btn')
const submitBtn = document.getElementById('submitBtn');
let user, userId;

const animationContainer = document.querySelector('.signupAnimation');
lottie.loadAnimation({
  container: animationContainer,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/assets/videos/signup.json'
});

function showVerifyBtn() {
  verifyBtn.style.display = 'block';
}

function disableSubmitBtn() {
  submitBtn.disabled = true;
}

form.addEventListener('submit', handleSignup)
async function handleSignup(event) {
  event.preventDefault();
  showLoader();
  
  const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('username');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput.value.trim();

    clearErrors([emailInput, nameInput, passwordInput]);
  const validationResult = sanitizeAndValidateInput(email, name, password);
  if (!validationResult.success) {
    showError(validationResult.target, validationResult.message);
    hideLoader();
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;
    const userRef = ref(db, `users/${user.uid}`);
    
    await set(userRef, { username: name, email, verified: false });
    await sendEmailVerification(user);
    showModal('A verification email has been sent. Please verify your email.', 'success');
    
    await signOut(auth);
    showVerifyBtn();
    disableSubmitBtn();
  } catch (error) {
    handleSignupError(error);
  } finally {
    hideLoader();
  }
}

verifyBtn.addEventListener('click', handleVerification)
async function handleVerification() {
  showLoader();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    user = userCredential.user;
    await user.reload();
    
    if (user.emailVerified) {
      const verifyRef = ref(db, `users/${user.uid}`);
      await update(verifyRef, { verified: true });
      
      showToast('Email verified! Redirecting to login page.');
      await signOut(auth);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2500);
    } else {
      showModal('Email not verified yet. Please check your inbox.', 'danger');
      await signOut(auth);
    }
  } catch (error) {
    showToast('Failed to check verification. Try again.');
    console.error(error);
    await signOut(auth);
  } finally {
    hideLoader();
  }
}

function sanitizeAndValidateInput(email, name, password) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return { success: false, message: "Invalid email format", target: document.getElementById('email') };
  
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) return { success: false, message: "Name should contain only alphabets", target: document.getElementById('username') };
  
  if (password.length < 8) return { success: false, message: "Password must be at least 8 characters long", target: document.getElementById('password') };
  if (!/[A-Z]/.test(password)) return { success: false, message: "Password must have at least one uppercase letter", target: document.getElementById('password') };
  if (!/[a-z]/.test(password)) return { success: false, message: "Password must have at least one lowercase letter", target: document.getElementById('password') };
  if (!/[0-9]/.test(password)) return { success: false, message: "Password must have at least one number", target: document.getElementById('password') };
  if (!/[^A-Za-z0-9]/.test(password)) return { success: false, message: "Password must have at least one special character", target: document.getElementById('password') };
  
  return { success: true };
}

function showError(inputElement, message) {
  let errorTag = document.createElement("small");
  errorTag.classList.add("error");
  errorTag.innerText = message;
  inputElement.parentNode.appendChild(errorTag);
}

function clearErrors(inputElements) {
  inputElements.forEach(input => {
    let parent = input.parentNode;
    let errorTag = parent.querySelector(".error");
    if (errorTag) parent.removeChild(errorTag);
  });
}

function handleSignupError(error) {
  let errorMessage = "Signup failed. Please try again.";
  
  if (error.code === 'auth/email-already-in-use') {
    errorMessage = "This email is already registered.";
  } else if (error.code === 'auth/weak-password') {
    errorMessage = "Password should be at least 6 characters.";
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = "Invalid email format.";
  }
  
  showModal(errorMessage, 'danger');
}

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

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

googleBtn.addEventListener("click", handleGoogle);
async function handleGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
    
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      username: user.displayName,
      email: user.email
    });
    window.location.href = '/index.html';
  } catch (error) {
    console.error("Error:", error);
  }
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