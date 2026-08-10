import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Fancybox } from '@fancyapps/ui';
import { ActivityTrackerService } from '../service/activitytracker.service';
import { GeolocationService } from '../service/geolocation.service';
import { Meta } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { SeoService } from 'src/app/seo.service';
declare var bootstrap: any;

interface City {
  cid: number;
  cname: string;
}

@Component({
  selector: 'app-matching-properties',
  templateUrl: './matching-properties.component.html',
  styleUrls: ['./matching-properties.component.css'],
  providers: [DatePipe]
})
export class MatchingPropertiesComponent implements OnInit {
  tooltipVisible = false;
  tooltipPosition = { top: '0px', left: '0px' };
  @ViewChild('otpModel') otpModel!: ElementRef;
  @ViewChild('otpContactModel') otpContactModel!: ElementRef;
  private apiUrl: string = environment.apiUrl;
  homepagesearch: any;
  searchdata: any;
  original: any[] = [];
  filteredData: any[] = [];
  selectedSortOption: string = 'Relevance';
  isDropdownOpen: boolean = false;
  activeFilters: { [key: string]: boolean } = {
    'New Property': false,
    'Ready to Move': false,
    'Featured': false,
    'Farm House': false,
    'New Construction': false,
    'Furnished': false,
  };
  paginatedData: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  itemsPerPage = 5;
  formData: any = {
    username: '',
    useremail: '',
    countrycode: 'IN +91',
    contact_no: null,
    property_for: '',
    otp: '',
    termsAccepted: false,
  };
  contact: any;
  nameError: boolean = false;
  emailError: boolean = false;
  phoneError: boolean = false;
  otpError: boolean = false;
  isResendEnabled = false;
  termsError: boolean = false;
  isMobileNumberDisabled: boolean = false;
  openModel = 0;
  remainingTime: number = 60;
  private timer: any;
  isSubmitting = false;
  contactData: any;
  visiblePageStart: number = 1;
  visiblePageCount: number = 5;
  initialListCount = 5;
  propertyToLoad = 5;
  loading: boolean = false;

  sortOptions: string[] = [
    'Relevance',
    'Price - Low to High',
    'Price - High to Low',
    'Most Recent',
  ];

  url: any;
  dynamicUrl: any;
  formDataphone: any = {
    contactusername: '',
    contactuseremail: '',
    contactcontact_no: null,
    contactproperty_for: '',
    contactotp: '',
    termsContactAccepted: false,
  };
  nameContactError: boolean = false;
  emailContactError: boolean = false;
  phoneContactError: boolean = false;
  termsContactError: boolean = false;
  singleProp: any;
  checkToken: any;
  is_token: boolean = false;
  city: any;
  city1: City[] = [];
  validcityforselected: any;
  totalPages = 0;

  constructor(
    private router: Router,
    private tost: ToastrService,
    private http: HttpClient,
    private elementRef: ElementRef,
    private activityTrackerService: ActivityTrackerService,
    private geolocationService: GeolocationService,
    private spinner: NgxSpinnerService,
    private metaService: Meta,
    private datePipe: DatePipe,
    private seoService: SeoService
  ) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      const data = navigation.extras.state as any;
      let rawData = data.responseData || data.data || [];

      let keywords: string[] = data.searchKeywords || [];
      if ((!keywords || keywords.length === 0) && data.searchedLocality) {
        keywords = data.searchedLocality.split(/\s+/).filter((k: string) => k.trim().length > 0);
      }
      if (!keywords || keywords.length === 0) {
        try {
          const saved = localStorage.getItem('selectedExtraChips');
          if (saved) keywords = JSON.parse(saved);
        } catch (e) { }
      }

      if (keywords && keywords.length > 0 && Array.isArray(rawData)) {
        const lowerKeywords = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
        if (lowerKeywords.length > 0) {
          rawData = rawData.filter((item: any) => {
            const locName = (
              item.project_locality_name ||
              item.project_localities ||
              item.locality ||
              item.location ||
              item.area ||
              item.project_location ||
              item.project_address ||
              item.address ||
              item.name ||
              item.title ||
              ''
            ).toLowerCase();
            return lowerKeywords.some(kw => locName.includes(kw) || kw.includes(locName));
          });
        }
      }

