import { MemberService } from './member.service';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { MemberCreateDTO } from '../dto/member-create.dto';
import { Public } from '../config/decorator';
import { MemberUpdateDTO } from '../dto/member-update.dto';
import { member } from '@prisma/client';

@Controller('member')
export class MemberController {
    
    constructor(private readonly memberService:MemberService){}

    @Public()
    @Post('register')
    insertMember(@Body() body : MemberCreateDTO): Promise<any> {

      const result = this.memberService.register(body);
      return result;
    }

    @Get('info/:mem_idx')
    getMemberDetail(@Param('mem_idx', ParseIntPipe) mem_idx: number) : Promise<object>{
      const result = this.memberService.getMemberInfo(mem_idx);
      return result;
    }

    @Patch('modify')
    modifyMember(@Body() body: MemberUpdateDTO) : Promise<any> {
      const result = this.memberService.modify(body);
      return result;
    }

    @Get('list')
    memberList() : Promise<object[]> {
      const result = this.memberService.list();
      return result;
    }
}
