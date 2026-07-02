import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../../");
const testSchemaPath = path.join(projectRoot, "prisma", "schema-test.prisma");
const testDbPath = path.join(projectRoot, "prisma", "test.db");

// Génère le client Prisma de test
execSync(`npx prisma generate --schema="${testSchemaPath}"`, {
  cwd: projectRoot,
  stdio: "pipe",
});

// Réinitialise la base SQLite de test
execSync(
  `npx prisma db push --schema="${testSchemaPath}" --force-reset --accept-data-loss`,
  {
    cwd: projectRoot,
    stdio: "pipe",
  }
);

// Import dynamique du client généré
const require = createRequire(import.meta.url);
const clientPath = path.join(
  projectRoot,
  "node_modules",
  ".prisma",
  "client-test"
);

// Correction de l'import pour résoudre l'erreur de namespace
const clientModule = require(clientPath);
const PrismaClient = clientModule.PrismaClient;

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${testDbPath}`,
    },
  },
});

export default testPrisma;