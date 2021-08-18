import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
// @Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 200;

    response.status(200).json({
      statusCode: status,
      error : exception['response'] instanceof Object ?  exception['response']['error'] : exception['response'],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
