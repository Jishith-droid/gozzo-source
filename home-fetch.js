"use strict";
const topPicks = document.getElementById('top-picks');
const discountSec = document.querySelector('.discount-sec');
const searchInput = document.querySelector('.search_mobile');
const searchInputpc = document.querySelector('.search-pc');
const searchSuggestions = document.querySelectorAll('.search-suggestions');
const loader = document.getElementById('loader-container');

function showLoader() {
  loader.style.display = 'flex'; 
}

// Hide the loader
function hideLoader() {
  loader.style.display = 'none';
}

fetch("https://cdn.jsdelivr.net/gh/Jishith-MP/Pot-it-up_products@main/products.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    const products = Object.values(data.products); 
    if (products.length === 0) {
      topPicks.innerHTML = 'No top picks available at the moment.';
      discountSec.innerHTML = 'No discounted products available at the moment.';
      return;
    }

    // Function to display top picks
    function displayTopPicks() {
      topPicks.innerHTML = '';
      products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('top-picks-container');
        productDiv.innerHTML = `
          <a href="products/prod_view.html?productCode=${product.code}">
            <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}">
            <div class="top-picks-footer">
              From ₹${product.discounted_price}
            </div>
          </a>
        `;
        topPicks.appendChild(productDiv);
      });
    }
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
  input.addEventListener('input', function (event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (searchTerm.length > 0) {
        const filteredProd = products.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.subDescription.toLowerCase().includes(searchTerm) ||
                   product.category.some(cat => cat.toLowerCase().includes(searchTerm));
        });

        displaySuggestions(filteredProd);
    } else {
        console.log('No search term entered or search term cleared');
        searchSuggestions.forEach(s => {
            s.innerHTML = '';
            s.classList.remove('active');
        });
    }
});
});

function displaySuggestions(filteredProd) {
    searchSuggestions.forEach(s => s.innerHTML = '');

    if (filteredProd.length === 0) {
        console.log('No products match the search term.');
        searchSuggestions.forEach(s => s.classList.remove('active'));
        return;
    }

    console.log('Found matching products, displaying suggestions');
    searchSuggestions.forEach(s => s.classList.add('active'));

    filteredProd.forEach(product => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');

        suggestionItem.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <span>${product.name}</span>
        `;

        suggestionItem.addEventListener('click', () => {
            console.log('Suggestion clicked:', product.name);
            window.location.href = `/products/prod_view.html?productCode=${encodeURIComponent(product.code)}`;
            searchInput.value = '';
            searchSuggestions.forEach(s => s.classList.remove('active'));
        });

        searchSuggestions.forEach(s => s.appendChild(suggestionItem));
    });
}
  
    function displaydiscountSec() {
      discountSec.innerHTML = ''; 

      const maxProducts = 6;
      const productsToDisplay = products.slice(0, maxProducts); 

      const discountGrid = document.createElement('div');
      discountGrid.classList.add('discount-grid');

      productsToDisplay.forEach(product => {
        const discountSecDiv = document.createElement('div');
        discountSecDiv.classList.add('gridItem');

        discountSecDiv.innerHTML = `
          <a href="products/prod_view.html?productCode=${product.code}">
            <div class="gridImage">
              <img src="${product.images[Math.min(Math.floor(Math.random() * 4), product.images.length - 1)]}" alt="${product.name}">
            </div>
            <div class="product-info">
              <p class="product-name">${product.name}</p>
              <p class="discount">${product.discount_percentage} % OFF</p>
            </div>
          </a>
        `;
        discountGrid.appendChild(discountSecDiv);
      });

      discountSec.appendChild(discountGrid);
    }

    displayTopPicks();
    displaydiscountSec();
    
  }).catch(error => {
    console.error('Error fetching product data:', error);
      
   let errorDiv = `<div class="error-gateway">
        <img src="/assets/vectors/404.svg" alt="404 error">
        <a href="javascript:location.reload();">Reload Page</a>
      </div>
    `;
    discountSec.innerHTML = errorDiv;
    topPicks.innerHTML = errorDiv;
    }).finally(() => {
      hideLoader();
    })