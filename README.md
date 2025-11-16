
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

