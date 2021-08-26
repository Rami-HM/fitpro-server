import { ProjectCreateDTO } from './../dto/project-create.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, project } from '@prisma/client';
import { getFormatDate } from '../member/member.service';
import { brotliDecompress } from 'zlib';

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaService) { }

    async register(body: ProjectCreateDTO): Promise<any> {
        try {
            const result = await this.prisma.project.create({
                data: {
                    prj_title: body.prj_title,
                    prj_sub_title: body.prj_sub_title,
                    prj_contents: body.prj_contents,
                    prj_start: body.prj_start,
                    prj_end: body.prj_end,
                    reg_mem_idx: body.reg_mem_idx,
                }
            })

            if (result['prj_start'])
                result['prj_start'] = getFormatDate(result.prj_start) as any;
            if (result['prj_end'])
                result['prj_end'] = getFormatDate(result.prj_end) as any;


            let assignInfo: Prisma.project_assignCreateInput;
            assignInfo = {
                reg_date: new Date(),
                readeryn: true,
                reg_mem_idx: body.reg_mem_idx,
                project: {
                    connect: { prj_idx: result.prj_idx }
                },
                member: {
                    connect: { mem_idx: body.reg_mem_idx }
                }
            }
            //프로젝트에 등록인 팀장으로 배정
            await this.prisma.project_assign.create({
                data: assignInfo
            });

            return ({
                status: 200,
                message: '프로젝트가 만들어졌어요!',
                data: {...result, readeridx : result.reg_mem_idx}
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async list(mem_idx: number): Promise<any> {
        try {
            const projectList = await this.prisma.$queryRaw(
                `SELECT 
                    PRJ_IDX, 
                    PRJ_TITLE,
                    PRJ_SUB_TITLE,
                    PRJ_CONTENTS,
                    PRJ_START,
                    PRJ_END,
                    REG_DATE,
                    READERIDX,
                    BOOKMARK
                FROM (
                SELECT
                    TB1.PRJ_IDX,
                    PRJ_TITLE,
                    PRJ_SUB_TITLE,
                    PRJ_CONTENTS,
                    PRJ_START,
                    PRJ_END,
                    TB1.REG_DATE
                    ,(SELECT MEM_IDX FROM PROJECT_ASSIGN PA WHERE PRJ_IDX = TB1.PRJ_IDX AND READERYN = TRUE) AS READERIDX,
                    (CASE
                        WHEN TB3.MEM_IDX IS NULL THEN FALSE
                        ELSE TRUE
                    END) AS BOOKMARK
                FROM
                    PROJECT TB1
                LEFT JOIN PROJECT_ASSIGN TB2 ON (TB1.PRJ_IDX = TB2.PRJ_IDX)
                LEFT JOIN PROJECT_BOOKMARK TB3 ON (TB1.PRJ_IDX = TB3.PRJ_IDX AND TB2.MEM_IDX = TB3.MEM_IDX)
                WHERE TB1.USEYN = TRUE AND TB2.MEM_IDX = ${mem_idx}
                ) TBL1
                ORDER BY
                    BOOKMARK DESC,
                    REG_DATE DESC;
                    `
            );
            return projectList;

        } catch (error) {
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async projectAssignList(prj_idx: number): Promise<project[]> {
        try {
            const resultQuery = await this.prisma.$queryRaw(
                `select
                        TB3.MEM_IDX,
                        MEM_ID,
                        MEM_NAME,
                        MEM_EMAIL,
                        MEM_BIRTH,
                        MEM_AFFIL,
                        MEM_PROFILE ,
                        MEM_NAME as NAME,
                        READERYN,
                        CONCAT('${process.env.CDN_URL}',MEM_PROFILE) as SRC
                    from
                        PROJECT TB1
                    left join PROJECT_ASSIGN as TB2 on
                        TB1.PRJ_IDX = TB2.PRJ_IDX
                    left join MEMBER as TB3 on
                        TB2.MEM_IDX = TB3.MEM_IDX
                    where
                        TB1.USEYN = true
                        AND
                        TB1.PRJ_IDX = ${prj_idx}
                    order by READERYN desc`
            );
            return await resultQuery;

        } catch (error) {
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async detail(prj_idx: number, mem_idx: number): Promise<project> {
        try {
            const result = await this.prisma.$queryRaw(
                `SELECT
                    TB1.PRJ_IDX,
                    PRJ_TITLE,
                    PRJ_SUB_TITLE,
                    PRJ_CONTENTS,
                    TO_CHAR(PRJ_START,'YYYY-MM-DD') AS PRJ_START, 
                    TO_CHAR(PRJ_END,'YYYY-MM-DD') AS PRJ_END,
                    TB3.MEM_IDX,
                    (CASE
                        WHEN TB3.MEM_IDX IS NULL THEN FALSE
                        ELSE TRUE
                    END) AS BOOKMARK,
                    TB1.REG_DATE,
                    TB3.MEM_IDX AS READERIDX
                FROM
                    PROJECT TB1
                LEFT JOIN PROJECT_BOOKMARK TB2 ON
                    (TB1.PRJ_IDX = TB2.PRJ_IDX
                        AND TB2.MEM_IDX = ${mem_idx})
                LEFT JOIN PROJECT_ASSIGN TB3 ON
                    (TB1.PRJ_IDX = TB3.PRJ_IDX
                        AND READERYN = TRUE)
                WHERE
                    TB1.USEYN = TRUE
                    AND TB1.PRJ_IDX = ${prj_idx}`
            )

            const resultQuery = await this.prisma.$queryRaw(
                `select
                    TB3.MEM_IDX,
                    MEM_ID,
                    MEM_NAME,
                    MEM_EMAIL,
                    MEM_BIRTH,
                    MEM_AFFIL,
                    MEM_PROFILE ,
                    MEM_NAME as NAME,
                    READERYN,
                    CONCAT('${process.env.CDN_URL}',MEM_PROFILE) as SRC
                from
                    PROJECT TB1
                left join PROJECT_ASSIGN as TB2 on
                    TB1.PRJ_IDX = TB2.PRJ_IDX
                left join MEMBER as TB3 on
                    TB2.MEM_IDX = TB3.MEM_IDX
                where
                    TB1.USEYN = true
                    AND
                    TB1.PRJ_IDX = ${prj_idx}`
            );
            result[0]['project_assign'] = await resultQuery;
            return result[0];

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async modifyProjectAssign(prj_idx: number, body: any): Promise<any> {
        try {
            await this.prisma.$queryRaw(
                `delete from project_assign where prj_idx = ${prj_idx}`
            );

            body['assignProjectMemberList'].map(async (member) => {
                let assignInfo: Prisma.project_assignCreateInput;
                assignInfo = {
                    member: { connect: { mem_idx: member.mem_idx } },
                    project: { connect: { prj_idx } },
                    readeryn: member['readeryn'],
                    reg_mem_idx: body.reg_mem_idx,
                };
                const result = await this.prisma.project_assign.create({
                    data: assignInfo
                })
            })

            return ({
                status: 201,
                message: '수정되었습니다.',
                data: body['assignProjectMemberList']
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 수정 하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }

        return null;
    }

    async modifyProject(prj_idx: number, body: any): Promise<any> {
        try {

            let data: Prisma.projectUpdateInput = {
                prj_title: body.prj_title,
                prj_sub_title: body.prj_sub_title,
                prj_contents: body.prj_contents,
                prj_start: body.prj_start,
                prj_end: body.prj_end,
                upt_date: new Date(),
                upt_mem_idx: body.upt_mem_idx
            }

            const result = await this.prisma.project.update({
                where: { prj_idx: prj_idx },
                data,
            });

            const resultDetail = await this.detail(prj_idx, body.upt_mem_idx);

            return ({
                status: 201,
                message: '수정되었습니다.',
                data: resultDetail
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 수정 하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }

        return null;
    }

    async modifyProjectBookmark(body: any): Promise<any> {
        try {
            if (body.bookmark) {
                const result = await this.prisma.project_bookmark.create({
                    data: {
                        prj_idx: body.prj_idx,
                        mem_idx: body.mem_idx
                    }
                })
            } else {
                await this.prisma.project_bookmark.delete({
                    where: {
                        project_bookmark_un: {
                            prj_idx: body.prj_idx,
                            mem_idx: body.mem_idx
                        }
                    }
                })
            }

            return ({
                status: 201,
                message: '수정되었습니다.',
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 즐겨찾기 하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }

        return null;
    }

    async deleteProject(prj_idx: number): Promise<any> {

        try {
            await this.prisma.project.delete({
                where: { prj_idx }
            });

            return ({
                status: 201,
                message: '삭제되었어요.',
            });
        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "프로젝트를 삭제 하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }

    }
}
