let particles = [];
let thinkingFactor = 0;
let targetThinkingFactor = 0;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Create more background light streaks since central blob is removed
    for (let i = 0; i < 60; i++) {
        particles.push(new Streak());
    }

    background(0);
}

function draw() {
    // Smoothen thinking transition
    thinkingFactor = lerp(thinkingFactor, targetThinkingFactor, 0.03);

    // Deep space fade
    background(0, 15);

    // Render streaks
    // Thinking factor makes streaks faster/more vibrant
    for (let p of particles) {
        p.update(thinkingFactor);
        p.display(thinkingFactor);
    }
}

window.setThinking = (isThinking) => {
    targetThinkingFactor = isThinking ? 1 : 0;
};

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Sophisticated Light Streaks
class Streak {
    constructor() {
        this.init();
    }

    init() {
        this.pos = createVector(random(width), random(height));
        this.baseVel = createVector(random(-0.3, 0.3), random(-0.1, 0.1));
        this.vel = this.baseVel.copy();
        this.len = random(80, 250);
        this.alpha = random(5, 20);
        this.hue = random() > 0.5 ? color(124, 58, 237) : color(6, 182, 212); // Violet or Cyan
    }

    update(factor) {
        // Streaks accelerate slightly during thinking
        let speedMult = 1 + factor * 2;
        this.pos.add(p5.Vector.mult(this.baseVel, speedMult));

        // Wrap around
        if (this.pos.x < -this.len) this.pos.x = width + this.len;
        if (this.pos.x > width + this.len) this.pos.x = -this.len;
        if (this.pos.y < -this.len) this.pos.y = height + this.len;
        if (this.pos.y > height + this.len) this.pos.y = -this.len;
    }

    display(factor) {
        // Thinking mode increases brightness and line weight slightly
        let weight = 0.5 + factor * 0.5;
        let brightness = this.alpha + factor * 20;

        strokeWeight(weight);
        for (let i = 0; i < 3; i++) {
            stroke(red(this.hue), green(this.hue), blue(this.hue), brightness / (i + 1));
            line(this.pos.x, this.pos.y, this.pos.x + this.len, this.pos.y);
        }
    }
}
