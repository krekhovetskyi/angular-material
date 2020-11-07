import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipHarness} from './chip-harness';

let fixture: ComponentFixture<ChipHarnessTest>;
let loader: HarnessLoader;

describe('MatChipHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipHarness);
    expect(harnesses.length).toBe(5);
  });

  it('should get the chip text content', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipHarness);
    expect(await harnesses[0].getText()).toBe('Basic Chip');
    expect(await harnesses[1].getText()).toBe('Chip');
    expect(await harnesses[2].getText()).toBe('Chip with avatar');
    expect(await harnesses[3].getText()).toBe('Disabled Chip');
    expect(await harnesses[4].getText()).toBe('Chip Row');
  });

  it('should be able to remove a mat-chip-row', async () => {
    const removeChipSpy = spyOn(fixture.componentInstance, 'removeChip');

    const harnesses = await loader.getAllHarnesses(MatChipHarness);
    await harnesses[4].remove();

    expect(removeChipSpy).toHaveBeenCalledTimes(1);
  });
});

@Component({
  template: `
    <mat-basic-chip>Basic Chip</mat-basic-chip>
    <mat-chip>Chip <span matChipTrailingIcon>trailing_icon</span></mat-chip>
    <mat-chip><mat-chip-avatar>B</mat-chip-avatar>Chip with avatar</mat-chip>
    <mat-chip disabled>Disabled Chip <span matChipRemove>remove_icon</span></mat-chip>
    <mat-chip-row (removed)="removeChip()">Chip Row</mat-chip-row>
  `
})
class ChipHarnessTest {
  removeChip() {}
}
