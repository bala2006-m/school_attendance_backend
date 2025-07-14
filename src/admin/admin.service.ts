import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAdmin(username?: string) {
    if (username) {
      const admin = await this.prisma.Admin.findUnique({
        where: { username },
        select: {
          name: true,
          designation: true,
          mobile:true,
          photo: true,
          school_id: true,
        },
      });

      if (!admin) return [];

      return [
        {
          ...admin,
          photo: admin.photo ? Buffer.from(admin.photo).toString('base64') : null,
        },
      ];
    } else {
      const admins = await this.prisma.admin.findMany({
        select: {
          name: true,
          designation: true,
          mobile:true,
          photo: true,
          school_id: true,
        },
      });

      return admins.map((admin) => ({
        ...admin,
        photo: admin.photo ? Buffer.from(admin.photo).toString('base64') : null,
      }));
    }
  }
  async updateAdmin(username: string, data: UpdateAdminDto) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!existingAdmin) {
      throw new Error(`Admin with username "${username}" not found.`);
    }

    const updateData: any = {
      name: data.name,
      designation: data.designation,
      mobile: data.mobile,
    };

    if (data.photoBase64) {
      updateData.photo = Buffer.from(data.photoBase64, 'base64');
    }

    await this.prisma.admin.update({
      where: { username },
      data: updateData,
    });

    return { message: 'Profile updated successfully' };
  }

}