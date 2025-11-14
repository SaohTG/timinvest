# 🐳 Guide Docker - TimInvest

## 🎯 Vue d'Ensemble

TimInvest peut être déployé avec Docker de plusieurs façons :

1. **Docker Compose** (local ou serveur)
2. **Portainer** (interface graphique)
3. **Docker natif** (commandes manuelles)

## 📁 Fichiers Docker Créés

| Fichier | Description |
|---------|-------------|
| `Dockerfile` | Configuration de l'image Docker (multi-stage build optimisé) |
| `docker-compose.yml` | Configuration pour Docker Compose standard |
| `docker-compose.portainer.yml` | Configuration optimisée pour Portainer |
| `.dockerignore` | Fichiers à exclure de l'image |
| `Makefile` | Commandes simplifiées |
| `deploy.sh` / `deploy.ps1` | Scripts de déploiement automatique |

## 🚀 Méthodes de Déploiement

### Méthode 1 : Scripts Automatiques (Le Plus Simple)

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Méthode 2 : Makefile (Recommandé)

```bash
# Installation complète
make install

# Ou étape par étape
make build    # Construire l'image
make run      # Lancer le conteneur
make logs     # Voir les logs
make stop     # Arrêter
make restart  # Redémarrer

# Gestion des données
make backup   # Sauvegarder
make restore FILE=backup.tar.gz  # Restaurer
```

### Méthode 3 : Docker Compose Manuel

```bash
# Construire et lancer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart
```

### Méthode 4 : Portainer (Interface Graphique)

Voir `QUICKSTART-PORTAINER.md` pour le guide complet.

**Résumé rapide:**
1. Construisez l'image: `docker build -t timinvest:latest .`
2. Ouvrez Portainer → Stacks → Add Stack
3. Copiez le contenu de `docker-compose.portainer.yml`
4. Deploy !

## 🔧 Configuration

### Variables d'Environnement

Modifiez dans `docker-compose.yml` ou `.env.production` :

```yaml
environment:
  - NODE_ENV=production
  - FINNHUB_API_KEY=votre_cle_api
  - NEXT_PUBLIC_APP_URL=http://votre-domaine.com
```

### Changer le Port

Par défaut sur port 3000. Pour changer:

```yaml
ports:
  - "8080:3000"  # Utilisera le port 8080
```

### Volumes et Persistance

Les données sont stockées dans un volume Docker nommé `timinvest-data`.

```bash
# Localiser le volume
docker volume inspect timinvest-data

# Sauvegarder
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restaurer
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## 📊 Monitoring et Logs

### Voir les Logs

```bash
# En temps réel
docker logs -f timinvest

# Dernières 100 lignes
docker logs --tail 100 timinvest

# Avec horodatage
docker logs -t timinvest
```

### Statistiques en Temps Réel

```bash
docker stats timinvest
```

### État de Santé

```bash
docker inspect --format='{{.State.Health.Status}}' timinvest
```

## 🔄 Mise à Jour

### Méthode Simple

```bash
make update
```

### Méthode Manuelle

```bash
# 1. Reconstruire l'image
docker build -t timinvest:latest .

# 2. Redémarrer
docker-compose down
docker-compose up -d
```

## 🌐 Configuration Avancée

### Avec Reverse Proxy (Nginx)

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name invest.votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Avec Traefik (SSL Automatique)

**docker-compose.traefik.yml:**
```yaml
version: '3.8'

services:
  timinvest:
    image: timinvest:latest
    container_name: timinvest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - FINNHUB_API_KEY=d4b96lhr01qrv4ataf3gd4b96lhr01qrv4ataf40
      - NEXT_PUBLIC_APP_URL=https://invest.votredomaine.com
    volumes:
      - timinvest-data:/app/data
    networks:
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.timinvest.rule=Host(`invest.votredomaine.com`)"
      - "traefik.http.routers.timinvest.entrypoints=websecure"
      - "traefik.http.routers.timinvest.tls.certresolver=letsencrypt"
      - "traefik.http.services.timinvest.loadbalancer.server.port=3000"

volumes:
  timinvest-data:

networks:
  web:
    external: true
```

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs d'erreur
docker logs timinvest

# Reconstruire sans cache
docker build --no-cache -t timinvest:latest .

# Vérifier la configuration
docker-compose config
```

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Problèmes de permissions

```bash
# Vérifier les permissions du volume
docker exec timinvest ls -la /app/data

# Corriger si nécessaire
docker exec timinvest chown -R nextjs:nodejs /app/data
```

### Problème réseau

```bash
# Vérifier le réseau
docker network inspect timinvest-network

# Recréer le réseau
docker network rm timinvest-network
docker network create timinvest-network
```

## 📦 Structure de l'Image Docker

L'image utilise un **multi-stage build** pour optimisation :

1. **Stage deps** : Installation des dépendances
2. **Stage builder** : Build de l'application
3. **Stage runner** : Image finale légère

Taille finale : ~150-200 MB (vs ~1GB sans optimisation)

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne pas exposer le port directement sur Internet** → Utilisez un reverse proxy
2. **Activer HTTPS** avec Let's Encrypt
3. **Limiter les ressources** :

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

4. **Scanner l'image** pour les vulnérabilités:

```bash
docker scan timinvest:latest
```

## 📈 Performance

### Optimisations Appliquées

- ✅ Multi-stage build
- ✅ Cache des dépendances npm
- ✅ Output standalone de Next.js
- ✅ Image Alpine Linux (légère)
- ✅ User non-root
- ✅ Healthcheck intégré

### Monitoring avec Portainer

Portainer affiche automatiquement :
- CPU usage
- Memory usage
- Network I/O
- Container health

## 🎯 Commandes Utiles de A à Z

```bash
# Construction
docker build -t timinvest:latest .

# Lancement
docker run -d -p 3000:3000 --name timinvest timinvest:latest

# Logs
docker logs -f timinvest

# Shell dans le conteneur
docker exec -it timinvest sh

# Arrêt
docker stop timinvest

# Redémarrage
docker restart timinvest

# Suppression
docker rm -f timinvest

# Nettoyage
docker system prune -a

# Info
docker inspect timinvest
```

## 🎉 C'est Tout !

Votre application TimInvest est maintenant prête à être déployée en production avec Docker ! 🚀

Pour toute question, consultez :
- `PORTAINER.md` pour Portainer
- `QUICKSTART-PORTAINER.md` pour un démarrage rapide
- `README.md` pour la documentation générale

