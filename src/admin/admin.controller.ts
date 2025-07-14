import { Controller, Get, Param, Patch, Body,Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';


@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('fetch_admin')
  async fetchAdminData(@Query('username') username?: string) {
    try {
      const data = await this.adminService.getAdmin(username);
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
  @Patch(':username')
    async updateAdmin(
      @Param('username') username: string,
      @Body() dto: UpdateAdminDto,
    ) {
      return this.adminService.updateAdmin(username, dto);
    }
}
