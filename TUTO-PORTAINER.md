# 🚀 TUTORIEL PORTAINER - TimInvest

Guide complet et simple pour déployer TimInvest sur Portainer en 10 minutes !

---

## 📋 Ce dont vous avez besoin

- ✅ Docker installé sur votre machine/serveur
- ✅ Portainer installé (si ce n'est pas fait, voir ci-dessous)
- ✅ 10 minutes de votre temps ⏱️

---

## 🐳 Étape 0 : Installer Portainer (si pas déjà fait)

Si vous n'avez pas encore Portainer, installez-le en 2 commandes :

```bash
# Créer un volume pour Portainer
docker volume create portainer_data

# Installer Portainer
docker run -d -p 9000:9000 -p 9443:9443 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Puis ouvrez **http://localhost:9000** et créez votre compte admin.

---

## 🎯 Méthode Rapide : En 4 étapes

### ✨ Étape 1 : Préparer le déploiement

**Bonne nouvelle !** Avec la méthode GitHub, vous n'avez **pas besoin de construire l'image** manuellement. Portainer va le faire automatiquement depuis le repository ! 🎉

---

### 📦 Étape 2 : Ouvrir Portainer

1. Ouvrez votre navigateur
2. Allez sur **http://localhost:9000** (ou l'IP de votre serveur)
3. Connectez-vous avec vos identifiants Portainer

---

### 🎨 Étape 3 : Créer la Stack

Dans Portainer :

1. **Cliquez sur "Stacks"** dans le menu de gauche
2. **Cliquez sur "+ Add stack"** en haut à droite
3. **Nom de la stack :** `timinvest`
4. **Sélectionnez "Repository"**
5. **Configurez le repository :**
   - **Repository URL :** `https://github.com/SaohTG/timinvest`
   - **Repository reference :** `refs/heads/main`
   - **Compose path :** `docker-compose.portainer.yml`
   - **Authentication :** Laissez vide (repository public)
6. **Cliquez sur "Deploy the stack"**

#### 📋 Alternative : Méthode Web Editor (Manuelle)

Si vous préférez modifier la configuration avant de déployer :

1. **Cliquez sur "Stacks"** dans le menu de gauche
2. **Cliquez sur "+ Add stack"** en haut à droite
3. **Nom de la stack :** `timinvest`
4. **Sélectionnez "Web editor"**
5. **Copiez-collez ce code** dans l'éditeur :

```yaml
version: '3.8'

services:
  timinvest:
    image: timinvest:latest
    container_name: timinvest
    restart: unless-stopped
    ports:
      - "8547:3000"
    environment:
      - NODE_ENV=production
      - FINNHUB_API_KEY=d4b96lhr01qrv4ataf3gd4b96lhr01qrv4ataf40
      - NEXT_PUBLIC_APP_URL=http://localhost:8547
    volumes:
      - timinvest-data:/app/data
    networks:
      - timinvest-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.timinvest.description=Gestion de patrimoine boursier"
      - "com.timinvest.version=1.0.0"

volumes:
  timinvest-data:
    driver: local

networks:
  timinvest-network:
    driver: bridge
```

6. **Cliquez sur "Deploy the stack"** en bas

> 💡 **Astuce :** La méthode Repository est recommandée car elle permet de mettre à jour facilement la stack en un clic depuis GitHub !

---

### 🎉 Étape 4 : Accéder à l'application

⏱️ Attendez environ 30 secondes que le conteneur démarre...

Puis ouvrez votre navigateur sur :

🌐 **http://localhost:8547**

(Ou remplacez `localhost` par l'IP de votre serveur si vous l'avez installé à distance)

---

## ✅ Vérifier que tout fonctionne

Dans Portainer :

1. Allez dans **Containers** (menu de gauche)
2. Vous devriez voir le conteneur **timinvest**
3. Le status doit être : **running** 🟢
4. Le health doit être : **healthy** ✅

### Voir les logs

Si vous voulez voir ce qui se passe :

1. Cliquez sur le conteneur **timinvest**
2. Cliquez sur **Logs**
3. Vous verrez les messages de démarrage

---

## 🔧 Personnalisation

### Changer le port

Si le port 8547 est déjà utilisé, modifiez cette ligne dans la stack :

```yaml
ports:
  - "VOTRE_PORT:3000"  # Exemple : "9999:3000"
```

### Utiliser votre propre clé API Finnhub

1. Créez un compte gratuit sur [Finnhub.io](https://finnhub.io/)
2. Récupérez votre clé API
3. Modifiez dans la stack :

```yaml
environment:
  - FINNHUB_API_KEY=VOTRE_CLE_ICI
```

### Utiliser un domaine personnalisé

Si vous avez un nom de domaine, modifiez :

```yaml
environment:
  - NEXT_PUBLIC_APP_URL=https://invest.votredomaine.com
```

---

## 🛠️ Commandes Utiles

### Dans Portainer (Interface graphique)

| Action | Où ? |
|--------|------|
| **Voir les logs** | Containers → timinvest → Logs |
| **Redémarrer** | Containers → timinvest → Restart |
| **Arrêter** | Containers → timinvest → Stop |
| **Statistiques (CPU/RAM)** | Containers → timinvest → Stats |
| **Supprimer** | Stacks → timinvest → Delete |

### Via Ligne de Commande

```bash
# Voir les logs en temps réel
docker logs -f timinvest

# Redémarrer l'application
docker restart timinvest

# Arrêter l'application
docker stop timinvest

# Relancer l'application
docker start timinvest

# Vérifier l'état
docker ps | grep timinvest
```

---

## 💾 Sauvegarde des Données

Vos données (actions, dividendes) sont stockées dans le volume Docker `timinvest-data`.

### Sauvegarder

```bash
docker run --rm \
  -v timinvest-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/timinvest-backup-$(date +%Y%m%d).tar.gz -C /data .
```

Cela créera un fichier `timinvest-backup-YYYYMMDD.tar.gz` dans votre dossier actuel.

### Restaurer

```bash
docker run --rm \
  -v timinvest-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/timinvest-backup-YYYYMMDD.tar.gz -C /data
```

---

## 🔄 Mettre à Jour l'Application

Quand une nouvelle version est disponible :

### Méthode 1 : Mise à jour depuis GitHub (Si vous avez utilisé "Repository")

**Super simple !** 🚀

1. Allez dans **Stacks** → **timinvest**
2. Cliquez sur **Pull and redeploy**
3. Portainer va automatiquement :
   - Récupérer la dernière version depuis GitHub
   - Reconstruire l'image si nécessaire
   - Redéployer l'application

C'est tout ! L'application est à jour en un clic ! 🎉

### Méthode 2 : Mise à jour manuelle

Si vous avez utilisé la méthode "Web editor" :

1. **Reconstruire l'image localement :**
   ```bash
   # Récupérer les dernières modifications
   git pull
   
   # Reconstruire l'image
   docker build -t timinvest:latest .
   ```

2. **Dans Portainer :**
   - Allez dans **Stacks** → **timinvest**
   - Cliquez sur **Editor**
   - Ne changez rien, cliquez juste sur **Update the stack**
   - Cochez **Re-pull image and redeploy**
   - Cliquez sur **Update**

L'application va redémarrer avec la nouvelle version ! 🎉

---

## 🌐 Accès depuis Internet

Pour accéder à votre application depuis n'importe où :

### Option 1 : Ouvrir le port (Simple mais pas sécurisé)

Sur votre routeur/firewall, ouvrez le port 8547 vers votre serveur.

⚠️ **Non recommandé** pour la production (pas de HTTPS)

### Option 2 : Utiliser un Reverse Proxy (Recommandé)

Utilisez Nginx ou Traefik pour avoir HTTPS automatique.

**Exemple avec Nginx :**

```nginx
server {
    listen 80;
    server_name invest.votredomaine.com;
    
    location / {
        proxy_pass http://localhost:8547;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis utilisez Certbot pour ajouter HTTPS :

```bash
certbot --nginx -d invest.votredomaine.com
```

---

## 🐛 Résolution de Problèmes

### ❌ L'application ne démarre pas

**Vérifier les logs :**
```bash
docker logs timinvest
```

**Problèmes courants :**

1. **Port déjà utilisé**
   - Changez le port dans la stack (ex: `9999:3000`)

2. **Image non trouvée**
   - Reconstruisez l'image : `docker build -t timinvest:latest .`

3. **Erreur de permission**
   ```bash
   docker exec timinvest chown -R nextjs:nodejs /app/data
   ```

### ❌ L'application est lente

**Vérifier les ressources :**

Dans Portainer → Containers → timinvest → Stats

Si la RAM ou CPU sont à 100%, allouez plus de ressources à Docker.

### ❌ Les prix des actions ne se mettent pas à jour

**Vérifier la clé API :**

1. Allez dans les logs : `docker logs timinvest`
2. Cherchez des erreurs liées à l'API Finnhub
3. Vérifiez que votre clé API est valide sur [finnhub.io](https://finnhub.io/)

### ❌ Je ne vois pas mes données après redémarrage

**Vérifier le volume :**

```bash
# Lister les volumes
docker volume ls | grep timinvest

# Inspecter le volume
docker volume inspect timinvest-data
```

Si le volume n'existe pas, il a été supprimé. Restaurez depuis votre backup.

---

## 📊 Monitoring Avancé

### Voir les statistiques en temps réel

Dans Portainer :
- **Containers** → **timinvest** → **Stats**

Vous verrez :
- 📈 CPU Usage
- 💾 Memory Usage
- 🌐 Network I/O
- 💿 Disk I/O

### Health Check

L'application vérifie automatiquement son état toutes les 30 secondes.

Status possible :
- 🟢 **healthy** : Tout va bien
- 🟡 **starting** : Démarrage en cours
- 🔴 **unhealthy** : Problème détecté

---

## 🎓 Premiers Pas avec l'Application

### 1. Ajouter votre première action

1. Ouvrez **http://localhost:8547**
2. Cliquez sur **Portfolio** dans le menu
3. Cliquez sur **Ajouter une action**
4. Recherchez une action (ex: **AAPL** pour Apple)
5. Entrez :
   - Quantité : 10
   - Prix d'achat : 150
   - Date d'achat : (aujourd'hui)
6. Cliquez sur **Ajouter**

### 2. Voir votre dashboard

1. Cliquez sur **Dashboard** dans le menu
2. Vous verrez :
   - 💰 Valeur totale du portefeuille
   - 📈 Plus-value/Moins-value
   - 📊 Graphiques de performance
   - 🎯 Répartition du portefeuille

### 3. Ajouter un dividende

1. Cliquez sur **Dividendes**
2. Cliquez sur **Ajouter un dividende**
3. Remplissez les informations
4. Visualisez votre calendrier de dividendes ! 💵

---

## 🎯 Configuration Avancée

### Limiter les ressources du conteneur

Dans la stack Portainer, ajoutez :

```yaml
services:
  timinvest:
    # ... autres configurations ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Ajouter des labels Traefik

Pour utiliser avec Traefik :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.timinvest.rule=Host(`invest.votredomaine.com`)"
  - "traefik.http.routers.timinvest.entrypoints=websecure"
  - "traefik.http.routers.timinvest.tls.certresolver=letsencrypt"
  - "traefik.http.services.timinvest.loadbalancer.server.port=3000"
```

### Utiliser un registry Docker privé

Si vous avez poussé l'image sur votre registry :

```yaml
services:
  timinvest:
    image: registry.votredomaine.com/timinvest:latest
    # ... reste de la configuration ...
```

---

## 📱 Application Multi-Serveurs

### Déployer sur plusieurs serveurs

1. **Construisez l'image** sur le premier serveur
2. **Sauvegardez l'image** :
   ```bash
   docker save timinvest:latest | gzip > timinvest.tar.gz
   ```
3. **Transférez sur les autres serveurs** :
   ```bash
   scp timinvest.tar.gz user@serveur2:/tmp/
   ```
4. **Chargez l'image** sur chaque serveur :
   ```bash
   docker load < timinvest.tar.gz
   ```
5. **Déployez via Portainer** sur chaque serveur

---

## 🔐 Sécurité

### Bonnes pratiques

1. ✅ **Utilisez HTTPS** avec un reverse proxy
2. ✅ **Changez la clé API** si elle est exposée
3. ✅ **Sauvegardez régulièrement** vos données
4. ✅ **Limitez l'accès** au port Portainer (9000)
5. ✅ **Mettez à jour** Docker et Portainer régulièrement

### Sécuriser Portainer

```bash
# Utiliser HTTPS pour Portainer
docker run -d -p 9443:9443 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  -v /path/to/certs:/certs \
  portainer/portainer-ce:latest \
  --ssl --sslcert /certs/portainer.crt --sslkey /certs/portainer.key
```

---

## 📞 Aide et Support

### Ressources utiles

- 📖 **Documentation Docker** : [docs.docker.com](https://docs.docker.com/)
- 📖 **Documentation Portainer** : [docs.portainer.io](https://docs.portainer.io/)
- 🔑 **API Finnhub** : [finnhub.io/docs/api](https://finnhub.io/docs/api)

### Commandes de diagnostic

```bash
# Vérifier que Docker fonctionne
docker version

# Lister tous les conteneurs
docker ps -a

# Voir l'utilisation des ressources
docker stats timinvest

# Inspecter le conteneur
docker inspect timinvest

# Nettoyer Docker
docker system prune -a
```

---

## 🎉 Félicitations !

Votre application TimInvest est maintenant déployée sur Portainer ! 🚀

Vous pouvez maintenant :
- ✅ Gérer votre portefeuille d'actions
- ✅ Suivre vos dividendes
- ✅ Analyser vos performances
- ✅ Accéder à votre app 24/7

### Prochaines étapes

1. Ajoutez vos premières actions
2. Configurez vos dividendes
3. Explorez le dashboard
4. Partagez avec d'autres utilisateurs (en ajoutant un système d'auth)

---

## 💡 Astuces Pro

### Automatiser les backups

Créez un script cron pour sauvegarder automatiquement :

```bash
#!/bin/bash
# backup-timinvest.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/timinvest"

mkdir -p $BACKUP_DIR

docker run --rm \
  -v timinvest-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/timinvest-$DATE.tar.gz -C /data .

# Garder seulement les 7 derniers backups
cd $BACKUP_DIR && ls -t | tail -n +8 | xargs -r rm
```

Ajoutez au cron :
```bash
crontab -e
# Backup tous les jours à 2h du matin
0 2 * * * /path/to/backup-timinvest.sh
```

### Monitoring avec Prometheus

Pour un monitoring avancé, intégrez Prometheus :

```yaml
version: '3.8'

services:
  timinvest:
    # ... configuration existante ...
    labels:
      - "prometheus-job=timinvest"
  
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

volumes:
  prometheus-data:
```

---

## ✅ Checklist Finale

- [ ] Docker et Portainer installés
- [ ] Image `timinvest:latest` construite
- [ ] Stack déployée dans Portainer
- [ ] Application accessible sur http://localhost:8547
- [ ] Conteneur status = **running**
- [ ] Health check = **healthy**
- [ ] Première action ajoutée au portfolio
- [ ] Backup configuré
- [ ] Accès sécurisé (HTTPS) si accessible depuis Internet

---

## 🚀 Bonne Gestion de Patrimoine !

Profitez de TimInvest pour suivre et optimiser vos investissements boursiers ! 📈💰

**Questions ?** Consultez les logs et la documentation Docker/Portainer.

---

**Dernière mise à jour :** Novembre 2024  
**Version de l'application :** 1.0.0  
**Ports :** Dev: 5847 | Docker: 8547

