import { Controller, Get } from '@nestjs/common';
import { DbService } from './db.service';

@Controller('db')
export class DbController {
  constructor(private readonly dbService: DbService) {}

  @Get('tables')
  async getTables() {
    const tables = await this.dbService.listTables();
    return { tables };
  }
}
