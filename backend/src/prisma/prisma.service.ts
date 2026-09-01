import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST!,
      port: Number(process.env.DATABASE_PORT!),
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_NAME!,
      connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT!),
      allowPublicKeyRetrieval: true,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
