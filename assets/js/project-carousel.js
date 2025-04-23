function autoScrollCarousel(id) {
    const carousel = document.getElementById(id);
    let index = 0;
    setInterval(() => {
        const total = carousel.children.length;
        index = (index + 1) % total;
        carousel.style.transform = `translateX(-${100 * index}%)`;
    }, 3000);
}

// Initialize for each carousel
autoScrollCarousel("carousel1");
// Add more here if needed, e.g.:
// autoScrollCarousel("carousel2");
