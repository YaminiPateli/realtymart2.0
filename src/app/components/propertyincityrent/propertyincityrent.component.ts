import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OwnerpropertyService } from '../service/ownerproperty.service';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Fancybox } from '@fancyapps/ui';
import { ActivityTrackerService } from '../service/activitytracker.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GeolocationService } from '../service/geolocation.service';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

declare var bootstrap: any;

interface City {
  cid: number;
  cname: string;
}

@Component({
  selector: 'app-propertyincityrent',
  templateUrl: './propertyincityrent.component.html',
  styleUrls: ['./propertyincityrent.component.css']
})
export class PropertyincityrentComponent implements OnInit {
  tooltipVisible = false;
  tooltipPosition = { top: '0px', left: '0px' };
  @ViewChild('otpModel') otpModel!: ElementRef;
  @ViewChild('otpContactModel') otpContactModel!: ElementRef;
  private apiUrl: string = environment.apiUrl;
  cityss!: any;
  currentPage: number = 1;
  lastPage: number = 1;
  isLoading: boolean = false;
  scrollTimeout: any;
  formData: any = {
    username: '', // Initialize with an empty string
    useremail: '', // Initialize with an empty string
    countrycode: 'IN +91', // Initialize with an empty string
    contact_no: null, // Initialize with null or a default number
    property_for: '', // Initialize with an empty string,
    otp: '',
    termsAccepted: false,
  };
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
  ownerPropertyData: any;
  ownerlauchedproperty: any;
  ownerlauchedpropertycount: any;
  contactData: any;
  contact: any;
  paginatedData: any[] = []; // Data for the current page
  // currentPage: number = 1; // Current page number
  pageSize: number = 5; // Items per page
  totalItems: number = 0; // Total number of items
  itemsPerPage = 5;
  totalPages: any;
  visiblePageStart: number = 1;
  visiblePageCount: number = 5;
  // contact: any = {
  //   property_main_img: null,
  //   property_type: null,
  //   property_bhk: null,
  //   project_localities: null,
  //   minprice: null,
  //   maxprice: null,
  //   name: null,
  // };
  isSubmitting = false;
  url: any;
  dynamicUrl: any;
  singleProp: any;

  initialListCount = 10;
  propertyToLoad = 10;
  loading: boolean = false;
  checkDescriptionHeight: any;
  images: any;
  checkToken: any;
  is_token: boolean = false;

