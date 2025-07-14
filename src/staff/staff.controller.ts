import { Body, Controller, Param,Post,Get,Put,Delete,Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ChangeStaffPasswordDto } from './dto/change-password.dto';
import { Injectable, NotFoundException ,BadRequestException} from '@nestjs/common';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}
 @Put('update/:username')
  async updateProfile(
    @Param('username') username: string,
    @Body() updateData: UpdateStaffDto,
  ) {
    const staff = await this.staffService.findByUsername(username);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    const updated = await this.staffService.updateProfile(username, updateData);
    return { status: 'success', data: updated };
  }

@Get('fetch-staffs')
async getProfileByUsername1(@Query('username') username: string) {
  if (!username) {
    return {
      status: 'error',
      message: 'Missing or empty username parameter.',
    };
  }

  try {
    const staff = await this.staffService.getProfileByUsername(username);

    if (staff) {
      return {
        status: 'success',
        staff: {
            id:staff.id,
            username: staff.username,
            email: staff.email,
          school_id: staff.school_id,
          name: staff.name,
          designation: staff.designation,
          gender: staff.gender,
          mobile: staff.mobile,
        },
      };
    } else {
      return {
        status: 'success',
        staff: null,
        message: `No staff found for username: ${username}`,
      };
    }
  } catch (error) {
    console.error('Controller error:', error); // ✅ log controller-level issues too
    return {
      status: 'error',
      message: 'Database query failed.',
    };
  }
}




@Get('fetch-by-username')
async getByUsername(@Query('username') username: string) {
  if (!username) {
    return {
      status: 'error',
      message: 'Missing or empty username parameter.',
    };
  }

  try {
    const staff = await this.staffService.findByUsername(username);

    if (staff) {
      return {
        status: 'success',
        staff: {
          school_id: staff.school_id,
          name: staff.name,
          designation: staff.designation,
          gender: staff.gender,
          mobile: staff.mobile,
        },
      };
    } else {
      return {
        status: 'success',
        staff: null,
        message: `No staff found for username: ${username}`,
      };
    }
  } catch (error) {
    console.error('Controller error:', error); // ✅ log controller-level issues too
    return {
      status: 'error',
      message: 'Database query failed.',
    };
  }
}


  @Post('register')
  async register(@Body() dto: RegisterStaffDto) {
    return this.staffService.register(dto);
  }
  @Get('all-by-school')
    async getAllBySchoolId(@Query('school_id') schoolId: string) {
      if (!schoolId) {
        return { status: 'error', message: 'Missing school_id' };
      }
const id = parseInt(schoolId, 10);
      return this.staffService.getAllBySchool(id);
    }
@Put('update')
  async updateStaff(
    @Query('username') username: string,
    @Body() dto: UpdateStaffDto,
  ) {
    if (!username) {
      return { status: 'error', message: 'Missing username' };
    }
    return this.staffService.updateStaff(username, dto);
  }
   @Delete('delete')
    async deleteStaff(@Query('username') username: string) {
      if (!username) {
        return { status: 'error', message: 'Missing username' };
      }
      return this.staffService.deleteStaff(username);
    }
@Put('change-password')
  async changePassword(@Body() dto: ChangeStaffPasswordDto) {
    return this.staffService.changePassword(dto);
  }
@Get('count')
  async countStaff(@Query('school_id') schoolId: string) {
    if (!schoolId) {
      throw new BadRequestException('Missing or empty school_id');
    }

    return this.staffService.countStaffBySchoolId(+schoolId);
  }

}
