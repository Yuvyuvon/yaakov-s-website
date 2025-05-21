document.addEventListener('DOMContentLoaded', () => {
  function setupCarousel(carouselId, dotContainerId, cardSelector) {
    const carousel = document.getElementById(carouselId);
    const dotContainer = document.getElementById(dotContainerId);
    const cards = carousel.querySelectorAll(cardSelector);
    const switchLangBtn = document.getElementById('switchLang');

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

  // Navigation toggle
  // This function toggles the side navigation menu

  function toggleNav() {
    const nav = document.getElementById('sideNav');
    nav.classList.add('open');
  }

  function closeNav() {
    const nav = document.getElementById('sideNav');
    nav.classList.remove('open');
  }

  // Language switch
  function switchLang() {
    showLoaderAndRedirect();
  }

  function showLoaderAndRedirect() {
    // Show loader
    const text = document.querySelector('.loading-text');
    const bg = document.querySelector('.bg');

    let load = 0;
    text.style.display = 'block';
    bg.style.display = 'block';

    let int = setInterval(() => {
      load++;

      if (load > 99) {
        clearInterval(int);
        // Redirect after loader completes
        const current = window.location.pathname;
        window.location.href = current.includes('index-en')
          ? 'index.html'
          : 'index-en.html';
      }

      text.innerText = `${load}%`;
      text.style.opacity = scale(load, 0, 100, 1, 0);
      bg.style.filter = `blur(${scale(load, 0, 100, 30, 0)}px)`;
    }, 30);
  }

  const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  };

  // Initialize both carousels
  setupCarousel('carousel-1', 'dotContainer-1', '.pictures-of-something__card');
  setupCarousel('carousel-2', 'dotContainer-2', '.pictures-of-center__card');
  setupCarousel('carousel-3', 'dotContainer-3', '.Yaakovs-section__card');
  document.getElementById('hamburger').addEventListener('click', toggleNav);
  document.getElementById('closeNav').addEventListener('click', closeNav);
  document.getElementById('switchLang').addEventListener('click', switchLang);
});
