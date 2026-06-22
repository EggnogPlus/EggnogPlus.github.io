// Constants
const ASCII_CHARS = [' ', '.', ',', '-', '~', '+', '=', '*', '#', '%', '@'];
const TARGET_TEXT = "EGGNOGPLUS";
const CELL_SIZE = 12;

// Canvas setup
const canvas = document.getElementById('asciiCanvas');
const ctx = canvas.getContext('2d');
let WIDTH, HEIGHT;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WIDTH = Math.floor(canvas.width / CELL_SIZE);
    HEIGHT = Math.floor(canvas.height / CELL_SIZE);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Easing
function smoothStep(x) {
    return x * x * (3 - 2 * x);
}

// Map a 0–1 value to an ASCII character
function getAsciiChar(value) {
    const idx = Math.min(Math.floor(value * ASCII_CHARS.length), ASCII_CHARS.length - 1);
    return ASCII_CHARS[idx];
}

// Render directly to canvas — no intermediate grid allocation
function renderFrame(timePassed) {
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;

    // Vortex spins up from still over the first 5 seconds
    const spinup = smoothStep(Math.min(1.0, timePassed / 5.0));

    // Text reveals character by character from center outward,
    // starting at t = 4s and completing at t = 10s
    const textProgress = Math.max(0, (timePassed - 4) / 6);
    const textXStart = Math.floor(centerX - TARGET_TEXT.length / 2);
    const textY = Math.floor(centerY);
    const centerCharOffset = (TARGET_TEXT.length - 1) / 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${CELL_SIZE}px 'Courier New', Courier, monospace`;

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
            // Avoid division by zero right at the centre
            const normalizedDist = Math.max(0.001, dist / maxDist);
            const angle = Math.atan2(dy, dx);

            // ── Text reveal ────────────────────────────────────────────
            // Each letter appears when textProgress exceeds its distance
            // from the centre of the word, so they fan out from the middle.
            if (y === textY && x >= textXStart && x < textXStart + TARGET_TEXT.length) {
                const charIndex = x - textXStart;
                const charDist = Math.abs(charIndex - centerCharOffset) / centerCharOffset;
                if (textProgress > charDist * 0.85) {
                    ctx.fillStyle = 'rgb(245, 245, 255)';
                    ctx.fillText(TARGET_TEXT[charIndex], x * CELL_SIZE, (y + 1) * CELL_SIZE);
                    continue;
                }
            }

            // ── Vortex rotation ────────────────────────────────────────
            // Two components:
            //   baseOmega  – a uniform rotation so the whole field moves together
            //   diffOmega  – extra speed at the centre, decaying outward
            //                this creates the whirlpool / drain effect
            const baseOmega = 0.18 * spinup;
            const diffOmega = 0.15 * spinup / (normalizedDist + 0.25);
            const twistedAngle = angle - timePassed * (baseOmega + diffOmega);

            // ── Storm texture ──────────────────────────────────────────
            // Three overlapping sine waves in polar space produce spiral
            // arms with fine cross-hatch detail — similar to Midjourney's
            // layered character storm.
            const wave1 = Math.sin(twistedAngle * 2 - normalizedDist * 8);
            const wave2 = Math.sin(twistedAngle * 3 - normalizedDist * 14) * 0.45;
            // Third wave drifts very slowly on its own, adding breathing motion
            const wave3 = Math.sin(twistedAngle - normalizedDist * 3 - timePassed * 0.08 * spinup) * 0.25;

            let value = ((wave1 + wave2 + wave3) / 1.7 + 1) / 2;

            // Shift the range upward so spaces are rare — the storm should
            // feel dense, not sparse
            value = value * 0.80 + 0.12;

            // Tiny noise keeps it feeling organic without drowning the pattern
            value += (Math.random() - 0.5) * 0.04;
            value = Math.max(0, Math.min(1, value));

            const char = getAsciiChar(value);

            // ── Colour ────────────────────────────────────────────────
            // Monochrome base with a subtle blue lift on the brightest chars,
            // keeping the palette cool and distinct from the white text.
            const brightness = Math.floor(25 + value * 155);
            const blueBoost  = Math.floor(value * value * 30);
            ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${Math.min(255, brightness + blueBoost)})`;
            ctx.fillText(char, x * CELL_SIZE, (y + 1) * CELL_SIZE);
        }
    }
}

// ── Animation loop ─────────────────────────────────────────────────────────
const startTime = Date.now() / 1000;

function animate() {
    const timePassed = Date.now() / 1000 - startTime;
    renderFrame(timePassed);
    requestAnimationFrame(animate);
}

animate();