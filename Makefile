# Makefile pour TimInvest
# Simplifie les commandes Docker et le déploiement

.PHONY: help build run stop clean logs restart deploy-portainer backup restore

# Variables
IMAGE_NAME=timinvest
CONTAINER_NAME=timinvest
VERSION=latest

help: ## Affiche l'aide
	@echo "TimInvest - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construit l'image Docker
	@echo "🔨 Construction de l'image Docker..."
	docker build -t $(IMAGE_NAME):$(VERSION) .

run: ## Lance le conteneur
	@echo "🚀 Lancement du conteneur..."
	docker-compose up -d

stop: ## Arrête le conteneur
	@echo "⏹️  Arrêt du conteneur..."
	docker-compose down

restart: stop run ## Redémarre le conteneur
	@echo "🔄 Conteneur redémarré"

logs: ## Affiche les logs en temps réel
	@echo "📋 Logs du conteneur:"
	docker-compose logs -f

clean: ## Nettoie les images et conteneurs inutilisés
	@echo "🧹 Nettoyage..."
	docker system prune -f

clean-all: ## Nettoie tout (incluant les volumes)
	@echo "🧹 Nettoyage complet..."
	docker-compose down -v
	docker system prune -af

deploy-portainer: build ## Prépare pour le déploiement Portainer
	@echo "📦 Image prête pour Portainer"
	@echo "Ouvrez Portainer et utilisez docker-compose.portainer.yml"

backup: ## Sauvegarde les données
	@echo "💾 Sauvegarde des données..."
	@mkdir -p backups
	docker run --rm -v timinvest-data:/data -v $(PWD)/backups:/backup alpine tar czf /backup/timinvest-backup-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Sauvegarde créée dans ./backups/"

restore: ## Restaure les données (usage: make restore FILE=backup.tar.gz)
	@echo "♻️  Restauration des données..."
	docker run --rm -v timinvest-data:/data -v $(PWD)/backups:/backup alpine tar xzf /backup/$(FILE) -C /data
	@echo "✅ Données restaurées"

status: ## Affiche le statut du conteneur
	@echo "📊 Statut du conteneur:"
	docker ps -a | grep $(CONTAINER_NAME) || echo "Conteneur non trouvé"

shell: ## Ouvre un shell dans le conteneur
	@echo "🐚 Ouverture du shell..."
	docker exec -it $(CONTAINER_NAME) sh

install: ## Installation complète (build + run)
	@echo "🎯 Installation de TimInvest..."
	@make build
	@make run
	@echo "✅ TimInvest installé et en cours d'exécution sur http://localhost:3000"

update: ## Met à jour l'application
	@echo "🔄 Mise à jour de l'application..."
	@make build
	@make restart
	@echo "✅ Application mise à jour"

