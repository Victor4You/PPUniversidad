// src/reports/reports.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CourseCompletion } from '../courses/entities/course-completion.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/user.entity';
import * as ExcelJS from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(CourseCompletion)
    private completionRepo: Repository<CourseCompletion>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepo: Repository<CourseEnrollment>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async generateFile(format: string, filters: any): Promise<Buffer> {
    const { start, end, label } = this.calculateDateRange(filters);
    const categorias =
      filters.dataTypes || filters.categorias || filters.categories || [];
    const reportData: any = { label, sections: {} };
    const targetAlumnoId = filters.alumnoId ? String(filters.alumnoId) : null;

    // 1. CARGA DE DATOS LOCALES
    const [completions, allEnrollments, localUsers] = await Promise.all([
      this.completionRepo.find({ where: { completedAt: Between(start, end) } }),
      this.enrollmentRepo.find({ relations: ['course'] }),
      this.userRepo.find(),
    ]);

    // --- CARGA DE DATOS EXTERNOS (PAGINACIÓN PARA TRAER LOS 375 USUARIOS) ---
    let externalUsers: any[] = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await axios.get(
          `${process.env.EXTERNAL_API_URL_LOCAL}/usuarios/`,
          {
            timeout: 10000,
            headers: { Authorization: `Bearer ${process.env.MASTER_TOKEN}` },
            params: { page, limit: 50 },
          },
        );

        const rawData = response.data;
        const pageData =
          rawData?.data ||
          rawData?.items ||
          (Array.isArray(rawData) ? rawData : []);

        if (pageData.length > 0) {
          externalUsers.push(...pageData);
          this.logger.log(
            `Descargada página ${page}: ${pageData.length} usuarios.`,
          );
          page++;
          if (pageData.length < 20) hasMore = false;
          if (page > 30) hasMore = false; // Límite de seguridad
        } else {
          hasMore = false;
        }
      }
    } catch (e) {
      this.logger.error(`Error en API Externa: ${e.message}`);
    }

    // 2. FUSIÓN Y LIMPIEZA DE USUARIOS (Quita "zak", "vmsj" y duplicados)
    const studentMap = new Map<string, { id: string; name: string }>();

    // Prioridad API
    externalUsers.forEach((u) => {
      if (!u?.id) return;
      const id = String(u.id);
      const fullName = (
        u.nombre_completo || `${u.nombre || ''} ${u.apellido || ''}`
      ).trim();
      // Solo agregamos si tiene un nombre real (más de 5 caracteres o no es igual al usuario)
      const isSystemAlias =
        fullName.toLowerCase() === (u.usuario || '').toLowerCase() &&
        fullName.length < 6;
      if (fullName && !isSystemAlias) {
        studentMap.set(id, { id, name: fullName });
      }
    });

    // Complemento Local
    localUsers.forEach((u) => {
      const id = String(u.id);
      if (!studentMap.has(id)) {
        const name = u.name?.trim();
        const isSystemAlias =
          name?.toLowerCase() === u.username?.toLowerCase() && name?.length < 6;
        if (name && !isSystemAlias) {
          studentMap.set(id, { id, name });
        }
      }
    });

    let finalStudents = Array.from(studentMap.values());
    finalStudents.sort((a, b) => a.name.localeCompare(b.name));

    if (targetAlumnoId) {
      finalStudents = finalStudents.filter((s) => s.id === targetAlumnoId);
    }

    // 3. GENERACIÓN DE SECCIONES (Kardex, Calificaciones, etc.)

    // CALIFICACIONES
    if (categorias.includes('calificaciones')) {
      reportData.sections['Calificaciones'] = finalStudents.map((student) => {
        const userGrades = completions.filter(
          (c) => String(c.userId) === student.id,
        );
        const promedio =
          userGrades.length > 0
            ? Math.round(
                userGrades.reduce(
                  (acc, curr) => acc + Number(curr.score || 0),
                  0,
                ) / userGrades.length,
              )
            : 'N/A';
        return { ALUMNO: student.name, PROMEDIO: promedio.toString() };
      });
    }

    // INSCRIPCIONES
    if (
      categorias.includes('matriculas') ||
      categorias.includes('inscripciones')
    ) {
      reportData.sections['Inscripciones y Matrículas'] = finalStudents.map(
        (student) => {
          const userEnrolls = allEnrollments.filter(
            (e) => String(e.userId) === student.id,
          );
          const cursos =
            userEnrolls.length > 0
              ? Array.from(
                  new Set(userEnrolls.map((e) => e.course?.nombre || 'Curso')),
                ).join(', ')
              : 'N/A';
          return {
            ALUMNO: student.name,
            ESTADO: userEnrolls.length > 0 ? 'Inscrito' : 'No inscrito',
            CURSOS: cursos,
          };
        },
      );
    }

    // 6. SECCIÓN: KARDEX (Lógica corregida para evitar error TS2345)
    if (categorias.includes('kardex')) {
      const kardexData: any[] = []; // <-- AGREGAR : any[] AQUÍ

      finalStudents.forEach((student) => {
        const studentEnrolls = allEnrollments.filter(
          (e) => String(e.userId) === student.id,
        );

        studentEnrolls.forEach((e) => {
          kardexData.push({
            ALUMNO: student.name,
            CURSO: e.course?.nombre || 'N/A',
            FECHA: e.enrolledAt
              ? new Date(e.enrolledAt).toLocaleDateString()
              : 'N/A',
            ESTADO: 'ACTIVO',
          });
        });
      });

      reportData.sections['Kardex Académico'] = kardexData;
    }

    // ASISTENCIAS Y EVALUACIONES (Placeholders)
    if (categorias.includes('asistencias')) {
      reportData.sections['Registro de Asistencias'] = finalStudents.map(
        (s) => ({
          ALUMNO: s.name,
          ASISTENCIA: 'Sincronizado',
          OBSERVACIÓN: 'N/A',
        }),
      );
    }

    if (categorias.includes('evaluaciones')) {
      reportData.sections['Evaluaciones de Desempeño'] = finalStudents.map(
        (s) => ({
          ALUMNO: s.name,
          RESULTADO: 'Pendiente',
          ESTADO: 'Procesando',
        }),
      );
    }

    if (Object.keys(reportData.sections).length === 0)
      throw new NotFoundException('Sin datos');

    return format === 'pdf'
      ? await this.generatePdfBuffer(reportData.sections, label)
      : await this.generateExcelBuffer(reportData.sections);
  }

  // --- MÉTODOS PRIVADOS DE DISEÑO ---

  private async generatePdfBuffer(
    sections: Record<string, any[]>,
    periodLabel: string,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;

    page.drawText(`REPORTE GENERAL - ${periodLabel.toUpperCase()}`, {
      x: 50,
      y,
      size: 16,
      font: boldFont,
    });
    y -= 40;

    for (const [title, items] of Object.entries(sections)) {
      if (y < 100) {
        page = pdfDoc.addPage();
        y = height - 50;
      }

      // Encabezado de Sección
      page.drawRectangle({
        x: 50,
        y: y - 5,
        width: width - 100,
        height: 18,
        color: rgb(0.1, 0.4, 0.7),
      });
      page.drawText(title.toUpperCase(), {
        x: 55,
        y,
        size: 10,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      y -= 25;

      if (items.length > 0) {
        const headers = Object.keys(items[0]);
        const colWidth = (width - 100) / headers.length;

        headers.forEach((h, i) => {
          page.drawText(h, {
            x: 50 + i * colWidth,
            y,
            size: 9,
            font: boldFont,
          });
        });
        y -= 15;

        items.forEach((item) => {
          if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
          }
          headers.forEach((h, i) => {
            page.drawText(String(item[h]).substring(0, 35), {
              x: 50 + i * colWidth,
              y,
              size: 8,
              font,
            });
          });
          y -= 12;
        });
      }
      y -= 30;
    }
    return Buffer.from(await pdfDoc.save());
  }

  private async generateExcelBuffer(
    sections: Record<string, any[]>,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    for (const [title, items] of Object.entries(sections)) {
      const sheet = workbook.addWorksheet(title.substring(0, 30));
      if (items.length > 0) {
        const headers = Object.keys(items[0]);
        sheet.columns = headers.map((h) => ({ header: h, key: h, width: 30 }));
        sheet.addRows(items);
        sheet.getRow(1).font = { bold: true };
      }
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private calculateDateRange(filters: any) {
    const range = filters?.range || 'mes';
    const start = new Date();
    const end = new Date();
    if (range === 'semana') start.setDate(start.getDate() - 7);
    else if (range === 'anio') start.setFullYear(start.getFullYear() - 1);
    else if (range === 'hoy') start.setHours(0, 0, 0, 0);
    else start.setDate(start.getDate() - 30);

    const labels: Record<string, string> = {
      hoy: 'Hoy',
      semana: 'Semana',
      mes: 'Mes',
      anio: 'Año',
    };
    return { start, end, label: labels[range] || 'Mes' };
  }

  async getAcademicStats() {
    // Se mantiene tu lógica original de estadísticas para el Dashboard
    const [completions, enrollments, courses] = await Promise.all([
      this.completionRepo.find(),
      this.enrollmentRepo.find(),
      this.courseRepo.find(),
    ]);
    // ... (resto de tu lógica de stats)
    return {
      totalInscripciones: enrollments.length,
      totalCalificaciones: completions.length /* ... */,
    };
  }
}
