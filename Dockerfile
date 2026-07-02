# Utilisation d'une image Node.js légère
FROM node:20-alpine

# Création et définition du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm install

# Copie du dossier Prisma
COPY prisma ./prisma/

# Copie du reste du code source
COPY src ./src/

# Génération du client Prisma (Obligatoire pour l'ORM)
RUN npx prisma generate

# Construction (Compilation) du code TypeScript
RUN npm run build

# Exposition du port (selon ton .env, c'est le 3001)
EXPOSE 3001

# Commande de démarrage de l'application
CMD ["npm", "start"]