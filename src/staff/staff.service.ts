import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import * as bcrypt from 'bcrypt';
import { ChangeStaffPasswordDto } from './dto/change-password.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}
 async updateProfile(username: string, data: UpdateStaffDto) {
    return this.prisma.staff.update({
      where: { username },
      data,
    });
  }
  async getProfileByUsername(username: string) {


    if (!username) {
      throw new BadRequestException('Username is required');
    }

    return this.prisma.staff.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        mobile: true,
        gender: true,
        designation: true,
        school_id: true,
      },
    });

  }




async findByUsername(username: string) {
  try {
    return await this.prisma.staff.findUnique({
      where: { username },
      select: {
        school_id: true,
        name: true,
        designation: true,
        gender: true,
        mobile: true,
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}


  async register(dto: RegisterStaffDto) {
    const exists = await this.prisma.staff.findUnique({
      where: { username: dto.username },
    });

    if (exists) {
      return { status: 'error', message: 'Username already exists' };
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const staff = await this.prisma.staff.create({
      data: {
        username: dto.username,
        designation: dto.designation,
        name: dto.name,
        email: dto.email,
        gender: dto.gender,
        mobile: dto.mobile,
        school_id: dto.school_id,
        password: hashed,
      },
    });

    return { status: 'success', staff };
  }
  async getAllBySchool(school_id: number) {
    const staffList = await this.prisma.staff.findMany({
      where: { school_id },
      select: {
        id: true,
        username: true,
        designation: true,
        name: true,
        email: true,
        gender: true,
        mobile: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      count: staffList.length,
      staff: staffList,
    };
  }
async updateStaff(username: string, dto: UpdateStaffDto) {
  const staff = await this.prisma.staff.findUnique({ where: { username } });

  if (!staff) {
    return { status: 'error', message: 'Staff not found' };
  }

  const updated = await this.prisma.staff.update({
    where: { username },
    data: dto,
  });

  return { status: 'success', staff: updated };
}
async deleteStaff(username: string) {
  const exists = await this.prisma.staff.findUnique({ where: { username } });

  if (!exists) {
    return { status: 'error', message: 'Staff not found' };
  }

  await this.prisma.staff.delete({ where: { username } });

  return { status: 'success', message: `Staff '${username}' deleted.` };
}

async changePassword(dto: ChangeStaffPasswordDto) {
  const staff = await this.prisma.staff.findUnique({
    where: { username: dto.username },
  });

  if (!staff) {
    return { status: 'error', message: 'Staff not found' };
  }

  const valid = await bcrypt.compare(dto.old_password, staff.password);

  if (!valid) {
    return { status: 'error', message: 'Incorrect old password' };
  }

  const hashed = await bcrypt.hash(dto.new_password, 10);

  await this.prisma.staff.update({
    where: { username: dto.username },
    data: { password: hashed },
  });

  return { status: 'success', message: 'Password updated successfully' };
}
async countStaffBySchoolId(schoolId: number) {
    const count = await this.prisma.staff.count({
      where: {
        school_id: schoolId,
      },
    });

    return {
      status: 'success',
      count,
    };
  }


}

