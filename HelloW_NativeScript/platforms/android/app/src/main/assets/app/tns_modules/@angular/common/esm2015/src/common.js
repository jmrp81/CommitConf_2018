/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
export { PlatformLocation, LOCATION_INITIALIZED, LocationStrategy, APP_BASE_HREF, HashLocationStrategy, PathLocationStrategy, Location } from './location/index';
export { formatDate } from './i18n/format_date';
export { formatCurrency, formatNumber, formatPercent } from './i18n/format_number';
export { NgLocaleLocalization, NgLocalization } from './i18n/localization';
export { registerLocaleData } from './i18n/locale_data';
export { Plural, NumberFormatStyle, FormStyle, TranslationWidth, FormatWidth, NumberSymbol, WeekDay, getNumberOfCurrencyDigits, getCurrencySymbol, getLocaleDayPeriods, getLocaleDayNames, getLocaleMonthNames, getLocaleId, getLocaleEraNames, getLocaleWeekEndRange, getLocaleFirstDayOfWeek, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocalePluralCase, getLocaleTimeFormat, getLocaleNumberSymbol, getLocaleNumberFormat, getLocaleCurrencyName, getLocaleCurrencySymbol } from './i18n/locale_data_api';
export { parseCookieValue as ɵparseCookieValue } from './cookie';
export { CommonModule, DeprecatedI18NPipesModule } from './common_module';
export { NgClass, NgForOf, NgForOfContext, NgIf, NgIfContext, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NgComponentOutlet } from './directives/index';
export { DOCUMENT } from './dom_tokens';
export { AsyncPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe, TitleCasePipe, KeyValuePipe } from './pipes/index';
export { DeprecatedDatePipe, DeprecatedCurrencyPipe, DeprecatedDecimalPipe, DeprecatedPercentPipe } from './pipes/deprecated/index';
export { PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, PLATFORM_WORKER_APP_ID as ɵPLATFORM_WORKER_APP_ID, PLATFORM_WORKER_UI_ID as ɵPLATFORM_WORKER_UI_ID, isPlatformBrowser, isPlatformServer, isPlatformWorkerApp, isPlatformWorkerUi } from './platform_id';
export { VERSION } from './version';
export { ViewportScroller, NullViewportScroller as ɵNullViewportScroller } from './viewport_scroller';

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLDhJQUFjLGtCQUFrQixDQUFDO0FBQ2pDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRixPQUFPLEVBQUMsb0JBQW9CLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQVEsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHVCQUF1QixFQUFFLDRCQUE0QixFQUFFLHdCQUF3QixFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLHVCQUF1QixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDampCLE9BQU8sRUFBQyxnQkFBZ0IsSUFBSSxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvRCxPQUFPLEVBQUMsWUFBWSxFQUFFLHlCQUF5QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDeEUsT0FBTyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0TSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQVcsTUFBTSxlQUFlLENBQUM7QUFDcE4sT0FBTyxFQUFDLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbEksT0FBTyxFQUFDLG1CQUFtQixJQUFJLG9CQUFvQixFQUFFLGtCQUFrQixJQUFJLG1CQUFtQixFQUFFLHNCQUFzQixJQUFJLHVCQUF1QixFQUFFLHFCQUFxQixJQUFJLHNCQUFzQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZTLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxFQUFDLGdCQUFnQixFQUFFLG9CQUFvQixJQUFJLHFCQUFxQixFQUFDLE1BQU0scUJBQXFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBFbnRyeSBwb2ludCBmb3IgYWxsIHB1YmxpYyBBUElzIG9mIHRoZSBjb21tb24gcGFja2FnZS5cbiAqL1xuZXhwb3J0ICogZnJvbSAnLi9sb2NhdGlvbi9pbmRleCc7XG5leHBvcnQge2Zvcm1hdERhdGV9IGZyb20gJy4vaTE4bi9mb3JtYXRfZGF0ZSc7XG5leHBvcnQge2Zvcm1hdEN1cnJlbmN5LCBmb3JtYXROdW1iZXIsIGZvcm1hdFBlcmNlbnR9IGZyb20gJy4vaTE4bi9mb3JtYXRfbnVtYmVyJztcbmV4cG9ydCB7TmdMb2NhbGVMb2NhbGl6YXRpb24sIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuL2kxOG4vbG9jYWxpemF0aW9uJztcbmV4cG9ydCB7cmVnaXN0ZXJMb2NhbGVEYXRhfSBmcm9tICcuL2kxOG4vbG9jYWxlX2RhdGEnO1xuZXhwb3J0IHtQbHVyYWwsIE51bWJlckZvcm1hdFN0eWxlLCBGb3JtU3R5bGUsIFRpbWUsIFRyYW5zbGF0aW9uV2lkdGgsIEZvcm1hdFdpZHRoLCBOdW1iZXJTeW1ib2wsIFdlZWtEYXksIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMsIGdldEN1cnJlbmN5U3ltYm9sLCBnZXRMb2NhbGVEYXlQZXJpb2RzLCBnZXRMb2NhbGVEYXlOYW1lcywgZ2V0TG9jYWxlTW9udGhOYW1lcywgZ2V0TG9jYWxlSWQsIGdldExvY2FsZUVyYU5hbWVzLCBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UsIGdldExvY2FsZUZpcnN0RGF5T2ZXZWVrLCBnZXRMb2NhbGVEYXRlRm9ybWF0LCBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCwgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzLCBnZXRMb2NhbGVQbHVyYWxDYXNlLCBnZXRMb2NhbGVUaW1lRm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldExvY2FsZU51bWJlckZvcm1hdCwgZ2V0TG9jYWxlQ3VycmVuY3lOYW1lLCBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbH0gZnJvbSAnLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5leHBvcnQge3BhcnNlQ29va2llVmFsdWUgYXMgybVwYXJzZUNvb2tpZVZhbHVlfSBmcm9tICcuL2Nvb2tpZSc7XG5leHBvcnQge0NvbW1vbk1vZHVsZSwgRGVwcmVjYXRlZEkxOE5QaXBlc01vZHVsZX0gZnJvbSAnLi9jb21tb25fbW9kdWxlJztcbmV4cG9ydCB7TmdDbGFzcywgTmdGb3JPZiwgTmdGb3JPZkNvbnRleHQsIE5nSWYsIE5nSWZDb250ZXh0LCBOZ1BsdXJhbCwgTmdQbHVyYWxDYXNlLCBOZ1N0eWxlLCBOZ1N3aXRjaCwgTmdTd2l0Y2hDYXNlLCBOZ1N3aXRjaERlZmF1bHQsIE5nVGVtcGxhdGVPdXRsZXQsIE5nQ29tcG9uZW50T3V0bGV0fSBmcm9tICcuL2RpcmVjdGl2ZXMvaW5kZXgnO1xuZXhwb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcbmV4cG9ydCB7QXN5bmNQaXBlLCBEYXRlUGlwZSwgSTE4blBsdXJhbFBpcGUsIEkxOG5TZWxlY3RQaXBlLCBKc29uUGlwZSwgTG93ZXJDYXNlUGlwZSwgQ3VycmVuY3lQaXBlLCBEZWNpbWFsUGlwZSwgUGVyY2VudFBpcGUsIFNsaWNlUGlwZSwgVXBwZXJDYXNlUGlwZSwgVGl0bGVDYXNlUGlwZSwgS2V5VmFsdWVQaXBlLCBLZXlWYWx1ZX0gZnJvbSAnLi9waXBlcy9pbmRleCc7XG5leHBvcnQge0RlcHJlY2F0ZWREYXRlUGlwZSwgRGVwcmVjYXRlZEN1cnJlbmN5UGlwZSwgRGVwcmVjYXRlZERlY2ltYWxQaXBlLCBEZXByZWNhdGVkUGVyY2VudFBpcGV9IGZyb20gJy4vcGlwZXMvZGVwcmVjYXRlZC9pbmRleCc7XG5leHBvcnQge1BMQVRGT1JNX0JST1dTRVJfSUQgYXMgybVQTEFURk9STV9CUk9XU0VSX0lELCBQTEFURk9STV9TRVJWRVJfSUQgYXMgybVQTEFURk9STV9TRVJWRVJfSUQsIFBMQVRGT1JNX1dPUktFUl9BUFBfSUQgYXMgybVQTEFURk9STV9XT1JLRVJfQVBQX0lELCBQTEFURk9STV9XT1JLRVJfVUlfSUQgYXMgybVQTEFURk9STV9XT1JLRVJfVUlfSUQsIGlzUGxhdGZvcm1Ccm93c2VyLCBpc1BsYXRmb3JtU2VydmVyLCBpc1BsYXRmb3JtV29ya2VyQXBwLCBpc1BsYXRmb3JtV29ya2VyVWl9IGZyb20gJy4vcGxhdGZvcm1faWQnO1xuZXhwb3J0IHtWRVJTSU9OfSBmcm9tICcuL3ZlcnNpb24nO1xuZXhwb3J0IHtWaWV3cG9ydFNjcm9sbGVyLCBOdWxsVmlld3BvcnRTY3JvbGxlciBhcyDJtU51bGxWaWV3cG9ydFNjcm9sbGVyfSBmcm9tICcuL3ZpZXdwb3J0X3Njcm9sbGVyJztcbiJdfQ==