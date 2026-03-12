import { TestBed } from '@angular/core/testing';

import { ThreeJs } from './three-js';

describe('ThreeJs', () => {
  let service: ThreeJs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreeJs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
