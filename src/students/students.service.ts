import { PrismaService } from '../common/prisma.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password.dto';
import { log } from 'console';
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
    const exists = await this.prisma.student.findUnique({
      where: { username },
    });

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
      where: { class_id: Number(class_id) },
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
  async getAllByClassAndSchool(class_id: string, school_id: string) {
    const students = await this.prisma.student.findMany({
      where: { class_id: Number(class_id), school_id: Number(school_id) },
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

  async getUsersWithLongestConsecutiveAbsentDays(params: {
    school_id?: number;
    class_id?: number;
    limit: number; // minimum streak length to consider
  }) {
    const { school_id, class_id, limit } = params;

    if (!limit || limit < 1) {
      throw new Error('limit parameter must be a positive integer');
    }

    const where: any = {
      OR: [{ fn_status: 'A' }, { an_status: 'A' }],
    };
    if (school_id !== undefined) where.school_id = Number(school_id);
    if (class_id !== undefined) where.class_id = Number(class_id);

    const records = await this.prisma.studentAttendance.findMany({
      where,
      select: {
        username: true,
        date: true,
      },
      orderBy: [{ username: 'asc' }, { date: 'asc' }],
    });

    const grouped: Record<string, Date[]> = {};
    for (const rec of records) {
      if (!grouped[rec.username]) grouped[rec.username] = [];
      grouped[rec.username].push(new Date(rec.date));
    }

    const result: { username: string; dates: string[] }[] = [];

    for (const [username, dates] of Object.entries(grouped)) {
      dates.sort((a, b) => a.getTime() - b.getTime());

      let maxStreakStartIndex = 0;
      let maxStreakLength = 1;

      let currentStreakStartIndex = 0;
      let currentStreakLength = 1;

      for (let i = 1; i < dates.length; i++) {
        const diff =
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          // Consecutive day
          currentStreakLength++;
        } else {
          // Sequence breaks here, check if current streak is longest
          if (currentStreakLength > maxStreakLength) {
            maxStreakLength = currentStreakLength;
            maxStreakStartIndex = currentStreakStartIndex;
          }
          // Reset to new streak
          currentStreakStartIndex = i;
          currentStreakLength = 1;
        }
      }

      // After loop, check last streak
      if (currentStreakLength > maxStreakLength) {
        maxStreakLength = currentStreakLength;
        maxStreakStartIndex = currentStreakStartIndex;
      }

      // Include only if streak is at least `limit`
      if (maxStreakLength >= limit) {
        const streakDates = dates
          .slice(maxStreakStartIndex, maxStreakStartIndex + maxStreakLength)
          .map((d) => d.toISOString().split('T')[0]);

        result.push({
          username,
          dates: streakDates,
        });
      }
    }

    return result;
  }

  async getStudentsWithLowAttendance(params: {
    school_id?: number;
    class_id?: number;
    thresholdPercent: number; // e.g. 50 for 50%
  }) {
    const { school_id, class_id, thresholdPercent } = params;
    if (thresholdPercent < 0 || thresholdPercent > 100) {
      throw new Error('thresholdPercent must be between 0 and 100');
    }

    // Build filtering for school and class
    const where: any = {};
    if (school_id !== undefined) where.school_id = Number(school_id);
    if (class_id !== undefined) where.class_id = Number(class_id);

    // Fetch all attendance records for filtered students
    const records = await this.prisma.studentAttendance.findMany({
      where,
      select: {
        username: true,
        fn_status: true,
        an_status: true,
      },
    });

    // Group records by user
    const grouped: Record<
      string,
      { presentCount: number; totalCount: number }
    > = {};

    for (const rec of records) {
      if (!grouped[rec.username]) {
        grouped[rec.username] = { presentCount: 0, totalCount: 0 };
      }
      const userStats = grouped[rec.username];

      // Each record (day) counts as 2 half-days
      userStats.totalCount += 2;
      console.log(`Processing record for ${rec.username}: fn_status=${rec.fn_status}, an_status=${rec.an_status}`);
      

      // Count present halves
      if (rec.fn_status === 'P') userStats.presentCount += 1;
      if (rec.an_status === 'P') userStats.presentCount += 1;
    }

    // Calculate percentage and filter users below or equal threshold
    const result = Object.entries(grouped)
      .map(([username, stats]) => {
        const percentage = (stats.presentCount / stats.totalCount) * 100;
        return { username, percentage };
      })
      .filter((user) => user.percentage <= thresholdPercent)
      .sort((a, b) => a.percentage - b.percentage); // optional: lowest attendance first

    return result;
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
