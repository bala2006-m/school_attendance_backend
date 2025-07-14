// src/school/schools.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('fetch_school_data')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  async getSchoolById(@Query('id') id: string) {
    // Validate that ID is provided and is a number
    if (!id || isNaN(Number(id))) {
      return { status: 'error', message: 'Invalid or missing school ID' };
    }

    try {
      const school = await this.schoolsService.findById(Number(id));

      if (!school) {
        return { status: 'error', message: 'School not found' };
      }

      // Convert photo (Buffer) to base64
      const photoBase64 = school.photo
        ? Buffer.from(school.photo).toString('base64')
        : null;

      return {
        status: 'success',
        schools: [
          {
            id: school.id,
            name: school.name,
            address: school.address,
            photo: photoBase64,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching school:', error);
      return { status: 'error', message: 'Internal server error' };
    }
  }
}
