#!/usr/bin/env node
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = 'public/logo-suivi-carburant.png';
const outputDir = 'public/icons';

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...');

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 139, alpha: 1 } // Fond bleu comme l'original
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Créé: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${size}x${size}:`, error.message);
    }
  }

  // Générer favicon.ico (32x32)
  console.log('\n🎨 Génération du favicon...');
  try {
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 139, alpha: 1 }
      })
      .png()
      .toFile('app/favicon.ico');

    console.log('✅ Créé: app/favicon.ico');
  } catch (error) {
    console.error('❌ Erreur favicon:', error.message);
  }

  // Générer apple-touch-icon (180x180)
  console.log('\n🎨 Génération de l\'icône Apple...');
  try {
    await sharp(inputPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 139, alpha: 1 }
      })
      .png()
      .toFile('public/apple-touch-icon.png');

    console.log('✅ Créé: public/apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Erreur apple-touch-icon:', error.message);
  }

  console.log('\n✨ Génération terminée!');
}

generateIcons().catch(console.error);
