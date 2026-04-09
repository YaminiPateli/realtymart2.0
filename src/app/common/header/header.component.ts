import { Component, OnInit , AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PropertyservicesService } from '../../components/service/propertyservices.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs'; // Import Observablez`
import { Location } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { GeolocationService } from '../../components/service/geolocation.service';
import { NgFor } from '@angular/common';
import { HeaderService } from 'src/app/components/service/header.service';
interface ApiResponse {
  data: any;
}


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements AfterViewInit{
  // ...existing code...
  getDisplayUserName(): string {
    if (!this.userName) return 'Account';
    return this.userName.length > 10 ? this.userName.slice(0, 10) + '...' : this.userName;
  }
  private apiUrl: string = environment.apiUrl;
  [x: string]: any;
  propertyget: any;
  data: any;
  result: any;
  showPassword = false;
  email: string = '';
  isOtpGenerated: boolean = false;
  enteredOtp: string = '';
  isOtpValid: boolean = false;
  generatedOtp: string = '';
  loading: boolean = false;
  locationCookie:any;
  latitude:any;
  cookie_location: any;
  longitude:any;
  checkToken:any;
  city: any;
  locationFooter: any;
  validCities: string[] = ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Mumbai', 'Navi Mumbai', 'Pune', 'Bangalore', 'NCR', 'Delhi', 'Gurgaon', 'Hyderabad'];
  userName: string | null = null;

  constructor(
    public http: HttpClient,
    private PropertyservicesService: PropertyservicesService,
    private spinner: NgxSpinnerService,
    private route: Router,
    private location: Location,
    private elementRef: ElementRef,
    private toastr: ToastrService,
    private geolocationService: GeolocationService,
    private headerService: HeaderService,
    private renderer: Renderer2
  ) {
    if(this.checkToken == null || this.checkToken == undefined){
      this.checkToken = localStorage.getItem('myrealtylogintoken');
    }
    if (this.checkToken) {
      this.userName = localStorage.getItem('name');
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);

    this.PropertyservicesService.propertyget()?.subscribe((data) => {
      this.propertyget = data;
      this.result = this.propertyget['responseData'];
    });
    this.spinner.show();
  }

  ngOnInit(): void {
    this.headerService.refresh$.subscribe((refresh) => {
      if (refresh) {
        this.getLocation();
        this.getLocations();
        if(this.checkToken == null || this.checkToken == undefined){
          this.checkToken = localStorage.getItem('myrealtylogintoken');
        }
        if (this.checkToken) {
          this.userName = localStorage.getItem('name');
        } else {
          this.userName = null;
        }
        this.headerService.resetRefresh();
      }
    });
    this.getLocation();
    this.getLocations();
    if(this.checkToken == null || this.checkToken == undefined){
      this.checkToken = localStorage.getItem('myrealtylogintoken');
    }
    if (this.checkToken) {
      this.userName = localStorage.getItem('name');
    } else {
      this.userName = null;
    }
  }

  getLocation() {
    const locationCookie = localStorage.getItem('location');
    this.city = locationCookie;

    if (!locationCookie) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.geolocationService.getCity(latitude, longitude).then((city: string) => {
              this.locationFooter = latitude + ', ' + longitude;
              if (this.isValidCity(city)) {
                this.updateCity(city);
              } else {
                this.updateCity('Ahmedabad');
              }
            }).catch((error: any) => {
              console.error('Error getting city from coordinates:', error);
              this.updateCity('Ahmedabad');
            });
          },
          (error) => {
            console.error('Error getting location', error);
            this.updateCity('Ahmedabad');
          }
        );
      } else {
        console.error('Geolocation not supported by this browser.');
        this.updateCity('Ahmedabad');
      }
    } else {
      // If 'location' cookie already exists, delete and set again with current city
      localStorage.removeItem('location');
      localStorage.setItem('location', this.city);
      this.locationCookie = this.city;
    }
  }

  isValidCity(city: string): boolean {
    return this.validCities.includes(city);
  }

  updateCity(city: string) {
    this.city = city;
    const locationCookie = localStorage.getItem('location');
    if (this.city == locationCookie) {
      localStorage.removeItem('location');
    localStorage.setItem('location', city);
    }
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.spinner.hide();
      this.loading = true;
      this.initDropdownBehavior();
    }, 3000);
  }

  private initDropdownBehavior() {
    const minWidth = 1200;
    const isDesktop = () => window.innerWidth >= minWidth;
    const self = this;

    // Block Bootstrap BEFORE it opens the dropdown
    this.renderer.listen('document', 'show.bs.dropdown', function (e: any) {
      if (isDesktop()) {
        e.preventDefault();
      }
    });

    // Hover handlers
    function showDropdown(this: HTMLElement) {
      if (!isDesktop()) return;
      this.classList.add('show');
      const menu = this.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.add('show');
        menu.setAttribute('data-bs-popper', 'none');
      }
    }

    function hideDropdown(this: HTMLElement) {
      if (!isDesktop()) return;
      this.classList.remove('show');
      const menu = this.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.remove('show');
        menu.removeAttribute('data-bs-popper');
      }
    }

    function handleDropdownBehavior() {
      const toggles = document.querySelectorAll('.navbar .dropdown-toggle');
      toggles.forEach(function (toggle, i) {
        const toggleEl = toggle as HTMLElement;
        const parent = toggleEl.closest('.dropdown');
        if (!parent) return;
        if (isDesktop()) {
          // Step 1: Destroy Bootstrap Dropdown instance to remove its listeners
          if ((window as any).bootstrap && (window as any).bootstrap.Dropdown) {
            const bsInstance = (window as any).bootstrap.Dropdown.getInstance(toggleEl);
            if (bsInstance) bsInstance.dispose();
          }
          // Step 2: Strip Bootstrap's data attributes
          toggleEl.removeAttribute('data-bs-toggle');
          toggleEl.removeAttribute('data-bs-auto-close');
          // Step 3: Hard block click with capture listener (only once)
          if (!(parent as any)._clickGuardAttached) {
            (parent as any)._clickGuardAttached = true;
            toggleEl.addEventListener('click', function (e) {
              if (isDesktop()) {
                e.preventDefault();
                e.stopImmediatePropagation();
              }
            }, true);
          }
          // Step 4: Attach hover listeners (only once)
          if (!(parent as any)._hoverAttached) {
            (parent as any)._hoverAttached = true;
            parent.addEventListener('mouseenter', showDropdown);
            parent.addEventListener('mouseleave', hideDropdown);
          }
        } else {
          // Mobile mode
          if ((window as any).bootstrap && (window as any).bootstrap.Dropdown) {
            const existingInstance = (window as any).bootstrap.Dropdown.getInstance(toggleEl);
            if (!existingInstance) {
              toggleEl.setAttribute('data-bs-toggle', 'dropdown');
              new (window as any).bootstrap.Dropdown(toggleEl);
            }
          }
          toggleEl.setAttribute('data-bs-toggle', 'dropdown');
          // Remove hover listeners
          if ((parent as any)._hoverAttached) {
            (parent as any)._hoverAttached = false;
            parent.removeEventListener('mouseenter', showDropdown);
            parent.removeEventListener('mouseleave', hideDropdown);
          }
        }
      });
      // Force-close any open dropdowns when switching to desktop
      if (isDesktop()) {
        document.querySelectorAll('.navbar .dropdown.show').forEach(function (d) {
          const dropdown = d as HTMLElement;
          dropdown.classList.remove('show');
          const menu = dropdown.querySelector('.dropdown-menu');
          if (menu) (menu as HTMLElement).classList.remove('show');
        });
      }
    }

    // Listen for resize
    window.addEventListener('resize', handleDropdownBehavior);
    // Run on init
    handleDropdownBehavior();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  logout() {
    const token = localStorage.getItem('myrealtylogintoken');

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    const url = `${this.apiUrl}logout`;
    const data = { location: this.locationFooter };

    this.http.post<ApiResponse>(url, data, {headers}).subscribe(
      (response: any) => {
        if (response && response.status === true) {
        localStorage.removeItem('myrealtylogintoken');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('contact_no');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('sessionId');
        this.userName = null;
        this.checkToken = null;
        const currentUrl = this.location.path();
        this.headerService.triggerRefresh();
        if(currentUrl == ''){
          window.location.reload();
        }else{
          this.route.navigate(['/']);
        }
      }
    });
  }

  getLocations(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationFooter = this.latitude + ', ' + this.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }

  onChange(e: any): void {
    this['type'] = e.target.value;
  }

  getregistereddata(information: any): void {
    this.http.post(`${this.apiUrl}register`, information)
      .subscribe(
        (response: any) => {
          if (response.status === true) {
            const elementToClick = this.elementRef.nativeElement.querySelector('#btncloseregister');
            if (elementToClick) {
              elementToClick.click();
            }
            setTimeout(() => {
              this.toastr.success('Registered Successfully.');
            }, 10);
          }
          const currentUrl = this.location.path();
          if (currentUrl == '/login') {
            window.location.reload();
          } else {
            this.route.navigate(['/login']);
          }
        },
        (error: any) => {
          console.error('Error sending data', error);
        }
      );
      }
    }

function handleScroll() {
  const header = document.querySelector('header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 150);
  }
}

window.addEventListener('scroll', handleScroll);
function ngOnInit() {
  throw new Error('Function not implemented.');
}
