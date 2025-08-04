// import { Injectable } from '@nestjs/common';
// import * as ExcelJS from 'exceljs';
//  // unified service
// import { AttendanceUserService } from 'src/attendance-user/attendance-user.service';
// import { RegisterDesignationDto } from 'src/auth/dto/register-designation.dto';

// @Injectable()
// export class ExcelUploadService {
//   constructor(private readonly userService: AttendanceUserService) {}

//   // ✅ Handles Admin, Staff, and Students Excel uploads
//   async processExcel(filePath: string, table: 'admin' | 'staff' | 'students', res: any) {
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(filePath);
//     const sheet = workbook.worksheets[0];

//     const inserted: RegisterDesignationDto[] = [];
//     const duplicates: RegisterDesignationDto[] = [];

//     for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
//       const row = sheet.getRow(rowNum);
//       const values = row.values as any[];

//       // ✅ Convert row to DTO based on table
//       const dto: RegisterDesignationDto = this.mapRowToDto(values, table);

//       // ✅ Check duplicates
//       const exists = await this.userService.checkIfUserExists(dto.username, table);
//       if (exists) {
//         duplicates.push(dto);
//       } else {
//         await this.userService.registerDesignation(dto);
//         inserted.push(dto);
//       }
//     }

//     // ✅ Return duplicate Excel if any
//     if (duplicates.length > 0) {
//       const dupWorkbook = new ExcelJS.Workbook();
//       const dupSheet = dupWorkbook.addWorksheet('Duplicates');

//       // Add headers dynamically
//       dupSheet.addRow(Object.keys(duplicates[0]));
//       duplicates.forEach((d) => dupSheet.addRow(Object.values(d)));

//       const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', `attachment; filename=${table}_duplicates_${timestamp}.xlsx`);
//       await dupWorkbook.xlsx.write(res);
//       return res.end();
//     }

//     return res.json({ message: `${inserted.length} ${table} records inserted successfully. No duplicates.` });
//   }

//   // ✅ Map Excel row values to DTO dynamically
//   private mapRowToDto(values: any[], table: 'admin' | 'staff' | 'students'): RegisterDesignationDto {
//     if (table === 'admin' || table === 'staff') {
//       return {
//         username: values[1],
//         name: values[2],
//         gender: values[3],
//         role: values[4],
//         designation: values[5],
//         school_id: values[6]?.toString(),
//         mobile: values[7]?.toString(),
//         email: values[8] || '',
//         password: values[9],
//         table,
//       };
//     }
//     if (table === 'students') {
//       return {
//         username: values[1],
//         name: values[2],
//         gender: values[3],
//         role: values[4],
//         school_id: values[5]?.toString(),
//         mobile: values[6]?.toString(),
//         email: values[7] || '',
//         classId: values[8]?.toString(),
//         password: values[9],
//         table,
//       };
//     }
//   }
// }
