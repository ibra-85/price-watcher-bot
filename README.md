# PC Price Watcher Bot

Bot Discord en TypeScript pour surveiller les prix de composants PC (cartes graphiques, alimentations, etc.) sur différents sites marchands (ex : TopAchat).

Le bot permet d'ajouter des produits à surveiller avec un prix cible et envoie une alerte dans un salon Discord lorsque le prix passe sous le seuil.

## ✨ Fonctionnalités

- Commande `!add <url> <prix_seuil> [nom]` pour ajouter un produit à surveiller
- Commande `!list` pour afficher la liste des produits suivis
- Vérification régulière des prix via un cron (toutes les 30 minutes par défaut)
- Architecture propre en TypeScript, organisée par couches (bot, services, data)
- Stockage en mémoire pour l'instant (prévu pour passer facilement en MySQL)

## 🧱 Stack technique

- Node.js
- TypeScript
- [discord.js](https://discord.js.org/)
- axios + cheerio (scraping HTML)
- node-cron
- dotenv

## 📦 Installation

```bash
git clone <URL_DU_REPO>
cd pc-price-watcher-bot

npm install
