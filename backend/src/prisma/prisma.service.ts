import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Aniket@123',
      database: 'qsr_db',
      connectionLimit: 10,
      allowPublicKeyRetrieval: true
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