      this.searchdata = rawData;
      this.original = [...this.searchdata];
      this.onPageChange(1);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    let offsetHeight: number;
    if (window.innerWidth > 1144) {
      // Desktop
      offsetHeight = 5000;
    } else if (window.innerWidth > 768) {
      // Tablet
      offsetHeight = 4000;
    } else {
      // Mobile
      offsetHeight = 2000;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const totalHeight = document.body.offsetHeight;
    if (
      scrollPosition >= totalHeight - offsetHeight &&
      !this.loading &&
      this.initialListCount < this.searchdata.length
    ) {
      this.loading = true;
      setTimeout(() => {
        this.initialListCount += this.propertyToLoad;
        this.loading = false;
      }, 700);
    }
  }

  ngOnInit() {
    this.metaService.updateTag({
      property: 'og:title',
      content: 'Real Estate Property Portal | Buy, Sell & Rent Properties | RealtyMart'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Search verified residential and commercial properties, apartments, villas, plots and offices across India.'
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: window.location.href
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });

    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'RealtyMart'
    });
    const token = localStorage.getItem('myrealtylogintoken');
    if (token) {
      this.is_token = true;
      this.formData.username = localStorage.getItem('name') || '';
      this.formData.useremail = localStorage.getItem('email') || '';
      this.formData.contact_no = localStorage.getItem('contact_no') || '';
      this.formData.termsAccepted = true;
      this.formDataphone.contactusername = localStorage.getItem('name') || '';
      this.formDataphone.contactuseremail = localStorage.getItem('email') || '';
      this.formDataphone.contactcontact_no =
        localStorage.getItem('contact_no') || '';
      this.formDataphone.termsContactAccepted = true;
    }
    this.city = localStorage.getItem('location') || '';
    this.totalPages = Math.ceil(
      this.searchdata.length /
      this.itemsPerPage
    );
    this.onPageChange(1);
    this.seoService.setCanonicalURL(window.location.href)
  }
  checkLoggedIn() {
    this.checkToken = localStorage.getItem('myrealtylogintoken');
    if (this.checkToken) {
      this.is_token = true;
    } else {
      this.is_token = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  changeSortOption(option: string): void {
    this.selectedSortOption = option;
    this.isDropdownOpen = false;
    this.applyFiltersAndSorting();
  }

  toggleFilter(filterName: string): void {
    if (this.activeFilters.hasOwnProperty(filterName)) {
      this.activeFilters[filterName] = !this.activeFilters[filterName];
      this.applyFiltersAndSorting();
    }
  }

  convertToLac(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;

    let str = String(val).toLowerCase().trim().replace(/,/g, '');
    const match = str.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 0;

    const num = parseFloat(match[1]);

    if (str.includes('cr') || str.includes('crore')) {
      return num * 100;
    }
    if (str.includes('lac') || str.includes('lakh') || str.includes('l')) {
      return num;
    }
    if (str.includes('k')) {
      return num / 100;
    }
    if (num > 1000) {
      return num / 100000;
    }
    return num;
  }

  private getItemPrice(item: any): number {
    const val =
      item.project_minimum_price ??
      item.minprice ??
      item.total_price ??
      item.rent_amount ??
      item.price ??
      item.expected_price ??
      0;
    return this.convertToLac(val);
  }

  applyFiltersAndSorting(): void {
    let data = [...(this.original || [])];

    if (this.activeFilters['New Property']) {
      data = data.filter(
        (item: any) =>
          item.transaction_type &&
          item.transaction_type.toLowerCase() === 'new property'
      );
    }

    if (this.activeFilters['Ready to Move']) {
      data = data.filter(
        (item: any) =>
          item.possession_status &&
          item.possession_status.toLowerCase() === 'ready to move'
      );
    }

    if (this.activeFilters['Featured']) {
      data = data.filter(
        (item: any) =>
          (item.property_status &&
            item.property_status.toLowerCase() === 'featured') ||
          item.is_featured == 1
      );
    }

    if (this.activeFilters['Farm House']) {
      data = data.filter(
        (item: any) =>
          item.property_type &&
          item.property_type.toLowerCase() === 'farm house'
      );
    }

    if (this.activeFilters['New Construction']) {
      data = data.filter(
        (item: any) =>
          item.age_of_construction &&
          item.age_of_construction.toLowerCase() === 'new construction'
      );
    }

    if (this.activeFilters['Furnished']) {
      data = data.filter(
        (item: any) =>
          item.furnishing_status &&
          item.furnishing_status.toLowerCase() === 'furnished'
      );
    }

    switch (this.selectedSortOption) {
      case 'Price - Low to High':
        data.sort((a: any, b: any) => this.getItemPrice(a) - this.getItemPrice(b));
        break;

      case 'Price - High to Low':
        data.sort((a: any, b: any) => this.getItemPrice(b) - this.getItemPrice(a));
        break;

      case 'Most Recent':
        data.sort((a: any, b: any) => this.sortByRecent(a, b));
        break;

      case 'Relevance':
      default:
        break;
    }

    this.searchdata = data;
    this.totalItems = this.searchdata.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    this.onPageChange(1);
  }

  private sortByRecent(a: any, b: any): number {
    const dateA = new Date(a.created_at || a.createddate || 0).getTime();
    const dateB = new Date(b.created_at || b.createddate || 0).getTime();
    return dateB - dateA;
  }

  filterByPrice(minPrice: number, maxPrice: number): void {
    this.filteredData = this.searchdata.filter((property: any) => {
      const propertyMinPrice = this.convertToLac(property.minprice);
      const propertyMaxPrice = this.convertToLac(property.maxprice);

      return (
        (minPrice === null || propertyMinPrice >= minPrice) &&
        (maxPrice === null || propertyMaxPrice <= maxPrice)
      );
    });
  }
  getUrl(urlPart1: any, urlPart2: any) {
    this.url = window.location.origin;
    const staticpart = '/property-details/';
    this.dynamicUrl = this.url + staticpart + urlPart1 + '/' + urlPart2;
  }

  whatsappShare() {
    const link = `https://wa.me/?text=${encodeURIComponent(this.dynamicUrl)}`;
    window.open(link, '_blank');
  }

  twitterShare() {
    const text = encodeURIComponent('Check this out!');
    const url = encodeURIComponent(this.dynamicUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank');
  }

  facebookShare() {
    const url = encodeURIComponent(this.dynamicUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank');
  }

  emailShare() {
    const subject = encodeURIComponent('Check this out');
    const body = encodeURIComponent(
      `Here is something interesting: ${this.dynamicUrl}`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  }

  contactowner(propertyid: any) {
    this.http.get(`${this.apiUrl}contactowner/${propertyid}`).subscribe(
      (contactData: any) => {
        this.contactData = contactData;
        this.contact = this.contactData?.data;
      },
      (error: any) => {
        // Handle the error as needed
      }
    );
  }
  fetchProperty(property: any) {
    this.singleProp = property;
  }

  submitForm() {
    //     this.nameError = false;
    //     this.phoneError = false;
    //     this.emailError = false;
    //     this.termsError = false;

    //  if(!this.formData.username) {
    //     this.nameError=true;
    //   }
    //   if(!this.formData.useremail)
    //   {
    //     this.emailError=true;
    //   }
    //   if(!this.formData.contact_no)
    //   {
    //     this.phoneError=true;
    //   }
    //   if (!this.formData.termsAccepted) {
    //     this.termsError = true;
    //   }
    //   if(this.nameError || this.phoneError || this.emailError || this.termsError)
    //   {
    //     return;
    //   }
    this.spinner.show();
    const payload = {
      contact_no: this.formData.contact_no,
      useremail: this.formData.useremail,
      username: this.formData.username,
      project_Id: this.contact?.property?.project_id,
      property_id: this.contact?.property?.property_id,
      builder_id: this.contact?.property?.builder_id,
      agent_id: this.contact?.property?.agent_id,
      receiver_user_id: this.contact?.property?.user_id,
      leads_type: 'contact-owner',
      leads_for: 'Property',
      location: this.city,
      // leads_for:this.singleproject.property_for,
      // countrycode:'',
      // request_price:0,
    };
    const token = localStorage.getItem('myrealtylogintoken');

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    this.http
      .post(`${this.apiUrl}storeinquiry`, payload, { headers })
      .subscribe(
        (response: any) => {
          if (response.status === true) {
            this.activityTrackerService.logActivity(
              'Inquiry stored for property',
              ''
            );
            this.tost.success('We have received your inquiry. Our team will get back to you within 24 working hours.!');
            const modalElement = document.getElementById('contact-owner');
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance?.hide();
            }
            this.resetForm();
          }
        },
        (error) => {
          console.error('Error sending data', error);
        }
      );
  }

  validateCharInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;

    // Prevent space as the first character
    if (charCode === 32 && inputElement.value.length === 0) {
      event.preventDefault();
    }

    // Allow only alphabets (A-Z, a-z) and spaces (except first character)
    if (
      (charCode < 65 || (charCode > 90 && charCode < 97) || charCode > 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateName(event: any) {
    const inputValue = event.target.value;
    const companyPattern = /^[a-zA-Z\s]+$/;
    this.nameError = !companyPattern.test(inputValue);
  }

  validateEmail(event: any) {
    const inputValue = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.emailError = !emailPattern.test(inputValue);
  }

  validatePhoneNumber(event: any) {
    const inputValue = event.target.value;

    const validFormatPattern = /^[0-9]{10}$/;
    const allIdenticalPattern = /^(?!([0-9])\1{9})[0-9]{10}$/;
    const sequentialPattern = /^(0123456789|9876543210|1234567890|0987654321)$/;
    const mirroredPattern = /^(.)(.)(.)(.)(.).?\5\4\3\2\1$/;

    if (
      !validFormatPattern.test(inputValue) || // Check if it's 10 digits
      !allIdenticalPattern.test(inputValue) || // Reject if all identical digits
      sequentialPattern.test(inputValue) || // Reject if sequential
      mirroredPattern.test(inputValue) // Reject if mirrored/palindromic
    ) {
      this.phoneError = true; // Display error
    } else {
      this.phoneError = false; // Valid number
      // this.sendOTPToMobile();
    }
  }

  resendOTP() {
    if (this.isResendEnabled) {
      this.sendOTPToMobile(); // Logic to send OTP
      this.startTimer(); // Restart the timer after resending OTP
    }
  }

  verifyOTP() {
    if (this.formData.otp == '') {
      this.tost.error('Please Enter OTP');
      return;
    }

    this.http.post(`${this.apiUrl}verifyinquiryotp`, this.formData).subscribe(
      (response: any) => {
        if (response.status == true) {
          // this.tost.success('OTP verified successfully.');
          const modalElement = this.otpModel.nativeElement;
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          } else {
            const newModal = new bootstrap.Modal(modalElement);
            newModal.hide();
          }
          this.submitForm();
          this.isResendEnabled = false;
          this.isMobileNumberDisabled = true;
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this.spinner.hide();
        } else {
          this.tost.error('Wrong OTP entered. Please try again.');
          this.isResendEnabled = true;
          this.isSubmitting = false;
        }
      },
      (error) => {
        console.error('Wrong OTP entered. Please try again.', error);
        this.isResendEnabled = true;
        this.isSubmitting = false;
      }
    );
  }

  startTimer() {
    this.isResendEnabled = false;
    this.remainingTime = 60;
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(this.timer);
        this.isResendEnabled = true;
      }
    }, 1000);
  }

  fetchCities() {
    this.http
      .get<{ data: { id: number; name: string }[] }>(
        `${environment.apiUrl}cities`
      )
      .subscribe(
        (response: any) => {
          this.city1 = response.responseData.map((city: any) => ({
            cid: city.id,
            cname: city.name,
          }));
          this.validcityforselected = response.validCities;
          const defaultCity = this.city1.find(
            (city) => city.cname === this.city
          );
        },
        (error: any) => {
          console.error('API Error:', error);
        }
      );
  }

  isValidCity(city: string): boolean {
    return this.validcityforselected.includes(city);
  }

  updateCity(city: string) {
    this.city = city;
    localStorage.setItem('location', city);
  }

  onTermsChange(event: Event) {
    this.termsError = !(event.target as HTMLInputElement).checked;
  }

  sendOTPToMobile() {
    this.spinner.show();
    this.http
      .post(`${this.apiUrl}genrateinquiryotp`, {
        contact_no: this.formData.contact_no,
      })
      .subscribe(
        (response: any) => {
          if (response.data == 'ok') {
            this.startTimer();
            if (response.status === true) {
              // this.sendOTPToMobile();
              const modalElement = this.otpModel.nativeElement;
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
              this.tost.success('OTP Sent Successfully.');
            }
            if (response.code === 101) {
              this.tost.warning(response.message);
            }
          } else {
            this.phoneError = true;
          }
          this.spinner.hide();
        },
        (error) => {
          this.tost.error('Failed to send OTP.');
          console.error('Error sending OTP', error);
          this.spinner.hide();
        }
      );
  }
  resetForm() {
    this.formData = {
      username: '',
      useremail: '',
      contact_no: '',
    };
    this.nameError = false;
    this.phoneError = false;
    this.emailError = false;
    this.termsError = false;
  }

  openOTPModal() {
    this.nameError = false;
    this.phoneError = false;
    this.emailError = false;
    this.termsError = false;

    if (!this.formData.username) {
      this.nameError = true;
    }
    if (!this.formData.useremail) {
      this.emailError = true;
    }
    if (!this.formData.contact_no) {
      this.phoneError = true;
    }
    if (!this.formData.termsAccepted) {
      this.termsError = true;
    }
    if (
      this.nameError ||
      this.phoneError ||
      this.emailError ||
      this.termsError
    ) {
      return;
    }
    this.sendOTPToMobile(); // Call this to send OTP to mobile

    let contactModal = document.getElementById('contact-owner');
    let otpModal = document.getElementById('otpModel');

    if (contactModal) {
      let bsModal = bootstrap.Modal.getInstance(contactModal);
      bsModal?.hide();
    }

    // Show the OTP modal
    if (otpModal) {
      let otpModalInstance = new bootstrap.Modal(otpModal);
      otpModalInstance.show();
    }
  }

  submitFormPhone() {
    // this.nameContactError = false;
    // this.phoneContactError = false;
    // this.emailContactError = false;
    // this.termsContactError = false;

    // if(!this.formDataphone.contactusername) {
    //   this.nameContactError=true;
    // }
    // if(!this.formDataphone.contactuseremail)
    // {
    //   this.emailContactError=true;
    // }
    // if(!this.formDataphone.contactcontact_no)
    // {
    //   this.phoneContactError=true;
    // }
    // if (!this.formDataphone.termsContactAccepted) {
    //   this.termsContactError = true;
    // }
    // if(this.nameContactError || this.phoneContactError || this.emailContactError || this.termsContactError)
    // {
    //   return;
    // }
    this.spinner.show();
    const payload = {
      contact_no: this.formDataphone.contactcontact_no,
      useremail: this.formDataphone.contactuseremail,
      username: this.formDataphone.contactusername,
      receiver_user_id: this.singleProp.user_id,
      project_Id: this.singleProp.project_id,
      propertyid: this.singleProp.id,
      builder_id: this.singleProp.builder_id,
      agent_id: this.singleProp.agent_id,
      leads_type: 'call for price',
      leads_for: 'Property',
      location: this.city,
    };
    const token = localStorage.getItem('myrealtylogintoken');

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    this.http
      .post(`${this.apiUrl}storeinquiry`, payload, { headers })
      .subscribe(
        (response: any) => {
          if (response.status === true) {
            this.activityTrackerService.logActivity(
              'Inquiry stored for property',
              ''
            );
            this.tost.success('We have received your inquiry. Our team will get back to you within 24 working hours.');
            const modalElement = document.getElementById('get-owner');
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance?.hide();
            }
            this.resetContactForm();
          }
        },
        (error) => {
          console.error('Error sending data', error);
        }
      );
  }

  resetContactForm() {
    this.formDataphone = {
      contactusername: '',
      contactuseremail: '',
      contactcontact_no: '',
    };
    this.nameContactError = false;
    this.phoneContactError = false;
    this.emailContactError = false;
    this.termsContactError = false;
  }

  onTermsContactChange(event: Event) {
    this.termsContactError = !(event.target as HTMLInputElement).checked;
  }

  validateContactCharInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode !== 32 && charCode < 65 && charCode > 57) ||
      (charCode > 90 && charCode < 97) ||
      charCode > 122
    ) {
      event.preventDefault();
    }
  }

  validateContactNumberInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow numeric characters (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateContactName(event: any) {
    const inputValue = event.target.value;
    const companyPattern = /^[a-zA-Z\s]+$/;
    this.nameContactError = !companyPattern.test(inputValue);
  }

  validateContactEmail(event: any) {
    const inputValue = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.emailContactError = !emailPattern.test(inputValue);
  }
  validateContactPhoneNumber(event: any) {
    const inputValue = event.target.value;

    const validFormatPattern = /^[0-9]{10}$/;
    const allIdenticalPattern = /^(?!([0-9])\1{9})[0-9]{10}$/;
    const sequentialPattern = /^(0123456789|9876543210|1234567890|0987654321)$/;
    const mirroredPattern = /^(.)(.)(.)(.)(.).?\5\4\3\2\1$/;

    if (
      !validFormatPattern.test(inputValue) || // Check if it's 10 digits
      !allIdenticalPattern.test(inputValue) || // Reject if all identical digits
      sequentialPattern.test(inputValue) || // Reject if sequential
      mirroredPattern.test(inputValue) // Reject if mirrored/palindromic
    ) {
      this.phoneContactError = true;
    } else {
      this.phoneContactError = false;
      // this.sendOTPToMobile();
    }
  }

  openContactOTPModal() {
    this.nameContactError = false;
    this.phoneContactError = false;
    this.emailContactError = false;
    this.termsContactError = false;

    if (!this.formDataphone.contactusername) {
      this.nameContactError = true;
    }
    if (!this.formDataphone.contactuseremail) {
      this.emailContactError = true;
    }
    if (!this.formDataphone.contactcontact_no) {
      this.phoneContactError = true;
    }
    if (!this.formDataphone.termsContactAccepted) {
      this.termsContactError = true;
    }
    if (
      this.nameContactError ||
      this.phoneContactError ||
      this.emailContactError ||
      this.termsContactError
    ) {
      return;
    }
    this.sendOTPContactToMobile();
    let contactModal = document.getElementById('get-owner');
    let otpModal = document.getElementById('otpContactModel');

    if (contactModal) {
      let bsModal = bootstrap.Modal.getInstance(contactModal);
      bsModal?.hide();
    }

    // Show the OTP modal
    if (otpModal) {
      let otpModalInstance = new bootstrap.Modal(otpModal);
      otpModalInstance.show();
    }
  }

  resendContactOTP() {
    clearInterval(this.timer);
    this.startTimer();
  }

  sendOTPContactToMobile() {
    this.spinner.show();
    this.http
      .post(`${this.apiUrl}genrateinquiryotp`, {
        contact_no: this.formDataphone.contactcontact_no,
      })
      .subscribe(
        (response: any) => {
          if (response.data == 'ok') {
            this.startTimer();
            if (response.status === true) {
              // this.sendOTPToMobile();
              const modalElement = this.otpContactModel.nativeElement;
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
              this.tost.success('OTP Sent Successfully.');
            }
            if (response.code === 101) {
              this.tost.warning(response.message);
            }
          } else {
            this.phoneContactError = true;
          }
          this.spinner.hide();
        },
        (error) => {
          this.tost.error('Failed to send OTP.');
          console.error('Error sending OTP', error);
          this.spinner.hide();
        }
      );
  }

  getFormattedDate(dateString: string) {
    return this.datePipe.transform(dateString, 'MMMM, yyyy');
  }

  onPageChange(page: number = 1) {
    this.currentPage = page;
    if (!this.searchdata || !Array.isArray(this.searchdata)) {
      this.paginatedData = [];
      return;
    }
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedData = this.searchdata.slice(start, end);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  verifyContactOTP() {
    if (this.formDataphone.contactotp == '') {
      this.tost.error('Please Enter OTP');
      return;
    }
    let payload = {
      contact_no: this.formDataphone.contactcontact_no,
      otp: this.formDataphone.contactotp,
    };
    this.http.post(`${this.apiUrl}verifyinquiryotp`, payload).subscribe(
      (response: any) => {
        if (response.status == true) {
          // this.tost.success('OTP verified successfully.');
          const modalElement = this.otpContactModel.nativeElement;
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          } else {
            const newModal = new bootstrap.Modal(modalElement);
            newModal.hide();
          }
          this.submitFormPhone();
          this.isResendEnabled = false;
          this.isMobileNumberDisabled = true;

          setTimeout(() => {
            this.spinner.hide();
          }, 1000); // Adjust the delay as needed
          this.spinner.hide();
        } else {
          this.tost.error('Wrong OTP entered. Please try again.');
          this.isResendEnabled = true;
          this.isSubmitting = false; // Reset submission flag if failed
        }
      },
      (error) => {
        console.error('Wrong OTP entered. Please try again.', error);
        this.isResendEnabled = true;
        this.isSubmitting = false; // Reset submission flag on error
      }
    );
  }

  ngAfterViewInit(): void {
    Fancybox.bind('[data-fancybox="gallery"]', {
      // Custom options if needed
    });
  }

  // Share and copy link

  @Input() propertyLink: string = '';
  copyLink(event: MouseEvent) {
    navigator.clipboard.writeText(this.dynamicUrl).then(
      () => {
        this.showTooltip(event);
      },
      (err) => {
        console.log('failed copy');
      }
    );
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

  slideConfig1 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    // dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
  };
}
