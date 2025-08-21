import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBlockedSchoolDto } from './dto/create-blocked-school.dto';
import { BlockedSchoolModule } from './blocked-school.module';

@Injectable()
export class BlockedSchoolService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create Blocked School
  async create(data: CreateBlockedSchoolDto) {
   return this.prisma.blockedSchool.create({
      data,
      include: { school: true }, 
    });
  }

  // ✅ Delete Blocked School by ID
  async delete(id: number) {
    const existing = await this.prisma.blockedSchool.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`BlockedSchool with id ${id} not found`);
    }

    return this.prisma.blockedSchool.delete({
      where: { id },
    });
  }

  // Optional: Get all blocked schools
  async findAll() {
    return this.prisma.blockedSchool.findMany({
      include: { school: true },
    });
  }
}
