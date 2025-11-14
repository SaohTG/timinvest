# 🐳 TimInvest - Déploiement Docker & Portainer

## 🎯 Déploiement Ultra-Simplifié

### 🚀 En 3 Commandes

```bash
# 1. Construire l'image
docker build -t timinvest:latest .

# 2. Lancer le conteneur
docker-compose up -d

# 3. Ouvrir dans le navigateur
# http://localhost:3000
```

**C'EST TOUT ! ✅**

---

## 📚 Documentation Complète

| Guide | Contenu | Temps |
|-------|---------|-------|
| **START-HERE.md** | Point de départ | 1 min |
| **QUICKSTART-PORTAINER.md** | Portainer rapide | 5 min |
| **PORTAINER.md** | Documentation complète Portainer | 15 min |
| **BUILD.md** | Guide de construction | 10 min |
| **DOCKER-GUIDE.md** | Guide Docker complet | 20 min |

---

## 🎬 Déploiement Portainer Pas à Pas

### Prérequis
- ✅ Docker installé
- ✅ Portainer installé

### Étape 1 : Construire l'Image (5 min)

**Sur votre machine locale :**

```bash
# Cloner ou naviguer vers le projet
cd timinvest

# Construire l'image
docker build -t timinvest:latest .
```

### Étape 2 : Ouvrir Portainer (1 min)

