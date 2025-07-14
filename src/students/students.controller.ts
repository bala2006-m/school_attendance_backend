import { BadRequestException ,Body, Post, Controller, Get,Delete,Put, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
 @Get('school-class')
  async getSchoolAndClass(@Query('username') username: string) {
    return this.studentsService.getSchoolAndClassByUsername(username);
  }
@Get('fetch_all_student_data')
  async fetchAllStudents(@Query('school_id') schoolId?: string) {
    return this.studentsService.getAllStudents(schoolId);
  }
  @Get('by-username')
  async getStudentByUsername(@Query('username') username: string) {
    try {
      if (!username) {
        return { status: 'error', message: 'Missing or empty username' };
      }

      return await this.studentsService.findByUsername(username);
    } catch (error) {
      console.error('Error in getStudentByUsername:', error); // <-- this is what we need
      return { status: 'error', message: 'Internal server error' };
    }
  }


  @Post('register')
    async registerStudent(@Body() dto: RegisterStudentDto) {
      return this.studentsService.registerStudent(dto);
    }
 @Delete('delete')
  async deleteStudent(@Query('username') username: string) {
    if (!username) {
      return { status: 'error', message: 'Missing username' };
    }

    return this.studentsService.deleteStudent(username);
  }
 @Post('change-password')
   async changePassword(@Body() dto: ChangePasswordDto) {
     return this.studentsService.changeStudentPassword(dto);
   }
@Get('all-by-class')
  async getAllByClass(@Query('class_id') classId: string) {
    if (!classId) {
      return { status: 'error', message: 'Missing class_id' };
    }

    return this.studentsService.getAllByClass(classId);
  }


  @Get('fetch-student-data')
    async getAllByClassAndSchool(@Query('class_id') classId: string, @Query('school_id') schoolId: string ) {
      if (!classId||!schoolId) {
        return { status: 'error', message: 'Missing class_id or school_id' };
      }

      return this.studentsService.getAllByClass(classId);
    }
@Get('count_student')
  async countStudents(@Query('school_id') schoolId?: string) {
    if (!schoolId) {
      throw new BadRequestException({
        status: 'failure',
        message: 'Missing or empty school_id',
      });
    }

    const id = parseInt(schoolId, 10);
    if (isNaN(id)) {
      throw new BadRequestException({
        status: 'failure',
        message: 'Invalid school_id',
      });
    }

    const count = await this.studentsService.countStudentsBySchool(id);

    return {
      status: 'success',
      count,
    };
  }
  @Get('fetch_student_name')
    async getStudentByUsername1(
      @Query('username') username: string,
      @Query('school_id') schoolId: string,
      @Query('class_id') classId: string,
    ) {
      if (!username || !schoolId || !classId) {
        throw new BadRequestException('Missing parameters');
      }

      const schoolIdInt = parseInt(schoolId);
      const classIdInt = parseInt(classId);

      const student = await this.studentsService.findStudentByUsernameClassSchool(
        username,
        classIdInt,
        schoolIdInt,
      );

      if (!student) {
        return {
          status: 'error',
          message: 'Student not found',
        };
      }

      return {
        status: 'success',
        student: {
          name: student.name,
          gender: student.gender,
          email: student.email,
          mobile: student.mobile,
        },
      };
    }
}
