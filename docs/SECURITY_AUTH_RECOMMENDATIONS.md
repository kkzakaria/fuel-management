# Recommandations de sécurité - Authentification

**Date**: 2025-11-06
**Priorité**: WARN - Améliorations recommandées
**Source**: Analyse Supabase Database Advisor

---

## 📋 Résumé

Deux problèmes de sécurité liés à l'authentification ont été identifiés par l'analyse Supabase. Ces problèmes ne sont pas critiques mais doivent être résolus pour renforcer la sécurité du système.

---

## 🔐 1. Protection contre les mots de passe divulgués (DÉSACTIVÉE)

### Problème

La protection contre les mots de passe compromis est actuellement désactivée. Cette fonctionnalité empêche l'utilisation de mots de passe qui ont été divulgués dans des violations de données connues.

### Impact

- **Sécurité**: Les utilisateurs peuvent choisir des mots de passe connus pour être compromis
- **Risque**: Augmentation du risque de piratage de compte par attaque par dictionnaire
- **Conformité**: Non-respect des bonnes pratiques de sécurité modernes

### Solution

Activer la protection contre les mots de passe divulgués dans la configuration Supabase Auth.

#### Étapes à suivre:

1. **Via le Dashboard Supabase**:
   - Accéder à: Authentication > Settings
   - Section "Password Strength"
   - Activer: **"Check passwords against Have I Been Pwned"**

2. **Via SQL** (alternative):

   ```sql
   -- Note: Cette configuration se fait généralement via le dashboard
   -- Contactez le support Supabase pour activer via API si nécessaire
   ```

3. **Configuration recommandée**:
   - ✅ Activer "Check passwords against Have I Been Pwned"
   - ✅ Définir une longueur minimale: 8 caractères (actuellement configuré)
   - ✅ Exiger au moins une majuscule, une minuscule, un chiffre

### Référence

