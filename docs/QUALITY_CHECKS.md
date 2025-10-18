# 🛡️ Vérifications de qualité du code

## Configuration TypeScript Strict

Le projet utilise TypeScript en mode strict avec des vérifications additionnelles pour garantir la qualité et la sécurité du code.

### Options activées

#### Strict Type-Checking

- ✅ `strict`: Active toutes les vérifications strictes
- ✅ `noImplicitAny`: Interdit les types `any` implicites
- ✅ `strictNullChecks`: Vérification stricte de null/undefined
- ✅ `strictFunctionTypes`: Vérification stricte des types de fonctions
- ✅ `strictBindCallApply`: Vérification stricte de bind/call/apply
- ✅ `strictPropertyInitialization`: Propriétés de classe doivent être initialisées
- ✅ `noImplicitThis`: Interdit `this` implicite
- ✅ `alwaysStrict`: Mode strict JavaScript activé

#### Additional Checks

- ✅ `noUnusedLocals`: Erreur sur variables locales non utilisées
- ✅ `noUnusedParameters`: Erreur sur paramètres non utilisés
- ✅ `noImplicitReturns`: Toutes les branches doivent retourner une valeur
- ✅ `noFallthroughCasesInSwitch`: Interdit les switch fallthrough
- ✅ `noUncheckedIndexedAccess`: Accès aux index vérifiés (undefined possible)
- ✅ `noImplicitOverride`: Mot-clé `override` requis
- ✅ `noPropertyAccessFromIndexSignature`: Accès propriétés index signatures sécurisé

## Pre-commit Hook avec Husky

Le projet utilise Husky et lint-staged pour valider le code **avant chaque commit**.

### Vérifications automatiques

#### Pour les fichiers TypeScript (_.ts, _.tsx)

1. **ESLint** avec auto-correction
   ```bash
   eslint --fix
   ```
2. **TypeScript type checking**
   ```bash
   tsc --noEmit --pretty
   ```

#### Pour les fichiers JavaScript (_.js, _.jsx)

1. **ESLint** avec auto-correction
   ```bash
   eslint --fix
   ```

#### Pour les fichiers JSON et Markdown (_.json, _.md)

1. **Prettier** formatage automatique
   ```bash
   prettier --write
   ```

### Workflow d'un commit

```bash
# 1. Vous modifiez des fichiers
# 2. Vous stagez vos changements
git add .

# 3. Vous tentez un commit
git commit -m "feat: nouvelle fonctionnalité"

# 4. Husky déclenche automatiquement :
#    - Sauvegarde de l'état actuel (git stash)
#    - Exécution ESLint sur fichiers stagés
#    - Correction automatique des erreurs fixables
#    - Vérification TypeScript (types)
#
# 5a. Si tout est OK :
#     - Les corrections sont appliquées
#     - Le commit est créé
#     - État restauré
#
# 5b. Si erreurs non fixables :
#     - Le commit est bloqué ❌
#     - État restauré (rollback)
#     - Vous devez corriger les erreurs
```

### Exemple de commit bloqué

```bash
$ git commit -m "test: add feature"

✖ tsc --noEmit --pretty:
test.ts:7:9 - error TS2322: Type 'string' is not assignable to type 'number'.

7   const age: number = "not a number";
          ~~~

Found 1 error in test.ts:7

husky - pre-commit script failed (code 1)
```

Le commit est **bloqué** jusqu'à correction de l'erreur.

## Commandes utiles

### Vérification manuelle

```bash
# Vérifier les types TypeScript
pnpm type-check

# Linter le code
pnpm lint

# Vérifier uniquement les fichiers modifiés
pnpm lint-staged
```

### Contourner le hook (déconseillé)

```bash
# En cas d'urgence uniquement
git commit --no-verify -m "message"
```

⚠️ **Ne pas utiliser** sauf en cas d'urgence absolue. Les erreurs TypeScript peuvent casser la production.

## Configuration Prettier

Le projet utilise Prettier pour le formatage automatique des fichiers JSON et Markdown.

### Règles de formatage

- Indentation : 2 espaces
- Point-virgule : Oui
- Guillemets : Doubles
- Largeur ligne : 80 caractères
- Fin de ligne : LF (Unix)

### Fichier `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "always"
}
```

## Fichiers ignorés

### `.prettierignore`

- `node_modules/`
- `.next/`
- `pnpm-lock.yaml`
- Fichiers de build et cache

## Bénéfices

### ✅ Qualité du code

- Détection précoce des erreurs de types
- Code uniforme et formaté automatiquement
- Moins de bugs en production

### ✅ Productivité

- Corrections automatiques (ESLint)
- Pas besoin de relecture manuelle du formatage
- Prévention des erreurs avant PR

### ✅ Collaboration

- Code cohérent entre tous les développeurs
- Standards partagés et appliqués automatiquement
- Moins de discussions sur le style de code

## Dépannage

### Le hook ne se déclenche pas

```bash
# Réinstaller Husky
pnpm prepare
```

### Erreurs TypeScript trop strictes

Si les vérifications strict posent problème temporairement :

1. **Option 1** : Corriger le code (recommandé)
2. **Option 2** : Utiliser des types explicites

   ```typescript
   // Au lieu de
   const data = fetchData(); // Type inconnu

   // Utiliser
   const data: UserData = fetchData();
   ```

3. **Option 3** : Type assertion (en dernier recours)
   ```typescript
   const data = fetchData() as UserData;
   ```

### Performance lente du pre-commit

Si le pre-commit est trop lent :

```bash
# Vérifier uniquement les fichiers TypeScript modifiés
# (déjà configuré dans lint-staged)
```

La configuration actuelle ne vérifie que les fichiers **stagés**, pas tout le projet.

## Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
