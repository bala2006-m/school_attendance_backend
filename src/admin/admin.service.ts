import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAdmin(username?: string, school_id?: number) {
    if (username && school_id) {
      const admin = await this.prisma.admin.findUnique({
        where: {
          username_school_id: { username, school_id:Number(school_id) },
        },
        select: {
          name: true,
          username: true,
          designation: true,
          mobile: true,
          email: true,
          photo: true,
          school_id: true,
          gender: true,
        },
      });

      if (!admin) return [];

      return [
        {
          ...admin,
          photo: admin.photo
            ? Buffer.from(admin.photo).toString('base64')
            : null,
        },
      ];
    }

    const admins = await this.prisma.admin.findMany({
      select: {
        name: true,
        designation: true,
        mobile: true,
        photo: true,
        school_id: true,
        gender: true,
      },
      orderBy: { name: 'asc' },
    });

    return admins.map((admin) => ({
      ...admin,
      photo: admin.photo
        ? Buffer.from(admin.photo).toString('base64')
        : null,
    }));
  }

  async updateAdmin(username: string, school_id: number, data: UpdateAdminDto) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username_school_id: { username, school_id } },
    });

    if (!existingAdmin) {
      throw new NotFoundException(
        `Admin with username "${username}" and school_id "${school_id}" not found.`,
      );
    }

    const updateData: any = {
      name: data.name,
      designation: data.designation,
      mobile: data.mobile,
      gender: data.gender,
      email: data.email,
    };

    if (data.photoBase64) {
      updateData.photo = Buffer.from(data.photoBase64, 'base64');
    }

    await this.prisma.admin.update({
      where: { username_school_id: { username, school_id } },
      data: updateData,
    });

    return { message: 'Profile updated successfully' };
  }
}