  city: string = '';
  city1: City[] = [];
  validcityforselected: any;
  cityget: any;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    public http: HttpClient,
    private ownerpropertyService: OwnerpropertyService,
    private elementRef: ElementRef,
    private tost: ToastrService,
    private spinner: NgxSpinnerService,
    private activityTrackerService: ActivityTrackerService,
    private router: Router,
    private route: ActivatedRoute,
    private geolocationService: GeolocationService,
    private seoService: SeoService
  ) {
    this.cityss = localStorage.getItem('location');

    setTimeout(() => {
      const savedScrollY = sessionStorage.getItem('scrollPosition');
      if (savedScrollY) {
        window.scrollTo({
          top: parseInt(savedScrollY, 10),
          behavior: 'instant',
        });
      }
    }, 0);

    // setTimeout(() => {
    //   window.scrollTo({ top: 0, behavior: 'instant' });
    // }, 0);
    // this.ownerpropertyService.getownerpropertybuy()?.subscribe((ownerPropertyData) => {
    //   this.ownerPropertyData = ownerPropertyData;
    //   this.ownerlauchedproperty = this.ownerPropertyData?.responseData?.isownerproperty;
    //   this.ownerlauchedpropertycount = this.ownerPropertyData?.responseData?.isownerpropertycount;
    //   // this.totalItems = this.ownerlauchedproperty.length;
    //   //     this.updatePaginatedData();
    // });
    this.loadProperties();
  }
  trackCustomActivity() {
    this.router.navigate(['property-details/:name/:id']);
  }

  parsePriceValue(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    const str = String(val).toLowerCase().replace(/,/g, '').trim();
    if (str.includes('cr')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num * 10000000;
    }
    if (str.includes('lac') || str.includes('lakh')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num * 100000;
    }
    if (str.includes('k')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? 0 : num * 1000;
    }
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  filterByBudgetAndType(items: any[]): any[] {
    const qp = this.route.snapshot.queryParams;
    if (!qp) return items;

    let result = items;
    const minValStr = qp['minPrice'] || qp['min_price'];
    const maxValStr = qp['maxPrice'] || qp['max_price'];
    const minVal = minValStr ? this.parsePriceValue(minValStr) : 0;
    const maxVal = maxValStr ? this.parsePriceValue(maxValStr) : 0;

    if (minVal > 0 || maxVal > 0) {
      result = result.filter(item => {
        const price = this.parsePriceValue(item.rent_amount || item.total_price || item.price || item.minprice);
        if (price <= 0) return true;
        if (minVal > 0 && price < minVal) return false;
        if (maxVal > 0 && price > maxVal) return false;
        return true;
      });
    }

    const locKeyword = (qp['locality'] || qp['search_keyword'] || '').toLowerCase().trim();
    if (locKeyword) {
      result = result.filter(item => {
        const itemLocality = (
          item.property_locality ||
          item.project_locality_name ||
          item.prjlocalities ||
          item.project_localities ||
          item.locality ||
          item.location ||
          item.area ||
          item.address ||
          item.project_location ||
          ''
        ).toLowerCase();
        return itemLocality.includes(locKeyword) || locKeyword.includes(itemLocality);
      });
    }

    return result;
  }

  loadProperties() {
    this.cityget = this.route.snapshot.paramMap.get('city') || 'Ahmedabad';

    const qp = this.route.snapshot.queryParams;
    let url = `${environment.apiUrl}propertyrentincity/${this.cityget}?page=${this.currentPage}`;

    if (qp) {
      const params = new URLSearchParams();
      if (qp['minPrice'] || qp['min_price']) {
        const minP = qp['minPrice'] || qp['min_price'];
        params.append('minPrice', minP);
        params.append('min_price', minP);
      }
      if (qp['maxPrice'] || qp['max_price']) {
        const maxP = qp['maxPrice'] || qp['max_price'];
        params.append('maxPrice', maxP);
        params.append('max_price', maxP);
      }
      if (qp['residentialItems']) {
        params.append('residentialItems', qp['residentialItems']);
      }
      if (qp['otherItems']) {
        params.append('otherItems', qp['otherItems']);
      }
      if (qp['commercialItems']) {
        params.append('commercialItems', qp['commercialItems']);
      }
      if (qp['property_type'] || qp['propertyType']) {
        const pt = qp['property_type'] || qp['propertyType'];
        params.append('property_type', pt);
        params.append('propertyType', pt);
      }
      if (qp['locality']) {
        params.append('locality', qp['locality']);
      }
      if (qp['search_keyword']) {
        params.append('search_keyword', qp['search_keyword']);
      }

      const paramString = params.toString();
      if (paramString) {
        url += `&${paramString}`;
      }
    }

    this.http
      .get<any>(url)
      .subscribe(
        (response) => {
          let rawData = response.data?.data || response.responseData?.data || response.data || [];
          let list = Array.isArray(rawData) ? rawData : [];
          this.ownerlauchedproperty = this.filterByBudgetAndType(list);

          this.setPropertyRentSchema();

          this.ownerlauchedpropertycount =
            response.data?.total || response.responseData?.total || this.ownerlauchedproperty.length;

          this.itemsPerPage = response.data?.per_page || response.responseData?.per_page || 10;

          this.totalPages = Math.ceil(
            this.ownerlauchedpropertycount /
            (this.itemsPerPage || 10)
          );

          if (response.meta) {
            this.setMetaTags(
              response.meta.title,
              response.meta.description,
            );
          }

          this.lastPage = response.data?.last_page || response.responseData?.last_page || 1;
        },
        (error) => {
          console.error('Error fetching properties:', error);
          this.isLoading = false;
          this.loading = false;
        }
      );
  }

  setPropertyRentSchema() {

    const properties = this.ownerlauchedproperty.map((item: any, index: number) => ({

      "@type": "ListItem",

      "position": index + 1,

      "item": {

        "@type": "Residence",

        "name": item.project_name,

        "url": `https://www.realtymart.com/property-details/${item.propertyfirstUrlPart}/${item.propertysecondUrlPart}`,

        "image": item.property_main_img,

        "description": `For Rent ${item.bedroom ? item.bedroom + ' BHK' : item.property_type} in ${item.project_name}`,

        "address": {
          "@type": "PostalAddress",
          "addressLocality": item.property_locality,
          "addressCountry": "IN"
        },

        "numberOfRooms": item.bedroom || undefined,

        "floorSize": item.super_area
          ? {
            "@type": "QuantitativeValue",
            "value": item.super_area,
            "unitCode": "FTK"
          }
          : undefined,

        "offers": {
          "@type": "Offer",
          "price": item.rent_amount || item.total_price,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "url": `https://www.realtymart.com/property-details/${item.propertyfirstUrlPart}/${item.propertysecondUrlPart}`
        }

      }

    }));


    const schema = {

      "@context": "https://schema.org",

      "@graph": [

        {

          "@type": "CollectionPage",

          "@id": window.location.href,

          "url": window.location.href,

          "name": `Property For Rent in ${this.cityget}`,

          "description": `Browse rental properties in ${this.cityget}. Find apartments, flats, villas, offices, shops and commercial properties available for rent on RealtyMart.`,

          "publisher": {
            "@type": "Organization",
            "name": "Intelliworkz Business Solutions Pvt. Ltd.",
            "brand": {
              "@type": "Brand",
              "name": "RealtyMart"
            }
          },

          "mainEntity": {

            "@type": "ItemList",

            "numberOfItems": this.ownerlauchedproperty.length,

            "itemListElement": properties

          }

        }

      ]

    };

    this.seoService.setSchema(schema);

  }

  onPageChange(page: number) {

    this.currentPage = page;

    this.loadProperties();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  openGallery(images: string[], event: Event) {
    event.preventDefault(); // Prevents default anchor behavior

    Fancybox.show(
      images.map((img) => ({
        src: img,
        type: 'image',
      })),
      {
        // loop: true, // Enable looping
        // toolbar: true // Show toolbar
      }
    );
  }

  // meta title
  setMetaTags(title: string, description: string) {
    this.titleService.setTitle(title);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({
      property: 'og:description',
      content: description,
    });
    // this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    // this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  // const fancyboxOptions = {
  //   Toolbar: false, // Fancybox v4 uses uppercase `Toolbar`
  //   infinite: true,  // Instead of `loop`, use `infinite`
  // };

  // Fancybox: any.bind("[data-fancybox='gallery']", fancyboxOptions);

  // @HostListener('window:scroll', ['$event'])
  // onScroll() {
  //   let offsetHeight: number;
  //   if (window.innerWidth > 1144) {
  //     // Desktop
  //     offsetHeight = 5000;
  //   } else if (window.innerWidth > 768) {
  //     // Tablet
  //     offsetHeight = 4000;
  //   } else {
  //     // Mobile
  //     offsetHeight = 2000;
  //   }
  //   const scrollPosition = window.innerHeight + window.scrollY;
  //   const totalHeight = document.body.offsetHeight;
  //   if (
  //     scrollPosition >= totalHeight - offsetHeight &&
  //     !this.loading &&
  //     this.initialListCount < this.ownerlauchedproperty.length
  //   ) {
  //     this.loading = true;
  //     // const lastLoadedElement = document.querySelector(
  //     //   `.maching-myproperties:nth-child(${this.initialListCount})`
  //     // );
  //     // if (lastLoadedElement) {
  //     //   this.scrollToElement(lastLoadedElement);
  //     // }
  //   setTimeout(() => {
  //     this.initialListCount += this.propertyToLoad;
  //     this.loading = false;
  //     const lastLoadedElement = document.querySelector(
  //       `.maching-myproperties:nth-child(${this.initialListCount})`
  //     );
  //     if (lastLoadedElement) {
  //       this.scrollToElement(lastLoadedElement);
  //     }
  //   }, 1000);
  //   }
  // }

  ngOnInit() {
    const city = this.route.snapshot.paramMap.get('city');

    this.route.queryParams.subscribe(() => {
      this.loadProperties();
    });

    this.seoService.setCanonicalURL(window.location.href);
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
  }
  scrollToElement(element: Element) {
    const elementRect = element.getBoundingClientRect(); // Element's position relative to the viewport
    const absoluteElementTop = elementRect.top + window.scrollY; // Element's absolute position in the document
    const offset = 100; // Add an optional offset (e.g., for sticky headers)

    window.scrollTo({
      top: absoluteElementTop - offset,
      behavior: 'smooth',
    });
  }

  checkLoggedIn() {
    this.checkToken = localStorage.getItem('myrealtylogintoken');
    if (this.checkToken) {
      this.is_token = true;
    } else {
      this.is_token = false;
    }
  }
  // scrollToUpdatedContent() {
  //   const element = document.querySelector('.maching-myproperties:nth-child');
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   }
  // }
  contactowner(propertyid: any) {
    this.http.get(`${this.apiUrl}contactowner/${propertyid}`).subscribe(
      (contactData: any) => {
        this.contactData = contactData;
        this.contact = this.contactData?.data;
      },
      (error: any) => { }
    );
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
      // project_Id:this.singleproject.id,
      // leads_for:this.singleproject.property_for,
      // receiver_user_id:this.singleproject.user_id,
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
            this.activityTrackerService.logActivity('Inquiry stored for property', '');
            this.tost.success('We have received your inquiry. Our team will get back to you within 24 working hours.');
            // const elementToClick = this.elementRef.nativeElement.querySelector('#contactownerbuttonclose');
            const modalElement = document.getElementById('contect-owner');
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
    console.log(this.formData.contact_no, 'this.formData.contact_no')
    if (this.formData.otp == '') {
      this.tost.error('Please Enter OTP');
      return;
    }
    let payload = {
      contact_no: this.formData.contact_no,
      otp: this.formData.otp,
    };

    this.http.post(`${this.apiUrl}verifyinquiryotp`, payload).subscribe(
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
          }, 1000); // Adjust the delay as needed
          // if (
          //   this.nameError||
          //   this.phoneError ||
          //   this.emailError
          // ) {
          //   return;
          // }
          // else{
          //   this.submitForm();
          // }

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

  startTimer() {
    this.isResendEnabled = false;
    this.remainingTime = 60;
    this.timer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        clearInterval(this.timer);
        this.isResendEnabled = true;
      }
    }, 700);
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
              this.tost.success('OTP sent successfully.');
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


    let contactModal = document.getElementById('contect-owner');
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

  fetchProperty(property: any) {
    console.log(property);
    this.singleProp = property;
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
      location: this.city
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
            this.activityTrackerService.logActivity('Inquiry stored for property', '');
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
    if (this.isResendEnabled) {
      this.sendOTPContactToMobile();
      this.startTimer();
    }
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
              this.tost.success('OTP sent successfully.');
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

          // Optional: Delay for user feedback before hiding
          setTimeout(() => {
            this.spinner.hide();
          }, 1000); // Adjust the delay as needed
          // if (
          //   this.nameContactError||
          //   this.phoneContactError ||
          //   this.emailContactError
          // ) {
          //   return;
          // }
          // else {
          //   this.submitFormPhone();
          // }

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
  getUrl(urlPart1: any, urlPart2: any) {
    this.url = window.location.origin;
    const staticpart = '/property-details/';
    this.dynamicUrl = this.url + staticpart + urlPart1 + '/' + urlPart2;
    // console.log(this.dynamicUrl);
  }

  fetchCities() {
    this.http.get<{ data: { id: number; name: string }[] }>(`${environment.apiUrl}cities`).subscribe(
      (response: any) => {
        this.city1 = response.responseData.map((city: any) => ({
          cid: city.id,
          cname: city.name
        }));
        this.validcityforselected = response.validCities;
        const defaultCity = this.city1.find(city => city.cname === this.city);
      },
      (error: any) => {
        console.error('API Error:', error);
      }
    );
  }

  isValidCity(city: string): boolean {
    return this.validcityforselected.includes(city);
  }

  whatsappShare() {
    const link = `https://wa.me/?text=${encodeURIComponent(this.dynamicUrl)}`;
    window.open(link, '_blank');
  }
  // fancybox for images

  ngAfterViewInit(): void {
    // Fancybox.bind('[data-fancybox="gallery"]', {
    //   // Custom options if needed
    // });
    const fancyboxOptions = {
      Toolbar: false, // Fancybox v4 uses uppercase `Toolbar`
      infinite: true, // Instead of `loop`, use `infinite`
    };

    Fancybox.bind("[data-fancybox='gallery']", fancyboxOptions);
  }

  // Share and copy link

  @Input() propertyLink: string = '';
  copyLink(event: MouseEvent) {
    navigator.clipboard.writeText(this.dynamicUrl).then(() => {
      this.showTooltip(event);
    }, (err) => {
      console.log('failed copy')
    });
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
    const body = encodeURIComponent(`Here is something interesting: ${this.dynamicUrl}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
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

  // Image slider

  slideConfig1 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    // dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
  };

  // slideConfig1 = {
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   infinite: true, // Instead of `loop`, use `infinite`
  //   arrows: true,
  //   // dots: true,
  //   loop: true, // Enable looping
  //     toolbar: true // Show toolbar
  // };
}
