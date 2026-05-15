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
import { ConfigService } from '@nestjs/config';
import { ParentModule } from './parent/parent.module';
import { StaffModule } from './staff/staff.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import type { Provider } from '@nestjs/common';

const throttlerGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }), // Reads the .env file
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        console.log('DB connected:', !!dbUrl);

        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    UsersModule,
    AuthModule,
    UsthadModule,
    AdminModule,
    StudentModule,
    SubwingModule,
    ParentModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [throttlerGuardProvider, AppService],
})
export class AppModule {}
