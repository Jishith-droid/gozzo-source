let currentIndex = 0;
let slideInterval;
let progressFrame;
const carousel = document.getElementById('custom-carousel');
const slides = document.querySelectorAll('.custom-carousel-item');
const totalSlides = slides.length;
const indicatorsContainer = document.getElementById('custom-indicators');

// Cache indicators array
const indicators = Array.from({ length: totalSlides }, (_, i) => {
  const indicator = document.createElement('span');
  indicator.classList.add('custom-indicator', 'inactive');
  indicator.addEventListener('click', () => goToSlide(i));

  const progressBar = document.createElement('div');
  progressBar.classList.add('custom-progress');
  indicator.appendChild(progressBar);

  indicatorsContainer.appendChild(indicator);
  return indicator;
});

// Initial update
updateCarousel();
resetAutoSlide();

function updateCarousel() {
  carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === currentIndex);
    indicator.classList.toggle('inactive', i !== currentIndex);
    indicator.querySelector('.custom-progress').style.width = '0%';
  });

  startProgressBar(indicators[currentIndex]);
}

// Moves the slide left or right
function moveSlide(step) {
  let prevIndex = currentIndex;
  currentIndex = (currentIndex + step + totalSlides) % totalSlides;

  if (prevIndex !== currentIndex) {
    updateCarousel();
    resetAutoSlide();
  }
}

// Directly jumps to a slide
function goToSlide(index) {
  currentIndex = index;
  updateCarousel();
  resetAutoSlide();
}

function startProgressBar(activeIndicator) {
  const progressElement = activeIndicator.querySelector('.custom-progress');

  // **Stop existing animation**
  progressElement.style.transition = 'none';
  progressElement.style.width = '0%';

  // **Restart animation after a short delay**
  setTimeout(() => {
    progressElement.style.transition = 'width 5s linear'; // Smooth transition
    progressElement.style.width = '100%';
  }, 50); // Small delay ensures transition re-applies

  // **Ensure slide moves after 5s (avoid stacking animations)**
  clearTimeout(progressFrame);
  progressFrame = setTimeout(() => {
    moveSlide(1);
  }, 5000);
}

// Auto-slide logic
function autoSlide() {
  moveSlide(1);
}

// Resets the auto-slide interval (Optimized)
function resetAutoSlide() {
  clearInterval(slideInterval);
  cancelAnimationFrame(progressFrame);

  slideInterval = setInterval(() => {
    if (document.hasFocus()) {
      autoSlide();
    }
  }, 5000);
}

// Touch/swipe functionality (Fixed Swipe Direction)
const carouselContainer = document.querySelector('.custom-carousel-container');
let startX;

carouselContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

carouselContainer.addEventListener('touchend', (e) => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) moveSlide(diff > 0 ? 1 : -1);
});

// Pause auto-slide when tab is inactive
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(slideInterval);
    cancelAnimationFrame(progressFrame);
  } else {
    resetAutoSlide();
  }
});