import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [AuthModule, UsersModule, EmployeesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
