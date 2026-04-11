import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsthadModule } from './usthad/usthad.module';
import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { SubwingModule } from './subwing/subwing.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Reads the .env file
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,

      synchronize: true, // Automatically creates SQL tables for you! (Dev only)
    }),
    UsersModule,
    AuthModule,
    UsthadModule,
    AdminModule,
    StudentModule,
    SubwingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
