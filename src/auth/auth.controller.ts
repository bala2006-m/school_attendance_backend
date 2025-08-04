import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterDesignationDto } from './dto/register-designation.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { log } from 'console';
import { Table } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('register-designation')
  async registerDesignation(@Body() dto: RegisterDesignationDto) {
    return this.authService.registerDesignation(dto);
  }
  @Post('register_student')
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('excel-upload/:table')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = `./uploads/${req.params.table}`;
          if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
          cb(null, folder);
        },
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only Excel files are allowed'), false);
      },
    }),
  )
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const table = req.params.table;
    if (!['admin', 'staff', 'students'].includes(table)) {
      throw new BadRequestException('Invalid table type');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Excel file has no sheets');

    const createdRecords: { row: number; username: string; reason: string }[] =
      [];
    const existingRecords: { row: number; username: string; reason: string }[] =
      [];
    const errors: { row: number; username: string; reason: string }[] = [];
    const emptyRows: { row: number; reason: string }[] = [];

    let totalRows = 0;

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      // ✅ Check if row is null or truly empty (ExcelJS quirk fix)
      if (
        !row ||
        !Array.isArray(row.values) ||
        row.values.length === 0 ||
        (Array.isArray(row.values) && row.values.every((v) => v === null))
      ) {
        emptyRows.push({ row: i - 1, reason: 'Empty row detected' });
        continue;
      }

      // ✅ Convert row to array (skip index 0)
      const valuesArray = Array.isArray(row.values)
        ? row.values.slice(1)
        : Object.values(row.values);

      // ✅ Check if all cells are blank/empty objects
      const isRowCompletelyEmpty = valuesArray.every(
        (cell) =>
          !cell ||
          (typeof cell === 'object' && 'text' in cell && !cell.text) || // Handle { text: '' }
          (typeof cell === 'string' && cell.trim() === ''),
      );

      if (isRowCompletelyEmpty) {
        emptyRows.push({ row: i - 1, reason: 'Empty row detected' });
        continue;
      }

      totalRows++;

      const dto = this.mapRowToDto(valuesArray, table);
      dto.table = table;

      try {
        const result = await this.authService.registerDesignation1(dto);

        if (result?.emptyRow) {
          emptyRows.push({ row: i - 1, reason: 'Empty row detected' });
          continue;
        }

        if (result?.alreadyExisting) {
          existingRecords.push({
            row: i - 1,
            username: dto.username || 'Unknown',
            reason: 'Already exists',
          });
        } else if (result) {
          createdRecords.push({
            row: i - 1,
            username: dto.username || 'Unknown',
            reason: 'Created successfully',
          });
        }
      } catch (err) {
        errors.push({
          row: i - 1,
          username: valuesArray[0]?.toString()?.trim() || 'Unknown',
          reason: err.message || 'Unknown error',
        });
      }
    }

    // ✅ If Excel has no data rows (only empties)
    if (totalRows === 0 && emptyRows.length > 0) {
      return {
        Table: table,
        status: 'failed',
        message: 'Your Excel is empty. Please upload a valid file with data.',
        // empty: emptyRows,
      };
    }

    return totalRows === 0 && emptyRows.length > 0
      ? {
          Table: table,
          status: 'failed',
          message: 'Your Excel is empty. Please upload a valid file with data.',
          // empty: emptyRows,
        }
      : {
          Table: table,
          status: 'success',
          message: `${createdRecords.length} created, ${existingRecords.length} duplicates, ${emptyRows.length} empty rows, ${errors.length} errors.`,
          created: createdRecords,
          duplicates: existingRecords,
          empty: emptyRows,
          errors: errors,
        };
  }

  private mapRowToDto(values: any[], table: string): RegisterDesignationDto {
    switch (table) {
      case 'admin': // Map Excel columns to admin fields
        return {
          username: values[0]?.toString()?.trim() ?? '',
          name: values[1]?.toString()?.trim() ?? '',
          gender: values[2]?.toString()?.trim() ?? '',
          designation: values[3]?.toString()?.trim() ?? '',
          school_id: values[4]?.toString()?.trim() ?? '',
          mobile: values[5]?.toString()?.trim() ?? '',
          email: values[6]?.toString()?.trim() ?? '',
          class_id: '',
          password: '',
          role: '',
          table,
        };
      case 'staff': // Map Excel columns to staff fields (order must match Excel)
        return {
          username: values[0]?.toString()?.trim() ?? '',
          name: values[1]?.toString()?.trim() ?? '',
          gender: values[2]?.toString()?.trim() ?? '',
          designation: values[3]?.toString()?.trim() ?? '',
          school_id: values[4]?.toString()?.trim() ?? '',
          mobile: values[5]?.toString()?.trim() ?? '',
          email: values[6]?.toString()?.trim() ?? '',
          password: values[7]?.toString()?.trim() ?? '',
          role: '',
          class_id: '',
          table,
        };
      case 'students': // Mapping for students (designation and role intentionally blank)
        return {
          username: values[0]?.toString()?.trim() ?? '',
          name: values[1]?.toString()?.trim() ?? '',
          gender: values[2]?.toString()?.trim() ?? '',
          mobile: values[3]?.toString()?.trim() ?? '',
          email: values[4]?.toString()?.trim() ?? '',
          school_id: values[5]?.toString()?.trim() ?? '',
          class_id: values[6]?.toString()?.trim() ?? '',
          password: values[7]?.toString()?.trim() ?? '',
          role: '', // Students do not have a role
          designation: '', // Students do not have a designation
          table,
        };
      default:
        throw new BadRequestException('Unknown table');
    }
  }
}
