// sketch.js
let textString = "think of nothing, think of wind";
let chars = [];
let swingAngles = [], swingVelocities = [], noiseOffsets = [], sounds = [], playedFlags = [];
let fontSize = 32;
let baseY;

let swingStrength = 0.5;
let damping = 0.9;
let maxWaveOffset;

let hangOffsets = [
  18, 15, 22, 15, 10,
  22,
  15, 20,
  22,
  15, 15, 15, 15, 22, 15, 15,
  1,
  22,
  18, 15, 22, 15, 10,
  22,
  15, 20,
  23,
  15, 22, 15, 15
];

let charToSound = {
  't': 'sound/G2.mp3',
  'h': 'sound/G3.mp3',
  'i': 'sound/G4.mp3',
  'n': 'sound/G5.mp3',
  'k': 'sound/G6.mp3',
  'o': 'sound/G7.mp3',
  'f': 'sound/G8.mp3',
  ',': 'sound/F1.mp3',
  'g': 'sound/C8.mp3',
  'w': 'sound/F4.mp3',
  'd': 'sound/F8.mp3'
};

function preload() {
  for (let i = 0; i < textString.length; i++) {
    let char = textString[i].toLowerCase();
    if (char === ' ') {
      sounds.push(null);
    } else {
      let path = charToSound[char];
      if (path) {
        sounds.push(loadSound(path));
      } else {
        sounds.push(null);
      }
    }
    playedFlags.push(false);
  }
}

function setup() {
  createCanvas(1440, 900);
  textAlign(CENTER, BASELINE);
  textSize(fontSize);
  textFont('Times New Roman');

  baseY = height / 2;
  maxWaveOffset = height * 0.075;

  let totalWidth = textWidth(textString);
  let startX = width / 2 - (totalWidth * 2) / 2; //修改间距
  let currentX = startX;

  for (let i = 0; i < textString.length; i++) {
    let char = textString[i];
    let w = textWidth(char);
    let hangOffset = hangOffsets[i] || 25;

    chars.push({
      char: char,
      x: currentX + (w * 2) / 2, //修改间距
      hangOffset: hangOffset,
      waveOffset: map(noise(i * 0.3), 0, 1, -maxWaveOffset, maxWaveOffset)
    });
    currentX += w * 2; //修改间距

    swingAngles.push(0);
    swingVelocities.push(0);
    noiseOffsets.push(random(1000));
  }
}

function draw() {
  background(255);
  fill(0);
  textFont('Times New Roman');
  textSize(fontSize);
  textAlign(CENTER, BASELINE);

  for (let i = 0; i < chars.length; i++) {
    let c = chars[i];
    let dx = c.x - mouseX;
    let maxDist = width / 2;
    let distance = abs(dx);
    let naturalMagnitude = map(distance, 0, maxDist, 4, 0.5, true);

    let nOffset = noiseOffsets[i];
    let naturalSwingX = map(noise(nOffset + frameCount * 0.01), 0, 1, -naturalMagnitude, naturalMagnitude);
    let naturalSwingY = map(noise(nOffset + 100 + frameCount * 0.01), 0, 1, -naturalMagnitude, naturalMagnitude);

    if (mouseIsPressed) {
      let strengthScale = map(abs(dx), 0, maxDist, 1.5, 0.1, true);
      let wind = (dx > 0 ? 1 : -1) * swingStrength * strengthScale;
      swingVelocities[i] += wind;

      if (!playedFlags[i] && sounds[i] && abs(dx) < 10) {
        playedFlags[i] = true;
        sounds[i].play();
      }
    }

    let restoringForce = -swingAngles[i] * 0.02;
    swingVelocities[i] += restoringForce;
    swingVelocities[i] *= damping;
    swingAngles[i] += swingVelocities[i];

    let swingX = swingAngles[i] + naturalSwingX;
    let swingY = naturalSwingY;
    let finalX = c.x + swingX;
    let finalY = baseY + swingY + c.waveOffset - 50;

    if (c.char !== ' ') {
      let textTop = baseY - c.hangOffset + swingY + c.waveOffset - 50;
      stroke(0);
      strokeWeight(0.2);
      line(c.x, 0, finalX, textTop);
    }

    noStroke();
    fill(0);
    text(c.char, finalX, finalY);
  }
}

function mouseReleased() {
  for (let i = 0; i < playedFlags.length; i++) {
    playedFlags[i] = false;
  }
}