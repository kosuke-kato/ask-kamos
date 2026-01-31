let nodes = [];
let thinkingFactor = 0;
let targetThinkingFactor = 0;
const NODE_COUNT = 120; // Significantly increased for a denser matrix
const MAX_DIST = 250;  // Slightly tightened distance to maintain clarity
let pulses = [];

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node(i));
    }
    background(0);
}

function draw() {
    thinkingFactor = lerp(thinkingFactor, targetThinkingFactor, 0.05);

    // Slight trail for data motion - further slowed for better persistence
    background(0, 20);

    // Draw connections
    strokeWeight(0.8);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let d = dist(nodes[i].pos.x, nodes[i].pos.y, nodes[j].pos.x, nodes[j].pos.y);
            if (d < MAX_DIST) {
                let alpha = map(d, 0, MAX_DIST, 50 + thinkingFactor * 80, 0);
                let hue = lerpColor(nodes[i].color, nodes[j].color, 0.5);
                stroke(red(hue), green(hue), blue(hue), alpha);
                line(nodes[i].pos.x, nodes[i].pos.y, nodes[j].pos.x, nodes[j].pos.y);

                // Significantly reduced pulse spawn rate to keep it clean
                if (random() < 0.0005 + thinkingFactor * 0.005) {
                    pulses.push(new Pulse(nodes[i], nodes[j]));
                }
            }
        }
    }

    // Update and draw pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update(thinkingFactor);
        pulses[i].display();
        if (pulses[i].done) pulses.splice(i, 1);
    }

    // Draw nodes
    for (let n of nodes) {
        n.update(thinkingFactor);
        n.display(thinkingFactor);
    }
}

window.setThinking = (isThinking) => {
    targetThinkingFactor = isThinking ? 1 : 0;
};

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Node {
    constructor(id) {
        this.id = id;
        this.pos = createVector(random(width), random(height));
        this.noiseOffset = createVector(random(1000), random(1000));

        let r = random();
        if (r < 0.33) this.color = color(245, 158, 11); // Yellow
        else if (r < 0.66) this.color = color(249, 115, 22); // Orange
        else this.color = color(236, 72, 153); // Pink

        this.size = random(2, 4);
    }

    update(factor) {
        let speed = 0.001 + factor * 0.003;
        this.noiseOffset.add(speed, speed);

        let nx = noise(this.noiseOffset.x, this.id * 0.1);
        let ny = noise(this.noiseOffset.y, this.id * 0.1 + 100);

        let tx = map(nx, 0.2, 0.8, -100, width + 100);
        let ty = map(ny, 0.2, 0.8, -100, height + 100);

        this.pos.x = lerp(this.pos.x, tx, 0.01);
        this.pos.y = lerp(this.pos.y, ty, 0.01);
    }

    display(factor) {
        noStroke();
        // Minimal subtle glow - much smaller than before
        fill(red(this.color), green(this.color), blue(this.color), 20 + factor * 30);
        circle(this.pos.x, this.pos.y, this.size * 2 + (factor * 2));

        // Tiny sharp core
        fill(255, 150 + factor * 105);
        circle(this.pos.x, this.pos.y, 1.5);
    }
}

class Pulse {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.pct = 0;
        this.speed = random(0.02, 0.06); // Faster, zippy pulses
        this.color = lerpColor(start.color, end.color, 0.5);
        this.done = false;
    }

    update(factor) {
        this.pct += this.speed * (1 + factor * 1.2);
        if (this.pct >= 1) this.done = true;
    }

    display() {
        let x = lerp(this.start.pos.x, this.end.pos.x, this.pct);
        let y = lerp(this.start.pos.y, this.end.pos.y, this.pct);

        noStroke();
        // Sharp data packet
        fill(255);
        circle(x, y, 2);

        // Trailing glow for the packet
        fill(red(this.color), green(this.color), blue(this.color), 180);
        circle(x, y, 4);
    }
}