- [Documentation Supabase - Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Have I Been Pwned](https://haveibeenpwned.com/)

---

## 🔒 2. Options d'authentification multi-facteurs insuffisantes (MFA)

### Problème

Le projet n'a pas suffisamment d'options MFA activées, ce qui affaiblit la sécurité des comptes.

### Impact

- **Sécurité**: Vulnérabilité accrue au vol de mots de passe
- **Accès critique**: Pas de protection supplémentaire pour les comptes admin/gestionnaire
- **Conformité**: Non-respect des standards de sécurité pour applications critiques

### Solution

Activer plusieurs méthodes d'authentification multi-facteurs (MFA).

#### Options MFA recommandées:

**1. TOTP (Time-based One-Time Password)** - PRIORITÉ HAUTE

- Applications: Google Authenticator, Authy, 1Password
- Avantages: Fonctionne hors ligne, pas de dépendance réseau
- Configuration:
  ```typescript
  // Dans votre configuration Supabase
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });
  ```

**2. SMS** - PRIORITÉ MOYENNE

- Avantages: Familier pour les utilisateurs
- Inconvénients: Coûts SMS, dépendance réseau mobile
- Configuration nécessaire: Fournisseur SMS (Twilio, etc.)

**3. Email Magic Links** - DÉJÀ DISPONIBLE

- Supabase supporte nativement les magic links
- Peut servir de méthode MFA secondaire

#### Plan d'implémentation recommandé:

**Phase 1 - Configuration Backend** (Via Dashboard Supabase):

1. Accéder à: Authentication > Settings > MFA
2. Activer: **"Time-based One-Time Password (TOTP)"**
3. Configurer les paramètres:
   - Durée de validité du code: 30 secondes (standard)
   - Nombre de tentatives: 3 maximum

**Phase 2 - Implémentation Frontend** (À développer):

```typescript
// lib/auth-mfa.ts - Fonctions utilitaires MFA

import { createClient } from "@/lib/supabase/client";

/**
 * Enregistrer un nouveau facteur MFA TOTP
 */
export async function enrollMFA() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Transport Manager App",
  });

  if (error) throw error;

  return {
    qrCode: data.totp.qr_code, // QR code à afficher
    secret: data.totp.secret, // Secret de secours
    id: data.id,
  };
}

/**
 * Vérifier le code MFA et terminer l'enregistrement
 */
export async function verifyMFAEnrollment(factorId: string, code: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (error) throw error;

  const { data: verifyData, error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code,
    });

  if (verifyError) throw verifyError;

  return verifyData;
}

/**
 * Vérifier le code MFA lors de la connexion
 */
export async function challengeMFA(factorId: string, code: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (error) throw error;

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: data.id,
    code,
  });

  if (verifyError) throw verifyError;

  return true;
}

/**
 * Lister les facteurs MFA actifs
 */
export async function listMFAFactors() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) throw error;

  return data;
}

/**
 * Désactiver un facteur MFA
 */
export async function unenrollMFA(factorId: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) throw error;
}
```

**Phase 3 - Interface Utilisateur** (Pages à créer):

1. **Page d'activation MFA**: `app/(dashboard)/parametres/securite/mfa/page.tsx`
   - Afficher QR code pour TOTP
   - Champ de vérification du code
   - Instructions d'utilisation

2. **Page de connexion MFA**: `app/(auth)/login-mfa/page.tsx`
   - Déclenchée après connexion par mot de passe
   - Champ de saisie du code TOTP
   - Lien "Problème avec le code ?"

3. **Page de gestion MFA**: `app/(dashboard)/parametres/securite/page.tsx`
   - Liste des méthodes MFA actives
   - Bouton "Ajouter une méthode"
   - Bouton "Désactiver" pour chaque méthode
   - Codes de récupération

**Phase 4 - Politiques MFA**:

```typescript
// Règles métier recommandées

const MFA_POLICIES = {
  // Rôles nécessitant MFA obligatoire
  REQUIRED_ROLES: ["admin", "gestionnaire"],

  // Rôles avec MFA optionnelle
  OPTIONAL_ROLES: ["chauffeur", "personnel"],

  // Délai avant obligation MFA (jours)
  GRACE_PERIOD_DAYS: 30,

  // Actions sensibles nécessitant re-vérification MFA
  SENSITIVE_ACTIONS: [
    "delete_user",
    "change_role",
    "export_data",
    "modify_subcontractor_payment",
  ],
};
```

#### Stratégie de déploiement:

**Semaine 1-2**: Configuration backend + développement frontend
**Semaine 3**: Tests internes avec admins
**Semaine 4**: Déploiement progressif:

- Jour 1-7: Admins (obligatoire)
- Jour 8-14: Gestionnaires (obligatoire)
- Jour 15+: Autres rôles (optionnel, recommandé)

### Référence

- [Documentation Supabase - MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [TOTP Standard (RFC 6238)](https://datatracker.ietf.org/doc/html/rfc6238)

---

## 📊 Priorités d'implémentation

| Fonctionnalité                     | Priorité   | Effort               | Impact | Délai recommandé |
| ---------------------------------- | ---------- | -------------------- | ------ | ---------------- |
| Protection mots de passe divulgués | 🔴 Haute   | Faible (config)      | Élevé  | Immédiat         |
| MFA TOTP                           | 🟡 Moyenne | Moyen (2-3 semaines) | Élevé  | 1 mois           |
| MFA SMS                            | 🟢 Basse   | Élevé (intégration)  | Moyen  | Futur            |

---

## ✅ Checklist de déploiement

### Configuration Supabase (Backend)

- [ ] Activer "Check passwords against Have I Been Pwned"
- [ ] Activer MFA TOTP dans les paramètres Auth
- [ ] Configurer les paramètres MFA (durée codes, tentatives)
- [ ] Tester en environnement de développement

### Développement Frontend

- [ ] Créer `lib/auth-mfa.ts` avec fonctions utilitaires
- [ ] Créer page d'activation MFA
- [ ] Créer page de connexion MFA
- [ ] Créer page de gestion MFA
- [ ] Implémenter validation Zod pour codes MFA
- [ ] Ajouter gestion d'erreurs appropriée

### Tests

- [ ] Test unitaire: Enregistrement MFA
- [ ] Test unitaire: Vérification code MFA
- [ ] Test E2E: Flux complet d'activation MFA
- [ ] Test E2E: Connexion avec MFA
- [ ] Test E2E: Désactivation MFA
- [ ] Test des codes de récupération

### Documentation

- [ ] Mettre à jour CLAUDE.md avec nouvelles fonctionnalités
- [ ] Créer guide utilisateur MFA (français)
- [ ] Documenter processus de récupération de compte
- [ ] Mettre à jour schéma d'architecture

### Déploiement

- [ ] Notification aux utilisateurs (7 jours avant)
- [ ] Déploiement progressif selon rôles
- [ ] Support utilisateur disponible
- [ ] Monitoring des erreurs MFA
- [ ] Collecte de feedback utilisateurs

---

## 🔗 Ressources additionnelles

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [Best Practices for Password Security](https://www.cisecurity.org/insights/white-papers/best-practices-password-security)

---

## 📝 Notes

- Ces recommandations sont basées sur l'analyse Supabase Database Advisor du 2025-11-06
- L'implémentation MFA est particulièrement importante pour la Côte d'Ivoire où la sécurité des données financières (paiements sous-traitants) est critique
- Considérer la connectivité intermittente en Côte d'Ivoire: TOTP (hors ligne) est préférable à SMS
- Les migrations de base de données pour les problèmes de performance/sécurité RLS ont été créées séparément
