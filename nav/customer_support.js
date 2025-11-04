import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, get, update, set, push,  } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';

const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
  const chatInterface = document.getElementById('chat-interface');
  const logoContainer = document.getElementById('logo-container');
  const preInputDiv = document.querySelector('.box');
  const inputDiv = document.querySelector('.input');
  let messageContainer, orderId, user, issueDes, transId, userId;
  
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      user = currentUser; 
      userId = user.uid;
     dynamicDP(await fetchUsername(userId));
    } else {
      showModal('User must be authenticated to use this facility!', 'danger');
      setTimeout(() => {
      window.location.href = '/auth/login.html'; 
      }, 2500);
    }
  });
  
  function setUpLogo() {
    logoContainer.innerHTML = `
      <div class="logo">
        <img src="/assets/images/logo.png" alt="logo">
        <b>Hi! How Can I Help You?</b>
      </div>
    `;
  }
  
  function setPreDiv() {
    preInputDiv.innerHTML = `
      <div><b>Order Related</b></div>
      <div><b>Payment Related</b></div>
      <div><b>Account Related</b></div>
      <div><b>Other Issues</b></div>
    `;
    assignEventListeners(); 
  }
  
  function hidePreInputDiv() {
    preInputDiv.style.display = 'none';
  }
  
  function showPreInputDiv() {
    preInputDiv.style.display = 'block';
  }
  
  function hideInput() {
    inputDiv.style.display = 'none';
  }
  
  function sanitizeInput(input) {
    if (!input) return ""; 
    return input.trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/[^a-zA-Z0-9 .,!?]/g, ""); 
  }
  
  function otherIssue() {
    inputDiv.style.display = "block";
    inputDiv.innerHTML = `
    <span>
      <textarea rows="3" placeholder="Describe the issue in maximum 90 words..." maxLength="90"></textarea>
      <button id="desSubmit">Submit</button>
    </span>
  `;
    
    hidePreInputDiv();
    setTimeout(() => {
      const submitButton = document.getElementById("desSubmit");
      if (!submitButton) {
        console.error("Submit button not found!");
        return;
      }
      
      submitButton.addEventListener("click", function() {
        const textarea = document.querySelector(".input textarea");
        if (!textarea) {
          console.error("Textarea not found!");
          return;
        }
        
        let issueDes = sanitizeInput(textarea.value);
        if (issueDes.length > 90) {
          issueDes = issueDes.substring(0, 90);
        }
        
        if (issueDes) {
          addMessageToChat(issueDes, "right");
          hideInput();
          hidePreInputDiv();
          showPreInputDiv();
          saveToDB(userId, issueDes);
        } else {
          addMessageToChat("Please enter a valid issue description before submitting.", "left");
        }
      });
    }, 100);
  }
  
  function showInputForPayment() {
    inputDiv.style.display = 'block';
    inputDiv.innerHTML = '';
    inputDiv.innerHTML = `
      <span>
        <input type="text" placeholder="Type Transaction ID..." maxLength="40">
        <button id="transIdsubmit">Submit</button>
      </span>
    `;
    
    
    setTimeout(() => {
      const submitButton = document.getElementById('transIdsubmit');
      if (submitButton) {
        submitButton.addEventListener('click', function() {
          const transId = document.querySelector('.input input').value.trim();
          if (transId) {
            addMessageToChat(`Transaction ID:${transId}`, 'right');
            addMessageToChat('saving transaction ID... Please wait!')
            document.querySelector('.input input').value = '';
            hideInput();
            hidePreInputDiv();

            if (typeof user !== 'undefined' && user.uid) {
                saveTransactionId(user.uid, transId);
            } else {
                console.error("User not found or not logged in.");
                addMessageToChat("Error: User not found. Please try logging in again.", 'left');
            }

            showPreInputDiv();
          }
        });
      } else {
        console.error('Submit button not found!');
      }
    }, 100); 
}
    
  function showInput() {
    inputDiv.style.display = 'block';
    inputDiv.innerHTML = `
      <span>
        <input type="text" placeholder="Type Order ID" maxLength="20">
        <button id="submit">Submit</button>
      </span>
    `;
    
    setInputPreDiv('Cancel Order', 'Order Not Received', 'Order Policies', 'Other Issues');
    setTimeout(() => {
      const submitButton = document.getElementById('submit');
      if (submitButton) {
        submitButton.addEventListener('click', function() {
          orderId = document.querySelector('.input input').value;
          if (orderId) {
            addMessageToChat(`Order ID: ${orderId}`, 'right');
            document.querySelector('.input input').value = '';
            hideInput();
            hidePreInputDiv();
            addMessageToChat('Thank you! We will look into your order.', 'left');
            
            showPreInputDiv();
            getOrderDetails(userId, orderId)
              .then((orderDetailsString) => {
                if (orderDetailsString) {
                  addMessageToChat(`Order Details:\n${orderDetailsString}`, 'left');
                } 
                showPreInputDiv();
                
              })
              .catch((error) => {
                console.error('Error fetching order details:', error);
                addMessageToChat('An error occurred while fetching order details.', 'left');
              });
            
          } else {
            addMessageToChat('Please enter a valid Order ID.', 'left');
            
          }
        });
      } else {
        console.error('Submit button not found!');
      }
    }, 100);
    
  }
  
  function showInputDouble() {
    inputDiv.style.display = 'block';
    inputDiv.innerHTML = `
      <span>
        <input type="text" placeholder="Type Order ID" maxLength="20">
        <button id="submit">Submit</button>
      </span>
    `;
    
    setInputPreDiv('Order Related', 'Payment Related', 'Account Ralated', 'Other Issues');
    setTimeout(() => {
      const submitButton = document.getElementById('submit');
      if (submitButton) {
        submitButton.addEventListener('click', function() {
          orderId = document.querySelector('.input input').value;
          if (orderId) {
            addMessageToChat(`Order ID: ${orderId}`, 'right');
            document.querySelector('.input input').value = '';
            hideInput();
            hidePreInputDiv();
            addMessageToChat('Thank you! We will look into your payment details', 'left');
            
            showPreInputDiv();
            checkDoublePayment(user.uid, orderId);
            
          } else {
            addMessageToChat('Please enter a valid Order ID.', 'left');
          }
        });
      } else {
        console.error('Submit button not found!');
      }
    }, 100);
    
  }
  
  function setInputPreDiv(one, two, three, four) {
    preInputDiv.innerHTML = `
      <div><b>${one}</b></div>
      <div><b>${two}</b></div>
      <div><b>${three}</b></div>
      <div><b>${four}</b></div>
    `;
    assignEventListeners(); 
  }
  
  function assignEventListeners() {
    const predefinedInputs = document.querySelectorAll('.box div');
    predefinedInputs.forEach((input) => {
      input.addEventListener('click', function() {
        const userMessage = input.innerText;
        const botResponse = getBotResponse(userMessage);
        logoContainer.style.display = 'none';
        
        addMessageToChat(userMessage, 'right');
        
        if (botResponse) {
          addMessageToChat(botResponse, 'left');
        }
      });
    });
  }
  
  function addMessageToChat(message, side) {
     messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(side === 'left' ? 'left-message' : 'right-message');
    messageDiv.innerHTML = message;
    
    messageContainer.appendChild(messageDiv);
    chatInterface.appendChild(messageContainer);
    
    
    chatInterface.appendChild(preInputDiv);
    chatInterface.scrollTop = chatInterface.scrollHeight; 
    showNew();
  }
  
  function getBotResponse(userMessage) {
    if (userMessage === 'Order Related') {
      hidePreInputDiv();
      showInput();
      
      
      return 'Please provide your order ID.';
    }
    if (userMessage === 'Cancel Order') {
      
      cancelOrder(userId, orderId)
        .then((cancelled) => {
          if (cancelled) {
            addMessageToChat(`Order cancelled successfully for Order ID: ${orderId}`, 'left');
          } 
        })
        .catch((error) => {
          console.error('Error canceling order:', error);
          addMessageToChat('An error occurred while processing the cancellation. Please try again later.', 'left');
        });
      return 'Checking cancellation status...'; 
      
    } else if (userMessage === 'Order Not Received') {
      
      orderNotReceived(user.uid, orderId);
      
      return 'Checking current order status...';
    } else if (userMessage === 'Order Policies') {
      return 'You can view our order policies <a href="orderPolicy.html">Here</a>. Let me know if you have questions.';
    } else if (userMessage === 'Other Issues') {
      
      otherIssue();
      
      return 'Please describe the issue you are facing.';
    }
    
    if (userMessage === 'Payment Related') {
      showPreInputDiv();
      
      setInputPreDiv('Payment Deducted But not ordered!', 'Payment Deducted Twice', 'Refund Not Received', 'Other Issues');
      
      return 'Select an issue from the list below to get help';
    }
    if (userMessage === 'Payment Deducted But not ordered!') {
      
      hidePreInputDiv();
      showInputForPayment();
      
      return 'Please provide your transaction ID to proceed'
    } else if (userMessage === 'Payment Deducted Twice') {
      
      hidePreInputDiv();
      showInputDouble();
      
      
      return 'Please provide your order ID to varify if there is any double payment!';
    } else if (userMessage === 'Refund Not Received') {
      
      
      checkRefundStatus(userId);
      
      return 'Checking refund status...'
    } else if (userMessage === 'Other Issues') {
      
      otherIssue();
      
      return 'Please describe the issue you are facing.';
    }
    if (userMessage === "Account Related") {
      showPreInputDiv();
      
      setInputPreDiv('Delete Account', 'Update Account', 'Account Information', 'Other Issues');
      
      return 'Select an option from the list below';
    }
    if (userMessage === "Delete Account") {
      setTimeout(() => {
      addMessageToChat(`You can delete your account permanently from the settings page. <br> <a href="account_settings.html#delete" target="_blank">Go to Delete Account</a>`, "left");
      }, 100);
      return 'You can delete your account permanently using the link below!';
    } else if (userMessage === "Update Account") {
      setTimeout(() => {
      addMessageToChat(`You can update your account details from the settings page. <br> <a href="account_settings.html#update" target="_blank">Go to Update Account</a>`,"left");
      }, 100);
      return 'You can update your account using the link below!';
    } else if (userMessage === "Account Information") {
      
      retrieveAccInfo(user.uid);
      
      return 'Fetching your account information...';
    } else if (userMessage === "Other Issues") {
      otherIssue();
      
      return 'Please describe the issue you are facing.';
      
    } 
    if (userMessage === "Other Issues") {
      otherIssue();
     
      return 'Please describe the issue you are facing.'
    }
  
    return 'I am sorry, I did not understand that.';
   
  }
  
  setUpLogo();
  setPreDiv();
 
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

  
  async function getOrderDetails(userid, orderid) {
    
    const orderRef = ref(db, `users/${userid}/orders/${orderid}`);
    
    try {
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        const orderDetails = snapshot.val();
        if (orderDetails["order-status"] === "cancelled") {
          addMessageToChat('This order is already cancelled!', 'left');
          return null;
        }
        
const { qrcode, paymentIds, ["total-amount"]: _, ...restOrderDetails } = orderDetails;
        
        // Convert the rest of the order details to a <ul> <li> format
        let orderDetailsString = `<ul>`;
        for (const [key, value] of Object.entries(restOrderDetails)) {
          if (key === 'products') {
            continue; // Skip products for now, handle separately
          }
          orderDetailsString += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        orderDetailsString += `</ul>`;
        
        // Fetch product details from the JSON URL
        const productsResponse = await fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json");
        
        if (!productsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await productsResponse.json();
        
        const products = Object.values(data.products); // Convert the object to an array
        
        // Format product details
        let productDetailsString = `<b>Products:</b>`;
        for (const productCode in orderDetails.products) {
          // Log productCode for debugging
          console.log('Product Code in Order:', productCode);
          
          // Fetch quantity of the product from the order data in Firebase
          const productQuantity = orderDetails.products[productCode]?.quantity || 0;
          
          // Find the product in the productData object
          const product = products.find(p => p.code === productCode);
          if (product) {
            // Log product details for debugging
            console.log('Product Found:', product);
            
            // Add product image, name, and quantity in a clean format
            productDetailsString += `
            <div class="productsDivMain">
            <div class="productsDiv">
              <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}">
              <span>${product.name}<br><small>Quantity: ${productQuantity}</small></span>
            </div>
            </div>`;
          } else {
            // Log if product is not found
            console.log('Product Not Found for Code:', productCode);
            continue;
          }
        }
        
        // Combine order details and product details
        return orderDetailsString + productDetailsString;
      } else {
       
       addMessageToChat('No order details found for the provided ID.', 'left');
                
        return null; // Return null if no order exists
      }

    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error; // Re-throw the error for handling in the calling function
    }
  }
  
  async function cancelOrder(userid, orderId) {
    const orderRef = ref(db, `users/${userid}/orders/${orderId}`);
    
    try {
      const snapshot = await get(orderRef);
      
      // If the order doesn't exist, return false
      if (!snapshot.exists()) {
        console.log('Order does not exist.');
        addMessageToChat('Order not found!', 'left');
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
      const cancelRef = ref(db, `users/${userid}/orders/${orderId}/cancelled-time`);
      if (timeDifference <= twentyFourHoursInMs) {
        if (orderStatusRef === "order placed") {
          await update(orderRef, { "order-status": "cancelled",
          });
          await set(cancelRef, cancelled_time);
        
        console.log('Order canceled successfully.');
        const refundRef = ref(db, `users/${userId}/orders/${orderId}/refund-Initiated`); // Reference to the user node
            set(refundRef, true);
        }
        return true; // Order canceled successfully
      } else {
        console.log('Order cancellation not allowed (over 24 hours).');
        addMessageToChat('Cancellation period has expired. Orders can only be cancelled within 24 hours of placing them.', 'left');
        return false; // Cancellation not allowed
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error; // Re-throw the error to be handled by the caller
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
  
  async function orderNotReceived(userId, orderId) {
    const orderRef = ref(db, `users/${userId}/orders/${orderId}`);
    
    try {
      const snapshot = await get(orderRef);
      
      // Check if the order exists
      if (!snapshot.exists()) {
        console.log('Order not found.');
        addMessageToChat('Order not found', 'left');
        return false;
      }
      
      const orderData = snapshot.val();
      if (orderData["order-status"] === "cancelled") {
        addMessageToChat('This order is cancelled!', 'left');
        return null;
      }
      const orderStatus = orderData['order-status']; // Retrieve the order status
      
      if (orderStatus === 'order placed') {
        addMessageToChat(`Your order has been placed successfully. Please wait until it is dispatched.`, 'left');
      } else if (orderStatus === 'dispatched') {
        addMessageToChat(`Your order has been dispatched. It should arrive within a few days or by the expected delivery date.`, 'left');
      } else {
        addMessageToChat(
          `Your order appears to have been delivered. If you have not received it, please contact our support team <a href="mailto:potitupspprt@gmail.com">here</a>.`,
          'left'
        );
      }
    } catch (error) {
      console.error('An error occurred while retrieving the order:', error);
    }
  }
  
  // Function to save feedback in Firebase without overwriting other user data
  async function saveToDB(userId, issueDes) {
    if (!userId || !issueDes) return; // Prevents storing empty or invalid data
    
    issueDes = sanitizeInput(issueDes);
    if (issueDes.length > 90) {
      issueDes = issueDes.substring(0, 90); // Enforce max length
    }
    
    const userRef = ref(db, `users/${userId}/issueDescription`); // Reference to the user node
    
    try {
      await push(userRef, issueDes); // Updates issueDescription without removing other data
      
      addMessageToChat(
        "Thank you for submitting your feedback. We have received your issue description and will review it promptly. Our support team will get back to you within 2 business days.",
        "left"
      );
    } catch (error) {
      console.error("Error saving feedback: ", error);
      addMessageToChat("There was an error submitting your feedback. Please try again later.", "left");
    }
  }
  
  function saveTransactionId(userid, transid) {
    const transRef = ref(db, `users/${userid}/customerProvidedTransactionID`);
    
    // Save as an object to avoid overwriting and add a timestamp
    push(transRef, { transactionId: transid })
    .then(() => {
        addMessageToChat('We will look into your transaction and order status. You will receive an update via email within 2 business days.', 'left');
    })
    .catch(error => {
        console.error("Error saving transaction:", error);
        addMessageToChat('There was an error processing your request. Please try again later.', 'left');
    });
}

async function checkDoublePayment(userId, orderId) {  
  const orderRef = ref(db, `users/${userId}/orders/${orderId}`);  
  const orderSnap = await get(orderRef);
  if (!orderSnap.exists()) {
    addMessageToChat('No order found for this order ID. Please check your order ID and try again', 'left');
    return;
  }
    const payRef = ref(db, `users/${userId}/orders/${orderId}/paymentIds`);  

    try {  
        const snapshot = await get(payRef);  

        if (!snapshot.exists()) {  
            addMessageToChat('No payments found for this order. Please ensure this is a valid online payment order!', 'left');  
            
        }  
        const payments = Object.values(snapshot.val());  

        if (payments.length > 1) {  
            addMessageToChat(`Double payment detected! Refund for the excess amount will be processed within 3 business days. (Note: platform fee is not refundable)`, 'left');  const doublePayRef = ref(db, `users/${userId}/doublePayment`); // Reference to the user node
           await set(doublePayRef, true);
        } else {  
            addMessageToChat('No duplicate payments detected. Everything is fine.', 'left');  
        }  
    } catch (error) {  
        console.error("Error checking payments:", error);  
       addMessageToChat('An error occurred while checking payments.', 'left');  
    }  
}  

async function checkRefundStatus(userid) {
    let orderId = null;

    // Prompt user until valid order ID is provided or cancelled
    while (!orderId) {
        orderId = prompt("Enter your Order ID for checking refund status:");

        if (orderId === null) {
            addMessageToChat("Order ID input was cancelled.", "left");
            return; // Exit if cancelled
        }

        orderId = orderId.trim();
        if (!orderId) {
            addMessageToChat("Order ID cannot be empty!", "left");
            continue; // Retry prompt
        }

        if (!/^order_[A-Za-z0-9]{14}$/.test(orderId)) {
            addMessageToChat("Invalid Order ID! It must start with 'order_' followed by 14 letters/numbers.", "left");
            orderId = null; // Reset and retry
            continue;
        }

        addMessageToChat(`Order ID: ${orderId}`, "right");
    }

    // Now orderId is valid, proceed with database lookup
    const orderRef = ref(db, `users/${userid}/orders/${orderId}`);

    try {
        addMessageToChat("Checking refund status...", "left");

        const snapshot = await get(orderRef);
        
        if (!snapshot.exists()) {
            addMessageToChat("Order not found. Please enter a valid Order ID.", "left");
            return;
        }

        const orderDetails = snapshot.val();
        if (orderDetails["order-status"] === "cancelled") { 
            addMessageToChat(
                `Your refund for Order ID <b>${orderId}</b> has been initiated and is typically processed within 2 days. If not received within this period, we will automatically raise a complaint and usually resolve it within 1 day.`,
                "left"
            );
            hideInput();
        } else {
            addMessageToChat(
                `We do not initiate refunds manually. Refunds are automatically processed if the order is canceled within 24 hours of purchase. If the 24-hour window has passed, refunds will not be available. Please refer to our refund policy here: <a href=terms&conditions.html#return&refund&replacement">Refund Policy</a>.`,
                "left"
            );
        }
    } catch (e) {
        console.error("Error fetching order reference:", e);
        addMessageToChat("An error occurred while checking your refund status. Please try again later.", "left");
    }
}

async function retrieveAccInfo(userid) {
  const userRef = ref(db, `users/${userid}`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const name = userData["username"];
      const email = userData["email"];
      const phNo = userData["phone-no"] || 'N/A';
      const address = userData["address"] || 'N/A';
      
      addMessageToChat(`<b>Name</b>:${name} <br><b>Email</b>:${email} <br><b>Phone Numbe</b>: ${phNo} <br><b>Address</b>:${address}`, 'left');
    } else {
      console.error("User not found.");
    }
  } catch (e) {
    console.error("Error fetching Account Information:", e);
  }
}

function dynamicDP(name) {
    // Function to generate a random hex color
    function getRandomColor() {
    let color;
    do {
        color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (isBadColor(color)); // Keep generating until a good color is found
    return color;
}

// Function to check if a color is bad (low contrast or neon-like)
function isBadColor(hex) {
    let rgb = hexToRgb(hex);
    let brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114); // Luminance formula

    return (
        brightness > 180 ||  // Too bright (low contrast with white)
        (rgb.r < 50 && rgb.g > 200 && rgb.b < 50) // Lime-like colors
    );
}

// Convert HEX to RGB
function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

    // Extract initials from the name
    let initials = name.split(' ').map(word => word[0].toUpperCase()).join('');

    // Create a div element
    let dpDiv = document.createElement('div');
    dpDiv.classList.add('dynamic-dp'); // Add the class
    dpDiv.style.backgroundColor = getRandomColor();
    dpDiv.textContent = initials;

    // Append to body or any container
    username.appendChild(dpDiv);
}

function showNew() {
  document.getElementById('new').style.display = 'flex';
}

function hideNew() {
  document.getElementById('new').style.display = 'none';
}

function newClick() {
  document.getElementById('new').addEventListener('click', ()=> {
    resetPage();
    hideNew();
  })
}
newClick();

function resetPage() {
  logoContainer.style.display = 'block'; 
  document.querySelectorAll('.message-container').forEach(msg => msg.remove());
  preInputDiv.style.display = 'block';
  preInputDiv.innerHTML = `
      <div><b>Order Related</b></div>
      <div><b>Payment Related</b></div>
      <div><b>Account Related</b></div>
      <div><b>Other Issues</b></div>
    `;
    assignEventListeners(); // Reassign listeners when changing options
  hideInput();
  hideNew();
}

(function() {
  
  const arrow = document.querySelector('section .bi-arrow-left');
  
  username.addEventListener('click', ()=> {
   window.location.href = '/index.html';
  });
  arrow.addEventListener('click', ()=> {
   window.history.back();
  });
})();

function showOrderIdInput() {
  inputDiv.style.display = 'block';
    inputDiv.innerHTML = `
      <span>
        <input type="text" placeholder="Type Order ID" maxLength="20">
        <button id="submit">Submit</button>
      </span>
    `;
    setTimeout(() => {
      const submitButton = document.getElementById('submit');
      if (submitButton) {
        submitButton.addEventListener('click', function() {
          orderId = document.querySelector('.input input').value;
          getBotResponse('Refund Not Received');
        });
        } else {
          console.log('submit btn not found');
        }
      
      }, 100);
}

 
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
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
});