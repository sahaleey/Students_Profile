import { Test, TestingModule } from '@nestjs/testing';
import { UsthadService } from './usthad.service';

describe('UsthadService', () => {
  let service: UsthadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsthadService],
    }).compile();

    service = module.get<UsthadService>(UsthadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
