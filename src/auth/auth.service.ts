import { Injectable, ConflictException, InternalServerErrorException,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDesignationDto } from './dto/register-designation.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: RegisterDto) {
    const { username, password, role, school_id } = data;

    // Check if username exists
    const existingUser = await this.prisma.attendance_user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await this.prisma.attendance_user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          school_id,
        },
      });

      return {
        "status": "success",
        "message": "Registration successful",
        "username": newUser.username,
      };
    } catch (error) {
      throw new InternalServerErrorException('Registration failed: ' + error.message);
    }
  }

  async registerDesignation(dto: RegisterDesignationDto) {
    const { username, designation, school_id, mobile, table,email,classId,name,gender } = dto;

    const schoolIdInt = parseInt(school_id);
    const classIdInt = parseInt(classId);

    // Table-specific logic
    const tableMap = {
      admin: async () => {
        const exists = await this.prisma.admin.findUnique({ where: { username } });
        if (exists) throw new ConflictException('Username already exists in admin');
        return this.prisma.admin.create({
          data: {
            username,
            designation,
            school_id: schoolIdInt,
            mobile,

          },
        });
      },
      staff: async () => {
        const exists = await this.prisma.staff.findUnique({ where: { username } });
        if (exists) throw new ConflictException('Username already exists in staff');
        return this.prisma.staff.create({
          data: {
            username,
            designation,
            school_id: schoolIdInt,
            mobile,
            password: '',
            email:'',
          },
        });
      },
      students: async () => {
        const exists = await this.prisma.student.findUnique({ where: { username } });
        if (exists) throw new ConflictException('Username already exists in students');
        return this.prisma.student.create({
          data: {
            username,
            name,
            gender,
            school_id: schoolIdInt,
            mobile,
            password: '',
            class_id: classIdInt,
            email,

          },
        });
      },
    };

    const insertFn = tableMap[table];
    if (!insertFn) {
      throw new BadRequestException('Invalid table name');
    }

    const result = await insertFn();

    return {
      status: 'success',
      message: 'Designation registration successful',
      table,
      username,
    };
  }
async registerStudent(dto: RegisterStudentDto) {
  const { username, name, gender, email, mobile, class_id, school_id } = dto;

  // Check if username exists
  const exists = await this.prisma.student.findUnique({
    where: { username },
  });

  if (exists) {
    throw new ConflictException('Username already exists');
  }

  try {
    const student = await this.prisma.student.create({
      data: {
        username,
        name,
        gender,
        email,
        mobile,
        class_id: Number(class_id),
        school_id: Number(school_id),
        password: '', // if password is required later
      },
    });

    return {
      status: 'success',
      message: 'Registration successful',
      username: student.username,
    };
  } catch (error) {
    throw new InternalServerErrorException('Registration failed: ' + error.message);
  }
}

}
