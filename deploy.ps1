# Script de déploiement PowerShell pour TimInvest
# Usage: .\deploy.ps1

Write-Host "🚀 Déploiement de TimInvest" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas installé. Installez Docker Desktop d'abord." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Étape 1: Construction de l'image Docker" -ForegroundColor Blue
docker build -t timinvest:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image construite avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la construction de l'image" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Étape 2: Arrêt des conteneurs existants" -ForegroundColor Blue
docker-compose down 2>$null

Write-Host ""
Write-Host "🚀 Étape 3: Lancement de l'application" -ForegroundColor Blue
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application lancée avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du lancement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Attente du démarrage (15 secondes)..." -ForegroundColor Blue
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "📊 Vérification du statut" -ForegroundColor Blue
docker ps | Select-String "timinvest"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application accessible sur: " -NoNewline
Write-Host "http://localhost:7293" -ForegroundColor Yellow
Write-Host ""
Write-Host "Commandes utiles:"
Write-Host "  - Voir les logs:        docker logs -f timinvest"
Write-Host "  - Arrêter:              docker-compose down"
Write-Host "  - Redémarrer:           docker restart timinvest"
Write-Host "  - État:                 docker ps | Select-String timinvest"
Write-Host ""

