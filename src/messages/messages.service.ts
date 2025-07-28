import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getLastMessageBySchoolId(schoolId: number) {
    return this.prisma.messages.findFirst({
      where: { school_id: schoolId },
      orderBy: {
        id: 'desc',
      },
    });
  }
  async postMessage(message: string, school_id: number) {
  try {
    const newMessage = await this.prisma.messages.create({
      data: {
        messages: message,
        school_id: school_id,
      },
    });

    return {
      status: 'success',
      message: 'Message added successfully',
      data: {
        message: newMessage.messages,
        school_id: newMessage.school_id,
      },
    };
  } catch (error) {
    throw new InternalServerErrorException('Add failed: ' + error.message);
  }
}

  }

