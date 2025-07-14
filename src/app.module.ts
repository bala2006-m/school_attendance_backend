import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HolidaysModule } from './holidays/holidays.module';
import { AttendanceModule } from './attendance/attendance.module';
import { StaffModule } from './staff/staff.module';
import { StudentsModule } from './students/students.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DbModule } from './db/db.module';
import { ClassTimetableModule } from './timetable/class-timetable.module';
import {FeedbackModule} from './feedback/feedback.module';
import { SchoolsModule } from './school/schools.module';
import { ClassesModule } from './class/classes.module';
import { AdminModule } from './admin/admin.module';
import {AuthModule } from './auth/auth.module';
import { AttendanceUserModule } from './attendance-user/attendance-user.module'
@Module({
  imports: [
      StudentsModule,
    HolidaysModule,
    AttendanceModule,
     StaffModule,
     DashboardModule,
     DbModule,
     ClassTimetableModule,
     FeedbackModule,
     SchoolsModule,
     ClassesModule,
     AdminModule,
     AuthModule,
     AttendanceUserModule,
    // add more modules here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
