import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDesignationDto } from './dto/register-designation.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { log } from 'console';

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
        status: 'success',
        message: 'Registration successful',
        username: newUser.username,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Registration failed: ' + error.message,
      );
    }
  }

  async registerDesignation(dto: RegisterDesignationDto) {
    const {
      username,
      designation,
      school_id,
      mobile,
      table,
      email,
      class_id,
      name,
      gender,
    } = dto;

    const schoolIdInt = parseInt(school_id);
    const classIdInt = parseInt(class_id);

    // Table-specific logic
    const tableMap = {
      admin: async () => {
        const exists = await this.prisma.admin.findUnique({
          where: { username },
        });
        if (exists)
          throw new ConflictException('Username already exists in admin');
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
        const exists = await this.prisma.staff.findUnique({
          where: { username },
        });
        if (exists)
          throw new ConflictException('Username already exists in staff');
        return this.prisma.staff.create({
          data: {
            username,
            designation,
            school_id: schoolIdInt,
            mobile,
            password: '',
            email: '',
          },
        });
      },
      students: async () => {
        const exists = await this.prisma.student.findUnique({
          where: { username },
        });
        if (exists)
          throw new ConflictException('Username already exists in students');
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
      throw new InternalServerErrorException(
        'Registration failed: ' + error.message,
      );
    }
  }
  async registerDesignation1(dto) {
    const {
      username,
      name,
      gender,
      role,
      designation,
      school_id,
      mobile,
      email,
      class_id,
      password,
      table,
    } = dto;
    

    // ✅ Detect fully empty rows
    if (
      (!username || username.trim() === '') &&
      (!name || name.trim() === '') &&
      (!gender || gender.toString().trim() === '') &&
      (!school_id || school_id.toString().trim() === '') &&
      (!mobile || mobile.trim() === '') &&
      (!email || email.trim() === '') &&
      (!class_id || class_id.toString().trim() === '') &&
      (!password || password.trim() === '')
    ) {
      console.log(`⚠️ Empty row detected for table: ${table}`);
      return { emptyRow: true };
    }

    const schoolIdInt = parseInt(school_id);
    const classIdInt = class_id ? parseInt(class_id) : null;

    const tableMap = {
      admin: async () => {
        const school = await this.prisma.school.findUnique({
          where: { id: schoolIdInt },
        });
        if (!school)
          throw new BadRequestException(`Invalid school_id: ${schoolIdInt}`);

        const existingAdmin = await this.prisma.admin.findUnique({
          where: { username },
        });
        if (existingAdmin) return { alreadyExisting: { username } };

        const attendanceUser = await this.prisma.attendance_user.findUnique({
          where: { username },
        });
        if (!attendanceUser) {
          await this.prisma.attendance_user.create({
            data: {
              username,
              password: password || '',
              role: 'admin',
              school_id: schoolIdInt,
            },
          });
        }

        return await this.prisma.admin.create({
          data: {
            username,
            name,
            designation,
            gender,
            school_id: schoolIdInt,
            mobile,
            email,
          },
        });
      },

      staff: async () => {
        const school = await this.prisma.school.findUnique({
          where: { id: schoolIdInt },
        });
        if (!school)
          throw new BadRequestException(`Invalid school_id: ${schoolIdInt}`);

        const existingStaff = await this.prisma.staff.findUnique({
          where: { username },
        });
        if (existingStaff) return { alreadyExisting: { username } };

        const attendanceUser = await this.prisma.attendance_user.findUnique({
          where: { username },
        });
        if (!attendanceUser) {
          await this.prisma.attendance_user.create({
            data: {
              username,
              password: password || '',
              role: 'staff',
              school_id: schoolIdInt,
            },
          });
        }

        return await this.prisma.staff.create({
          data: {
            username,
            name,
            gender,
            designation,
            school_id: schoolIdInt,
            mobile,
            email,
            password: password || '',
          },
        });
      },

      students: async () => {
        const school = await this.prisma.school.findUnique({
          where: { id: schoolIdInt },
        });
        if (!school)
          throw new BadRequestException(`Invalid school_id: ${schoolIdInt}`);

        const existingStudent = await this.prisma.student.findUnique({
          where: { username },
        });
        if (existingStudent) return { alreadyExisting: { username } };

        const attendanceUser = await this.prisma.attendance_user.findUnique({
          where: { username },
        });
        if (!attendanceUser) {
          await this.prisma.attendance_user.create({
            data: {
              username,
              password: password || '',
              role: 'student',
              school_id: schoolIdInt,
            },
          });
        }

        return await this.prisma.student.create({
          data: {
            username,
            name,
            gender: gender as any,
            mobile,
            email,
            photo: null,
            school_id: schoolIdInt,
            class_id: Number(classIdInt),
            password: password || '',
          },
        });
      },
    };

    const insertFn = tableMap[table];
    if (!insertFn) throw new BadRequestException('Invalid table name');

    return await insertFn();
  }
}
