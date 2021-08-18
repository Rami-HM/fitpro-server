import { Injectable, CanActivate, ExecutionContext, HttpStatus,HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from "@nestjs/core";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor( 
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService ) {
	}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
     const request = context.switchToHttp().getRequest();
    // return this.validateRequest();
    const token = request.headers.authorization;

    const isPublic = this.reflector.get<boolean>( "isPublic", context.getHandler() );
    //decorator.ts 에서 정의 된 Public decorator 가 적용 되어있을 경우만 true
    if ( isPublic ) {
			return true;
		}

		return this.validateRequest(request);
  }

  validateRequest = (request) => {
    //로그인 토큰 체크
    const token = request.headers.authorization;// 헤더에 같이 넘어온 토큰 확인 
    
    try {
      const verify = this.jwtService.verify(token, {secret : `${process.env.SECRET_KEY}`} );
      console.log(verify);
      return verify;
    } catch (error) {
      console.log('false' + error.message);
      switch (error.message) {
        // 토큰에 대한 오류를 판단합니다.
        case 'INVALID_TOKEN':
        case 'TOKEN_IS_ARRAY':
        case 'NO_USER':
          throw new HttpException('유효하지 않은 토큰입니다.',HttpStatus.FORBIDDEN);

        case 'jwt expired':
          throw new HttpException('토큰이 만료되었습니다.',HttpStatus.FORBIDDEN);
        
        default:
          throw new HttpException('서버 오류입니다.',HttpStatus.FORBIDDEN);
      }
    }
  };
}
