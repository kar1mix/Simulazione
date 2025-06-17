import { TestBed } from '@angular/core/testing';

import { Eventi } from './eventi';

describe('Eventi', () => {
  let service: Eventi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Eventi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
