import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseCompletion } from './entities/course-completion.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import { CourseProgress } from './entities/course-progress.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface UniversidadUser {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  sucursalId?: number;
  sucursal?: {
    nombre: string;
  };
}

interface APIResponse {
  data: UniversidadUser[];
  meta: any;
}

export class RegisterCompletionData {
  userId: number;
  courseId: number;
  score: number;
  survey?: Record<string, number>;
}

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(CourseCompletion)
    private completionRepository: Repository<CourseCompletion>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
  ) {}

  private get externalApiUrl(): string {
    const url =
      this.configService.get<string>('EXTERNAL_API_URL_LOCAL') ||
      'http://192.168.13.170:3201/v1';
    // Limpieza agresiva de comillas y espacios
    return url.replace(/['"]/g, '').trim();
  }

  private get masterToken(): string {
    const token = this.configService.get<string>('MASTER_TOKEN') || '';
    // Esto quita comillas dobles, simples y espacios en blanco
    return token.replace(/['"]/g, '').trim();
  }

  // --- MÉTODOS DE CURSOS ---

  async findAll() {
    const courses = await this.courseRepository.find({
      relations: ['estudiantesInscritos'],
      order: { id: 'ASC' },
    });

    return courses.map((course) => ({
      ...course,
      estudiantes: course.estudiantesInscritos?.length || 0,
    }));
  }

  async create(data: Partial<Course>): Promise<Course> {
    const newCourse = this.courseRepository.create(data);
    return await this.courseRepository.save(newCourse);
  }

  async update(id: string, data: Partial<Course>) {
    try {
      await this.courseRepository.update(id, data);
      return { message: 'Curso actualizado exitosamente' };
    } catch (error) {
      this.logger.error('Error al actualizar curso:', error);
      return { message: 'Error al actualizar datos en la base de datos' };
    }
  }

  async remove(id: string) {
    const numericId = Number(id);
    try {
      this.logger.log(`Eliminando dependencias del curso ID: ${numericId}`);
      await this.enrollmentRepository
        .createQueryBuilder()
        .delete()
        .where('"courseid" = :id', { id: numericId })
        .execute();
      await this.completionRepository
        .createQueryBuilder()
        .delete()
        .where('"courseid" = :id', { id: numericId })
        .execute();
      await this.courseProgressRepository
        .createQueryBuilder()
        .delete()
        .where('"courseid" = :id', { id: numericId })
        .execute();
      const result = await this.courseRepository.delete(numericId);
      this.logger.log(`Curso ${numericId} eliminado exitosamente.`);
      return result;
    } catch (error) {
      this.logger.error(`Error al eliminar curso: ${error.message}`);
      throw new Error(`No se pudo eliminar: ${error.message}`);
    }
  }

  // --- MÉTODOS DE USUARIOS Y API EXTERNA ---

  async findUsersBySucursal(sucursalId: string, query: string = '') {
    try {
      const baseUrl = this.externalApiUrl.replace(/\/$/, '');
      const url = `${baseUrl}/usuarios?q=${query.trim()}&take=50`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${this.masterToken}` },
      });

      const apiUsers = response.data?.data || [];

      return apiUsers
        .filter((u: any) => {
          // LÓGICA INTELIGENTE:
          // Si no hay filtro (id 0 o vacío), pasan todos.
          if (
            !sucursalId ||
            ['0', 'undefined', 'null', ''].includes(String(sucursalId))
          ) {
            return true;
          }
          // Si el sucursalId del usuario (ej: 18) coincide con el del modal (ej: "18")
          return String(u.sucursalId) === String(sucursalId);
        })
        .map((u: any) => ({
          id: u.id,
          name: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
          username: u.usuario,
          // Mostramos el nombre de la sucursal que viene en el JSON
          sucursalNombre: u.sucursal?.nombre || 'SIN SUCURSAL',
          puesto: u.empleado?.perfilSalario?.perfil || 'COLABORADOR',
        }));
    } catch (error) {
      this.logger.error(`Error filtrando usuarios: ${error.message}`);
      return [];
    }
  }

  async assignUsersToCourse(courseId: string, userIds: number[]) {
    await this.enrollmentRepository.delete({ courseId: Number(courseId) });
    if (userIds.length === 0) return this.findAll();
    const usersData = await this.findSpecificUsersFromApi(userIds);
    const newEnrollments = userIds.map((uId) => {
      const apiUser = usersData.find((u) => Number(u.id) === Number(uId));
      return this.enrollmentRepository.create({
        courseId: Number(courseId),
        userId: uId,
        userName: apiUser
          ? `${apiUser.nombre} ${apiUser.apellido}`.trim()
          : `Usuario ${uId}`,
        userUsername: apiUser ? apiUser.usuario : `u${uId}`,
      });
    });
    await this.enrollmentRepository.save(newEnrollments);
    return this.findAll();
  }

  private async findSpecificUsersFromApi(
    ids: number[],
  ): Promise<UniversidadUser[]> {
    try {
      const baseUrl = this.externalApiUrl.replace(/\/$/, '');
      const allRecovered: UniversidadUser[] = [];
      for (let page = 1; page <= 5; page++) {
        const url = `${baseUrl}/usuarios?take=100&page=${page}`;
        const response = await axios.get<APIResponse>(url, {
          headers: {
            Authorization: `Bearer ${this.masterToken}`,
          },
        });
        const data = response.data.data || [];
        if (data.length === 0) break;
        const matches = data.filter((u) => ids.includes(Number(u.id)));
        allRecovered.push(...matches);
        if (allRecovered.length >= ids.length) break;
      }
      return allRecovered;
    } catch (e) {
      this.logger.error(`Error en findSpecificUsers: ${e.message}`);
      return [];
    }
  }

  // --- PROGRESO Y COMPLETITUD ---

  async registerCompletion(data: RegisterCompletionData) {
    const existing = await this.completionRepository.findOne({
      where: { userId: Number(data.userId), courseId: Number(data.courseId) },
    });
    if (existing && existing.score >= 90) return existing;
    const completion = this.completionRepository.create({
      userId: Number(data.userId),
      courseId: Number(data.courseId),
      score: data.score,
      survey: data.survey,
    });
    return await this.completionRepository.save(completion);
  }

  async saveProgress(data: {
    courseId: number;
    userId: number;
    viewedVideos: number[];
    viewedPdfs: number[];
    attempts: number;
  }) {
    let progress = await this.courseProgressRepository.findOne({
      where: { courseId: Number(data.courseId), userId: Number(data.userId) },
    });
    if (!progress) {
      progress = this.courseProgressRepository.create({
        courseId: Number(data.courseId),
        userId: Number(data.userId),
        viewedVideos: [],
        viewedPdfs: [],
        attempts: 0,
      });
    }
    progress.viewedVideos = data.viewedVideos;
    progress.viewedPdfs = data.viewedPdfs;
    progress.attempts = data.attempts;
    return this.courseProgressRepository.save(progress);
  }

  async getProgress(userId: number, courseId: number) {
    const progress = await this.courseProgressRepository.findOne({
      where: { courseId: Number(courseId), userId: Number(userId) },
    });
    if (!progress) return { viewedVideos: [], viewedPdfs: [], attempts: 0 };
    return {
      viewedVideos: progress.viewedVideos || [],
      viewedPdfs: progress.viewedPdfs || [],
      attempts: progress.attempts || 0,
    };
  }

  async getEnrolledStudents(courseId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId: Number(courseId) },
    });
    return enrollments.map((e) => ({
      id: e.userId,
      name: e.userName || `ID: ${e.userId}`,
      username: e.userUsername || 'desconocido',
    }));
  }

  async findCoursesByUser(userId: number): Promise<any[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return [];
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
      relations: ['estudiantesInscritos'],
      order: { id: 'ASC' },
    });
    return courses.map((course) => ({
      ...course,
      estudiantes: course.estudiantesInscritos?.length || 0,
    }));
  }

  async getUserCompletions(userId: number): Promise<string[]> {
    // 1. Buscamos en la tabla de registros de finalización
    // Ajusta 'this.completionRepository' al nombre que uses para guardar los cursos terminados
    const completions = await this.completionRepository.find({
      where: { userId: userId },
    });

    // 2. Retornamos un array simple con solo los IDs de los cursos
    // Ejemplo: ["1", "5", "8"]
    return completions.map((c) => String(c.courseId));
  }

  // --- REPORTES Y ARCHIVOS ---

  async getRealReportStats() {
    const enrollments = await this.enrollmentRepository.count();
    const completions = await this.completionRepository.find();
    const cursos = await this.courseRepository.find();
    const rangos = [
      { rango: '0-5', min: 0, max: 59, color: '#EF4444', cantidad: 0 },
      { rango: '6-7', min: 60, max: 75, color: '#F59E0B', cantidad: 0 },
      { rango: '7-8', min: 76, max: 85, color: '#10B981', cantidad: 0 },
      { rango: '8-9', min: 86, max: 95, color: '#3B82F6', cantidad: 0 },
      { rango: '9-10', min: 96, max: 100, color: '#8B5CF6', cantidad: 0 },
    ];
    completions.forEach((c) => {
      const rango = rangos.find((r) => c.score >= r.min && c.score <= r.max);
      if (rango) rango.cantidad++;
    });
    const cursosMap = new Map();
    completions.forEach((c) => {
      const cursoEncontrado = cursos.find((curso) => curso.id === c.courseId);
      const cursoNombre = cursoEncontrado?.nombre || 'Desconocido';
      if (!cursosMap.has(cursoNombre)) {
        cursosMap.set(cursoNombre, { suma: 0, count: 0, aprobados: 0 });
      }
      const s = cursosMap.get(cursoNombre);
      s.suma += c.score;
      s.count++;
      if (c.score >= 60) s.aprobados++;
    });
    return {
      totalInscripciones: enrollments,
      totalCalificaciones: completions.length,
      distribucion: rangos.map((r) => ({
        ...r,
        porcentaje:
          completions.length > 0
            ? Math.round((r.cantidad / completions.length) * 100)
            : 0,
      })),
      rendimiento: Array.from(cursosMap.entries())
        .map(([nombre, s]) => ({
          curso: nombre,
          promedio: Math.round(s.suma / s.count),
          aprobados: s.aprobados,
          reprobados: s.count - s.aprobados,
        }))
        .slice(0, 5),
    };
  }
  async generateDiplomaPdf(userId: number, courseId: number, res: any) {
    // 1. Obtener datos reales de las tablas que SI existen en tu constructor
    // Buscamos el curso
    const course = await this.courseRepository.findOne({
      where: { id: Number(courseId) }, // Asegúrate de que sea Number si tu ID es numérico
    });

    // Como no tienes tabla de Usuarios local, buscamos el nombre en la tabla de Enrollments (Inscripciones)
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId: userId, courseId: Number(courseId) },
    });

    if (!course || !enrollment) {
      throw new Error(
        'No se encontró el curso o la inscripción del usuario para generar el diploma',
      );
    }

    // 2. Ruta del template (Asegúrate que el archivo esté en esta carpeta)
    const templatePath = path.join(
      process.cwd(),
      'src/assets/diploma_base.pdf',
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        'No se encontró el archivo base del diploma en src/assets/diploma_base.pdf',
      );
    }

    const existingPdfBytes = fs.readFileSync(templatePath);

    // 3. Cargar PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // 4. Fuentes
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // 5. Insertar NOMBRE (Usamos el nombre guardado en la inscripción)
    const nombreEstudiante =
      enrollment.userName || enrollment.userUsername || 'Estudiante';
    const fontSizeNombre = 45;
    const nombreWidth = fontItalic.widthOfTextAtSize(
      nombreEstudiante.toUpperCase(),
      fontSizeNombre,
    );

    firstPage.drawText(nombreEstudiante.toUpperCase(), {
      x: (width - nombreWidth) / 2, // Centrado automático
      y: height / 2 + 35, // Ajustado un poco más arriba
      size: fontSizeNombre,
      font: fontItalic,
      color: rgb(0.1, 0.1, 0.1),
    });

    // 6. Insertar NOMBRE DEL CURSO
    const nombreCurso = course.nombre;
    const fontSizeCurso = 22;
    const cursoWidth = fontBold.widthOfTextAtSize(nombreCurso, fontSizeCurso);

    firstPage.drawText(nombreCurso, {
      x: (width - cursoWidth) / 2, // También centramos el curso
      y: height / 2 - 50,
      size: fontSizeCurso,
      font: fontBold,
      color: rgb(0.63, 0.52, 0.23), // Color dorado
    });

    // 7. Insertar FECHA
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    firstPage.drawText(fechaActual, {
      x: width / 2 - 80,
      y: 110,
      size: 16,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    // 8. Enviar al cliente
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Diploma_${enrollment.userUsername}.pdf`,
    );
    res.send(Buffer.from(pdfBytes));
  }

  async uploadFileToBlob(file: Express.Multer.File) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      const fileUrl = `/uploads/${fileName}`;
      this.logger.log(`Archivo guardado localmente: ${fileUrl}`);
      return { url: fileUrl };
    } catch (error) {
      this.logger.error(`Error en uploadFileLocal: ${error.message}`);
      throw new Error('Error al procesar el almacenamiento local.');
    }
  }

  async findAllBranches() {
    try {
      const baseUrl = this.externalApiUrl.replace(/\/$/, '');
      // Traemos una muestra de usuarios para extraer las sucursales existentes
      const url = `${baseUrl}/usuarios?take=100`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${this.masterToken}` },
      });

      const apiUsers = response.data?.data || [];
      const sucursalesMap = new Map();

      // Agregamos siempre la opción de "Todas" al inicio
      sucursalesMap.set(0, { id: 0, nombre: 'TODAS LAS SUCURSALES' });

      apiUsers.forEach((u: any) => {
        // Si el usuario tiene sucursalId y el objeto sucursal con nombre
        if (u.sucursalId && u.sucursal?.nombre) {
          if (!sucursalesMap.has(u.sucursalId)) {
            sucursalesMap.set(u.sucursalId, {
              id: u.sucursalId,
              nombre: u.sucursal.nombre.toUpperCase(),
            });
          }
        }
      });

      const listaSucursales = Array.from(sucursalesMap.values());
      this.logger.log(
        `Inteligencia: Detectadas ${listaSucursales.length - 1} sucursales activas.`,
      );

      return listaSucursales;
    } catch (error) {
      this.logger.error(`Error extrayendo sucursales: ${error.message}`);
      return [{ id: 0, nombre: 'TODAS LAS SUCURSALES' }];
    }
  }

  async generateKardex(userId: number, res: any) {
    let nombreEstudiante = `USUARIO ID: ${userId}`;

    try {
      const baseUrl = this.externalApiUrl.replace(/\/$/, '');

      // Intentaremos buscar en las primeras 5 páginas para asegurar encontrar al usuario
      // ya que el ?q=id no funciona y el take=500 da error 400.
      let usuarioEncontradoApi: any = null;

      for (let pagina = 1; pagina <= 20; pagina++) {
        const url = `${baseUrl}/usuarios?page=${pagina}&q=`; // Usamos la estructura que te funcionó

        this.logger.log(`[KARDEX] Buscando en API página ${pagina}...`);

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${this.masterToken}` },
        });

        const lista = response.data?.data;

        if (Array.isArray(lista)) {
          usuarioEncontradoApi = lista.find(
            (u: any) => String(u.id) === String(userId),
          );

          if (usuarioEncontradoApi) {
            this.logger.log(
              `[KARDEX] ✅ Usuario ${userId} encontrado en la página ${pagina}`,
            );
            break; // Salimos del bucle for
          }
        }

        // Si la API nos dice que ya no hay más páginas, paramos
        if (response.data?.meta?.pages && pagina >= response.data.meta.pages)
          break;
      }

      if (usuarioEncontradoApi) {
        const nom = (usuarioEncontradoApi.nombre || '').trim();
        const ape = (usuarioEncontradoApi.apellido || '').trim();
        if (nom || ape) {
          nombreEstudiante = `${nom} ${ape}`.trim().toUpperCase();
        }
      } else {
        this.logger.warn(
          `[KARDEX] ⚠️ El ID ${userId} no se encontró en las páginas consultadas.`,
        );
      }
    } catch (e) {
      this.logger.error(`[KARDEX ERROR] Fallo crítico de API: ${e.message}`);
      // Si falla la API, el PDF se generará con "USUARIO ID: XXXX" para no bloquear al usuario
    }

    // --- RESTO DEL CÓDIGO (DB LOCAL Y PDF) ---
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
    });
    const completions = await this.completionRepository.find({
      where: { userId },
    });
    const allCourses = await this.courseRepository.find({
      order: { id: 'ASC' },
    });

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();

    page.drawText('KARDEX ACADÉMICO - UNIVERSIDAD PURO POLLO', {
      x: 50,
      y: height - 50,
      size: 18,
      font: fontBold,
    });
    page.drawText(`ESTUDIANTE: ${nombreEstudiante}`, {
      x: 50,
      y: height - 80,
      size: 11,
      font: fontNormal,
    });
    page.drawText(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 100,
      size: 10,
      font: fontNormal,
    });

    let yPos = height - 150;
    const tableLeft = 50;
    const tableWidth = 500;
    const rowHeight = 25;
    // ... (Encabezados de tabla iguales al código anterior)
    page.drawLine({
      start: { x: tableLeft, y: yPos + 15 },
      end: { x: tableLeft + tableWidth, y: yPos + 15 },
      thickness: 1.5,
    });
    page.drawText('CURSO', {
      x: tableLeft + 5,
      y: yPos,
      size: 9,
      font: fontBold,
    });
    page.drawText('FECHA', { x: 280, y: yPos, size: 9, font: fontBold });
    page.drawText('ESTADO', { x: 370, y: yPos, size: 9, font: fontBold });
    page.drawText('VALOR', { x: 450, y: yPos, size: 9, font: fontBold });
    page.drawText('LOGRADOS', { x: 510, y: yPos, size: 9, font: fontBold });

    // Línea divisoria debajo del encabezado
    page.drawLine({
      start: { x: tableLeft, y: yPos - 10 },
      end: { x: tableLeft + tableWidth, y: yPos - 10 },
      thickness: 1,
    });

    yPos -= 30;

    let totalCreditosLogrados = 0;
    for (const course of allCourses) {
      const enrollment = enrollments.find((e) => e.courseId === course.id);
      const completion = completions.find((c) => c.courseId === course.id);
      if (!enrollment && !completion) continue;

      const fechaTexto = completion
        ? new Date(completion.completedAt).toLocaleDateString()
        : '---';
      const estado = completion ? 'Finalizado' : 'En curso';
      const valorCurso = Number(course.creditos) || 0;
      const logrados = completion ? valorCurso : 0;
      totalCreditosLogrados += logrados;

      // Dibujar texto de la fila
      page.drawText(course.nombre.substring(0, 45).toUpperCase(), {
        x: tableLeft + 5,
        y: yPos,
        size: 8,
        font: fontNormal,
      });
      page.drawText(fechaTexto, { x: 280, y: yPos, size: 8, font: fontNormal });
      page.drawText(estado, { x: 370, y: yPos, size: 8, font: fontNormal });
      page.drawText(valorCurso.toString(), {
        x: 465,
        y: yPos,
        size: 8,
        font: fontNormal,
      });
      page.drawText(logrados.toString(), {
        x: 530,
        y: yPos,
        size: 8,
        font: fontNormal,
      });

      // Dibujar línea horizontal punteada o tenue para cada fila
      page.drawLine({
        start: { x: tableLeft, y: yPos - 10 },
        end: { x: tableLeft + tableWidth, y: yPos - 10 },
        thickness: 0.5,
        opacity: 0.5,
      });

      yPos -= rowHeight;

      // Control de nueva página
      if (yPos < 80) {
        page = pdfDoc.addPage([600, 800]);
        yPos = height - 50;
      }
    }

    // --- LÍNEA FINAL DE CIERRE ---
    page.drawText(`TOTAL CRÉDITOS ACUMULADOS: ${totalCreditosLogrados}`, {
      x: 320,
      y: yPos - 20,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Kardex_${userId}.pdf`,
    );
    res.send(Buffer.from(pdfBytes));
  }
}
