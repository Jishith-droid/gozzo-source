document.querySelector(".search-bar").addEventListener("input", function () {
    let searchValue = this.value.toLowerCase();
    let faqs = document.querySelectorAll(".accordion-item");

    faqs.forEach(faq => {
        let btnText = faq.querySelector(".accordion-button").textContent.toLowerCase();
        
        if (btnText.includes(searchValue)) {
            faq.style.display = "block";
        } else {
            faq.style.display = "none";
        }
    });
});

(function() {
  
  const arrow = document.querySelector('.header .bi-arrow-left');
  const image = document.querySelector('.header img')
  image.addEventListener('click', ()=> {
   window.location.href = '/index.html';
  });
  arrow.addEventListener('click', ()=> {
   window.history.back();
  });
})();