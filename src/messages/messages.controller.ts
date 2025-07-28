import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('last/:schoolId')
  async getLastMessage(@Param('schoolId', ParseIntPipe) schoolId: number) {
    return this.messagesService.getLastMessageBySchoolId(schoolId);
  }
}
