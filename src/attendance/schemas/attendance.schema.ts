import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Month } from 'src/common/enums/month.enum';

// Define el tipo de documento para TypeScript
export type AttendanceDocument = Attendance & Document<Types.ObjectId>;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Attendance {
  /**
   * El ID del usuario (profesor) al que pertenece esta asistencia.
   */
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // modelo de referencia
    required: true,
  })
  userId: mongoose.Schema.Types.ObjectId;

  /**
   * El mes de la asistencia.
   * Usamos un enum para validar que solo sean los 12 meses en español.
   */
  @Prop({
    type: String,
    required: true,
    // 2. USAMOS Object.values() PARA PASAR EL ARRAY DE STRINGS A MONGOOSE
    enum: Object.values(Month),
  })
  month: string;

  /**
   * Array con los datos de asistencia de cada estudiante.
   *
   * Usamos el tipo `[{ type: Map, of: String }]` para definir un array de objetos
   * donde cada objeto es un "Mapa" de Mongoose.
   *
   * Esto permite que los objetos dentro del array tengan claves dinámicas
   * (como "1", "2", "3", ..., "31", y "student")
   * y que todos sus valores sean tratados como String.
   *
   * El tipo de TypeScript `Record<string, string>[]` representa esto:
   * un array de objetos donde cada objeto tiene claves string y valores string.
   */
  @Prop({
    type: [{ type: Map, of: String }],
    required: true,
    default: [],
  })
  data: Record<string, string>[];
}

// Crea y exporta el schema de Mongoose a partir de la clase
export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Agregar un índice compuesto para mejorar la eficiencia de las búsquedas por usuario y mes
AttendanceSchema.index({ userId: 1, month: 1 }, { unique: true });
