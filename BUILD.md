# 🔨 Guide de Construction de l'Image Docker

Ce guide explique comment construire l'image Docker de TimInvest.

## 🎯 Construction Simple

### Commande de Base

```bash
docker build -t timinvest:latest .
```

**Temps estimé :** 3-5 minutes (selon votre connexion)

## 📦 Processus de Build

Le Dockerfile utilise un **multi-stage build** en 3 étapes :

### Stage 1 : Dependencies (deps)
- Installe les dépendances npm
- Utilise Alpine Linux pour légèreté
- Cache les `node_modules`

### Stage 2 : Builder
- Compile l'application Next.js
- Génère les fichiers optimisés
- Mode production

### Stage 3 : Runner (image finale)
- Image minimale pour exécution
- Copie uniquement les fichiers nécessaires
- Utilisateur non-root (sécurité)
- Taille finale : ~150-200 MB

## 🚀 Options de Build

### Build Standard

```bash
docker build -t timinvest:latest .
```

### Build Sans Cache (si problème)

```bash
docker build --no-cache -t timinvest:latest .
```

### Build avec Tag Spécifique

```bash
docker build -t timinvest:v1.0.0 .
```

### Build pour Registry Privé

```bash
# Build et tag
docker build -t registry.votredomaine.com/timinvest:latest .

# Push vers registry
docker push registry.votredomaine.com/timinvest:latest
```

### Build Multi-Architecture (ARM + x86)

```bash
# Créer un builder
docker buildx create --use

# Build pour multiple plateformes
docker buildx build --platform linux/amd64,linux/arm64 -t timinvest:latest .
```

## 📊 Vérifier l'Image

### Lister les Images

```bash
docker images | grep timinvest
```

Vous devriez voir :
```
timinvest   latest   abc123def456   2 minutes ago   180MB
```

### Inspecter l'Image

```bash
docker inspect timinvest:latest
```

### Voir les Couches

```bash
docker history timinvest:latest
```

## 🧪 Tester l'Image

### Test Local Rapide

```bash
# Lancer un conteneur test
docker run -d -p 3000:3000 --name test-timinvest timinvest:latest

# Vérifier que ça fonctionne
curl http://localhost:3000

# Supprimer le test
docker stop test-timinvest
docker rm test-timinvest
```

### Test avec Variables d'Environnement

```bash
docker run -d -p 3000:3000 \
  -e FINNHUB_API_KEY=votre_cle \
  -e NEXT_PUBLIC_APP_URL=http://test.com \
  --name test-timinvest \
  timinvest:latest
```

## 🔍 Debugging du Build

### Voir les Logs de Build

```bash
docker build -t timinvest:latest . 2>&1 | tee build.log
```

### Build en Mode Verbose

```bash
docker build --progress=plain -t timinvest:latest .
```

### Entrer dans une Étape Spécifique

```bash
# Builder une étape spécifique
docker build --target builder -t timinvest:builder .

# Explorer
docker run -it timinvest:builder sh
```

## 🎨 Personnalisation du Build

### Modifier le Dockerfile

**Changer la version de Node.js :**
```dockerfile
FROM node:20-alpine AS deps  # Au lieu de 18
```

**Ajouter des outils de debug :**
```dockerfile
RUN apk add --no-cache curl vim
```

**Optimiser la taille :**
```dockerfile
RUN npm ci --only=production --ignore-scripts
```

## 📦 Build Args (Arguments)

Vous pouvez passer des arguments au build :

```dockerfile
# Dans le Dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine AS deps
```

```bash
# Lors du build
docker build --build-arg NODE_VERSION=20 -t timinvest:latest .
```

## 🔐 Sécurité du Build

### Scanner l'Image

```bash
# Avec Docker
docker scan timinvest:latest

# Avec Trivy
trivy image timinvest:latest
```

### Vérifier les Vulnérabilités

```bash
# Audit npm dans l'image
docker run --rm timinvest:latest npm audit
```

## 🌐 Build pour Production

### Checklist Avant Production

- [ ] Testé localement
- [ ] Variables d'environnement configurées
- [ ] Image scannée pour vulnérabilités
- [ ] Taille de l'image optimisée
- [ ] Healthcheck fonctionnel
- [ ] Logs accessibles

### Build de Production Optimisé

```bash
# Build
docker build \
  --no-cache \
  --pull \
  -t timinvest:production \
  -f Dockerfile \
  .

# Vérifier
docker images timinvest:production

# Tester
docker run -d -p 3000:3000 --name prod-test timinvest:production
docker logs -f prod-test
```

## 💾 Exporter/Importer l'Image

### Sauvegarder l'Image

```bash
docker save timinvest:latest | gzip > timinvest-latest.tar.gz
```

### Charger l'Image

```bash
docker load < timinvest-latest.tar.gz
```

### Transférer vers un Serveur

```bash
# Sur votre machine
docker save timinvest:latest | gzip > timinvest-latest.tar.gz
scp timinvest-latest.tar.gz user@serveur:/tmp/

# Sur le serveur
ssh user@serveur
gunzip < /tmp/timinvest-latest.tar.gz | docker load
```

## 🔄 Automatisation du Build

### Script de Build Automatique

Créez `build.sh` :

```bash
#!/bin/bash
VERSION=$(date +%Y%m%d-%H%M%S)

echo "🔨 Building TimInvest v$VERSION"

docker build \
  --no-cache \
  -t timinvest:latest \
  -t timinvest:$VERSION \
  .

if [ $? -eq 0 ]; then
  echo "✅ Build réussi"
  docker images | grep timinvest
else
  echo "❌ Build échoué"
  exit 1
fi
```

### CI/CD (GitHub Actions)

Exemple `.github/workflows/build.yml` :

```yaml
name: Build Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t timinvest:latest .
      
      - name: Test image
        run: |
          docker run -d -p 3000:3000 --name test timinvest:latest
          sleep 10
          curl -f http://localhost:3000 || exit 1
```

## 🐛 Problèmes Courants

### Erreur : "no space left on device"

```bash
# Nettoyer Docker
docker system prune -a
docker volume prune
```

### Erreur : "npm install failed"

```bash
# Reconstruire sans cache
docker build --no-cache -t timinvest:latest .
```

### Build très lent

```bash
# Vérifier votre connexion
# Utiliser un registry mirror npm
echo "registry=https://registry.npmjs.org/" > .npmrc
```

## 📈 Optimisations Avancées

### Cache des Layers Docker

Le Dockerfile est optimisé pour cacher les layers :
1. Copie `package*.json` d'abord
2. Install dependencies (cachées)
3. Copie le code source
4. Build

### Réduire la Taille

```bash
# Voir la taille des layers
docker history timinvest:latest --human --format "table {{.Size}}\t{{.CreatedBy}}"

# Optimisations appliquées :
# - Multi-stage build
# - Alpine Linux
# - Standalone output Next.js
# - .dockerignore complet
```

## 🎉 Build Terminé !

Votre image est maintenant prête à être déployée sur Portainer ou n'importe quel environnement Docker ! 🚀

**Prochaine étape :** Consultez `PORTAINER.md` ou `QUICKSTART-PORTAINER.md` pour le déploiement.

