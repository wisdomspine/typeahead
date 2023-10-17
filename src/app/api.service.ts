import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { companies } from './companies.data';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  get companies() {
    return of(companies);
  }
}
