# Price Watcher Bot

Bot Discord en TypeScript permettant de surveiller les prix de produits (TopAchat pour le moment).
Le bot utilise MySQL pour stocker les produits, les sépare automatiquement par utilisateur, et exécute une vérification régulière des prix.

## ✨ Fonctionnalités

- `/add <url> <seuil> [nom]` — ajoute un produit à surveiller
- `/list` — liste tes produits surveillés
- `/remove <id>` — supprime un de tes produits
- `/check` — force une vérification immédiate (résultat privé)
- Vérification automatique toutes les 30 min (cron)
- Stockage MySQL persistant
- Scraper HTML (axios + cheerio)
- Architecture clean en TypeScript (bot / services / data / db)

## 🧱 Stack technique

- Node.js + TypeScript
- discord.js v14
- MySQL (mysql2/promise)
- axios + cheerio
- node-cron
- dotenv

## 📂 Structure

```text
src/
 ├── bot/
 │    ├── client.ts
 │    └── registerCommands.ts
 ├── commands/
 │    ├── add.ts
 │    ├── list.ts
 │    ├── remove.ts
 │    └── check.ts
 ├── config/
 │    └── env.ts
 ├── data/
 │    └── productsRepository.ts
 ├── db/
 │    └── connection.ts
 ├── services/
 │    ├── priceChecker.ts
 │    └── scheduler.ts
 └── index.ts

db/
 └── schema.sql
```

## 📦 Installation

```bash
git clone <URL_DU_REPO>
cd price-watcher-bot

npm install
```

## ⚙️ Configuration

Créer un fichier `.env` :

```env
DISCORD_TOKEN=ton_token
CLIENT_ID=ton_client_id
GUILD_ID=ton_guild_id

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=price_watcher

# Tuning du scheduler (optionnel)
PRICE_CHECK_CRON=*/30 * * * *
PRICE_CHECK_BATCH_SIZE=5
PRICE_CHECK_DELAY_MS=4000

# Timeout HTTP pour le scraping (ms)
HTTP_TIMEOUT_MS=10000
```

Ne jamais commiter ce fichier.

## 🗄️ Initialisation de la base MySQL

```bash
mysql -u root < db/schema.sql
```

(adapte l’utilisateur/host/port selon ton environnement)

## 🧩 Déploiement des commandes slash

```bash
npm run deploy:commands
```

À relancer uniquement quand tu ajoutes/modifies une commande.

## ▶️ Lancement du bot

```bash
npm run dev
```

Le bot se connectera à Discord et démarrera le scheduler.

## 🧠 Fonctionnement

- Chaque produit enregistré contient : `id`, `name`, `url`, `targetPrice`, `channelId`, `userId`, `createdAt`
- `/list`, `/remove` et `/check` ne concernent que les produits de l’utilisateur qui appelle la commande
- Le cron vérifie régulièrement tous les produits et envoie une alerte dans le salon d’origine si le prix passe sous le seuil

## 🗺️ Roadmap

- Support d’autres marchands (Amazon, LDLC, Materiel.net…)
- Historique des prix (table `price_history` + commande `/history`)
- Dashboard web (visualisation des prix, gestion des produits)
- Auth Discord OAuth2 côté web
- Alertes DM et/ou webhooks externes

## 📜 Licence

MIT