// src/user/user.service.ts
import { Body, Controller, Post, Res, Session,Request } from '@nestjs/common';
import { Public } from '../config/decorator';
import { User, UserService } from './user.service';

@Controller('geg')
export class UserController {
	constructor(private readonly userService: UserService){};

    @Public()
    @Post('login')
    getLoginInfo(@Body() body : User): Promise<any> {
      return this.userService.findOne(body);
    }

    // @Public()
    // @Post('login')
	// async login(@Body() body : User, @Session() session, @Request() req, @Res({ passthrough: true}) response) {
	// 	const accessToken = await (await this.userService.findOne(body)).accessToken;
	// 	await response.cookie('Authorization', accessToken);
    //     return req.user;
    // }
}