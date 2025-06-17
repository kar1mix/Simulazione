import { TestBed } from '@angular/core/testing';

import { Iscrizioni } from './iscrizioni';

describe('Iscrizioni', () => {
  let service: Iscrizioni;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Iscrizioni);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
