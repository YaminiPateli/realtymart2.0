import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private readonly allowedCities = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot'];

  constructor(private http: HttpClient) { }

  matchAllowedCity(rawCity: string): string | null {
    if (!rawCity) return null;
    const lower = rawCity.trim().toLowerCase();
    if (lower.includes('ahmedabad')) return 'Ahmedabad';
    if (lower.includes('gandhinagar')) return 'Gandhinagar';
    if (lower.includes('vadodara') || lower.includes('baroda')) return 'Vadodara';
    if (lower.includes('surat')) return 'Surat';
    if (lower.includes('rajkot')) return 'Rajkot';
    return null;
  }

  private ipCityPromise: Promise<string> | null = null;

  getCityByIp(): Promise<string> {
    const cachedSessionCity = sessionStorage.getItem('ip_detected_city');
    if (cachedSessionCity) {
      const matched = this.matchAllowedCity(cachedSessionCity);
      if (matched) {
        return Promise.resolve(matched);
      }
    }

    if (this.ipCityPromise) {
      return this.ipCityPromise;
    }

    this.ipCityPromise = new Promise((resolve) => {
      this.http.get<any>('https://ipapi.co/json/').subscribe({
        next: (res) => {
          const rawCity = res?.city || res?.region;
          const matched = this.matchAllowedCity(rawCity || '');
          if (matched) {
            sessionStorage.setItem('ip_detected_city', matched);
            resolve(matched);
          } else {
            this.fallbackFreeIpApi(resolve);
          }
        },
        error: () => {
          this.fallbackFreeIpApi(resolve);
        }
      });
    });

    return this.ipCityPromise;
  }

  private fallbackFreeIpApi(resolve: (city: string) => void) {
    this.http.get<any>('https://freeipapi.com/api/json').subscribe({
      next: (res) => {
        const rawCity = res?.cityName || res?.regionName;
        const matched = this.matchAllowedCity(rawCity || '');
        if (matched) {
          sessionStorage.setItem('ip_detected_city', matched);
          resolve(matched);
        } else {
          this.fallbackIpWhoIs(resolve);
        }
      },
      error: () => {
        this.fallbackIpWhoIs(resolve);
      }
    });
  }

  private fallbackIpWhoIs(resolve: (city: string) => void) {
    this.http.get<any>('https://ipwho.is/').subscribe({
      next: (res) => {
        const rawCity = res?.city || res?.region;
        const matched = this.matchAllowedCity(rawCity || '');
        const finalCity = matched || 'Ahmedabad';
        sessionStorage.setItem('ip_detected_city', finalCity);
        resolve(finalCity);
      },
      error: () => {
        const finalCity = 'Ahmedabad';
        sessionStorage.setItem('ip_detected_city', finalCity);
        resolve(finalCity);
      }
    });
  }

  getCity(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: latitude, lng: longitude };

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            for (const component of results[0].address_components) {
              if (component.types.includes('locality')) {
                resolve(component.long_name);
                return;
              }
            }
            resolve('City not found');
          } else {
            resolve('No results found');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }
}

