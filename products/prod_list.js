import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
import c from '/Config.js';


const app = initializeApp(c);
const auth = getAuth(app);
const db = getDatabase(app);

const loginBtn = document.querySelector('.login');
const authBtn = document.querySelector('authBtn');
const cartBtn = document.querySelector('.cart');
const tooltip = document.querySelector('.profile-tooltip');
const profileName = document.querySelector('.profile_name'); // Updated
const profIcon = document.querySelector('.prof_icon'); // Updated
const logoutBtn = document.getElementById('confirmLogout');
const productDisplay = document.querySelector('.product-display');
const logoutModal = document.getElementById('logoutModal');
const backBtn = document.querySelector('.bi-arrow-left');
const searchbarMob = document.querySelector('.search_mobile');
const searchPlaceholder = document.querySelector('.placeholder');
const sortBymobileBox = document.querySelector('.sort-by-mobile');
const sortBtn = document.querySelector('.sort');
const filterBtn = document.querySelector('.filter');
const radioButtons = document.querySelectorAll('input[name="sort-by"]');
const searchInput = document.getElementById('searchBar');
const searchSuggestions = document.getElementById('search-suggestions');
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
let userid = null;

document.addEventListener('DOMContentLoaded', () => {
  setupOutsideClickHandler();
  setupCartButtons();
  setupAuthStateChanged();
  setupLogoutButtons();
  setupProfileTooltips();
  setupFavoriteButtons();
  setupPlaceholderText();
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

// Function to cycle placeholder text
function setupPlaceholderText() {
  const placeholders = [
    'Search Flower Vases...', 'Search Gardening Pots...', 'Search Hanging Pots...',
    'Search Home Decor...', 'Search Countertop Items...', 'Search Planters...',
    'Search Decorative Pots...', 'Search Indoor Pots...', 'Search Outdoor Planters...',
    'Search flower Vases...'
  ];
  
  let currentIndex = 0;
  
  function changePlaceholder() {
    searchPlaceholder.classList.add('placeholder_slideout');
    
    searchPlaceholder.addEventListener('animationend', () => {
      searchPlaceholder.textContent = '';
      searchPlaceholder.classList.remove('placeholder_slideout');
      
      currentIndex = (currentIndex + 1) % placeholders.length;
      searchPlaceholder.textContent = placeholders[currentIndex];
      
      searchPlaceholder.classList.add('placeholder_slidein');
      
      searchPlaceholder.addEventListener('animationend', () => {
        searchPlaceholder.classList.remove('placeholder_slidein');
      }, { once: true });
    }, { once: true });
  }
  
  setInterval(changePlaceholder, 5000);
  searchPlaceholder.textContent = placeholders[currentIndex];
  
  searchbarMob.addEventListener('input', () => {
    searchPlaceholder.style.display = searchbarMob.value === '' ? 'block' : 'none';
  });
}


// Update UI for authenticated user
function updateLoginUI(user) {
  loginBtn.innerHTML = profileIcon;
  loginBtn.classList.add('auth-login');
  loginBtn.classList.remove('guest-login');
}

// Function to handle click outside the aside and tooltips
function setupOutsideClickHandler() {
  document.addEventListener('click', (event) => {
    if (!tooltip.contains(event.target) && !event.target.closest('.login')) {
      tooltip.style.display = 'none';
    }
  });
}

backBtn.addEventListener('click', () => {
  window.location.href = '/index.html';
})

// Firebase Authentication State Change
function setupAuthStateChanged() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userid = user.uid;
      
      updateLoginUI(user);
      const currentUserName = await fetchUsername(userid);
      console.log(currentUserName)
      profileName.textContent = currentUserName;
      loginBtn.addEventListener('click', () => {
        tooltip.style.display = 'flex';
      });
      await retrieveFavorites(user.uid);
      await retrieveNumberOfCart(user.uid);
    } else {
      updateGuestUI();
    }
  });
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

function closeModal() {
  const modalInstance = bootstrap.Modal.getInstance(logoutModal);
  if (modalInstance) modalInstance.hide();
}

// Update UI for guest user
function updateGuestUI() {
  loginBtn.innerHTML = profileIcon;
  loginBtn.classList.add('guest-login');
  loginBtn.classList.remove('auth-login');
  
  loginBtn.addEventListener('click', () => {
    window.location.href = '/auth/login.html';
  });
}

// Function to handle logout
function setupLogoutButtons() {
  logoutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        showToast('successfully logged out');
        profileName.textContent = 'Anonymous';
        profIcon.click();
        resetLoginButton();
        closeModal();
        
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  });
}

