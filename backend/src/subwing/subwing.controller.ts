import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubwingService } from './subwing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('subwing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubwingController {
  constructor(private readonly subwingService: SubwingService) {}

  @Roles(Role.SUBWING) // Only Sub-Wings can create programs
  @Post('programs')
  createProgram(@Request() req: any, @Body() body: any) {
    return this.subwingService.createProgram(req.user.userId, body);
  }

  @Roles(Role.SUBWING) // Both Sub-Wings and Students can view programs
  @Get('programs')
  getMyPrograms(@Request() req: any) {
    return this.subwingService.getMyPrograms(req.user.userId);
  }

  @Roles(Role.SUBWING, Role.STUDENT)
  @Get('results')
  getPublishedResults(@Request() req: any) {
    return this.subwingService.getPublishedResults(req.user.userId);
  }

  @Roles(Role.SUBWING)
  @Post('programs/:id/results')
  publishResults(
    @Request() req: any,
    @Param('id') programId: string,
    @Body('winners') winners: any[],
  ) {
    return this.subwingService.publishResults(
      req.user.userId,
      programId,
      winners,
    );
  }

  @Roles(Role.HISAN, Role.ADMIN) // HISAN's Eagle-Eye view
  @Get('analytics')
  async getHisanAnalytics() {
    // 🚀 Aggregating massive data perfectly
    const allPrograms = await this.subwingService['programRepo'].find({
      relations: ['createdBy'],
    });
    const allResults = await this.subwingService['resultRepo'].find();
    const subwings = await this.subwingService['programRepo'].manager.connection
      .getRepository('User')
      .find({ where: { role: 'subwing' } });

    // Calculate Top Level Stats
    const stats = {
      totalWings: subwings.length,
      activePrograms: allPrograms.filter((p) => p.status !== 'Results Declared')
        .length,
      totalParticipants: allResults.length,
      pointsDistributed: allResults.reduce(
        (sum, res) => sum + res.awardedPoints,
        0,
      ),
    };

    // Calculate Sub-Wing Performance Matrix
    const wingsData = subwings.map((wing) => {
      const wingPrograms = allPrograms.filter(
        (p) => p.createdBy?.id === wing.id,
      );
      const wingResults = allResults.filter((r) =>
        wingPrograms.some((wp) => wp.id === r.program?.id),
      );

      const activeCount = wingPrograms.filter(
        (p) => p.status !== 'Results Declared',
      ).length;

      return {
        id: wing.id,
        name: wing.fullName,
        activePrograms: activeCount,
        totalConducted: wingPrograms.length,
        pointsGiven: wingResults.reduce(
          (sum, res) => sum + res.awardedPoints,
          0,
        ),
        status:
          activeCount > 2
            ? 'Highly Active'
            : activeCount > 0
              ? 'Active'
              : 'Inactive',
      };
    });

    return {
      stats,
      subWings: wingsData,
      recentPrograms: allPrograms.slice(0, 5).map((p) => ({
        id: p.id,
        wing: p.createdBy?.fullName || 'Unknown',
        title: p.title,
        participants: allResults.filter((r) => r.program?.id === p.id).length,
        status: p.status,
        endDate: p.duration,
      })),
    };
  }
  // 3. Student's Personal Results - A dedicated endpoint for students to view their performance across all Sub-Wing programs

  @Roles(Role.STUDENT)
  @Get('my-results')
  getMyResults(@Request() req: any) {
    return this.subwingService.getMyResults(req.user.userId);
  }

  @Roles(Role.HISAN, Role.ADMIN)
  @Get('all-results')
  getAllPublishedResults() {
    return this.subwingService.getAllPublishedResults();
  }
}
