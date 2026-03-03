import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
  Res,
  Headers, // Añadido para recibir el username del cliente
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService, RegisterCompletionData } from './courses.service';
import { Course } from './entities/course.entity';
import * as Express from 'express';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    // SE ELIMINÓ ReportsService de aquí porque no existe y bloquea la App
  ) {}

  // --- NUEVOS MÉTODOS DE PROGRESO (Para que los checks funcionen) ---

  @Post('save-progress')
  async saveProgress(@Body() data: any) {
    return this.coursesService.saveProgress(data);
  }

  @Get('user-progress')
  async getProgress(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('courseId') courseId?: string, // Quitamos el Pipe para que sea opcional
  ) {
    // Si viene courseId, buscamos uno. Si no, devolvemos la lista de completados.
    if (courseId) {
      return this.coursesService.getProgress(userId, Number(courseId));
    }
    return this.coursesService.getUserCompletions(userId); // Debes tener este método en el Service
  }

  @Get('branches/list')
  async getAllBranches() {
    return this.coursesService.findAllBranches();
  }

  // --- MÉTODOS EXISTENTES MANTENIDOS ---

  @Get('enrolled/:userId')
  async findCoursesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.coursesService.findCoursesByUser(userId);
  }

  @Get('users/sucursal/:sucursalId')
  async findUsers(
    @Param('sucursalId') sucursalId: string,
    @Query('q') query: string,
  ) {
    return this.coursesService.findUsersBySucursal(sucursalId, query);
  }

  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id/students')
  async getEnrolledStudents(@Param('id') id: string) {
    return this.coursesService.getEnrolledStudents(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    return this.coursesService.uploadFileToBlob(file);
  }

  @Post('register-completion')
  async registerCompletion(@Body() completionData: RegisterCompletionData) {
    return this.coursesService.registerCompletion(completionData);
  }

  @Post(':id/students')
  async assignStudents(
    @Param('id') courseId: string,
    @Body('userIds') userIds: number[],
  ) {
    return this.coursesService.assignUsersToCourse(courseId, userIds);
  }

  @Post()
  async create(@Body() courseData: any) {
    return this.coursesService.create(courseData);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Course>) {
    return this.coursesService.update(id, updateData);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-user-department') department?: string, // Cambiamos username por department
  ) {
    // Ahora el permiso es por DEPARTAMENTO, no por nombre de persona
    const esGerencia = department?.toUpperCase().includes('GERENCIA');

    if (!esGerencia) {
      throw new ForbiddenException(
        `Acceso denegado. Solo el personal de GERENCIA puede realizar esta acción.`,
      );
    }

    return this.coursesService.remove(id);
  }

  @Get('reports/stats')
  async getStats() {
    return this.coursesService.getRealReportStats();
  }

  @Get('download-diploma')
  async downloadDiploma(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
  ) {
    return this.coursesService.generateDiplomaPdf(userId, courseId, res);
  }
}
