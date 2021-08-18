import { ProjectService } from './project.service';
import { Body, Controller, Get, Post, ParseIntPipe, Param, Patch, Delete } from '@nestjs/common';
import { ProjectCreateDTO } from 'src/dto/project-create.dto';
import { project } from '@prisma/client';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post('insert')
    insertMember(@Body() body: ProjectCreateDTO): Promise<any> {
        const result = this.projectService.register(body);
        return result;
    }

    @Get('list/:mem_idx')
    getProjectList(@Param('mem_idx', ParseIntPipe) mem_idx: number): Promise<project[]> {
        const result = this.projectService.list(mem_idx);
        return result;
    }

    @Get('detail/:prj_idx/:mem_idx')
    getProjectDetail(@Param('prj_idx', ParseIntPipe) prj_idx: number, @Param('mem_idx', ParseIntPipe) mem_idx: number): Promise<project> {
        const result = this.projectService.detail(prj_idx, mem_idx);
        return result;
    }

    @Get('member/:prj_idx')
    getProjectAssignList(@Param('prj_idx', ParseIntPipe) prj_idx: number): Promise<any> {
        const result = this.projectService.projectAssignList(prj_idx);
        return result;
    }

    @Patch('member/:prj_idx')
    modifyProjectAssign(@Param('prj_idx', ParseIntPipe) prj_idx: number, @Body() body: any): Promise<any> {
        const result = this.projectService.modifyProjectAssign(prj_idx, body);
        return result;
    }

    @Patch('modify/:prj_idx')
    modifyProject(@Param('prj_idx', ParseIntPipe) prj_idx: number, @Body() body: any): Promise<any> {
        const result = this.projectService.modifyProject(prj_idx, body);
        return result;
    }

    @Patch('bookmark/')
    modifyProjectBookmark(@Body() body: any): Promise<any> {
        const result = this.projectService.modifyProjectBookmark(body);
        return result;
    }

    @Delete('delete/:prj_idx')
    deleteProject(@Param('prj_idx', ParseIntPipe) prj_idx: number): Promise<any> {
        const result = this.projectService.deleteProject(prj_idx);
        return result;
    }


}
