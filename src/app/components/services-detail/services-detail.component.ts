import { Component, HostListener, OnInit } from '@angular/core';
import { CompanyPropertyServiceService } from '../../components/service/company-property-service.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { NgFor, NgForOf, CommonModule } from "@angular/common";
import { Fancybox } from "@fancyapps/ui";
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeolocationService } from '../service/geolocation.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { CountryCodeInputComponent } from 'src/app/common/country-code-input/country-code-input.component';
import { SeoService } from 'src/app/seo.service';
declare var bootstrap: any;

declare const google: any;

@Component({
  selector: 'app-services-detail',
  templateUrl: './services-detail.component.html',
  styleUrls: ['./services-detail.component.css'],
  standalone: true,
  imports: [NgbRatingModule, CommonModule, SlickCarouselModule, FormsModule, NgxSpinnerModule, CountryCodeInputComponent],
})
export class ServicesDetailComponent implements OnInit {
  tooltipVisible = false;
  tooltipPosition = { top: '0px', left: '0px' };
  [x: string]: any;
  currentRate: any;
  singlecompany: any = {};
  urlSegments: any;
  fullPath: any;
  activeSection: string | undefined = 'about';
  isManualScroll: boolean = false;
  private stickyOffset: number = 0;
  lastScrollTop: number = 0;
  isScrollingUp: boolean = false;
  isHeaderHidden: boolean = false;
  // google reviews
  lat = '23.0225';
  lng = '72.5714';
  placeName: string = '';
  errorMessage: string | null = null;
  reviews: any[] | null = null;
  placeDetails: any = null;
  googleReviews: any;
  dayNames: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private apiUrl: string = environment.apiUrl;
  url: any;
  city: any;
  placesName: any;
  dynamicUrl: any;
  serviceName = this.route.snapshot.paramMap.get('name');
  serviceId = this.route.snapshot.paramMap.get('id');
  googleMapUrl:string = "";
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private singleCompanyService: CompanyPropertyServiceService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private geolocationService: GeolocationService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private seoService:SeoService
  ) { }

  enquiryForm = {
    username: '',
    useremail: '',
    contact_no: '',
    termsAccepted: false
  };
  nameError = false;
  emailError = false;
  phoneError = false;
  termsError = false;
  nameTouched = false;
  emailTouched = false;
  phoneTouched = false;
  enquirySubmitted = false;
  is_token = false;

  validateCharInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;
    if (charCode === 32 && inputElement.value.length === 0) { event.preventDefault(); }
    if ((charCode < 65 || (charCode > 90 && charCode < 97) || charCode > 122) && charCode !== 32) {
      event.preventDefault();
    }
  }

  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) { event.preventDefault(); }
  }

  validateName(event: any) {
    this.nameTouched = true;
    const val = event.target.value;
    this.nameError = !/^[a-zA-Z\s]+$/.test(val) || val.trim().length < 3;
  }

  validateEmail(event: any) {
    this.emailTouched = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.emailError = !emailPattern.test(event.target.value);
  }

  validatePhoneNumber(event: any) {
    this.phoneTouched = true;
    const val = event.target.value;
    const validFormat = /^[0-9]{10}$/;
    const allSame = /^(.)\1{9}$/.test(val);
    const sequential = /^(0123456789|9876543210|1234567890|0987654321)$/.test(val);
    this.phoneError = !validFormat.test(val) || allSame || sequential;
  }

  onTermsChange(event: Event) {
    this.termsError = !(event.target as HTMLInputElement).checked;
  }

  submitEnquiry(): void {
    this.nameTouched = true;
    this.emailTouched = true;
    this.phoneTouched = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.nameError = !this.enquiryForm.username?.trim() || this.enquiryForm.username.trim().length < 3;
    this.emailError = !this.enquiryForm.useremail || !emailPattern.test(this.enquiryForm.useremail);
    this.phoneError = !this.enquiryForm.contact_no || String(this.enquiryForm.contact_no).length < 10;
    this.termsError = !this.enquiryForm.termsAccepted;

    if (this.nameError || this.emailError || this.phoneError || this.termsError) {
      return;
    }

    this.storeEnquiry();
  }

  storeEnquiry(): void {
    this.spinner.show();
    const token = localStorage.getItem('myrealtylogintoken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    const payload = {
      contact_no: this.enquiryForm.contact_no,
      username: this.enquiryForm.username,
      useremail: this.enquiryForm.useremail,
      leads_type: 'company',
      company_id: this.singlecompany?.id,
      receiver_user_id: this.singlecompany?.user_id,
      leads_for: '',
      countrycode: '',
      request_price: 0,
    };

    this.http.post(`${this.apiUrl}storeinquiry`, payload, { headers }).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.status === true) {
          this.enquirySubmitted = true;
          this.resetEnquiryForm();
        } else {
          this.toastr.warning(response.message || 'Could not submit enquiry. Please try again.');
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong. Please try again.');
      }
    });
  }

  resetEnquiryForm(): void {
    this.enquiryForm = { username: '', useremail: '', contact_no: '', termsAccepted: false };
    this.nameError = false;
    this.emailError = false;
    this.phoneError = false;
    this.termsError = false;
    this.nameTouched = false;
    this.emailTouched = false;
    this.phoneTouched = false;
  }

  ngOnInit(): void {
     const name = this.route.snapshot.paramMap.get('name');
  const id = this.route.snapshot.paramMap.get('id');
  this.seoService.setCanonicalURL(
    `https://www.realtymart.com/company-detail/${name}/${id}`
  );
    this.is_token = !!localStorage.getItem('myrealtylogintoken');
    this.fetchCompanyServiceListing();
    // this.loadGoogleMapsScript();
    this.activatedRoute.url.subscribe((segments) => {
      this.urlSegments = segments.map((segment) => segment.path);
      this.fullPath = `${this.apiUrl}/${this.urlSegments.join('/')}`;
    });
  }

  getSanitizedHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // private loadGoogleMapsScript(): void {
  //   if (typeof google === 'undefined' || !google.maps) {
  //     const script = document.createElement('script');
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCSTCnateoFfNtpPRtURlnEroMPDL0Bxs8&libraries=places`;
  //     script.async = false;
  //     script.defer = true;
  //     document.head.appendChild(script);

  //     script.onload = () => {
  //     };

  //     script.onerror = () => {
  //       this.errorMessage = 'Error loading Google Maps API.';
  //     };
  //   }
  // }

  getUrl(urlPart1: any, urlPart2: any) {
    this.url = window.location.origin;
    const staticpart = '/company-detail/';
    this.dynamicUrl = this.url + staticpart + this.serviceName + '/' + this.serviceId;
  }

  whatsappShare() {
    const link = `https://wa.me/?text=${encodeURIComponent(this.dynamicUrl)}`;
    window.open(link, '_blank');
  }

  copyLink(event: MouseEvent) {
    navigator.clipboard.writeText(this.dynamicUrl).then(() => {
      this.showTooltip(event);
    }, (err) => {
      console.log('failed copy');
    });
  }

  showTooltip(event: MouseEvent): void {
    const button = event.target as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    this.tooltipPosition = {
      top: `${buttonRect.top - 50}px`,
      left: `${buttonRect.left + 60}px`,
    };

    this.tooltipVisible = true;

    setTimeout(() => {
      this.tooltipVisible = false;
    }, 1500);
  }

  // fetchCompanyServiceListing() {
  //   const serviceName = this.route.snapshot.paramMap.get('name');
  //   const serviceId = this.route.snapshot.paramMap.get('id');

  //   if (serviceName && serviceId) {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           const { latitude, longitude } = position.coords;
  //           const lat = latitude;
  //           const lng = longitude;
  //           const city = localStorage.getItem('location');

  //           this.singleCompanyService.getCompanyServiceListing(serviceName, serviceId, lat, lng, city).subscribe(
  //             (response: any) => {
  //               this.singlecompany = response.data;
  //               this.setMetaTags(this.singlecompany.meta_title, this.singlecompany.meta_description, this.singlecompany.company_logo);
  //               // this.queryPlaceByName(this.singlecompany.company_name);
  //               console.log('response',response.data);
  //             },
  //             (error: any) => {
  //               console.error('Error fetching company service listing:', error);
  //             }
  //           );
  //         },
  //         (error) => {
  //           console.error('Geolocation error:', error);
  //           // fallback without location
  //         }
  //       );
  //     } else {
  //       // fallback if geolocation is not supported
  //     }
  //   }
  // }
  fetchCompanyServiceListing() {
    const serviceName = this.route.snapshot.paramMap.get('name');
    const serviceId = this.route.snapshot.paramMap.get('id');

    if (!serviceName || !serviceId) return;

    const city = localStorage.getItem('location');

    // Safari + iPhone Fix → Add geolocation options
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,       // 10 seconds
      maximumAge: 0
    };


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const lat = latitude;
          const lng = longitude;

          this.singleCompanyService
            .getCompanyServiceListing(serviceName, serviceId, lat, lng, city)
            .subscribe(
              (response: any) => {
                this.singlecompany = response.data;
                const encodedAddress = encodeURIComponent(this.singlecompany?.company_map);
                this.googleMapUrl =  `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                this.setCompanySchema();
                this.setMetaTags(
                  this.singlecompany.meta_title,
                  this.singlecompany.meta_description,
                  this.singlecompany.company_logo
                );
                console.log('response', response.data);
              },
              (error: any) => {
                console.error('Error fetching company service listing:', error);
              }
            );
        },

        // ------------- ERROR HANDLER FIXED FOR SAFARI --------------
        (error: GeolocationPositionError) => {
          console.error('Geolocation error:', error);

          // Custom readable error logs
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.warn("User denied location request.");
              break;

            case error.POSITION_UNAVAILABLE:
              console.warn("Location unavailable. Safari often causes this.");
              break;

            case error.TIMEOUT:
              console.warn("Location timed out.");
              break;
          }

          // fallback without location
          this.singleCompanyService
            .getCompanyServiceListing(serviceName, serviceId, this.lat, this.lng, city)
            .subscribe(
              (response: any) => {
                this.singlecompany = response.data;
                this.setMetaTags(
                  this.singlecompany.meta_title,
                  this.singlecompany.meta_description,
                  this.singlecompany.company_logo
                );
                console.log('response (fallback)', response.data);
              }
            );
        },
        geoOptions
      );
    } else {
      // If geolocation not supported
      this.singleCompanyService
        .getCompanyServiceListing(serviceName, serviceId, this.lat, this.lng, city)
        .subscribe(
          (response: any) => {
            this.singlecompany = response.data;
            this.setMetaTags(
              this.singlecompany.meta_title,
              this.singlecompany.meta_description,
              this.singlecompany.company_logo
            );
          }
        );
    }
  }


  // Set the title and meta description
  setMetaTags(title: string, description: string, image: string): void {
    this.titleService.setTitle(title || '');
    this.metaService.updateTag({ name: 'description', content: description || 'Default description' });

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:title', content: image });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }

  selectedImages: FileWithPreview[] = [];
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as FileWithPreview;
      this.selectedImages.push(file);
      this.previewImage(file);
    }
  }

  previewImage(file: FileWithPreview): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      file.preview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }
  ngAfterViewInit() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      this.stickyOffset = navbar.offsetTop;
    }
    Fancybox.bind('[data-fancybox="gallery"]', {
      // Custom options if needed
    });
  }

  slideConfig1 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
  };

  // gallery slider
  slideConfig2 = {
    slidesToShow: 3,
    slidesToScroll: 3,
    dots: false,
    arrows: true,
    infinite: true,
    autoplay: true,
    prevArrow:
      "<img class='a-left control-c prev slick-prev' src='../assets/images/prev.svg'>",
    nextArrow:
      "<img class='a-right control-c next slick-next' src='../assets/images/next.svg'>",
    responsive: [
      {
        breakpoint: 1199,  // Max width 1024px
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 520,  // Max width 1024px
        settings: {
          slidesToShow: 2,
        }
      },
    ],
  };

  slideConfig3 = {
    slidesToShow: 2,
    slidesToScroll: 2,
    dots: false,
    arrows: true,
    infinite: true,
    autoplay: true,
    prevArrow:
      "<img class='a-left control-c prev slick-prev' src='../assets/images/prev.svg'>",
    nextArrow:
      "<img class='a-right control-c next slick-next' src='../assets/images/next.svg'>",
    responsive: [
      {
        breakpoint: 768,  // Max width 1024px
        settings: {
          slidesToShow: 1,
        }
      },
    ],
  };

  slideConfig4 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
  };

  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    const navbar = document.getElementById('navbar');

    if (section && navbar) {
      this.isManualScroll = true;
      this.activeSection = sectionId;
      const navbarHeight = navbar.offsetHeight;
      const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
      const scrollMargin = 130;
      const scrollToPosition = sectionPosition - navbarHeight - scrollMargin;
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
      setTimeout(() => {
        this.isManualScroll = false;
      }, 1000);
    }
  }

  observeSections() {
    const sections = document.querySelectorAll('#about, #gallery, #services, #products, #catalogues, #testimonials, #reviews');
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isManualScroll) {
          this.activeSection = entry.target.id;
        }
      });
    }, observerOptions);
    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  detectActiveSectionOnScroll(): void {
    if (this.isManualScroll) return;

    const sections = [
      { id: 'about', element: document.getElementById('about') },
      { id: 'gallery', element: document.getElementById('gallery') },
      { id: 'services', element: document.getElementById('services') },
      { id: 'products', element: document.getElementById('products') },
      { id: 'catalogues', element: document.getElementById('catalogues') },
      { id: 'testimonials', element: document.getElementById('testimonials') },
      { id: 'reviews', element: document.getElementById('reviews') },
    ];

    const hEl = document.querySelector('header');
    const stickyTop = hEl ? hEl.offsetHeight : (window.innerWidth <= 991 ? 115 : 75);
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 60;
    const triggerOffset = stickyTop + navbarHeight + 150;

    let activeSection = 'about';
    for (const section of sections) {
      if (section.element) {
        if (section.element.getBoundingClientRect().top <= triggerOffset) {
          activeSection = section.id;
        }
      }
    }
    this.activeSection = activeSection;
  }

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (currentScroll < this.lastScrollTop) {
      this.isScrollingUp = true;
    } else {
      this.isScrollingUp = false;
    }
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

    const header = document.querySelector('header');
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (!navbar.classList.contains('sticky') && navbar.offsetTop > 0) {
      this.stickyOffset = navbar.offsetTop;
    }

    if (currentScroll > this.stickyOffset) {
      navbar.classList.add('sticky');
    } else {
      navbar.classList.remove('sticky');
    }



    this.detectActiveSectionOnScroll();
  }

  shareonWhatsapp() {
    // const whatsappMessage = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out my amazing concept: My Amazing Website! '+this.fullPath)}`;
    // window.open(whatsappMessage, '_blank');
    const message = `Thank you for your inquiry. Our team will get back to you shortly.`;

    const whatsappMessage =
      `https://api.whatsapp.com/send?phone=7378373783&text=${encodeURIComponent(message)}`;

    window.open(whatsappMessage, '_blank');
  }


  // google reviews
  //  queryPlaceByName(placeName: string): void {
  //   const service = new google.maps.places.PlacesService(document.createElement('div'));

  //   const request = {
  //     query: placeName,
  //     fields: ['place_id', 'name'],
  //   };

  //   service.textSearch(request, (results: any, status: any) => {
  //     if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
  //       const placeId = results[0].place_id;
  //       this.fetchPlaceDetails(placeId);
  //     } else {
  //       this.errorMessage = 'Error: Place not found.';
  //     }
  //   });
  // }

  getToday(): string {
    const today = new Date().getDay(); // Sunday = 0, Saturday = 6
    return today === 0 ? '7' : today.toString(); // Convert Sunday (0) to '7'
  }

  // Check if the day matches today
  isToday(day: string): boolean {
    return day === this.getToday();
  }

  // Convert day number to day name
  getDayName(day: string): string {
    return this.dayNames[parseInt(day, 10) - 1] || 'UNKNOWN';
  }

  // Reorder business hours to start with today
  reorderBusinessHours() {
    const today = this.getToday();
    const todayIndex = parseInt(today, 10) - 1;

    const sortedHours = [
      ...this.singlecompany?.bussiness_hours?.slice(todayIndex),
      ...this.singlecompany?.bussiness_hours?.slice(0, todayIndex),
    ];

    return sortedHours;
  }

  fetchPlaceDetails(placeId: string): void {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      placeId: placeId,
      fields: ['name', 'rating', 'reviews'],
    };

    service.getDetails(request, (place: any, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.googleReviews = place;
        this.errorMessage = null;
        this.reviews = place.reviews || [];
        this.placeDetails = {
          name: place.name,
          rating: place.rating,
          profile_photo_url: place.profile_photo_url,
        };
      } else {
        this.errorMessage = `Error retrieving place details: ${status}`;
      }
    });
  }


  setCompanySchema() {

    const businessHours = (this.singlecompany.bussiness_hours || [])
      .filter((day: any) => day.closed === 'on')
      .map((day: any) => ({

        "@type": "OpeningHoursSpecification",

        "dayOfWeek": [
          "",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ][Number(day.day)],

        "opens": this.convertTime(day.open_hour),

        "closes": this.convertTime(day.close_hour)

      }));


    const schema: any = {

      "@context": "https://schema.org",

      "@type": "ProfessionalService",

      "name": this.singlecompany.company_name,

      "url": window.location.href,

      "logo": this.singlecompany.company_logo,

      "image": [
        this.singlecompany.company_logo,
        ...(this.singlecompany.PrtSrcGallerys || [])
      ],

      "description": this.singlecompany.description
        ? this.singlecompany.description.replace(/<[^>]*>/g, "")
        : "",

      "serviceType": this.singlecompany.ps_id,
      "telephone": "-",

      "priceRange": "-",

      "address": {

        "@type": "PostalAddress",

        "streetAddress": this.singlecompany.company_address,

        "addressLocality": "Ahmedabad",

        "addressRegion": "Gujarat",

        "postalCode": "380015",

        "addressCountry": "IN"

      },

      "openingHoursSpecification": businessHours,

      "sameAs": this.singlecompany.company_website
        ? [this.singlecompany.company_website]
        : []

    };

    // Add email only if it isn't masked
    if (
      this.singlecompany.company_email &&
      !this.singlecompany.company_email.includes('*')
    ) {
      schema.email = this.singlecompany.company_email;
    }

    this.seoService.setSchema(schema);

  }
  convertTime(time: string): string {

    const [value, modifier] = time.split(' ');

    let [hours, minutes] = value.split(':');

    let h = parseInt(hours, 10);

    if (modifier === 'PM' && h < 12) {
      h += 12;
    }

    if (modifier === 'AM' && h === 12) {
      h = 0;
    }

    return `${h.toString().padStart(2, '0')}:${minutes}`;
  }
}

interface FileWithPreview extends File {
  preview: string;
}
