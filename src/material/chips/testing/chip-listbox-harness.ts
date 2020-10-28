/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatChipOptionHarness} from './chip-option-harness';
import {
  ChipListboxHarnessFilters,
  ChipOptionHarnessFilters,
} from './chip-harness-filters';
import {_MatChipListHarnessBase} from './chip-list-harness';

/** Harness for interacting with a standard selectable chip list in tests. */
export class MatChipListboxHarness extends _MatChipListHarnessBase {
  /** The selector for the host element of a `MatChipList` instance. */
  static hostSelector = '.mat-chip-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipListboxHarnessFilters = {}):
    HarnessPredicate<MatChipListboxHarness> {
    return new HarnessPredicate(MatChipListboxHarness, options);
  }

  /**
   * Gets the list of chips inside the chip list.
   * @param filter Optionally filters which chips are included.
   */
  async getChips(filter: ChipOptionHarnessFilters = {}): Promise<MatChipOptionHarness[]> {
    return this.locatorForAll(MatChipOptionHarness.with(filter))();
  }

  /**
   * Selects a chip inside the chip list.
   * @param filter An optional filter to apply to the child chips.
   *    All the chips matching the filter will be selected.
   */
  async selectChips(filter: ChipOptionHarnessFilters = {}): Promise<void> {
    const chips = await this.getChips(filter);
    if (!chips.length) {
      throw Error(`Cannot find chip matching filter ${JSON.stringify(filter)}`);
    }
    await Promise.all(chips.map(chip => chip.select()));
  }
}
