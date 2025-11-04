
  function copyToClipboard() {
    const numberText = document.querySelector('.order-id').textContent;
        navigator.clipboard.writeText(numberText).then(() => {
            showToast('order ID Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (orderId) {
    document.querySelector('.order-id').textContent = orderId;
  } else {
    document.querySelector('.order-id').textContent = 'Order ID is not available';
  }
}

document.getElementById('bottone1').addEventListener('click', ()=> {
  window.location.href = 'my-orders.html';
})

document.addEventListener('DOMContentLoaded', () => {
  
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