Accédez à votre instance Portainer :
```
http://localhost:9000
```
(ou l'adresse de votre serveur Portainer)

### Étape 3 : Créer la Stack (2 min)

1. **Menu gauche** → Cliquez sur **Stacks**
2. Cliquez sur **+ Add stack**
3. **Name** : `timinvest`
4. Sélectionnez **Web editor**
5. Copiez le contenu du fichier **`PORTAINER-STACK.yml`**
6. Cliquez sur **Deploy the stack**

### Étape 4 : Accéder à l'Application (1 min)

Attendez 30 secondes puis ouvrez :
```
http://localhost:3000
```
(ou http://IP-DU-SERVEUR:3000)

---

## 🎨 Configuration

### Changer le Port

Dans le fichier de stack, modifiez :

```yaml
ports:
  - "8080:3000"  # Au lieu de "3000:3000"
```

### Utiliser Votre Domaine

```yaml
environment:
  - NEXT_PUBLIC_APP_URL=https://invest.votredomaine.com
```

Puis configurez votre reverse proxy (Nginx/Traefik).

### Variables d'Environnement

```yaml
environment:
  - NODE_ENV=production
  - FINNHUB_API_KEY=votre_cle_api  # Votre clé API Finnhub
  - NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL de votre app
```

---

## 📊 Monitoring dans Portainer

### Vue d'Ensemble

Dans Portainer, vous verrez :

**Containers** :
- 🟢 `timinvest` - Status: **running** | Health: **healthy**

**Volumes** :
- 💾 `timinvest-data` - Vos données (actions et dividendes)

**Networks** :
- 🌐 `timinvest-network` - Réseau de l'application

### Consulter les Logs

1. **Containers** → **timinvest**
2. Cliquez sur **Logs**
3. Activez **Auto-refresh** pour voir en temps réel

### Statistiques

1. **Containers** → **timinvest**
2. Cliquez sur **Stats**

Vous verrez :
- 📊 CPU Usage
- 💾 Memory Usage
- 🌐 Network I/O
- 💿 Block I/O

---

## 🔄 Opérations Courantes

### Redémarrer l'Application

**Dans Portainer :**
1. **Containers** → **timinvest**
2. Cliquez sur **Restart**

**En ligne de commande :**
```bash
docker restart timinvest
```

### Mettre à Jour l'Application

1. Reconstruisez l'image :
   ```bash
   docker build -t timinvest:latest .
   ```

2. Dans Portainer :
   - **Stacks** → **timinvest**
   - Cliquez sur **Update the stack**
   - Activez **Re-pull image and redeploy**
   - Cliquez sur **Update**

### Sauvegarder les Données

**Méthode 1 : Avec le Makefile**
```bash
make backup
```

**Méthode 2 : Manuelle**
```bash
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

### Restaurer les Données

```bash
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

---

## 🛠️ Commandes Rapides

```bash
# Voir les logs en temps réel
docker logs -f timinvest

# Entrer dans le conteneur
docker exec -it timinvest sh

# Voir le statut
docker ps | grep timinvest

# Redémarrer
docker restart timinvest

# Arrêter
docker stop timinvest

# Démarrer
docker start timinvest

# Supprimer (attention aux données !)
docker rm -f timinvest
```

---

## 🌐 Accès depuis Internet

### Option 1 : Ouvrir le Port

```bash
# Sur votre firewall/routeur
Ouvrir le port 3000 TCP
Rediriger vers l'IP de votre serveur
```

### Option 2 : Reverse Proxy (Recommandé)

**Nginx :**

```nginx
server {
    listen 80;
    server_name invest.votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Traefik :**

Ajoutez les labels dans la stack :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.timinvest.rule=Host(`invest.votredomaine.com`)"
```

---

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker logs timinvest

# Vérifier la santé
docker inspect --format='{{.State.Health.Status}}' timinvest
```

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

Solution : Changez le port dans la configuration

### L'application ne répond pas

```bash
# Vérifier que le conteneur tourne
docker ps | grep timinvest

# Redémarrer
docker restart timinvest

# Reconstruire si nécessaire
docker build --no-cache -t timinvest:latest .
```

### Problème de données

```bash
# Vérifier le volume
docker volume inspect timinvest-data

# Vérifier les permissions
docker exec timinvest ls -la /app/data
```

---

## 📦 Architecture Docker

### Multi-Stage Build

L'image utilise 3 stages :

1. **deps** - Installation des dépendances (~500 MB)
2. **builder** - Compilation de l'app (~800 MB)
3. **runner** - Image finale (~180 MB) ✅

### Optimisations

- ✅ Alpine Linux (légère)
- ✅ Output standalone Next.js
- ✅ User non-root
- ✅ Healthcheck intégré
- ✅ Cache npm optimisé

---

## 🔒 Sécurité

### Bonnes Pratiques Appliquées

1. **User non-root** - L'application tourne avec l'utilisateur `nextjs`
2. **Minimal layers** - Réduction de la surface d'attaque
3. **No secrets in image** - Variables d'environnement
4. **Healthcheck** - Détection des problèmes
5. **Read-only filesystem** - Seul `/app/data` est modifiable

### Recommandations

```yaml
# Limiter les ressources
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

---

## 📈 Performance

### Ressources Recommandées

**Minimum :**
- CPU: 0.5 core
- RAM: 256 MB
- Disk: 1 GB

**Recommandé :**
- CPU: 1 core
- RAM: 512 MB
- Disk: 2 GB

### Temps de Démarrage

- Build initial : 3-5 minutes
- Démarrage conteneur : 15-30 secondes
- Health check : +10 secondes

---

## 🎯 Checklist Complète

### Avant le Déploiement

- [ ] Docker installé et fonctionnel
- [ ] Portainer installé (si utilisé)
- [ ] Image construite (`docker build -t timinvest:latest .`)
- [ ] Port 3000 disponible (ou modifié)
- [ ] Clé API Finnhub configurée

### Après le Déploiement

- [ ] Conteneur running (`docker ps`)
- [ ] Health check healthy
- [ ] Application accessible (http://localhost:3000)
- [ ] Test ajout d'une action
- [ ] Test récupération des prix
- [ ] Backup configuré

---

## 🎉 Prêt pour la Production !

Votre application TimInvest est maintenant :

- ✅ Conteneurisée avec Docker
- ✅ Déployable sur Portainer
- ✅ Optimisée et sécurisée
- ✅ Prête pour production
- ✅ Sauvegardable facilement

---

## 📞 Ressources

| Type | Fichier | Description |
|------|---------|-------------|
| 🚀 Quick Start | `START-HERE.md` | Commencer ici |
| 📘 Guide Portainer | `QUICKSTART-PORTAINER.md` | 5 minutes |
| 🔨 Build | `BUILD.md` | Construction image |
| 📦 Stack | `PORTAINER-STACK.yml` | Fichier pour Portainer |
| 🐳 Docker | `DOCKER-GUIDE.md` | Guide complet |

---

## 🎊 Bonne Gestion de Votre Patrimoine !

TimInvest est maintenant opérationnel 24/7 pour suivre vos investissements en temps réel ! 📈💰

Pour toute question, consultez la documentation appropriée ou les logs Docker.

**Happy Investing! 🚀**

