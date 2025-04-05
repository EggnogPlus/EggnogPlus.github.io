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

// Utility functions
function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;
    let r, g, b;
    if (h < 1/6) [r, g, b] = [c, x, 0];
    else if (h < 2/6) [r, g, b] = [x, c, 0];
    else if (h < 3/6) [r, g, b] = [0, c, x];
    else if (h < 4/6) [r, g, b] = [0, x, c];
    else if (h < 5/6) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [Math.floor((r + m) * 255), Math.floor((g + m) * 255), Math.floor((b + m) * 255)];
}

function getAsciiChar(value) {
    const idx = Math.min(Math.floor(value * ASCII_CHARS.length), ASCII_CHARS.length - 1);
    return ASCII_CHARS[idx];
}

function smoothStep(x) {
    return x * x * (3 - 2 * x);
}

// Initial ASCII file frame
function generateInitialAsciiFile() {
    const grid = [];
    for (let y = 0; y < HEIGHT; y++) {
        const row = ' '.repeat(WIDTH);
        const colors = Array(WIDTH).fill([180, 180, 180]);
        grid.push([row, colors]);
    }
    return grid;
}

// Animation frame
function generateAnimationFrame(timePassed) {
    const grid = [];
    const centerX = Math.floor(WIDTH / 2);
    const centerY = Math.floor(HEIGHT / 2);
    const flowSpeed = 0.8;
    const timeFactor = timePassed * flowSpeed;
    const textXStart = centerX - Math.floor(TARGET_TEXT.length / 2);
    const textProgress = smoothStep(Math.min(1.0, (timePassed - 5) / 12));
    const baseHue = (timePassed * 0.01) % 1.0;

    for (let y = 0; y < HEIGHT; y++) {
        let row = '';
        const colors = [];
        for (let x = 0; x < WIDTH; x++) {
            const nx = x / WIDTH - 0.5;
            const ny = y / HEIGHT - 0.5;
            const angle = Math.atan2(ny, nx);
            const dist = Math.sqrt(nx * nx + ny * ny) * 8.0;

            let flow = 0;
            flow += 0.5 * Math.sin(dist - timeFactor);
            flow += 0.25 * Math.sin(dist * 2 + angle * 2 - timeFactor * 1.1);
            flow += 0.125 * Math.sin(dist * 4 + angle * 4 - timeFactor * 1.2);

            const noise = Math.random() * 0.3 - 0.15;
            let value = (flow + 1) / 2 + noise;
            value = Math.max(0, Math.min(1, value));

            if (Math.abs(y - centerY) < 2 && x >= textXStart && x < textXStart + TARGET_TEXT.length) {
                const charIndex = x - textXStart;
                const charRevealThreshold = textProgress - (0.05 * Math.abs(charIndex - TARGET_TEXT.length / 2));
                if (Math.random() < charRevealThreshold) {
                    row += TARGET_TEXT[charIndex];
                    colors.push([230, 230, 255]);
                    continue;
                }
            }

            row += getAsciiChar(value);
            const hue = (baseHue + nx * 0.1 + ny * 0.1) % 1.0;
            const saturation = 0.1 + 0.2 * value;
            const brightness = 0.5 + 0.5 * value;
            colors.push(hsvToRgb(hue, saturation, brightness));
        }
        grid.push([row, colors]);
    }
    return grid;
}

// Blend frames
function blendFrames(frame1, frame2, blendFactor) {
    const blended = [];
    for (let i = 0; i < HEIGHT; i++) {
        const [row1, colors1] = frame1[i];
        const [row2, colors2] = frame2[i];
        let blendedRow = '';
        const blendedColors = [];
        for (let j = 0; j < WIDTH; j++) {
            blendedRow += Math.random() < blendFactor ? row2[j] : row1[j];
            const [r1, g1, b1] = colors1[j];
            const [r2, g2, b2] = colors2[j];
            const r = Math.floor(r1 * (1 - blendFactor) + r2 * blendFactor);
            const g = Math.floor(g1 * (1 - blendFactor) + g2 * blendFactor);
            const b = Math.floor(b1 * (1 - blendFactor) + b2 * blendFactor);
            blendedColors.push([r, g, b]);
        }
        blended.push([blendedRow, blendedColors]);
    }
    return blended;
}

// Render frame
function renderFrame(grid) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${CELL_SIZE}px 'Courier New', Courier, monospace`;
    for (let y = 0; y < HEIGHT; y++) {
        const [row, colors] = grid[y];
        for (let x = 0; x < WIDTH; x++) {
            ctx.fillStyle = `rgb(${colors[x][0]}, ${colors[x][1]}, ${colors[x][2]})`;
            ctx.fillText(row[x], x * CELL_SIZE, (y + 1) * CELL_SIZE);
        }
    }
}

// Main animation loop
const startTime = Date.now() / 1000;
let initialFrame = generateInitialAsciiFile();

function animate() {
    const timePassed = Date.now() / 1000 - startTime;

    if (timePassed < 5) {
        if (Math.random() < 0.1) {
            const y = Math.floor(Math.random() * HEIGHT);
            const xStart = Math.floor(Math.random() * (WIDTH - 20));
            const xEnd = Math.min(xStart + Math.floor(Math.random() * 10) + 5, WIDTH);
            const newSegment = Array(xEnd - xStart).fill().map(() => 'abcdefghijklmnopqrstuvwxyz0123456789_=+-*/()[]{}.,:;! '[Math.floor(Math.random() * 43)]);
            const newColors = newSegment.map(char => char.match(/[a-z]/i) ? [220, 220, 170] : char.match(/\d/) ? [180, 180, 100] : char.match(/[+\-*=]/) ? [220, 220, 220] : [180, 180, 180]);
            initialFrame[y][0] = initialFrame[y][0].slice(0, xStart) + newSegment.join('') + initialFrame[y][0].slice(xEnd);
            initialFrame[y][1].splice(xStart, xEnd - xStart, ...newColors);
        }
        renderFrame(initialFrame);
    } else if (timePassed < 10) {
        const blendFactor = (timePassed - 5) / 5;
        const animationFrame = generateAnimationFrame(timePassed);
        const blendedFrame = blendFrames(initialFrame, animationFrame, blendFactor);
        renderFrame(blendedFrame);
    } else {
        const animationFrame = generateAnimationFrame(timePassed);
        renderFrame(animationFrame);
    }

    requestAnimationFrame(animate);
}

animate();