/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  QueryList
} from '@angular/core';
import {
  RippleConfig,
  RippleRenderer,
  RippleTarget,
  setLines,
} from '@angular/material-experimental/mdc-core';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {MatListAvatarCssMatStyler, MatListIconCssMatStyler} from './list-styling';

function toggleClass(el: Element, className: string, on: boolean) {
  if (on) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  /** Query list matching list-item line elements. */
  abstract lines: QueryList<ElementRef<Element>>;

  /** Element reference referring to the primary list item text. */
  abstract _itemText: ElementRef<HTMLElement>;

  /** Host element for the list item. */
  _hostElement: HTMLElement;

  @ContentChildren(MatListAvatarCssMatStyler, {descendants: false}) _avatars: QueryList<never>;
  @ContentChildren(MatListIconCssMatStyler, {descendants: false}) _icons: QueryList<never>;

  @Input()
  get disableRipple(): boolean {
    return this.disabled || this._disableRipple || this._listBase.disableRipple;
  }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
  private _disableRipple: boolean = false;

  /** Whether the list-item is disabled. */
  @HostBinding('class.mdc-list-item--disabled')
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled(): boolean { return this._disabled || (this._listBase && this._listBase.disabled); }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  private _subscriptions = new Subscription();
  private _rippleRenderer: RippleRenderer|null = null;

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  rippleConfig: RippleConfig = {};

  /**
   * Implemented as part of `RippleTarget`.
   * @docs-private
   */
  get rippleDisabled(): boolean { return this.disableRipple; }

  constructor(public _elementRef: ElementRef<HTMLElement>, protected _ngZone: NgZone,
              private _listBase: MatListBase, private _platform: Platform) {
    this._hostElement = this._elementRef.nativeElement;

    if (!this._listBase._isNonInteractive) {
      this._initInteractiveListItem();
    }

    // If no type attribute is specified for a host `<button>` element, set it to `button`. If a
    // type attribute is already specified, we do nothing. We do this for backwards compatibility.
    // TODO: Determine if we intend to continue doing this for the MDC-based list.
    if (this._hostElement.nodeName.toLowerCase() === 'button' &&
        !this._hostElement.hasAttribute('type')) {
      this._hostElement.setAttribute('type', 'button');
    }
  }

  ngAfterContentInit() {
    this._monitorLines();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    if (this._rippleRenderer !== null) {
      this._rippleRenderer._removeTriggerEvents();
    }
  }

  /** Gets the label for the list item. This is used for the typeahead. */
  _getItemLabel(): string {
    return this._itemText ? (this._itemText.nativeElement.textContent || '') : '';
  }

  /** Whether the list item has icons or avatars. */
  _hasIconOrAvatar() {
    return !!(this._avatars.length || this._icons.length);
  }

  private _initInteractiveListItem() {
    this._hostElement.classList.add('mat-mdc-list-item-interactive');
    this._rippleRenderer =
        new RippleRenderer(this, this._ngZone, this._hostElement, this._platform);
    this._rippleRenderer.setupTriggerEvents(this._hostElement);
  }

  /**
   * Subscribes to changes in `MatLine` content children and annotates them
   * appropriately when they change.
   */
  private _monitorLines() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this.lines.changes.pipe(startWith(this.lines))
          .subscribe((lines: QueryList<ElementRef<Element>>) => {
            toggleClass(this._hostElement, 'mat-mdc-list-item-single-line', lines.length <= 1);
            lines.forEach((line: ElementRef<Element>, index: number) => {
              toggleClass(line.nativeElement,
                  'mdc-list-item__primary-text', index === 0 && lines.length > 1);
              toggleClass(line.nativeElement, 'mdc-list-item__secondary-text', index !== 0);
            });
            setLines(lines, this._elementRef, 'mat-mdc');
          }));
    });
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}

@Directive()
/** @docs-private */
export abstract class MatListBase {
  @HostBinding('class.mat-mdc-list-non-interactive')
  _isNonInteractive: boolean = true;

  /** Whether ripples for all list items is disabled. */
  @Input()
  get disableRipple(): boolean { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
  private _disableRipple: boolean = false;

  /** Whether all list items are disabled. */
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}
