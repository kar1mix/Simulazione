import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organizzatore } from './organizzatore';

describe('Organizzatore', () => {
  let component: Organizzatore;
  let fixture: ComponentFixture<Organizzatore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Organizzatore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Organizzatore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
