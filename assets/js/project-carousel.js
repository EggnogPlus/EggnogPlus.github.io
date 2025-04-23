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

    const images = container.children;
    if (images.length === 0) {
        console.error(`No images found in carousel with ID ${id}.`);
        return;
    }

    let index = 0;
    const total = images.length;
    let intervalId = null;
    let isTransitioning = false;

    // Create dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to image ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (isTransitioning) return; // Ignore clicks during transitions
            clearInterval(intervalId); // Clear existing interval
            index = i;
            updateCarousel();
            startAutoScroll(); // Restart auto-scroll immediately
        });
        dotsContainer.appendChild(dot);
    }
    console.log(`Created ${total} dots for carousel ${id}`); // Debug dot creation

    function updateCarousel() {
        isTransitioning = true;
        container.style.transform = `translateX(-${100 * index}%)`;
        // Update active dot
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 500); // Match CSS transition duration (0.5s)
    }

    function slide() {
        index = (index + 1) % total;
        updateCarousel();
    }

    function startAutoScroll() {
        clearInterval(intervalId); // Ensure no duplicate intervals
        intervalId = setInterval(slide, 4000);
    }

    // Start auto-scrolling
    startAutoScroll();

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', () => startAutoScroll());

    // Handle transition end to ensure smooth updates
    container.addEventListener('transitionend', () => {
        isTransitioning = false;
    });
}

// Run after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    autoScrollCarousel('carousel1');
    autoScrollCarousel('carousel2');
    autoScrollCarousel('carousel3');
    autoScrollCarousel('carousel4');
});
