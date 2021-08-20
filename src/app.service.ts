import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { createImageURL } from "./lib/multerOptions";
import { MemberService } from './member/member.service';

import toStream = require('buffer-to-stream');
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { exception } from 'console';

@Injectable()
export class AppService {
  constructor(private readonly memberService: MemberService, private readonly jwtService: JwtService
    , private cloudinary: CloudinaryService
  ) {

  }

  public async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {

    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  //기존 서버에 직접 저장하는 방식은 헤로쿠에서 지원을..안함.. 
  //Cloudinary 를 통해 cdn 에 저장 후 그 url 을 뿌려주는걸로!
  public async uploadCloudinary(files: Array<Express.Multer.File>) {
    try {
      const result = await this.cloudinary.uploadImage(files[0]).catch(() => {
        throw new exception();
      });
      return {
        status: 200,
        message: '파일 업로드를 성공하였습니다.',
        data: {
          files: result.url,
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException("파일 업로드에 실패하였습니다.", HttpStatus.BAD_REQUEST);
    }
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
      throw new HttpException('유효하지 않은 토큰입니다.', HttpStatus.UNAUTHORIZED);
    }
  }

}