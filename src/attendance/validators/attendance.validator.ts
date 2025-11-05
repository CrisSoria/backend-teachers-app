import { ValidateBy, ValidationArguments } from 'class-validator';
import { AttendanceStatus } from '../enums/attendance-status.enum';

// Helper function to validate a single attendance item
function validateAttendanceItem(value: any): boolean {
  if (!value || typeof value !== 'object') return false;

  // Verificar que tenga la propiedad student
  if (!value.student || typeof value.student !== 'string') return false;

  // Verificar que los días sean válidos (1-31)
  const validStatuses = Object.values(AttendanceStatus);
  for (const key in value) {
    if (key === 'student') continue;

    const dayNumber = parseInt(key);
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
      return false;
    }

    if (!validStatuses.includes(value[key])) {
      return false;
    }
  }

  return true;
}

export function IsDailyAttendance(options?: { each?: boolean }) {
  return ValidateBy({
    name: 'isDailyAttendance',
    validator: {
      validate: (value: any, args: ValidationArguments) => {
        // Handle array validation if 'each' is true
        if (options?.each && Array.isArray(value)) {
          return value.every((item) => validateAttendanceItem(item));
        }

        // Single item validation
        return validateAttendanceItem(value);
      },
      defaultMessage: (args: ValidationArguments) =>
        'Cada registro debe tener un campo "student" y días del 1-31 con valores: ' +
        Object.values(AttendanceStatus).join(', '),
    },
  });
}
