# 🧪 Test ISIN - Guide de Diagnostic

## ✅ ISIN supportés et leurs symboles

### Actions françaises populaires :

| Entreprise | ISIN | Symbole | Test |
|------------|------|---------|------|
| **Essilor/EssilorLuxottica** | `FR0000120669` | `EL.PA` | ✅ |
| LVMH | `FR0000121014` | `MC.PA` | ✅ |
| L'Oréal | `FR0000120321` | `OR.PA` | ✅ |
| TotalEnergies | `FR0000120271` | `TTE.PA` | ✅ |
| Sanofi | `FR0000120578` | `SAN.PA` | ✅ |
| BNP Paribas | `FR0000131104` | `BNP.PA` | ✅ |

### Actions américaines populaires :

| Entreprise | ISIN | Symbole | Test |
|------------|------|---------|------|
| Apple | `US0378331005` | `AAPL` | ✅ |
| Microsoft | `US5949181045` | `MSFT` | ✅ |
| ExxonMobil (Esso US) | `US30231G1022` | `XOM` | ✅ |

---

## 🔍 Comment tester la recherche ISIN :

### Test 1 : ISIN Essilor

1. **Portfolio** → **Ajouter une action**
2. **Collez exactement :** `FR0000120669`
3. **Résultat attendu :** EssilorLuxottica (EL.PA)

**Si ça ne fonctionne pas, vérifiez les logs Docker :**
```bash
docker logs timinvest | grep ISIN
```

Vous devriez voir :
```
[ISIN] Detected: FR0000120669
[ISIN] FR0000120669 → EL.PA (🇫🇷 France)
[ISIN] Found: EssilorLuxottica
```

---

### Test 2 : ISIN Apple

1. **Collez :** `US0378331005`
2. **Résultat attendu :** Apple Inc. (AAPL)

---

### Test 3 : ISIN avec espaces (devrait fonctionner)

1. **Collez :** `FR 0000 120669` (avec espaces)
2. **Résultat attendu :** Les espaces sont automatiquement enlevés → trouve Essilor

---

## 🐛 Si la recherche ISIN ne fonctionne pas :

### Diagnostic étape par étape :

#### Étape 1 : Vérifier le format ISIN

Format correct : **2 lettres + 10 chiffres/lettres** (12 caractères total)

✅ Correct :
- `FR0000120669` (12 caractères)
- `US0378331005` (12 caractères)

❌ Incorrect :
- `FR0000120669X` (13 caractères)
- `0000120669` (pas de code pays)

#### Étape 2 : Vérifier que l'ISIN est dans la base

**ISIN disponibles dans TimInvest :**

**Actions françaises (25 ISIN) :**
- FR0000120669 → EL.PA (Essilor) ✅
- FR0000121014 → MC.PA (LVMH)
- FR0000120321 → OR.PA (L'Oréal)
- FR0000120271 → TTE.PA (TotalEnergies)
- FR0000120578 → SAN.PA (Sanofi)
- FR0000131104 → BNP.PA (BNP Paribas)
- FR0000121972 → SU.PA (Schneider)
- ... et 18 autres

**Actions américaines (23 ISIN) :**
- US0378331005 → AAPL (Apple)
- US30231G1022 → XOM (ExxonMobil)
- US5949181045 → MSFT (Microsoft)
- ... et 20 autres

**Actions espagnoles (6 ISIN) :**
- ES0113900J37 → SAN.MC (Santander)
- ... et 5 autres

**Total : 70+ ISIN supportés**

#### Étape 3 : Vérifier les logs

Dans les logs Docker, cherchez :
```bash
docker logs timinvest | grep "\[ISIN\]"
```

**Si l'ISIN est détecté :**
```
[ISIN] Detected: FR0000120669
[ISIN] FR0000120669 → EL.PA (🇫🇷 France)
[ISIN] Found: EssilorLuxottica
```

**Si l'ISIN n'est pas dans la base :**
```
[ISIN] FR0000120999 not found in database
```

---

## 🔧 Résolution de problèmes

### Problème 1 : "ISIN non trouvé"

**Cause :** L'ISIN n'est pas dans la base de données.

**Solution :**
1. Vérifiez l'ISIN sur [Euronext](https://live.euronext.com/) ou [Boursorama](https://www.boursorama.com/)
2. Cherchez par **nom d'entreprise** à la place
3. Ou demandez l'ajout de l'ISIN

### Problème 2 : "Format ISIN invalide"

**Cause :** L'ISIN ne respecte pas le format.

**Solution :**
- Vérifiez que c'est bien 12 caractères
- Format : 2 lettres + 10 alphanumériques
- Exemple : `FR0000120669`

### Problème 3 : Recherche ne retourne rien

**Cause :** Peut-être un problème de cache.

**Solution :**
1. Essayez en collant l'ISIN **sans espaces**
2. Rechargez la page
3. Vérifiez les logs Docker

---

## 💡 Clarification : Esso vs Essilor

### Ce sont 2 entreprises DIFFÉRENTES ! ⚠️

| Recherche | Entreprise | Pays | ISIN | Symbole |
|-----------|------------|------|------|---------|
| **"Esso"** | ExxonMobil (pétrole) | 🇺🇸 US | `US30231G1022` | `XOM` |
| **"Essilor"** | EssilorLuxottica (optique) | 🇫🇷 FR | `FR0000120669` | `EL.PA` |

### Esso (ExxonMobil) :
- Compagnie pétrolière américaine
- Symbole : **XOM**
- ISIN : `US30231G1022`
- Bourse : NYSE (New York)

### Essilor (EssilorLuxottica) :
- Fabricant de lunettes français
- Symbole : **EL.PA**
- ISIN : `FR0000120669`
- Bourse : Euronext Paris

---

## ✅ Comment chercher correctement :

### Pour Esso (pétrole américain) :
1. Cherchez **"ExxonMobil"** ou **"Esso"**
2. Ou collez l'ISIN : `US30231G1022`
3. Ou tapez le symbole : `XOM`

### Pour Essilor (lunettes français) :
1. Cherchez **"Essilor"** ou **"EssilorLuxottica"**
2. Ou collez l'ISIN : `FR0000120669` ✅
3. Ou tapez le symbole : `EL.PA`

---

## 🧪 Tests à effectuer :

### Test 1 : Recherche "Essilor"
```
Input: "Essilor"
Expected: EL.PA - EssilorLuxottica
```

### Test 2 : ISIN Essilor
```
Input: FR0000120669
Expected: EL.PA - EssilorLuxottica
```

### Test 3 : ISIN avec espaces
```
Input: FR 0000 120669
Expected: Espaces enlevés automatiquement → EL.PA
```

### Test 4 : Recherche "Esso"
```
Input: "Esso"
Expected: XOM - ExxonMobil Corporation (Esso)
```

---

## 📞 En cas de problème

**Copiez-moi les logs :**
```bash
docker logs timinvest | tail -100
```

Et indiquez :
1. L'ISIN exact que vous cherchez
2. L'entreprise que vous voulez trouver
3. Ce que l'application retourne

Je corrigerai immédiatement ! 🔧

