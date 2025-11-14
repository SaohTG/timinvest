# 🐳 Déploiement sur Portainer - TimInvest

Ce guide vous explique comment déployer TimInvest sur Portainer de manière simple et rapide.

## 📋 Prérequis

- ✅ Docker installé sur votre serveur
- ✅ Portainer installé et accessible
- ✅ Accès à votre interface Portainer

## 🚀 Méthode 1 : Déploiement via Stack Portainer (Recommandé)

### Étape 1 : Construire l'image Docker

Depuis votre machine locale (où se trouve le projet) :

```bash
# Construire l'image Docker
docker build -t timinvest:latest .

# Optionnel : Tagger pour votre registry privé
docker tag timinvest:latest votre-registry.com/timinvest:latest

# Optionnel : Pusher vers votre registry
docker push votre-registry.com/timinvest:latest
```

### Étape 2 : Déployer sur Portainer

1. **Ouvrez Portainer** dans votre navigateur
2. Allez dans **Stacks** → **Add stack**
3. Donnez un nom : `timinvest`
4. Sélectionnez **Web editor**
5. Copiez-collez le contenu du fichier `docker-compose.portainer.yml`
6. Modifiez les variables d'environnement si nécessaire :
   - `FINNHUB_API_KEY` : Votre clé API (déjà configurée)
   - `NEXT_PUBLIC_APP_URL` : L'URL de votre application
7. Cliquez sur **Deploy the stack**

### Étape 3 : Accéder à l'application

Votre application sera accessible sur : `http://votre-serveur:3000`

## 🎯 Méthode 2 : Build directement sur le serveur

Si vous préférez ne pas utiliser de registry Docker :

### 1. Transférer les fichiers sur le serveur

```bash
# Compresser le projet
tar -czf timinvest.tar.gz .

# Transférer sur le serveur (exemple avec SCP)
scp timinvest.tar.gz user@votre-serveur:/home/user/

# Sur le serveur, décompresser
ssh user@votre-serveur
cd /home/user
tar -xzf timinvest.tar.gz -C timinvest
cd timinvest
```

### 2. Builder l'image sur le serveur

```bash
docker build -t timinvest:latest .
```

### 3. Déployer via Portainer

Suivez les étapes de la Méthode 1 à partir de l'Étape 2.

## 🔧 Configuration Avancée

### Changer le port

Dans le fichier `docker-compose.portainer.yml`, modifiez :

```yaml
ports:
  - "8080:3000"  # Utilisera le port 8080 au lieu de 3000
```

### Utiliser un domaine personnalisé

Si vous utilisez un reverse proxy (Nginx, Traefik) :

```yaml
environment:
  - NEXT_PUBLIC_APP_URL=https://invest.votredomaine.com
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.timinvest.rule=Host(`invest.votredomaine.com`)"
  - "traefik.http.services.timinvest.loadbalancer.server.port=3000"
```

### Backup des données

Les données sont stockées dans le volume Docker `timinvest-data`. Pour sauvegarder :

```bash
# Lister les volumes
docker volume ls

# Sauvegarder le volume
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar czf /backup/timinvest-backup.tar.gz -C /data .

# Restaurer le volume
docker run --rm -v timinvest-data:/data -v $(pwd):/backup alpine tar xzf /backup/timinvest-backup.tar.gz -C /data
```

## 📊 Monitoring dans Portainer

### Vérifier l'état de santé

Dans Portainer → Containers → timinvest :
- ✅ Status : **healthy** (vert)
- 🔴 Status : **unhealthy** (rouge) → Vérifiez les logs

### Consulter les logs

Dans Portainer → Containers → timinvest → Logs

```bash
# Ou via ligne de commande
docker logs timinvest
```

### Statistiques en temps réel

Portainer → Containers → timinvest → Stats

Vous verrez :
- CPU usage
- Memory usage
- Network I/O
- Block I/O

## 🔄 Mise à jour de l'application

### 1. Reconstruire l'image

```bash
docker build -t timinvest:latest .
```

### 2. Dans Portainer

- Allez dans **Stacks** → **timinvest**
- Cliquez sur **Update the stack**
- Cochez **Re-pull image and redeploy**
- Cliquez sur **Update**

Ou redéployez manuellement :

```bash
docker-compose down
docker-compose up -d
```

## 🌐 Exemple de Configuration Complète avec Traefik

Pour une configuration professionnelle avec SSL automatique :

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
    driver: local

networks:
  web:
    external: true
```

## 🐛 Résolution de Problèmes

### L'application ne démarre pas

```bash
# Vérifier les logs
docker logs timinvest

# Vérifier que le port n'est pas utilisé
netstat -tulpn | grep 3000

# Reconstruire l'image
docker build --no-cache -t timinvest:latest .
```

### Problème de permissions sur le volume

```bash
# Vérifier les permissions
docker exec timinvest ls -la /app/data

# Corriger les permissions si nécessaire
docker exec timinvest chown -R nextjs:nodejs /app/data
```

### L'API Finnhub ne fonctionne pas

1. Vérifiez que la variable `FINNHUB_API_KEY` est bien définie
2. Redémarrez le conteneur après modification :

```bash
docker restart timinvest
```

## 📱 Variables d'Environnement Disponibles

| Variable | Description | Défaut | Requis |
|----------|-------------|--------|--------|
| `NODE_ENV` | Environnement Node.js | `production` | Non |
| `FINNHUB_API_KEY` | Clé API Finnhub | - | Oui |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `http://localhost:3000` | Non |
| `PORT` | Port interne | `3000` | Non |

## 🎉 C'est Prêt !

Votre application TimInvest est maintenant déployée sur Portainer et accessible 24/7 ! 🚀

Pour toute question, consultez la documentation Docker ou Portainer.