// Reset login button UI
function resetLoginButton() {
  loginBtn.innerHTML = profileIcon;
  loginBtn.classList.remove('auth-login');
}

// Function to close profile tooltip
function setupProfileTooltips() {
  profIcon.addEventListener('click', () => { // Updated
    tooltip.style.display = 'none';
  });
}

// Function to handle cart button click
function setupCartButtons() {
  cartBtn.addEventListener('click', () => {
    window.location.href = '/cart/cart.html';
  });
}

fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    const products = Object.values(data.products); // Convert the object to an array
    // Your code to handle the products
    const radioButtons = document.querySelectorAll('input[name="sort-by"]');
    const filterCheckboxes = document.querySelectorAll('.filter-by-mobile input[type="checkbox"]');
    const applyFilterBtn = document.getElementById('filter-apply');
    
    function displayProducts(products) {
      productDisplay.innerHTML = ''; // Clear the current display
      
      products.forEach(product => {
        
        
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        productDiv.innerHTML = `
  <div class="products-layout">
    <div class="product-image">
      <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}" />
    </div>
    <div class="product-details">
      <i class="bi bi-heart heart-icon" id="favoriteIcon" data-product-code="${product.code}"></i>
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
    </div>

    <div class="product-characteristics">
      ${Object.entries(product.attributes).map(([key, value]) => {
        // Format the key properly
        let formattedKey = key === "suit_for" ? "Suitable For" : key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());

        // Handle different data types
        let formattedValue;
        if (Array.isArray(value)) {
          formattedValue = value.length ? value.join(", ") : "N/A ";
        } else if (typeof value === "object" && value !== null) {
          formattedValue = Object.entries(value)
            .map(([k, v]) => `${k}: ${v ? v : "N/A"}`)
            .join(", ");
        } else {
          formattedValue = value ? value : "N/A ";
        }

        return `<div class="characteristic"><strong>${formattedKey}:</strong> ${formattedValue}</div>`;
      }).join('')}
    </div>
`;
        
        productDisplay.appendChild(productDiv);
        
        productDiv.addEventListener('click', (event) => {
          if (event.target.closest('.heart-icon')) {
            return;
          }
          
          // Proceed with navigation if click is not in .heart-icon
          window.location.href = `/products/prod_view.html?productCode=${product.code}`;
          
        });
        
      });
      retrieveFavorites(userid);
    }
    
    displayProducts(products); // Initially display all products
    
    
    radioButtons.forEach(radio => {
      radio.addEventListener('change', (event) => {
        let selectedValue = event.target.value;
        
        // Sort the products based on the selected option
        let sortedProducts;
        
        if (selectedValue === 'popularity') {
          sortedProducts = products.sort(() => Math.random() - 0.5); // Random for now
        } else if (selectedValue === 'price--low-to-high') {
          sortedProducts = products.sort((a, b) => a.discounted_price - b.discounted_price);
        } else if (selectedValue === 'price--high-to-low') {
          sortedProducts = products.sort((a, b) => b.discounted_price - a.discounted_price);
        } else if (selectedValue === 'newest-first') {
          sortedProducts = products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (selectedValue === 'relevance') {
          sortedProducts = products.sort(() => Math.random() - 0.5); // Random for now
        } else {
          console.error('Radio button values do not match');
          return;
        }
        
        // Display the sorted products
        displayProducts(sortedProducts);
        
      });
      document.getElementById('relevance').checked = true;
    });
    
    searchInput.addEventListener('input', function(event) {
      const searchTerm = event.target.value.toLowerCase().trim();
      
      if (searchTerm.length > 0) {
        const filteredProd = products.filter(product => {
          return product.name.toLowerCase().includes(searchTerm) ||
            product.subDescription.toLowerCase().includes(searchTerm) ||
            product.category.some(cat => cat.toLowerCase().includes(searchTerm));
        });
        displayProducts(filteredProd);
        displaySuggestions(filteredProd);
        
      } else {
        searchSuggestions.innerHTML = '';
        searchSuggestions.classList.remove('active');
        displayProducts(products);
        
      }
      
    });
    
    function displaySuggestions(filteredProd) {
      
      // Clear previous suggestions
      searchSuggestions.innerHTML = '';
      
      if (filteredProd.length === 0) {
        searchSuggestions.classList.remove('active');
        return;
      }
      
      // Add the active class to show suggestions
      searchSuggestions.classList.add('active');
      
      // Loop through filtered products
      filteredProd.forEach(product => {
        // Create a new suggestion item element
        const suggestionItem = document.createElement('div'); // Adjust the element type as needed
        suggestionItem.classList.add('suggestion-item'); // Optional: Add a class for styling
        
        // Set innerHTML for the suggestion item
        suggestionItem.innerHTML = `
      <img src="${product.images[0]}" alt="${product.name}">
      <span>${product.name}</span>
    `;
        
        // Add click event listener to the suggestion item
        suggestionItem.addEventListener('click', () => {
          
          window.location.href = `/products/prod_view.html?productCode=${product.code}`;
          searchInput.value = '';
        });
        
        // Append the suggestion item to the search suggestions container
        searchSuggestions.appendChild(suggestionItem);
      });
      
    }
    
    function updateProductCount(productsCount) {
      const productno = document.getElementById('products-found');
      productno.textContent = productsCount.length;
    }
    
    applyFilterBtn.addEventListener('click', applyFilter);
    
    function resetFilter() {
      const checkboxs = document.querySelectorAll('input[type="checkbox"]');
      checkboxs.forEach(checkbox => {
        checkbox.checked = false;
      })
    }
    
    document.getElementById('reset-filter').addEventListener('click', resetFilter);
    
    function applyFilter() {
      filterCheckboxes.forEach((checkbox) => {
        
        let filteredProducts = [...products];
        
        // Build the filter logic based on checked checkboxes
        const priceFilters = [];
        const sizeFilters = [];
        const stockFilters = [];
        const discountFilters = [];
        const colorFilters = [];
        const categoriesFilter = [];
        
        filterCheckboxes.forEach(checkbox => {
          if (checkbox.checked) {
            switch (checkbox.name) {
              // Price filters
              case "below199":
              case "between200and399":
              case "between400and499":
              case "above500":
                priceFilters.push(checkbox.name);
                break;
                // Size filters
              case "size-small":
              case "size-medium":
              case "size-large":
                sizeFilters.push(checkbox.name);
                break;
                // category filter
              case "category-home-decor":
              case "category-electronics":
              case "category-fashion":
              case "category-beauty":
              case "category-books":
              case "category-sports":
              case "category-health":
              case "category-food":
              case "category-toys":
              case "category-furniture":
              case "category-automotive":
              case "category-jewelry":
              case "category-tools":
              case "category-pet":
              case "category-gardening":
              case "category-office-supplies":
              case "category-baby":
              case "category-art":
              case "category-music":
              case "category-travel":
              case "category-virtual-products":
                categoriesFilter.push(checkbox.name);
                break;
                // Stock filters
              case "in-stock":
              case "out-of-stock":
                stockFilters.push(checkbox.name);
                break;
                // Discount filters
              case "discount-20":
              case "discount-30":
              case "discount-50":
              case "discount-70":
                discountFilters.push(checkbox.name);
                break;
                // Color filters
              case "color-red":
              case "color-blue":
              case "color-green":
                // ... other color options
                colorFilters.push(checkbox.name);
                break;
            }
          }
        });
        
        // Apply all filters sequentially
        filteredProducts = filteredProducts.filter(product => {
          let keep = true;
          
          // Apply price filters
          if (priceFilters.length) {
            keep = keep && priceFilters.some(filter => {
              switch (filter) {
                case "below199":
                  return product.discounted_price <= 199;
                case "between200and399":
                  return product.discounted_price >= 200 && product.discounted_price <= 399;
                case "between400and499":
                  return product.discounted_price >= 400 && product.discounted_price <= 499;
                case "above500":
                  return product.discounted_price >= 500;
                default:
                  return false;
              }
            });
          }
          
          // Apply size filters
          if (sizeFilters.length) {
            keep = keep && sizeFilters.includes(product.attributes.size);
          }
          
          // Apply category filters
          if (categoriesFilter.length) {
            keep = keep && categoriesFilter.some(filter => {
              // Normalize the filter by removing "category-" and replacing hyphens with spaces
              const normalizedFilter = filter.replace("category-", "").replace("-", " ");
              return product.category.some(cat => cat.toLowerCase() === normalizedFilter.toLowerCase());
            });
          }
          
          // Apply stock filters
          if (stockFilters.length) {
            keep = keep && stockFilters.includes(product.stock ? "in-stock" : "out-of-stock");
          }
          
          // Apply discount filters
          if (discountFilters.length) {
            keep = keep && discountFilters.some(filter => {
              const minDiscount = parseInt(filter.replace("discount-", ""));
              return product.discount_percentage >= minDiscount;
            });
          }
          
          if (colorFilters.length) {
            console.log(`Checking Colors for Product: ${product.name}`);
            console.log("Available Colors:", product.attributes.color);
            
            keep = keep && colorFilters.some(filter => {
              const filterColor = filter.replace("color-", "").toLowerCase();
              return (
                product.attributes &&
                product.attributes.color &&
                Array.isArray(product.attributes.color) &&
                product.attributes.color.some(productColor =>
                  productColor.toLowerCase() === filterColor
                )
              );
            });
          }
          
          
          return keep;
        });
        
        
        
        // Display the filtered products
        displayProducts(filteredProducts);
        updateProductCount(filteredProducts);
        
        
      });
    }
    
  })
  .catch(error => {
    console.error('Error fetching product data:', error);
    productDisplay.innerHTML = `
      <div class="error-gateway">
        <img src="/assets/vectors/404.svg" alt="404 error">
        <a href="javascript:location.reload();">Reload Page</a>
      </div>
    `;
  });

