import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    const prisma = app.get<PrismaService>(PrismaService);
    prisma.$disconnect();
    await app.close();
  });

  // it('/ (GET)', () => {
  it('GET user/list', () => {
    return request(app.getHttpServer()).get('/user/list').expect(200);
    // return request(app.getHttpServer())
    //   .get('/')
    //   .expect(200)
    //   .expect('Hello World!');
  });

  it('POST user/add', () => {
    return request(app.getHttpServer())
      .post('/user/add')
      .send({
        name: '이사람',
        tel: '01023452345',
        address: '부산광역시 이사람구 이사람동',
        memo: '',
        groupId: 2,
      })
      .expect(201)
      .expect((res) => {
        console.log(res.body);
        expect(res).toBeDefined();
        // expect(res.body.name).toEqual('이사람');
      });
  });

  it('POST user/add validation', () => {
    return request(app.getHttpServer())
      .post('/user/add')
      .send({
        name: '이사람',
        tel: 2323,
        address: '부산광역시 이사람구 이사람동',
        memo: '',
        groupId: 'ggger',
      })
      .expect(500);
  });
});
