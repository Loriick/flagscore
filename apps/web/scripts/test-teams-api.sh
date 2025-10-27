#!/bin/bash

echo "🔍 Test de l'API Teams"
echo "======================"

# Test de l'endpoint GET (recherche)
echo "📡 Test GET /api/teams (recherche)"
curl -s "http://localhost:3000/api/teams?search=test" | jq '.' || echo "❌ Erreur GET"

echo ""
echo "📡 Test GET /api/teams (sans paramètres)"
curl -s "http://localhost:3000/api/teams" | jq '.' || echo "❌ Erreur GET"

echo ""
echo "🔄 Test POST /api/teams (synchronisation)"
curl -s -X POST "http://localhost:3000/api/teams" | jq '.' || echo "❌ Erreur POST"

echo ""
echo "✅ Tests terminés"