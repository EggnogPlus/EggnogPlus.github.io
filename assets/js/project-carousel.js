/**
 * Initializes and controls an auto-scrolling carousel with navigation dots.
 * @param {string} id - The ID of the carousel element.
 */
function autoScrollCarousel(id) {
    const carousel = document.getElementById(id);
    if (!carousel) {
        console.error(`Carousel with ID ${id} not found.`);
        return;
    }

    const container = carousel.querySelector('.carousel-container');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (!container || !dotsContainer) {
        console.error(`Carousel container or dots not found in carousel with ID ${id}.`);
        return;
    }

    const slides = Array.from(container.children);
    if (slides.length === 0) {
        console.error(`No slides found in carousel with ID ${id}.`);
        return;
    }

    // Set container and slide widths
    container.style.width = `${slides.length * 100}%`;
    slides.forEach(slide => {
        slide.style.width = `${100 / slides.length}%`;
    });

    let currentIndex = 0;
    let intervalId = null;
    let isTransitioning = false;
    const totalSlides = slides.length;
    const transitionDuration = 500; // Matches CSS transition (0.5s)

    // Create navigation dots
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            clearInterval(intervalId);
            currentIndex = i;
            updateCarousel();
            startAutoScroll();
        });
        dotsContainer.appendChild(dot);
    });

    /**
     * Updates the carousel to show the current slide and manage video playback.
     */
    function updateCarousel() {
        if (isTransitioning) return;
        isTransitioning = true;

        // Slide to current index
        container.style.transform = `translateX(-${(100 / totalSlides) * currentIndex}%)`;

        // Update active dot
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // Manage video playback
        slides.forEach((slide, i) => {
            if (slide.tagName === 'VIDEO') {
                i === currentIndex
                    ? slide.play().catch(e => console.error(`Video play failed: ${e}`))
                    : slide.pause();
            }
        });

        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, transitionDuration);
    }

    /**
     * Advances to the next slide and restarts auto-scroll.
     */
    function slide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
        clearInterval(intervalId);
        startAutoScroll();
    }

    /**
     * Starts auto-scrolling with dynamic intervals for video slides.
     */
    function startAutoScroll() {
        clearInterval(intervalId);
        const isVideoSlide = (id === 'carousel2' && currentIndex === 0) ||
            (id === 'carousel4' && [0, 1, 2].includes(currentIndex));
        const interval = isVideoSlide ? 8000 : 4000; // 8s for videos, 4s for images
        intervalId = setInterval(slide, interval);
    }

    // Initialize auto-scrolling
    startAutoScroll();

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', startAutoScroll);

    // Reset transition flag on completion
    container.addEventListener('transitionend', () => {
        isTransitioning = false;
    });
}

// Initialize carousels on page load
document.addEventListener('DOMContentLoaded', () => {
    ['carousel1', 'carousel2', 'carousel3', 'carousel4', 'carousel5', 'carousel6'].forEach(autoScrollCarousel);
});