export interface IPayload {
  email: string;
  sub: string; // userId (estándar JWT usar 'sub' para subject/user id)
  name: string;
}