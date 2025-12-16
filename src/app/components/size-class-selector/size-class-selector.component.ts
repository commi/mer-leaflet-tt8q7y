import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SIZE_CLASSES } from '../../utils/color.util';

@Component({
  selector: 'app-size-class-selector',
  standalone: false,
  templateUrl: './size-class-selector.component.html',
  styles: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SizeClassSelectorComponent),
      multi: true
    }
  ]
})
export class SizeClassSelectorComponent implements ControlValueAccessor {
  sizeClasses = SIZE_CLASSES;
  selectedSizeClasses: string[] = ['alle Größenklassen'];

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    if (value) {
      this.selectedSizeClasses = value;
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleSizeClass(sizeClass: string): void {
    const currentSelection = [...this.selectedSizeClasses];

    // Special handling: "alle Größenklassen" is mutually exclusive
    if (sizeClass === 'alle Größenklassen') {
      this.selectedSizeClasses = ['alle Größenklassen'];
      this.onChange(this.selectedSizeClasses);
      return;
    }

    // Remove "alle Größenklassen" if selecting specific size class
    const filtered = currentSelection.filter(s => s !== 'alle Größenklassen');

    if (filtered.includes(sizeClass)) {
      // Deselect
      const updated = filtered.filter(s => s !== sizeClass);
      // If nothing left, default to "alle"
      this.selectedSizeClasses = updated.length > 0 ? updated : ['alle Größenklassen'];
    } else {
      // Select
      this.selectedSizeClasses = [...filtered, sizeClass];
    }

    this.onChange(this.selectedSizeClasses);
    this.onTouched();
  }

  isSizeClassSelected(sizeClass: string): boolean {
    return this.selectedSizeClasses.includes(sizeClass);
  }
}
