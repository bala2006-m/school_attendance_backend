import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(data: {
    name: string;
    email: string;
    feedback: string;
    schoolId: number;
    classId: number;
  }) {
    const { name, email, feedback, schoolId, classId } = data;

    await this.prisma.feedback.create({
      data: {
        name,
        email,
        feedback,
        school_id: schoolId,
        class_id: classId,
      },
    });

    return { message: 'Feedback successfully submitted' };
  }
}
