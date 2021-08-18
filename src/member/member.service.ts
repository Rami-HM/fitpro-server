import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberLoginDTO } from '../dto/member-login-dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MemberCreateDTO } from '../dto/member-create.dto';
import { MemberUpdateDTO } from '../dto/member-update.dto';
import { brotliDecompress } from 'zlib';

@Injectable()
export class MemberService {
    constructor(private jwtService: JwtService, private readonly prisma: PrismaService) {

    }
    async findOne(body: MemberLoginDTO): Promise<any> {

        try {

            const memberInfo = await this.prisma.member.findFirst({
                // where: { AND : [{mem_id: body.mem_id}, {mem_pwd: body.mem_pwd}] },
                where: { mem_id: body.mem_id },
                select: {
                    mem_id: true,
                    mem_name: true,
                    mem_affil: true,
                    mem_email: true,
                    mem_birth: true,
                    mem_profile: true,
                    mem_idx: true,
                    mem_pwd: true,
                }
            });

            if (!memberInfo) {
                throw new HttpException('일치하는 정보가 없습니다.', HttpStatus.NO_CONTENT);
            }
            const chkPwd = await bcrypt.compare(body.mem_pwd, memberInfo.mem_pwd)

            if (!chkPwd) {
                throw new HttpException('비밀번호가 일치하지 않습니다.', HttpStatus.NO_CONTENT);
            }

            delete memberInfo.mem_pwd;

            if (memberInfo.mem_birth) {
                const formatDate = getFormatDate(memberInfo.mem_birth);
                memberInfo.mem_birth = formatDate as any;
            }

            const payload = { idx: memberInfo.mem_idx, id: memberInfo.mem_id };
            const token = this.jwtService.sign(payload);// token 반환

            return { member: memberInfo, accessToken: token };

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "오류가 발생하였습니다.", HttpStatus.BAD_REQUEST);
        }

    }

    async register(body: MemberCreateDTO): Promise<any> {

        try {

            const chkId = await this.prisma.member.findFirst({
                where: { mem_id: body.mem_id }
            });
            if (chkId) throw new HttpException("같은 아이디가 있어요!", HttpStatus.BAD_REQUEST);

            const saltOrRounds = 10;
            const password = body.mem_pwd;
            const hash = await bcrypt.hash(password, saltOrRounds);

            body.mem_pwd = hash;

            const result = await this.prisma.member.create(
                { data: body }
            )

            return ({
                status: 200,
                message: '반가워요! FITPRO 에 오신걸 환영합니다.',
                data: {
                    files: result,
                }
            });
        } catch (error) {
            throw new HttpException(error['response'] ? error['response'] : "회원가입에 실패하였습니다.", HttpStatus.BAD_REQUEST);
        }

    }

    async getMemberInfo(mem_idx: number): Promise<object> {

        try {
            let memberInfo = await this.prisma.member.findUnique({
                where: { mem_idx: mem_idx },
                select: {
                    mem_id: true,
                    mem_name: true,
                    mem_affil: true,
                    mem_email: true,
                    mem_birth: true,
                    mem_profile: true,
                    mem_idx: true,
                }
            });

            if (memberInfo.mem_birth) {
                const bir = memberInfo.mem_birth;
                const formatDate = getFormatDate(bir);
                memberInfo.mem_birth = formatDate as any;
            }

            return memberInfo;
        } catch (error) {
            throw new HttpException("정보를 찾을 수 없습니다.", HttpStatus.FORBIDDEN);
        }

    }

    async modify(body: MemberUpdateDTO): Promise<any> {

        try {

            const saltOrRounds = 10;
            const password = body.mem_pwd;
            const hash = await bcrypt.hash(password, saltOrRounds);

            // bodY 값에 해당 컬럼이아닌 값도 넘어와서ㅓ...
            const updateMember = {
                mem_id: body.mem_id,
                mem_pwd: hash,
                mem_name: body.mem_name,
                mem_email: body.mem_email,
                mem_birth: body.mem_birth,
                mem_affil: body.mem_affil,
                mem_profile: body.mem_profile,
                upt_date: new Date()
            }
            if (body.mem_profile === '') delete updateMember.mem_profile;

            const result = await this.prisma.member.update({
                where: { mem_idx: body.mem_idx },
                data: updateMember
            });

            return ({
                status: 200,
                message: '정보수정에 성공했어요!',
            });
        } catch (error) {
            throw new HttpException("정보수정에 실패하였습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async list(): Promise<object[]> {
        const resultQuery = await this.prisma.$queryRaw(
            `select
                MEM_IDX,
                MEM_ID,
                MEM_NAME,
                MEM_EMAIL,
                MEM_BIRTH,
                MEM_AFFIL,
                MEM_PROFILE ,
                MEM_NAME as NAME,
                CONCAT('${process.env.SERVER_DOMAIN}',MEM_PROFILE) as SRC
            from  MEMBER`
        );
        return resultQuery;
    }
}

export const getFormatDate = (date) => {
    var year = date.getFullYear();              //yyyy
    var month = (1 + date.getMonth());          //M
    month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
    var day = date.getDate();                   //d
    day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
    return year + '-' + month + '-' + day;       //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}