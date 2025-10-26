/**
 * Script Lighthouse Audit
 * Execute un audit complet de performance, accessibilité, best practices et SEO
 * Génère des rapports HTML et JSON
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const AUDIT_URL = process.env.AUDIT_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../lighthouse-reports');

// Créer le dossier de rapports s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log(`🚀 Démarrage de l'audit Lighthouse pour ${AUDIT_URL}...`);

  // Lancer Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });

  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(AUDIT_URL, options);

    // Extraire les scores
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    };

    // Afficher les scores
    console.log('\n📊 Résultats de l\'audit Lighthouse:');
    console.log('─'.repeat(50));
    console.log(`⚡ Performance:      ${scores.performance}/100 ${getScoreEmoji(scores.performance)}`);
    console.log(`♿ Accessibilité:    ${scores.accessibility}/100 ${getScoreEmoji(scores.accessibility)}`);
    console.log(`✅ Best Practices:   ${scores.bestPractices}/100 ${getScoreEmoji(scores.bestPractices)}`);
    console.log(`🔍 SEO:              ${scores.seo}/100 ${getScoreEmoji(scores.seo)}`);
    console.log('─'.repeat(50));

    // Identifier les problèmes critiques
    const issues = [];
    if (scores.performance < 90) issues.push('Performance');
    if (scores.accessibility < 95) issues.push('Accessibilité');
    if (scores.bestPractices < 90) issues.push('Best Practices');
    if (scores.seo < 90) issues.push('SEO');

    if (issues.length > 0) {
      console.log(`\n⚠️  Catégories nécessitant amélioration: ${issues.join(', ')}`);
    } else {
      console.log('\n✨ Tous les objectifs sont atteints!');
    }

    // Sauvegarder les rapports
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const htmlPath = path.join(OUTPUT_DIR, `report-${timestamp}.html`);
    const jsonPath = path.join(OUTPUT_DIR, `report-${timestamp}.json`);

    fs.writeFileSync(htmlPath, runnerResult.report[0]);
    fs.writeFileSync(jsonPath, JSON.stringify(lhr, null, 2));

    console.log(`\n📄 Rapports sauvegardés:`);
    console.log(`   HTML: ${htmlPath}`);
    console.log(`   JSON: ${jsonPath}`);

    // Générer un résumé markdown
    const summaryPath = path.join(OUTPUT_DIR, `summary-${timestamp}.md`);
    const summary = generateMarkdownSummary(lhr, scores, timestamp);
    fs.writeFileSync(summaryPath, summary);
    console.log(`   Summary: ${summaryPath}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    throw error;
  } finally {
    await chrome.kill();
  }
}

function getScoreEmoji(score) {
  if (score >= 90) return '✅';
  if (score >= 50) return '⚠️';
  return '❌';
}

function generateMarkdownSummary(lhr, scores, timestamp) {
  const audits = lhr.audits;

  let md = `# Lighthouse Audit Report\n\n`;
  md += `**Date**: ${new Date(timestamp).toLocaleString('fr-FR')}\n`;
  md += `**URL**: ${lhr.finalDisplayedUrl}\n\n`;

  md += `## 📊 Scores Globaux\n\n`;
  md += `| Catégorie | Score | Statut |\n`;
  md += `|-----------|-------|--------|\n`;
  md += `| ⚡ Performance | ${scores.performance}/100 | ${getScoreEmoji(scores.performance)} |\n`;
  md += `| ♿ Accessibilité | ${scores.accessibility}/100 | ${getScoreEmoji(scores.accessibility)} |\n`;
  md += `| ✅ Best Practices | ${scores.bestPractices}/100 | ${getScoreEmoji(scores.bestPractices)} |\n`;
  md += `| 🔍 SEO | ${scores.seo}/100 | ${getScoreEmoji(scores.seo)} |\n\n`;

  // Performance Metrics
  md += `## ⚡ Métriques de Performance\n\n`;
  md += `| Métrique | Valeur |\n`;
  md += `|----------|--------|\n`;

  const metrics = {
    'first-contentful-paint': 'First Contentful Paint',
    'largest-contentful-paint': 'Largest Contentful Paint',
    'total-blocking-time': 'Total Blocking Time',
    'cumulative-layout-shift': 'Cumulative Layout Shift',
    'speed-index': 'Speed Index',
  };

  Object.entries(metrics).forEach(([key, label]) => {
    if (audits[key]) {
      const value = audits[key].displayValue || audits[key].numericValue;
      md += `| ${label} | ${value} |\n`;
    }
  });

  // Opportunités d'amélioration
  md += `\n## 🎯 Opportunités d'Amélioration\n\n`;

  const opportunities = Object.values(audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity')
    .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
    .slice(0, 5);

  if (opportunities.length > 0) {
    opportunities.forEach(opp => {
      const savings = opp.displayValue || '';
      md += `- **${opp.title}** ${savings}\n`;
      if (opp.description) {
        md += `  ${opp.description}\n`;
      }
      md += `\n`;
    });
  } else {
    md += `Aucune opportunité majeure identifiée.\n\n`;
  }

  // Diagnostics
  md += `## 🔍 Diagnostics\n\n`;

  const diagnostics = Object.values(audits)
    .filter(audit => audit.score !== null && audit.score < 1 && audit.details?.type === 'table')
    .slice(0, 5);

  if (diagnostics.length > 0) {
    diagnostics.forEach(diag => {
      md += `- **${diag.title}** (Score: ${Math.round(diag.score * 100)}/100)\n`;
      if (diag.description) {
        md += `  ${diag.description}\n`;
      }
      md += `\n`;
    });
  }

  // Accessibilité
  if (scores.accessibility < 95) {
    md += `## ♿ Points d'Accessibilité à Améliorer\n\n`;

    const a11yIssues = Object.values(audits)
      .filter(audit => {
        const cat = lhr.categories.accessibility.auditRefs.find(ref => ref.id === audit.id);
        return cat && audit.score !== null && audit.score < 1;
      })
      .slice(0, 5);

    a11yIssues.forEach(issue => {
      md += `- **${issue.title}**\n`;
      if (issue.description) {
        md += `  ${issue.description}\n`;
      }
      md += `\n`;
    });
  }

  return md;
}

// Exécuter l'audit
runAudit()
  .then(() => {
    console.log('\n✅ Audit terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Audit échoué:', error);
    process.exit(1);
  });
