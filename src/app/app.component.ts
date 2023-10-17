import { Component, OnDestroy, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Company, Field } from './types';
import { ApiService } from './api.service';
import {
  Observable,
  Subject,
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import * as jsSearch from 'js-search';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  readonly $destroy = new Subject<void>();
  readonly domSanitizer = inject(DomSanitizer);

  readonly fields: Field[] = [
    { key: 'id', label: 'S/N' },
    { key: 'name', label: 'Company Name' },
    { key: 'country', label: 'Country' },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Date Founded' },
    { key: 'ceo', label: 'Top Staff' },
    { key: 'website', label: 'Website Address' },
  ];
  readonly control = new FormControl<string>('');

  readonly apiService = inject(ApiService);

  // Create a searcher with the specified field as id field
  readonly searcher = new jsSearch.Search('id');

  readonly searchListener = this.control.valueChanges.pipe(
    // Listen to changes in input control value until component is destroyed
    takeUntil(this.$destroy),

    // Ensure the search query length is at least 3 characters long
    filter((query) => (query ?? '').length >= 3),

    // delay how often new query are being received
    debounceTime(400)
  );

  readonly companiesFilter: Observable<Company[]> = this.searchListener.pipe(
    // ensured that companies are fetched from the API on first search
    withLatestFrom(
      this.searchListener
        .pipe(
          // Ensured that at least a query has been supplied before calling api
          take(1),
          switchMap((_) => this.apiService.companies)
        )
        .pipe(
          tap((companies) => {
            // add search indices
            this.searcher.addIndex('name');
            this.searcher.addIndex('email');
            this.searcher.addIndex('country');
            this.searcher.addIndex('ceo');
            // add the fetched companies to search database
            this.searcher.addDocuments(companies);
          })
        )
    ),

    // loop through, and search matched companies
    // In this case, I use the already created searcher
    map(([query, _]) => {
      return this.searcher.search(query!) as unknown[] as Company[];
    })
  );

  ngOnDestroy(): void {
    this.$destroy.next();
  }
}
