import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(data: {
    name: string;
    email: string;
    feedback: string;
    school_id: number;
    class_id: number;
  }) {
    return this.prisma.feedback.create({ data });
  }

  async getFeedbackBySchool(params: {
    school_id: number;
  }) {
    const { school_id} = params;
const schoolId = Number(school_id);
    const where: any = { school_id:schoolId };

    return this.prisma.feedback.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }
}
