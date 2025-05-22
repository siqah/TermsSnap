const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Base64 encoded icon (simple document with checkmark)
const base64Icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjZmZmZmZmIj48cGF0aCBkPSJNNDY0IDEyOEgyNzJjLTI2LjUgMC00OC0yMS41LTQ4LTQ4VjBjLTEzLjMgMC0yNCAxMC43LTI0IDI0djgwYzAgMTMuMyAxMC43IDI0IDI0IDI0aDE5MmMxMy4zIDAgMjQtMTAuNyAyNC0yNHMtMTAuNy0yNC0yNC0yNHpNNDE2IDQ4SDE0NGMtMjYuNSAwLTQ4IDIxLjUtNDggNDh2MzUyYzAgMjYuNSAyMS41IDQ4IDQ4IDQ4aDIyNGMyNi41IDAgNDgtMjEuNSA0OC00OFYxNzZjMC0yNi41LTIxLjUtNDgtNDgtNDh6bS05NiAxOTJIMTQ0Yy0xMy4zIDAtMjQtMTAuNy0yNC0yNHMxMC43LTI0IDI0LTI0aDE3NmMxMy4zIDAgMjQgMTAuNyAyNCAyNHMtMTAuNyAyNC0yNCAyNHptMC0xMjhIMTQ0Yy0xMy4zIDAtMjQtMTAuNy0yNC0yNHMxMC43LTI0IDI0LTI0aDE3NmMxMy4zIDAgMjQgMTAuNyAyNCAyNHMtMTAuNyAyNC0yNCAyNHoiLz48L3N2Zz4=';

// Sizes needed for Chrome extensions
const sizes = [16, 48, 128];

// Generate icons
async function generateIcons() {
  const image = await loadImage(base64Icon);
  
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create a blue background
    ctx.fillStyle = '#1a73e8';
    ctx.fillRect(0, 0, size, size);
    
    // Draw the icon in white
    ctx.fillStyle = '#ffffff';
    ctx.drawImage(image, size * 0.1, size * 0.1, size * 0.8, size * 0.8);
    
    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(imagesDir, `icon${size}.png`), buffer);
    
    // Create active version (different color)
    ctx.fillStyle = '#0d47a1';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.drawImage(image, size * 0.1, size * 0.1, size * 0.8, size * 0.8);
    
    const activeBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(imagesDir, `icon_active${size}.png`), activeBuffer);
    
    console.log(`Generated icons for size ${size}px`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
