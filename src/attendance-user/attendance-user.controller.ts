
import { Controller, Get, Query } from '@nestjs/common';
import { AttendanceUserService } from './attendance-user.service';

@Controller('attendance-users')
export class AttendanceUserController {
  constructor(private readonly attendanceUserService: AttendanceUserService) {}

  @Get()
  async getUsersByRole(@Query('role') role: string) {
    return this.attendanceUserService.getUsersByRole(role);
  }
}
