// src/reports/reports.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

// Definimos una interfaz robusta para el DTO
interface ExportReportDto {
  format: string;
  range?: string;
  includeCharts?: boolean;
  includeDetails?: boolean;
  dataTypes?: string[];
  categorias?: string[];
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('export')
  async exportReport(@Body() exportDto: ExportReportDto, @Res() res: Response) {
    try {
      const { format } = exportDto;

      // Obtenemos el buffer generado por el servicio
      const buffer = await this.reportsService.generateFile(format, exportDto);

      if (!buffer) {
        throw new HttpException(
          'No se pudo generar el contenido del reporte',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const filename = `Reporte_Academico_${Date.now()}`;

      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        excel:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        json: 'application/json',
      };

      const extensions: Record<string, string> = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv',
        json: 'json',
      };

      const contentType = mimeTypes[format] || mimeTypes.excel;
      const extension = extensions[format] || 'xlsx';
      const fullFileName = `${filename}.${extension}`;

      // CONFIGURACIÓN DE HEADERS CRÍTICA PARA ELECTRON Y NAVEGADORES
      res.set({
        'Content-Type': contentType,
        // Usamos filename* para asegurar compatibilidad con caracteres especiales si los hubiera
        'Content-Disposition': `attachment; filename="${fullFileName}"; filename*=UTF-8''${encodeURIComponent(fullFileName)}`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length', // Refuerzo de CORS
        Pragma: 'no-cache',
        Expires: '0',
      });

      // Enviamos el buffer directamente. Express manejará el flujo binario.
      return res.end(buffer);
    } catch (error: unknown) {
      console.error('Error en exportación (Backend):', error);

      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json(error.getResponse());
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error interno al generar el archivo';

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: errorMessage,
      });
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await this.reportsService.getAcademicStats();
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
