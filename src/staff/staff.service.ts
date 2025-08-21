import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import * as bcrypt from 'bcrypt';
import { ChangeStaffPasswordDto } from './dto/change-password.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}
  async updateProfile(username: string, data: UpdateStaffDto,school_id:number) {
    
  // Separate the photo from other fields
  const { photo, ...restDto } = data;

  // Prepare update data
  const updateData: any = { ...restDto };

  // If photo is given, convert from base64 string to Bytes
  if (photo) {
    try {
      updateData.photo = Buffer.from(photo, 'base64');
    } catch {
      return { status: 'error', message: 'Invalid photo format' };
    }
  }
    return this.prisma.staff.updateMany({
      where: { username,school_id },
      data:updateData,
    });
  }
  async getProfileByUsername(username: string,school_id:number) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    return this.prisma.staff.findFirst({
      where: { username,school_id:Number(school_id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        mobile: true,
        gender: true,
        designation: true,
        school_id: true,
        class_ids:true,
        photo:true,
      },
    });
   
  }




async findByUsername(username: string,school_id:number) {
  try {
    return await this.prisma.staff.findFirst({
      where: { username,school_id },
      select: {
        school_id: true,
        name: true,
        designation: true,
        gender: true,
        mobile: true,
        class_ids:true,
        photo:true,
        email:true,
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
async findByMobile(mobile: string,school_id:number) {
  try {
    var mobile=`+91${mobile}`;
  
    
    return await this.prisma.staff.findUnique({
      where: { mobile,school_id },
      select: {
        username:true,
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

  async register(dto: RegisterStaffDto) {
    const exists = await this.prisma.staff.findFirst({
      where: { username: dto.username,school_id:dto.school_id },
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
        class_ids:dto.class_ids,
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
        class_ids:true,
        photo:true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      count: staffList.length,
      staff:staffList,
    };
  }
  async updateStaff(username: string, dto: UpdateStaffDto,school_id:number) {
    const staff = await this.prisma.staff.findFirst({ where: { username,school_id } });

    if (!staff) {
      return { status: 'error', message: 'Staff not found' };
    }
    // Separate the photo from other fields
    const { photo, ...restDto } = dto;

    // Prepare update data
    const updateData: any = { ...restDto };

    // If photo is given, convert from base64 string to Bytes
    if (photo) {
      try {
        updateData.photo = Buffer.from(photo, 'base64');
      } catch {
        return { status: 'error', message: 'Invalid photo format' };
      }
    }}
  async deleteStaff(username: string,school_id:number) {
    const exists = await this.prisma.staff.findFirst({ where: { username,school_id } });

    if (!exists) {
      return { status: 'error', message: 'Staff not found' };
    }

    await this.prisma.staff.deleteMany({ where: { username,school_id } });

    return { status: 'success', message: `Staff '${username}' deleted.` };
  }

  // async changePassword(dto: ChangeStaffPasswordDto) {
  //   const staff = await this.prisma.staff.findUnique({
  //     where: { username: dto.username },
  //   });

  //   if (!staff) {
  //     return { status: 'error', message: 'Staff not found' };
  //   }

  //   const valid = await bcrypt.compare(dto.old_password, staff.password);

  //   if (!valid) {
  //     return { status: 'error', message: 'Incorrect old password' };
  //   }

  //   const hashed = await bcrypt.hash(dto.new_password, 10);

  //   await this.prisma.staff.update({
  //     where: { username: dto.username },
  //     data: { password: hashed },
  //   });

//   return { status: 'success', message: 'Password updated successfully' };
// }
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

