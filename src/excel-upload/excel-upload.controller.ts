// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   BadRequestException,
//   Res,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import * as fs from 'fs';
// import { Response } from 'express';
// import { ExcelUploadService } from './excel-upload.service';

// @Controller('excel-upload')
// export class ExcelUploadController {
//   constructor(private readonly excelService: ExcelUploadService) {}

//   private ensurePath(path: string) {
//     if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
//   }

//   @Post('admin')
//   @UseInterceptors(FileInterceptor('file', {
//     storage: diskStorage({
//       destination: (req, file, cb) => {
//         const path = './uploads/admin';
//         if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
//         cb(null, path);
//       },
//       filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
//     }),
//   }))
//   async uploadAdmin(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
//     if (!file) throw new BadRequestException('No file uploaded');
//     return this.excelService.processExcel(file.path, 'admin', res);
//   }

//   @Post('staff')
//   @UseInterceptors(FileInterceptor('file', {
//     storage: diskStorage({
//       destination: (req, file, cb) => {
//         const path = './uploads/staff';
//         if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
//         cb(null, path);
//       },
//       filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
//     }),
//   }))
//   async uploadStaff(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
//     if (!file) throw new BadRequestException('No file uploaded');
//     return this.excelService.processExcel(file.path, 'staff', res);
//   }

//   @Post('students')
//   @UseInterceptors(FileInterceptor('file', {
//     storage: diskStorage({
//       destination: (req, file, cb) => {
//         const path = './uploads/students';
//         if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
//         cb(null, path);
//       },
//       filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
//     }),
//   }))
//   async uploadStudents(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
//     if (!file) throw new BadRequestException('No file uploaded');
//     return this.excelService.processExcel(file.path, 'students', res);
//   }
// }
