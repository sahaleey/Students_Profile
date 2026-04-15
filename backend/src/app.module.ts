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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
