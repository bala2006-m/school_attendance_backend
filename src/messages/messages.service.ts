import { Injectable } from '@nestjs/common';
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
}
