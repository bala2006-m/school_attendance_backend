// src/school/schools.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return await this.prisma.school.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        photo: true,
      },
    });
  }
  async findAllSchools() {
  try {
    return await this.prisma.school.findMany({
      select: { id: true, name: true, address: true, photo: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    throw new Error(`Failed to fetch schools: ${error.message}`);
  }
}

}
