import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

export type RoleType = 'admin' | 'staff' | 'student';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new leave request
  async createLeaveRequest(data: {
    username: string;
    role?: RoleType;
    school_id: number;
    class_id: number;
    from_date: Date;
    to_date: Date;
    reason?: string;
  }) {
    if (data.from_date > data.to_date) {
      throw new BadRequestException('from_date cannot be later than to_date');
    }
    return this.prisma.leaveRequest.create({
      data: {
        username: data.username,
        role: data.role ?? 'student',
        school_id: data.school_id,
        class_id: data.class_id,
        from_date: data.from_date,
        to_date: data.to_date,
        reason: data.reason,
        status: 'pending',
      },
    });
  }

  // Get leave requests with optional filters
  async getLeaveRequests(filters: {
    school_id?: number;
  }) {
    const where: any = {};

    if (filters.school_id !== undefined) where.school_id = filters.school_id;

    return this.prisma.leaveRequest.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  // Update the status of a leave request (approve/reject)
  async updateLeaveRequestStatus(id: number, status: 'approved' | 'rejected') {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status, updated_at: new Date() },
    });
  }
}
