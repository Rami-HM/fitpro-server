import { Test, TestingModule } from '@nestjs/testing';
import { FailService } from './fail.service';

describe('FailService', () => {
  let service: FailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FailService],
    }).compile();

    service = module.get<FailService>(FailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
