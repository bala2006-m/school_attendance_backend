import { Controller, Get, Query,Post,Body,Put,Param,Delete } from '@nestjs/common';
import { ClassTimetableService } from './class-timetable.service';
import { SaveTimetableDto } from './dto/timetable.dto';

@Controller('timetable')
export class ClassTimetableController {
  constructor(private readonly timetableService: ClassTimetableService) {}



 @Post()
   async save(@Body() dto: SaveTimetableDto) {
     return this.timetableService.saveTimetables(dto.data);
   }
  @Get()
  async getTimetable(
    @Query('schoolId') schoolIdStr: string,
    @Query('classId') classIdStr: string,
  ) {
    const schoolId = parseInt(schoolIdStr);
    const classId = parseInt(classIdStr);

    if (isNaN(schoolId) || isNaN(classId)) {
      return { status: 'error', message: 'Invalid schoolId or classId' };
    }

    const result = await this.timetableService.getTimetable(schoolId, classId);
    return { status: 'success', timetable: result };
  }



//    @Put(':id')
//     async update(@Param('id') id: number, @Body() data: Partial<CreateTimetableDto>) {
//       return this.timetableService.update(+id, data);
//     }
//
//     @Delete(':id')
//     async delete(@Param('id') id: number) {
//       return this.timetableService.delete(+id);
//     }
}
