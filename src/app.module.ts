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
    TaskController
  ],
  providers: [
    PrismaService,
    AppService,
    UserService,
    MemberService,
    ProjectService,
    TaskService

    /*UserPgService,GroupPgService*/
  ],
})
export class AppModule {}
