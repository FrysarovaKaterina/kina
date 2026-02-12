import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Keyboard } from './keyboard';

describe('Keyboard', () => {
  let component: Keyboard;
  let fixture: ComponentFixture<Keyboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Keyboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Keyboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
