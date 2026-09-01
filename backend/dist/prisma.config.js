"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const user = process.env.DATABASE_USER || 'root';
const password = encodeURIComponent(process.env.DATABASE_PASSWORD || '');
const host = process.env.DATABASE_HOST || 'localhost';
const port = process.env.DATABASE_PORT || 3306;
const db = process.env.DATABASE_NAME || 'qsr_db';
const databaseUrl = process.env.DATABASE_URL ||
    `mysql://${user}:${password}@${host}:${port}/${db}`;
exports.default = (0, config_1.defineConfig)({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map