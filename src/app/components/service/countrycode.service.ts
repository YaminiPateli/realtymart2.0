import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CountryCode } from '../../CountryCode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountrycodeService {
  private apiURL = environment.apiUrl + 'countrycode';

  constructor(private httpClient: HttpClient) {}

  getcountrycode(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL).pipe(
      catchError(this.errorHandler)
    );
  }

  getIPCountryCode(): Observable<any> {
    sessionStorage.removeItem('ip_country_calling_code');

    return this.httpClient.get<any>('https://api.country.is').pipe(
      map((res: any) => {
        const country = (res?.country || 'IN').toUpperCase();
        return { country_code: country };
      }),
      catchError(() => {
        return this.httpClient.get<any>('https://ipinfo.io/json').pipe(
          map((res: any) => {
            const country = (res?.country || 'IN').toUpperCase();
            return { country_code: country };
          }),
          catchError(() => {
            return of({ country_code: 'IN' });
          })
        );
      })
    );
  }

  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