function setupFavoriteButtons() {
  document.addEventListener('click', async (event) => {
    
    if (event.target && event.target.matches('.heart-icon')) {
      
      const favIcon = event.target;
      const productCode = favIcon.getAttribute('data-product-code'); // Get the product code from the data attribute
      const userId = getUserId(); // Get current user's ID
      
      if (!userId) {
        showToast('Please log in to favorite products.');
        return;
      }
      
      // Toggle the heart icon's visual state
      const isFavorited = favIcon.classList.contains('favorited');
      const newFavoritedState = !isFavorited;
      
      // Update heart icon based on favorite state
      if (newFavoritedState) {
        favIcon.classList.add('favorited');
        favIcon.classList.replace('bi-heart', 'bi-heart-fill');
        showToast('Added to wishlist!');
      } else {
        favIcon.classList.remove('favorited');
        favIcon.classList.replace('bi-heart-fill', 'bi-heart');
        showToast('Removed from wishlist!');
      }
      
      // Save the favorite status to Firebase Realtime Database under the user's UID
      await saveFavoriteToDatabase(userId, productCode, newFavoritedState);
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

function retrieveFavorites(userId) {
  const favoritesRef = ref(db, `users/${userId}/favorites`);
  
  try {
    // Fetch favorites data
    get(favoritesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const favorites = snapshot.val();
        
        // Save favorites data to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Update heart icons based on favorites data
        document.querySelectorAll('.heart-icon').forEach((favIcon) => {
          const productCode = favIcon.getAttribute('data-product-code');
          if (favorites[productCode]) {
            const isFavorited = favorites[productCode].favorited;
            
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
        localStorage.removeItem('favorites');
      }
    });
  } catch (error) {
    console.error('Error retrieving favorite products:', error);
  }
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
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category"); // Get category from URL
  
  if (category) {
    const searchInput = document.querySelector("#searchBar");
    if (searchInput) {
      simulateTyping(searchInput, category); // Simulate typing instead of just setting value
    }
  }
});

// Function to simulate typing letter by letter
function simulateTyping(element, text) {
  element.value = ""; // Clear input first
  let index = 0;
  
  function typeNextLetter() {
    searchSuggestions.classList.remove('active');
    if (index < text.length) {
      element.value += text[index]; // Add next letter
      index++;
      
      // Dispatch both 'input' and 'keyup' events to mimic real typing
      const inputEvent = new Event("input", { bubbles: true });
      const keyupEvent = new Event("keyup", { bubbles: true });
      element.dispatchEvent(inputEvent);
      element.dispatchEvent(keyupEvent);
      
      setTimeout(typeNextLetter, 100); // Adjust typing speed (100ms per letter)
    }
  }
  
  typeNextLetter();
}

document.addEventListener("DOMContentLoaded", function() {
  const links = document.querySelectorAll(".filter-items a");
  const contents = document.querySelectorAll(".filter-value > div");
  
  // Show the first filter section by default
  contents[0].style.display = "block";
  links[0].classList.add("active");
  
  links.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      
      // Remove active class from all links
      links.forEach(l => l.classList.remove("active"));
      
      // Hide all sections
      contents.forEach(content => content.style.display = "none");
      
      // Show the selected section
      const targetClass = this.getAttribute("data-target");
      document.querySelector(`.filter-value .${targetClass}`).style.display = "block";
      
      // Add active class to clicked link
      this.classList.add("active");
    });
  });
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