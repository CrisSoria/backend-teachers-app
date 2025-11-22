
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment



## Resources



# Dependencias

- @nestjs/mongoose
- mongoose
- @nestjs/swagger __________# Documentación
- class-validator ____________ # Tipado
- class-transformer _________ # Tipado
- @nestjs/config ___________ # Configuración variables de entorno
- bcrypt ____________________ # Encriptación
- @nestjs/passport ________ # Autenticación
- passport _________________ # Autenticación
- passport-local ___________ # Autenticación
- @nestjs/jwt _____________ # Autenticación
- passport-jwt _____________ # Autenticación
- nodemailer _____________ # Envio de correo electrónico

## Dev Dependencies
`npm i -D packageName`
`npm i --save-dev packageName`
- @types/bcrypt ____________ # tipado para Encriptación
- @types/passport-local____ # tipado para Autenticación
- @types/passport-jwt______ # tipado para Autenticación
- @types/nodemailer______ # tipado para envio de correo electrónico

# Módulos

- app.module.ts
- users.module.ts
- students.module.ts
- attendance.module.ts
- auth.module.ts
- email.module.ts
- otp.module.ts


# OTP Flow
1. el usuario se registra con status UNVERIFIED
2. se envia un OTP al correo del usuario
3. el usuario valida el OTP y cambia su status a ACTIVE
4. el usuario se autentica

# Athorization Flow
1. el usuario realiza login
2. en el JWT se almacenan sus datos
3. el usuario accede a una ruta protegida con el decorador `@JwtAuthGuard`
4. el guard `@RolesGuard` permite verificar si el usuario posee el rol necesario para acceder a la ruta. Los roles se definen mediante el decorador `@Roles()`. Ejemplo: `@Roles(UserRole.ADMIN, UserRole.TEACHER)`.

## Revisar propiedad de usuario
La función `checkResourceOwnership` permite verificar si el usuario es dueño del recurso al que está intentando acceder:

- ✅ Revisa si `role === 'admin'` → permite continuar
- ✅ Compara `student.userId === req.user.userId` en memoria 
- ✅ Se puede pasar por parámetro el campo en el que el resource tiene el ID que se desea verificar
- ✅ Lanza 403 si no tiene permisos
- ✅ Todo sin consultar la BD de nuevo

### 📊 Flow Real:

```
Guard:          Request → JWT → Query BD → Guard → Query BD → Response (2 queries)
función helper:     Request → JWT → Query BD → Compare en memoria → Response (1 query)

```

# Documentación: Autenticación con JWT y Cookies

## Flujo de Autenticación

### 1. Login
- **Endpoint**: `POST /auth/login`
- **Proceso**:
  - Valida credenciales (email/contraseña)
  - Genera dos tokens JWT:
    - **Access Token**: Corta duración (ej. 15m)
    - **Refresh Token**: Mayor duración (ej. 7d)
  - Almacena el refresh token en la base de datos
  - Establece ambos tokens como cookies HTTP-only y seguras
  - Retorna información del usuario

### 2. Cookies
- **Access Token**:
  - Nombre: `access_token`
  - HTTP-only: Sí
  - Segura: Sí (solo HTTPS)
  - SameSite: 'strict'

- **Refresh Token**:
  - Nombre: `refresh_token`
  - HTTP-only: Sí
  - Segura: Sí (solo HTTPS)
  - SameSite: 'strict'

### 3. Logout
- **Endpoint**: `POST /auth/logout`
- **Proceso**:
  1. Limpia las cookies del navegador
  2. Elimina el refresh token de la base de datos
  3. Añade el access token a la lista negra (blacklist)
  4. Retorna confirmación de cierre de sesión

### 4. Blacklist de Tokens
- **Propósito**: Invalidar tokens antes de su expiración
- **Implementación**:
  - Colección en MongoDB que almacena tokens revocados
  - Cada entrada contiene:
    - Token
    - ID de usuario
    - Fecha de expiración
    - Tipo: 'blacklist'

### 5. Seguridad Adicional
- Validación de tokens contra la blacklist
- Renovación automática de tokens con refresh token
- Protección CSRF con SameSite cookies
- Headers de seguridad HTTP

### 6. Endpoints Relacionados
- `POST /auth/refresh`: Renovar tokens
- `POST /auth/logout-all`: Cerrar sesión en todos los dispositivos
- `GET /auth/profile`: Obtener perfil de usuario actual

Esta implementación sigue las mejores prácticas de seguridad para autenticación basada en tokens, combinando la comodidad de las cookies HTTP-only con la seguridad de la validación en el servidor.