document.addEventListener('DOMContentLoaded', () => {
  function setupCarousel(carouselId, dotContainerId, cardSelector) {
    const carousel = document.getElementById(carouselId);
    const dotContainer = document.getElementById(dotContainerId);
    const cards = carousel.querySelectorAll(cardSelector);

    // Clear previous dots (in case this is rerun)
    dotContainer.innerHTML = '';

    const dots = [];

    // Create dots
    cards.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.addEventListener('click', () => {
        const scrollAmount = cards[index].offsetLeft - carousel.offsetLeft;
        carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      });
      dotContainer.appendChild(dot);
      dots.push(dot);
    });

    // Highlight current dot
    function updateActiveDot() {
      const scrollLeft = carousel.scrollLeft;
      let currentIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          currentIndex = index;
        }
      });

      dots.forEach((dot) => dot.classList.remove('active'));
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    // Debounced scroll listener
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveDot, 50);
    });

    // Initial state
    dots[0]?.classList.add('active');
  }

  // Initialize both carousels
  setupCarousel('carousel-1', 'dotContainer-1', '.pictures-of-something__card');
  setupCarousel('carousel-2', 'dotContainer-2', '.pictures-of-center__card');
  setupCarousel('carousel-3', 'dotContainer-3', '.Yaakovs-section__card');
});
