/**
 * Estados posibles para el registro de asistencia
 * P: Presente, 
 * C: Falta completa, 
 * M: Media falta, 
 * X: Tercio de falta, 
 * Q: Cuarta falta, 
 * T: Tres cuartas falta, 
 * D: Doble falta, 
 * -: Día sin actividad
 */
export enum AttendanceStatus {
  PRESENT = 'P', // Presente
  ABSENT = 'C', // Ausente (falta)
  HALF_ABSENT = 'M', // Media falta
  THIRD_ABSENT = 'X', // Tercio de falta
  QUARTER_ABSENT = 'Q', // Cuarta falta
  THREE_QUARTERS_ABSENT = 'T', // Tres cuartas falta
  DOUBLE_ABSENT = 'D', // Doble falta
  NO_CLASS = '-', // Sin clase
}
