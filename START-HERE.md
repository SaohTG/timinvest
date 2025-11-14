# 🎯 COMMENCER ICI - TimInvest

## 🚀 Déploiement Rapide avec Portainer

### Pour les Impatients ⚡

**Sur Windows:**
```powershell
.\deploy.ps1
```

**Sur Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

Puis ouvrez : **http://localhost:8547** 🎉

---

## 📚 Documentation Disponible

| Fichier | Description | Pour Qui |
|---------|-------------|----------|
| **QUICKSTART-PORTAINER.md** | Guide de démarrage ultra-rapide (5 min) | ⭐ Débutants |
| **PORTAINER.md** | Documentation complète Portainer | Utilisateurs Portainer |
| **DOCKER-GUIDE.md** | Guide complet Docker | Utilisateurs Docker avancés |
| **INSTALLATION.md** | Installation développement local | Développeurs |
| **README.md** | Documentation générale | Tout le monde |

---

## 🎯 Choix de Déploiement

### Option 1 : Portainer (Recommandé) 🌟

**Avantages:**
- Interface graphique simple
- Gestion visuelle des conteneurs
- Monitoring intégré
- Parfait pour production

**Qui :** Déploiement serveur avec interface graphique

👉 Suivez : `QUICKSTART-PORTAINER.md`

### Option 2 : Docker Compose

**Avantages:**
- Simple et rapide
- Ligne de commande
- Portable

**Qui :** Utilisateurs à l'aise avec le terminal

👉 Commande : `docker-compose up -d --build`

### Option 3 : Développement Local

**Avantages:**
- Modifications en temps réel
- Développement actif
- Hot reload

**Qui :** Développeurs

👉 Suivez : `INSTALLATION.md`

---

## ⚡ Démarrage Ultra-Rapide

### 1. Avec Script Automatique

**Windows PowerShell:**
```powershell
.\deploy.ps1
```

**Linux/Mac Bash:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. Avec Makefile

```bash
make install
```

### 3. Avec Docker Compose

```bash
docker-compose up -d --build
```

### 4. Pour Portainer

1. Construisez l'image :
   ```bash
   docker build -t timinvest:latest .
   ```

2. Ouvrez Portainer → Stacks → Add Stack

3. Copiez le contenu de `docker-compose.portainer.yml`

4. Cliquez sur "Deploy the stack"

---

## 📱 Accès à l'Application

Après déploiement :

- **Dev Local:** http://localhost:5847
- **Docker:** http://localhost:8547
- **Serveur:** http://IP-DU-SERVEUR:8547

---

## 🛠️ Commandes Essentielles

```bash
# Voir les logs
docker logs -f timinvest

# Redémarrer
docker restart timinvest

# Arrêter
docker stop timinvest

# État
docker ps | grep timinvest

# Sauvegarder les données
make backup
```

---

## 🆘 Besoin d'Aide ?

### Problème de démarrage ?

```bash
# Voir les erreurs
docker logs timinvest

# Reconstruire
docker build --no-cache -t timinvest:latest .
```

### Port 3000 occupé ?

Modifiez dans `docker-compose.yml` :
```yaml
ports:
  - "9999:3000"  # Utilisera le port 9999
```

### Vérifier que Docker fonctionne

```bash
docker --version
docker ps
```

---

## ✅ Checklist de Déploiement

- [ ] Docker installé et lancé
- [ ] Image construite (`docker build -t timinvest:latest .`)
- [ ] Conteneur lancé (`docker-compose up -d` ou Portainer)
- [ ] Application accessible sur http://localhost:8547 (Docker) ou http://localhost:5847 (Dev)
- [ ] Ajout d'une action de test dans Portfolio
- [ ] Vérification des prix en temps réel sur Dashboard

---

## 🎓 Fonctionnalités Principales

1. **Dashboard** - Vue d'ensemble de votre portefeuille
2. **Portfolio** - Gestion de vos actions
3. **Dividendes** - Calendrier de revenus

### Premier Test

1. Allez dans **Portfolio**
2. Cliquez "Ajouter une action"
3. Recherchez "AAPL"
4. Entrez : Quantité = 10, Prix = 150€
5. Retournez au **Dashboard** → Voyez vos stats ! 📊

---

## 🚀 C'est Parti !

Choisissez votre méthode de déploiement et suivez le guide correspondant.

**Recommandation :** Commencez par `QUICKSTART-PORTAINER.md` si vous utilisez Portainer ! 🌟

---

## 📞 Support

Pour toute question :
1. Consultez les logs : `docker logs timinvest`
2. Vérifiez la documentation appropriée
3. Assurez-vous que Docker fonctionne correctement

Bonne gestion de votre patrimoine ! 💰📈

