# ❓ FAQ - Questions Fréquentes - TimInvest

## 🔍 Recherche d'actions

### Je cherche "Esso" mais ça me propose "ES.PA" qui ne fonctionne pas

**Problème :** ES.PA n'est pas un symbole valide.

**Solution :** **Esso** est le nom historique d'**ExxonMobil**, une entreprise américaine.

✅ **Symbole correct :** `XOM`  
✅ **ISIN :** `US30231G1022`  
✅ **Nom complet :** ExxonMobil Corporation

**Comment ajouter :**
1. Portfolio → Ajouter une action
2. Cherchez **"ExxonMobil"** ou **"Esso"**
3. Sélectionnez **XOM**
4. Ou collez l'ISIN : `US30231G1022`

---

### Le prix actuel reste identique au prix d'achat

**Causes possibles :**

#### 1. L'action a été ajoutée il y a moins de 60 secondes
- Le cache se rafraîchit toutes les 60 secondes
- **Solution :** Attendez 1 minute et rechargez

#### 2. Symbole invalide (ex: ES.PA)
- L'API ne trouve pas de prix
- **Solution :** Utilisez le bon symbole (voir guide ci-dessous)

#### 3. Marché fermé
- Les prix ne changent pas quand la bourse est fermée
- **Solution :** Normal ! Testez pendant les heures d'ouverture

#### 4. Action non supportée par l'API
- Certaines actions peuvent ne pas être dans Twelve Data
- **Solution :** Vérifiez les logs Docker pour voir l'erreur exacte

**Vérification :**
```bash
docker logs timinvest | grep "Twelve Data"
```

Vous devriez voir :
```
[Twelve Data] ✓ XOM: 105.50 USD  ← Prix reçu ✅
[Twelve Data] ✗ ES.PA: ...      ← Symbole invalide ❌
```

---

### Comment savoir si un symbole est correct ?

**Méthode 1 : Cherchez par ISIN** ⭐
- L'ISIN est toujours correct
- Vous le trouvez sur votre relevé bancaire
- Collez-le dans TimInvest

**Méthode 2 : Consultez le guide**
- Ouvrez [`SYMBOLS-GUIDE.md`](SYMBOLS-GUIDE.md)
- 100+ symboles avec leur ISIN

**Méthode 3 : Cherchez par nom d'entreprise**
- Tapez le nom complet : "ExxonMobil", "LVMH", "Santander"
- La base locale vous proposera le bon symbole

---

## 📊 Symboles invalides courants

| ❌ Symbole invalide | ✅ Symbole correct | Entreprise |
|--------------------|-------------------|------------|
| `ES.PA` | `XOM` | ExxonMobil (Esso) |
| `ESSO` | `XOM` | ExxonMobil (Esso) |
| `LVMH` | `MC.PA` | LVMH |
| `TOTAL` | `TTE.PA` | TotalEnergies |
| `SAN` (seul) | `SAN.MC` ou `SAN.PA` | Santander (ES) ou Sanofi (FR) |
| `BP` (seul) | `BP.L` | BP (UK) |

---

## 💰 Pourquoi les prix ne se mettent pas à jour ?

### Checklist de diagnostic :

- [ ] **Symbole correct ?** → Vérifiez dans SYMBOLS-GUIDE.md
- [ ] **Marché ouvert ?** → NYSE: 15h30-22h (heure FR), Euronext: 9h-17h30
- [ ] **Cache expiré ?** → Attendez 60 secondes après ajout
- [ ] **API fonctionne ?** → Vérifiez les logs Docker
- [ ] **Quota API OK ?** → 8 req/min max sur Twelve Data

### Heures d'ouverture des bourses (heure de Paris) :

| Bourse | Heures d'ouverture |
|--------|-------------------|
| 🇺🇸 NYSE/NASDAQ | 15h30 - 22h00 |
| 🇫🇷 Euronext Paris | 09h00 - 17h30 |
| 🇪🇸 Madrid | 09h00 - 17h30 |
| 🇩🇪 Xetra | 09h00 - 17h30 |
| 🇬🇧 London | 09h00 - 17h30 |

**Si le marché est fermé, le prix affiché est le dernier prix de clôture.**

---

## 🔧 API et Limites

### Twelve Data (API principale)

**Plan gratuit :**
- ✅ 8 requêtes/minute
- ✅ 800 requêtes/jour
- ✅ Vraiment temps réel

