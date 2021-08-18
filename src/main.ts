import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './auth.guard';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggingInterceptor } from './logging.interceptor';
import { JwtService,JwtModule } from '@nestjs/jwt';
//import express from 'express'; // 이렇게는 왜 안되는지 모르겟음.
import { join } from 'path';
var express = require('express');

//푸시 테스트
async function bootstrap() {
  const app= await NestFactory.create(AppModule);
  const reflector = app.get( Reflector );
  const jwtService = app.get( JwtService );
  app.enableCors();
  
  app.use('/uploads', express.static(join(__dirname, '../uploads'))); // 정적메소드 접근을 위해 static 정의
  
  app.useGlobalFilters(new HttpExceptionFilter()); //모든 컨트롤러에 대한 인셉션필터 적용
  // app.useGlobalPipes(new ValidationPipe());
  //app.useGlobalInterceptors(new LoggingInterceptor());
  
  app.useGlobalGuards(new AuthGuard(reflector,jwtService));
  await app.listen(process.env.PORT || 80 ); // port
  //await app.listen(process.env.SSL_PORT); // port
}
bootstrap();
