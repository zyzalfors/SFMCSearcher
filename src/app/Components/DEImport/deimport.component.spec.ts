import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DEImportComponent } from "./deimport.component";

describe("DEImportComponent", () => {
  let component: DEImportComponent;
  let fixture: ComponentFixture<DEImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DEImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DEImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
