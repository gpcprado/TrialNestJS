import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, Req} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.positionsService.delete(id);
    return {
      message: `Position deleted successfully.`,};
  }

  @UseGuards(JwtAuthGuard)
  @Get()
    async findAll() {
     const positions = await this.positionsService.findAll();
     return positions;
    }

  @UseGuards(JwtAuthGuard)
  @Post()
    async create(
    @Req() req: ExpressRequest,
    @Body() Body: any
    ) {
      
      const { position_code, position_name } = Body;
      const userId = (req.user as any)?.id;
      
      return this.positionsService.createPositions(position_code, position_name, userId);
    }
    
  @Put(':id')
    async update(
  @Param('id') id: number,
  @Body() data: { position_code?: string; position_name?: string },
) {
  return {
    message: 'Position updated successfully',
  };
}
} 