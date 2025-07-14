import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class ClassTimetableService {
  constructor(private prisma: PrismaService) {}

  async saveTimetables(data: string) {
    const lines = data
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const entries = lines.map((line) => {
      const [schoolIdStr, classesIdStr, dayOfWeekRaw, periodNumberStr, ...subjectParts] = line.split(' ');

      const schoolId = parseInt(schoolIdStr, 10);
      const classesId = parseInt(classesIdStr, 10);
      const periodNumber = parseInt(periodNumberStr, 10);
      const subject = subjectParts.join(' ');

      // Ensure dayOfWeek is a valid enum
      const dayOfWeek = dayOfWeekRaw as DayOfWeek;

      return {
        schoolId,
        classesId,
        dayOfWeek,
        periodNumber,
        subject,
      };
    });

    await this.prisma.classTimetable.createMany({
      data: entries,
      skipDuplicates: true,
    });

    return { success: true, count: entries.length };
  }

  async getTimetable(schoolId: number, classesId: number) {
    const rows = await this.prisma.classTimetable.findMany({
      where: {
        schoolId,
        classesId,
      },
      select: {
        dayOfWeek: true,
        periodNumber: true,
        subject: true,
      },
      orderBy: {
        periodNumber: 'asc',
      },
    });

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const grouped: Record<string, any[]> = {};

    for (const row of rows) {
      const day = row.dayOfWeek;
      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push({
        period: row.periodNumber,
        subject: row.subject,
        session: row.periodNumber <= 4 ? 'FN' : 'AN',
      });
    }

    // Sort by custom day order
    const sortedGrouped: Record<string, any[]> = {};
    for (const day of dayOrder) {
      if (grouped[day]) {
        sortedGrouped[day] = grouped[day];
      }
    }

    return sortedGrouped;
  }


  async findByClass(schoolId: number, classesId: number) {
    return this.prisma.classTimetable.findMany({
      where: {
        schoolId,
        classesId,
      },
      orderBy: {
        periodNumber: 'asc',
      },
    });
  }
}
