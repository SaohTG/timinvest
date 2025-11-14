# Utiliser Node.js 18 Alpine pour une image légère
FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (production + dev pour le build)
RUN npm ci || npm install

# Copier tous les fichiers du projet
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de l'application Next.js
RUN npm run build

# Créer le dossier data pour la persistance
RUN mkdir -p /app/data

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement runtime
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Lancer l'application avec next start
CMD ["npm", "start"]

