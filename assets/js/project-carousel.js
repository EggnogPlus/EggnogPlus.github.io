function autoScrollCarousel(id) {
    const carousel = document.getElementById(id);
    if (!carousel) {
        console.error(`Carousel with ID ${id} not found.`);
        return;
    }

    const container = carousel.querySelector('.carousel-container');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (!container || !dotsContainer) {
        console.error(`Carousel container or dots container not found in carousel with ID ${id}.`);
        return;
    }

    const slides = container.children;
    if (slides.length === 0) {
        console.error(`No slides found in carousel with ID ${id}.`);
        return;
    }

    let index = 0;
    const total = slides.length;
    let intervalId = null;
    let isTransitioning = false;

    // Create dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            clearInterval(intervalId);
            index = i;
            updateCarousel();
            startAutoScroll();
        });
        dotsContainer.appendChild(dot);
    }
    console.log(`Created ${total} dots for carousel ${id}`);

    function updateCarousel() {
        isTransitioning = true;
        container.style.transform = `translateX(-${100 * index}%)`;
        // Update active dot
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        // Manage video playback
        for (let i = 0; i < total; i++) {
            const slide = slides[i];
            if (slide.tagName === 'VIDEO') {
                if (i === index) {
                    slide.play().catch(e => console.error(`Video play failed: ${e}`));
                } else {
                    slide.pause();
                }
            }
        }
        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 500); // Match CSS transition duration (0.5s)
    }

    function slide() {
        index = (index + 1) % total;
        updateCarousel();
        clearInterval(intervalId); // Clear existing interval
        startAutoScroll(); // Start new interval with updated timing
    }

    function startAutoScroll() {
        clearInterval(intervalId);
        // Set longer interval for video slide (index 0 for carousel2)
        const isVideoSlide = id === 'carousel2' && index === 0;
        const interval = isVideoSlide ? 8000 : 4000; // 8s for video, 4s for images
        intervalId = setInterval(slide, interval);
    }

    // Start auto-scrolling
    startAutoScroll();

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', () => startAutoScroll());

    // Handle transition end
    container.addEventListener('transitionend', () => {
        isTransitioning = false;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    autoScrollCarousel('carousel1');
    autoScrollCarousel('carousel2');
    autoScrollCarousel('carousel3');
    autoScrollCarousel('carousel4');
});