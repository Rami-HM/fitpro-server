import { Test, TestingModule } from '@nestjs/testing';
import { FailController } from './fail.controller';

describe('FailController', () => {
  let controller: FailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FailController],
    }).compile();

    controller = module.get<FailController>(FailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
