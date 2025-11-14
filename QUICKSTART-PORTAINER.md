# 🚀 Quick Start - Déploiement Portainer

Guide ultra-rapide pour déployer TimInvest sur Portainer en 5 minutes !

## 📋 Prérequis

- Docker installé
- Portainer installé et accessible

## ⚡ Déploiement en 3 Étapes

### Étape 1️⃣ : Construire l'image Docker

Sur votre machine locale (où se trouve le projet) :

```bash
# Méthode facile avec le Makefile
make build

# Ou avec Docker directement
docker build -t timinvest:latest .
```

### Étape 2️⃣ : Ouvrir Portainer

1. Ouvrez Portainer dans votre navigateur
2. Allez dans **Stacks** (menu de gauche)
3. Cliquez sur **+ Add stack**

### Étape 3️⃣ : Créer la Stack

#### Méthode Simple : Depuis GitHub (Recommandé) 🌟

1. **Name** : `timinvest`
2. **Sélectionnez "Repository"**
3. **Configurez :**
   - Repository URL : `https://github.com/SaohTG/timinvest`
   - Reference : `refs/heads/main`
   - Compose path : `docker-compose.portainer.yml`
4. Cliquez sur **Deploy the stack**

#### Méthode Alternative : Web Editor

1. **Name** : `timinvest`
2. Sélectionnez **Web editor**
3. Copiez-collez le contenu ci-dessous :

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

volumes:
  timinvest-data:
    driver: local

networks:
  timinvest-network:
    driver: bridge
```

4. Cliquez sur **Deploy the stack**

## ✅ C'est Prêt !

Ouvrez votre navigateur sur : **http://localhost:8547** (ou l'IP de votre serveur:8547)

## 🔧 Commandes Utiles

```bash
# Voir les logs
docker logs timinvest

# Redémarrer
docker restart timinvest

# Sauvegarder les données
make backup

# Arrêter
docker stop timinvest

# Relancer
docker start timinvest
```

## 🌐 Accès depuis l'extérieur

Pour accéder depuis Internet, vous devez :

1. **Ouvrir le port 3000** sur votre firewall
2. **Ou utiliser un reverse proxy** (Nginx/Traefik)

Exemple avec Nginx :

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
    }
}
```

## 📊 Vérifier que tout fonctionne

Dans Portainer :
- Container status : **running** ✅
- Health : **healthy** ✅

Si problème, consultez les logs :
- Portainer → Containers → timinvest → Logs

## 🎉 Profitez de TimInvest !

Votre application est maintenant accessible 24/7 pour gérer votre patrimoine boursier ! 📈

