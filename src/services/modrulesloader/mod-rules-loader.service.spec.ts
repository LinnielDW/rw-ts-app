import { TestBed } from '@angular/core/testing';

import { ModRulesLoaderService } from './mod-rules-loader.service';

describe('ModlistAnalyserServiceService', () => {
  let service: ModRulesLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModRulesLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
