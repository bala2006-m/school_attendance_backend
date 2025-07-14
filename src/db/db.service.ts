import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DbService {
  private prisma = new PrismaClient();

  async listTables(): Promise<string[]> {
    const result = await this.prisma.$queryRawUnsafe<Record<string, string>[]>(`SHOW TABLES`);

    return result.map((row) => Object.values(row)[0] as string);
  }
}
