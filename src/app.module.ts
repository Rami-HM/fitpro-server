import { MemberService } from './member/member.service';
import { MemberController } from './member/member.controller';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
//import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ProjectService } from './project/project.service';
import { ProjectController } from './project/project.controller';
import { TaskController } from './task/task.controller';
import { TaskService } from './task/task.service';
import { FailController } from './fail/fail.controller';
import { FailService } from './fail/fail.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { StatsService } from './stats/stats.service';
import { StatsController } from './stats/stats.controller';

@Module({
  imports: [ PrismaModule, 
    ConfigModule.forRoot(),
    JwtModule.register({
    secret: `${process.env.SECRET_KEY}`,
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [
    AppController,
    UserController,
    MemberController,
    ProjectController,
    TaskController,
    FailController,
    StatsController
  ],
  providers: [
    PrismaService,
    AppService,
    UserService,
    MemberService,
    ProjectService,
    TaskService,
    FailService,
    CloudinaryService,
    CloudinaryProvider,
    StatsService,
    /*UserPgService,GroupPgService*/
  ],
})
export class AppModule {}
