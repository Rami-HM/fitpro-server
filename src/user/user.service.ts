import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
export type User = any;

@Injectable()
export class UserService {
    constructor(private jwtService: JwtService){

    }
    private readonly users = [
        {
          userId: 1,
          username: 'john',
          password: 'changeme',
          accessToken: '',
        },
        {
          userId: 2,
          username: 'maria',
          password: 'guess',
          accessToken: '',
        },
      ];
     
    
      async findOne(obj:any): Promise<User | undefined> {
    
        const token = this.jwtService.sign(obj);// token 반환
        let userInfo = this.users.find(user => user.username === obj.username);
        userInfo.accessToken = token;
        

        return {user : userInfo, accessToken : token};
      }

}
