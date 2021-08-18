import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createImageURL } from "./lib/multerOptions";
import { MemberService } from './member/member.service';

@Injectable()
export class AppService {
  constructor(private readonly memberService: MemberService, private readonly jwtService: JwtService
  ) {

  }
  public uploadFiles(files: Array<Express.Multer.File>): Object {
    const generatedFiles: string[] = [];

    try {
      for (const file of files) {
        generatedFiles.push(createImageURL(file));
        // http://localhost:8080/public/파일이름 형식으로 저장이 됩니다.
      }
      return {
        status: 200,
        message: '파일 업로드를 성공하였습니다.',
        data: {
          files: generatedFiles,
        },
      };
    } catch (error) {
      throw new HttpException("파일 업로드에 실패하였습니다.", HttpStatus.BAD_REQUEST);
    }
  }

  public checkToken(token): Promise<any> {
    try {
      const verify = this.jwtService.verify(token, { secret: `${process.env.SECRET_KEY}` });
      console.log(verify);
      return this.memberService.getMemberInfo(verify.idx);
    } catch (error) {
      throw new HttpException('유효하지 않은 토큰입니다.',HttpStatus.UNAUTHORIZED);
    }
  }

}