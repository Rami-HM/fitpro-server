import { MemberService } from './member/member.service';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Prisma, member } from '@prisma/client';
import { AppService } from './app.service';
import { Public } from './config/decorator';
import { multerOptions } from './lib/multerOptions';
import { MemberLoginDTO } from './dto/member-login-dto';
import { Request } from 'express';



@Controller('') //mapping 주소
export class AppController {
  constructor(private readonly appService: AppService, private readonly memberService: MemberService) { }


  @Public()
  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }

  @Get('hello2')
  getHello2(): string {
    return 'Hello World2222';
  }

  @Public()
  @Post('api/upload')
  //@UseInterceptors(FilesInterceptor('file', null, multerOptions))
  // FilesInterceptor 첫번째 매개변수: formData의 key값,
  // 두번째 매개변수: 파일 최대 갯수
  // 세번째 매개변수: 파일 설정 (위에서 작성했던 multer 옵션들)
  @UseInterceptors(FilesInterceptor('file'))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    //const confiles = this.appService.uploadFiles(files); //주소를 디비에 저장해서 불러오자!
    const confiles = this.appService.uploadCloudinary(files); //주소를 디비에 저장해서 불러오자!
    return confiles;
  }

  @Public()
  @Post('login')
  getLoginInfo(@Body() body: MemberLoginDTO): Promise<member> {
    const memberInfo = this.memberService.findOne(body);
    return memberInfo;
  }

  @Get('checkToken')
  checkToken(@Req() request: Request): Promise<member> {
    const token = request.headers.authorization;
    return this.appService.checkToken(token);
  }


  @Public()
  @Get('hihi')
  memberList() : Promise<object[]> {
    const result = this.memberService.list();
    return result;
  }
}
