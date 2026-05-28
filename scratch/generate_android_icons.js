const sharp = require('c:/Desktop/ExoticBasket/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = 'c:/Desktop/ExoticBasket/ios/ExoticBasket/Images.xcassets/AppIcon.appiconset/icon-1024.png';
const androidResDir = 'c:/Desktop/ExoticBasket/android/app/src/main/res';

const targets = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generate() {
  console.log('Generating Android App Icons...');
  
  if (!fs.existsSync(sourceIcon)) {
    console.error(`Source icon not found at: ${sourceIcon}`);
    process.exit(1);
  }

  // Read source icon into a buffer to prevent file lock issues
  const sourceBuffer = fs.readFileSync(sourceIcon);

  for (const target of targets) {
    const destFolder = path.join(androidResDir, target.folder);
    
    // Ensure folder exists
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    // Generate square icon
    const squareDestPath = path.join(destFolder, 'ic_launcher.png');
    console.log(`Generating ${target.folder}/ic_launcher.png (${target.size}x${target.size})...`);
    await sharp(sourceBuffer)
      .resize(target.size, target.size)
      .toFile(squareDestPath);

    // Generate round icon (creating a circular crop)
    const roundDestPath = path.join(destFolder, 'ic_launcher_round.png');
    console.log(`Generating ${target.folder}/ic_launcher_round.png (${target.size}x${target.size})...`);
    
    const circleSvg = Buffer.from(
      `<svg><circle cx="${target.size/2}" cy="${target.size/2}" r="${target.size/2}" /></svg>`
    );
    
    await sharp(sourceBuffer)
      .resize(target.size, target.size)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .toFile(roundDestPath);
  }

  console.log('Successfully generated Android icons!');
}

generate().catch(err => {
  console.error('Error generating Android icons:', err);
  process.exit(1);
});
