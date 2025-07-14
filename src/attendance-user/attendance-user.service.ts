
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AttendanceUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersByRole(role: string) {
    return this.prisma.attendance_user.findMany({
      where: {
        role: role.toLowerCase(), // optional: normalize input
      },
      select: {
        id: true,
        username: true,
        school_id: true,
        password:true,
      },
    });
  }
}