**Optimisations TimInvest :**
- Cache de 60 secondes
- Batching de 5 requêtes
- Avec 10 actions = ~10 req/heure (très loin de la limite)

### Si vous atteignez la limite :

**Symptôme :**
```
[Twelve Data] ✗ Error: Rate limit exceeded
[Fallback] Trying Finnhub...
```

**Solution :**
- Le système bascule automatiquement sur Finnhub
- Augmentez le cache (60s → 120s)
- Ou attendez 1 minute

---

## 🌐 Actions internationales

### Comment ajouter une action française ?

**Toujours utiliser le suffixe .PA :**

| Entreprise | ❌ Incorrect | ✅ Correct |
|------------|-------------|-----------|
| LVMH | `MC` ou `LVMH` | `MC.PA` |
| Total | `TTE` ou `TOTAL` | `TTE.PA` |
| BNP | `BNP` | `BNP.PA` |

**Ou utilisez l'ISIN :**
- LVMH : `FR0000121014`
- Total : `FR0000120271`

### Comment ajouter une action espagnole ?

**Toujours utiliser le suffixe .MC :**

| Entreprise | ❌ Incorrect | ✅ Correct |
|------------|-------------|-----------|
| Santander | `SAN` ou `ES.PA` | `SAN.MC` |
| BBVA | `BBVA` | `BBVA.MC` |
| Telefonica | `TEF` | `TEF.MC` |

---

## 🐛 Problèmes courants

### "Failed to fetch ES.PA"

**Cause :** ES.PA n'existe pas. C'est un symbole invalide.

**Solution :** 
- Si vous cherchez Esso → utilisez `XOM` (ExxonMobil)
- Si vous cherchez une action espagnole → utilisez `.MC` (ex: `SAN.MC`)

### "No valid price data"

**Causes :**
1. Symbole invalide ou inexistant
2. Action non cotée sur les marchés publics
3. Action suspendue de cotation
4. Problème temporaire de l'API

**Solution :**
- Vérifiez le symbole dans SYMBOLS-GUIDE.md
- Testez avec une action populaire (AAPL, MC.PA)
- Consultez les logs Docker

### Les graphiques sont vides

**Cause :** Aucune action dans le portfolio

**Solution :**
1. Ajoutez au moins 1 action
2. Attendez 60 secondes
3. Rechargez la page

---

## 💡 Astuces

### Astuce 1 : Testez avec Apple
Pour vérifier que tout fonctionne :
1. Ajoutez `AAPL` (Apple)
2. Prix d'achat : 150
3. Quantité : 10
4. Attendez 60 secondes
5. Le prix actuel devrait être ~150-160 (prix réel du marché)

### Astuce 2 : Utilisez l'ISIN quand disponible
- Plus fiable que les symboles
- Toujours sur vos relevés bancaires
- Pas de confusion possible

### Astuce 3 : Cherchez toujours par nom
- "Apple" plutôt que "AAPL"
- "LVMH" plutôt que "MC.PA"
- "ExxonMobil" ou "Esso" plutôt que "XOM"

---

## 📞 Support et Logs

### Voir les logs détaillés

**Via Docker :**
```bash
docker logs -f timinvest
```

**Via Portainer :**
- Containers → timinvest → Logs

### Logs utiles à rechercher :

```bash
# Voir les appels API
docker logs timinvest | grep "Twelve Data"

# Voir les erreurs
docker logs timinvest | grep "Error"

# Voir les stats API
docker logs timinvest | grep "API Stats"
```

---

## 🎯 Résumé : Rechercher "Esso"

### ✅ Méthode correcte :

**Option 1 : Par nom**
1. Cherchez "ExxonMobil" ou "Esso"
2. Sélectionnez **XOM - ExxonMobil Corporation (Esso)**

**Option 2 : Par symbole**
1. Entrez `XOM`

**Option 3 : Par ISIN**
1. Collez `US30231G1022`

### ❌ À éviter :
- ❌ ES.PA (n'existe pas)
- ❌ ESSO (seul)
- ❌ Symboles sans recherche préalable

---

## 🎉 En cas de doute

**Consultez les guides :**
- [`SYMBOLS-GUIDE.md`](SYMBOLS-GUIDE.md) - Tous les symboles
- [`API-ALTERNATIVES.md`](API-ALTERNATIVES.md) - Informations API
- [`MIGRATION-TWELVE-DATA.md`](MIGRATION-TWELVE-DATA.md) - Migration API

**Ou cherchez directement par ISIN !** C'est la méthode la plus sûre. 🎯

