#!/bin/bash

# Script de déploiement simplifié pour TimInvest
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de TimInvest"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez Docker d'abord."
    exit 1
fi

echo -e "${BLUE}📦 Étape 1: Construction de l'image Docker${NC}"
docker build -t timinvest:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image construite avec succès${NC}"
else
    echo "❌ Erreur lors de la construction de l'image"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Étape 2: Arrêt des conteneurs existants${NC}"
docker-compose down 2>/dev/null || true

echo ""
echo -e "${BLUE}🚀 Étape 3: Lancement de l'application${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application lancée avec succès${NC}"
else
    echo "❌ Erreur lors du lancement"
    exit 1
fi

echo ""
echo -e "${BLUE}⏳ Attente du démarrage (15 secondes)...${NC}"
sleep 15

echo ""
echo -e "${BLUE}📊 Vérification du statut${NC}"
docker ps | grep timinvest

echo ""
echo "================================"
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo -e "📱 Application accessible sur: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "Commandes utiles:"
echo "  - Voir les logs:        docker logs -f timinvest"
echo "  - Arrêter:              docker-compose down"
echo "  - Redémarrer:           docker restart timinvest"
echo "  - Sauvegarder données:  make backup"
echo ""

