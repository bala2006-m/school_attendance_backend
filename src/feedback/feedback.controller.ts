import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async storeFeedback(@Body() body: any) {
    const { name, email, feedback, schoolId, classId } = body;

    const newFeedback = await this.prisma.feedback.create({
      data: {
        name,
        email,
        feedback,
        school_id: parseInt(schoolId),
        class_id: parseInt(classId),
      },
    });

    return { status: 'success', data: newFeedback };
  }
}
