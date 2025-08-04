import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service'; // adjust path accordingly

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async storeFeedback(@Body() body: any) {
    const { name, email, feedback, schoolId, classId } = body;

    // Delegate creation to feedbackService
    const newFeedback = await this.feedbackService.createFeedback({
      name,
      email,
      feedback,
      school_id: parseInt(schoolId, 10),
      class_id: parseInt(classId, 10),
    });

    return { status: 'success', data: newFeedback };
  }

  @Get('list')
  async getFeedbacks(
    @Query('school_id') school_id?: number,
  ) {
    if (!school_id) {
      throw new Error('school_id query parameter is required');
    }

    return this.feedbackService.getFeedbackBySchool({school_id});
  }
}
