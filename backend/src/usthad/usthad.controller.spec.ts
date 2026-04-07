import { Test, TestingModule } from '@nestjs/testing';
import { UsthadController } from './usthad.controller';

describe('UsthadController', () => {
  let controller: UsthadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsthadController],
    }).compile();

    controller = module.get<UsthadController>(UsthadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
