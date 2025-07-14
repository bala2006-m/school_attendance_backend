import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateStaffAttendanceDto } from './dto/create-staff-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkAttendanceExists(schoolId: string, classId: string, date: string): Promise<boolean> {
    try {
      const exists = await this.prisma.studentAttendance.findFirst({
        where: {
          school_id: Number(schoolId),
          class_id: Number(classId),
          date: new Date(date),
        },
      });
      return !!exists;
    } catch (error) {
      throw new InternalServerErrorException('Database query failed');
    }
  }

  async fetchAttendanceByClassId(class_id: string, school_id: string, username: string) {
    return this.prisma.studentAttendance.findMany({
      where: {
        class_id: Number(class_id),
        school_id: Number(school_id),
        username,
      },
      select: {
        date: true,
        fn_status: true,
        an_status: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async markStudentAttendance(dto: CreateAttendanceDto) {
    const { username, date, session, status, school_id, class_id } = dto;
    const column = session === 'FN' ? 'fn_status' : 'an_status';

    // Try to update first
    const existing = await this.prisma.studentAttendance.findUnique({
      where: {
        username_date: {
          username,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      await this.prisma.studentAttendance.update({
        where: {
          username_date: {
            username,
            date: new Date(date),
          },
        },
        data: {
          [column]: status,
        },
      });
    } else {
      await this.prisma.studentAttendance.create({
        data: {
          username,
          date: new Date(date),
          [column]: status,
          school_id: Number(school_id),
          class_id: Number(class_id),
        },
      });
    }

    return { status: 'success', message: 'Student attendance recorded' };
  }

  async getStudentAttendance(date?: string, schoolId?: string) {
    if (!schoolId) return [];

    const whereCondition: any = {
      school_id: parseInt(schoolId),
    };

    if (date) {
      whereCondition.date = new Date(date);
    }

    return this.prisma.studentAttendance.findMany({
      where: whereCondition,
      select: {
        username: true,
        date: true,
        fn_status: true,
        an_status: true,
      },
    });
  }

  async getAttendanceByClassAndDate(class_id: string, date: string, school_id: string) {
    const students = await this.prisma.student.findMany({
      where: {
        class_id: Number(class_id),
        school_id: Number(school_id),
      },
      select: {
        username: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        class_id: Number(class_id),
        school_id: Number(school_id),
        date: new Date(date),
      },
    });

    const attendance = students.map((student) => {
      const record = attendanceRecords.find(
        (att) => att.username === student.username
      );
      return {
        username: student.username,
        name: student.name,
        fn_status: record?.fn_status ?? null,
        an_status: record?.an_status ?? null,
      };
    });

    return {
      status: 'success',
      count: attendance.length,
      attendance,
    };
  }

  async getMonthlySummary(username: string, month: number, year: number) {
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0);

    const records = await this.prisma.studentAttendance.findMany({
      where: {
        username,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        date: true,
        fn_status: true,
        an_status: true,
      },
      orderBy: { date: 'asc' },
    });

    return {
      status: 'success',
      count: records.length,
      month,
      year,
      records,
    };
  }

  async getDailySummary(username: string, date: string) {
    const record = await this.prisma.studentAttendance.findUnique({
      where: {
        username_date: {
          username,
          date: new Date(date),
        },
      },
      select: {
        fn_status: true,
        an_status: true,
      },
    });

    return {
      status: 'success',
      date,
      username,
      record: record ?? { fn_status: null, an_status: null },
    };
  }

  async markStaffAttendance(dto: CreateStaffAttendanceDto) {
    const { username, date, session, status, school_id } = dto;
    const column = session === 'FN' ? 'fn_status' : 'an_status';

    const existing = await this.prisma.staffAttendance.findUnique({
      where: {
        username_date: {
          username,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      await this.prisma.staffAttendance.update({
        where: {
          username_date: {
            username,
            date: new Date(date),
          },
        },
        data: {
          [column]: status,
        },
      });
    } else {
      await this.prisma.staffAttendance.create({
        data: {
          username,
          date: new Date(date),
          [column]: status,
          school_id: Number(school_id),
        },
      });
    }

    return { status: 'success', message: 'Staff attendance recorded' };
  }

  async getStaffDailySummary(username: string, date: string) {
    const record = await this.prisma.staffAttendance.findUnique({
      where: {
        username_date: {
          username,
          date: new Date(date),
        },
      },
      select: {
        fn_status: true,
        an_status: true,
      },
    });

    return {
      status: 'success',
      date,
      username,
      record: record ?? { fn_status: null, an_status: null },
    };
  }

  async getStaffMonthly(username: string, month: number, year: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const records = await this.prisma.staffAttendance.findMany({
      where: {
        username,
        date: {
          gte: from,
          lte: to,
        },
      },
      select: {
        date: true,
        fn_status: true,
        an_status: true,
      },
      orderBy: { date: 'asc' },
    });

    return {
      status: 'success',
      username,
      month,
      year,
      records,
    };
  }

  async fetchAttendance(date?: string, schoolId?: string) {
    const whereClause: any = {};
    if (date) whereClause.date = new Date(date);
    if (schoolId) whereClause.school_id = Number(schoolId);

    const attendance = await this.prisma.staffAttendance.findMany({
      where: whereClause,
      select: {
        username: true,
        date: true,
        fn_status: true,
        an_status: true,
      },
    });

    return {
      status: 'success',
      staff: attendance,
    };
  }

  async getAbsentees(
    date: Date,
    schoolId: number,
    classId: number,
    sessionField: 'fn_status' | 'an_status',
  ): Promise<string[]> {
    const absentees = await this.prisma.studentAttendance.findMany({
      where: {
        date,
        school_id: schoolId,
        class_id: classId,
        [sessionField]: 'A',
      },
      select: {
        username: true,
      },
    });

    return absentees.map((a) => a.username);
  }
}
