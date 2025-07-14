import { PrismaService } from '../common/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password.dto';
@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
async getSchoolAndClassByUsername(username: string) {
    return this.prisma.student.findUnique({
      where: { username },
      select: {
        school_id: true,
        class_id: true,
      },
    });
  }
  async findByUsername(username: string) {
    try {
      const student = await this.prisma.student.findUnique({
        where: { username },
        select: {
          name: true,
          gender: true,
          email: true,
          mobile: true,
          photo: true,
          class_id: true,
          school_id: true,
        },
      });

      return student
        ? { status: 'success', student }
        : {
            status: 'success',
            student: null,
            message: `No student found for username: ${username}`,
          };
    } catch (error) {
      console.error('Error in findByUsername:', error); // <-- also important
      throw error;
    }
  }



  async registerStudent(dto: RegisterStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      return { status: 'error', message: 'Username already exists' };
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const student = await this.prisma.student.create({
      data: {
        username: dto.username,
        name: dto.name,
        email: dto.email,
        gender: dto.gender,
        mobile: dto.mobile,
        class_id: Number(dto.class_id),
        school_id: Number(dto.school_id),
        password: hashedPassword,
      },
    });

    return { status: 'success', student };
  }
  async deleteStudent(username: string) {
    const exists = await this.prisma.student.findUnique({ where: { username } });

    if (!exists) {
      return { status: 'error', message: 'Student not found' };
    }

    await this.prisma.student.delete({ where: { username } });

    return { status: 'success', message: `Student '${username}' deleted.` };
  }
async changeStudentPassword(dto: ChangePasswordDto) {
    const { username, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.attendance_user.findUnique({
      where: { username },
    });

    if (!user || user.role !== 'student') {
      throw new BadRequestException('Student not found or invalid role');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.attendance_user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    return { status: 'success', message: 'Password updated successfully' };
  }

  async getAllByClass(class_id: string) {
  const students = await this.prisma.student.findMany({
    where: { class_id:Number(class_id) },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      mobile: true,
      gender: true,
    },
    orderBy: { name: 'asc' },
  });

  return {
    status: 'success',
    count: students.length,
    students,
  };
}
async getAllByClassAndSchool(class_id: string,school_id: string) {
  const students = await this.prisma.student.findMany({
    where: { class_id:Number(class_id) ,school_id:Number(school_id)},
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      mobile: true,
      gender: true,
    },
    orderBy: { name: 'asc' },
  });

  return {
    status: 'success',
    count: students.length,
    students,
  };
}
async countStudentsBySchool(schoolId: number): Promise<number> {
    return await this.prisma.student.count({
      where: {
        school_id: schoolId,
      },
    });
  }
  async getAllStudents(school_id?: string) {
      try {
        const whereClause = school_id
          ? { school_id: parseInt(school_id, 10) }
          : {};

        const students = await this.prisma.student.findMany({
          where: whereClause,
          orderBy: { name: 'asc' },
          select: {
            username: true,
            name: true,
            gender: true,
            email: true,
            mobile: true,
          },
        });

        return {
          status: 'success',
          students,
        };
      } catch (error) {
        return {
          status: 'error',
          message: 'Query failed',
          details: error.message,
        };
      }
    }
 async findStudentByUsernameClassSchool(
    username: string,
    classId: number,
    schoolId: number,
  ) {
    return this.prisma.student.findFirst({
      where: {
        username,
        class_id: classId,
        school_id: schoolId,
      },
      select: {
        name: true,
        gender: true,
        email: true,
        mobile: true,
      },
    });
  }
}
