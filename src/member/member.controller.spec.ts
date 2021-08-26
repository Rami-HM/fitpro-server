import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import * as bcrypt from 'bcrypt';

describe('MemberController', () => {
  let controller: MemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
    }).compile();

    controller = module.get<MemberController>(MemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('암호화 비밀번호 반환', () => {
  it('암호화 된 비밀번호를 얻어보자..', async () => {
    const member = {
      mem_id : 'test',
      mem_pwd : 'test1234$$'
    }
    const saltOrRounds = 10;
    const password = member.mem_pwd;
    const hash = await bcrypt.hash(password, saltOrRounds);
    
    console.log(hash);
    return hash;
  })
});
