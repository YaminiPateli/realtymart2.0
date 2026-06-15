import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
import { ProjectApproveDetailsService } from '../service/projectapprovedetail.service';
import { ProjectdetailsService } from '../service/projectdetails.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
// import { DatePipe } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Fancybox } from "@fancyapps/ui";
import { Title, Meta, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { IssponsoredService } from '../service/issponsored.service';
import { IsverifiedService } from '../service/isverified.service';
import { ActivityTrackerService } from '../service/activitytracker.service';
import { FilteredCities } from 'src/app/filteredcities';
declare var bootstrap: any;
@Component({
  selector: 'app-project-approve-detail',
  templateUrl: './project-approve-detail.component.html',
  styleUrls: ['./project-approve-detail.component.css']
})
export class ProjectApproveDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('otpModel') otpModel!: ElementRef;
  @ViewChild('otpContactModel') otpContactModel!: ElementRef;
  private apiUrl: string = environment.apiUrl;
  @ViewChild('descriptionElem') descriptionElem!: ElementRef;
  @ViewChild('slider') slider!: ElementRef;
  @ViewChild('floorSlickModal') floorSlickModal!: any;


  @Input() item: any;
  @Input() latitude!: any;
  @Input() longitude!: any;
  private _album: any[] = [];
  singleproject: any;
  singleprojectData: any;
  sponsorData: any;
  sponsor: any;
  verifyData: any;
  verify: any;
  isAtEnd = false;
  currentSection: any;
  private _activeSection: string = 'overview';
  selectedAction!: "view-contact" | "whatsapp" | "schedule-visit" | "brochure";
  get activeSection(): any {
    return this._activeSection;
  }
  set activeSection(val: any) {
    if (this._activeSection !== val) {
      this._activeSection = val;
      this.scrollActiveNavLinkIntoView();
    }
  }

  scrollActiveNavLinkIntoView(): void {
    setTimeout(() => {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;
      const activeLink = navbar.querySelector('a.active') as HTMLElement;
      const activeLi = activeLink ? activeLink.parentElement : null;
      const scrollContainer = navbar.querySelector('.flore_links') as HTMLElement;

      if (activeLi && scrollContainer) {
        const containerWidth = scrollContainer.offsetWidth;
        const activeOffsetLeft = activeLi.offsetLeft;
        const activeWidth = activeLi.offsetWidth;
        const scrollToX = activeOffsetLeft - (containerWidth / 2) + (activeWidth / 2);

        scrollContainer.scrollTo({
          left: scrollToX,
          behavior: 'smooth'
        });
      }
    }, 50);
  }
  nameError: boolean = false;
  emailError: boolean = false;
  phoneError: boolean = false;
  nameTouched: boolean = false;
  emailTouched: boolean = false;
  phoneTouched: boolean = false;
  nameContactError: boolean = false;
  emailContactError: boolean = false;
  phoneContactError: boolean = false;
  nameContactTouched: boolean = false;
  emailContactTouched: boolean = false;
  phoneContactTouched: boolean = false;
  termsError: boolean = false;
  termsContactError: boolean = false;
  showReelsView: boolean = false;
  currentSanitizedVideoUrl: SafeResourceUrl | null = null;
  currentVideoSafeUrl: SafeResourceUrl | null = null;
  private sanitizedVideoUrlCache = new Map<string, SafeResourceUrl>();
  lastReelSwitchTime: number = 0;
  activeReelIndex: number = 0;
  isReelsMuted: boolean = false;
  reelsLikedStates: boolean[] = [false, false, false, false, false, false];
  reelsLikesCount: number[] = [124, 87, 245, 56, 189, 93];
  showReelComments: boolean = false;
  showReelDetailCard: boolean = false;
  isSendingOtp: boolean = false;
  isContactSendingOtp: boolean = false;
  isBrochureSendingOtp: boolean = false;
  isMobileNumberDisabled: boolean = false;
  isSubmitting = false;
  enquirySubmitted = false;
  contactEnquirySubmitted = false;
  checkToken: any;
  is_token: boolean = false;
  formData: any = {
    username: '', // Initialize with an empty string
    useremail: '', // Initialize with an empty string
    contact_no: null, // Initialize with null or a default number
    property_for: '', // Initialize with an empty string,
    otp: '',
    termsAccepted: true
  };
  formDataphone: any = {
    contactusername: '',
    contactuseremail: '',
    contactcontact_no: null,
    contactproperty_for: '', // Initialize with an empty string,
    contactotp: '',
    termsContactAccepted: true
  };
  otpError: boolean = false;
  isResendEnabled = false;
  reels: any[] = [];
  openModel = 0;
  remainingTime: number = 60;
  scheduleVisitData: any = {
    visitDateTime: '',
    remarks: ''
  };
  scheduleVisitDateTimeError: boolean = false;
  // Floor plans – populated from API `floor_plans` array
  floorPlanList: { bhk_type: string; carpet_area: string; image: string[] }[] = [];
  selectedFloorPlanIndex: number = 0;

  get selectedFloorPlan() {
    return this.floorPlanList[this.selectedFloorPlanIndex] || null;
  }

  floorPlanSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    infinite: false,
    prevArrow: "<img class='a-left control-c prev slick-prev' src='assets/images/prev.svg'>",
    nextArrow: "<img class='a-right control-c next slick-next' src='assets/images/next.svg'>"
  };

  bannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: "<img class='a-left control-c prev slick-prev' src='assets/images/prev.svg'>",
    nextArrow: "<img class='a-right control-c next slick-next' src='assets/images/next.svg'>"
  };

  reelsSlideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    infinite: false,
    prevArrow: "<img class='a-left control-c prev slick-prev' src='assets/images/prev.svg'>",
    nextArrow: "<img class='a-right control-c next slick-next' src='assets/images/next.svg'>",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  markerPosition: google.maps.LatLngLiteral = {
    lat: 22.2865,
    lng: 73.1812
  };

  amenities = [
    {
      name: 'Parking',
      icon: '../../assets/images/parking_icon.png'
    },
    {
      name: 'Lift',
      icon: '../../assets/images/lift.png'
    },
    {
      name: 'Power Backup',
      icon: '../../assets/images/power_backup.png'
    },
    {
      name: 'Gas Pipeline',
      icon: '../../assets/images/gas_pipeline.png'
    },
    {
      name: 'Park',
      icon: '../../assets/images/park.png'
    },
    {
      name: 'Gymnasium',
      icon: '../../assets/images/gym.png'
    },
    {
      name: 'Swimming Pool',
      icon: '../../assets/images/pool.png'
    },
    {
      name: 'Club House',
      icon: '../../assets/images/club_house.png'
    }
  ];

  developerProjects: any[] = [];


  specifications = [
    {
      title: 'Flooring',
      points: [
        'Italian marble kitchen / dinning / livingroom and full body vitrified tiles in bedrooms'
      ]
    },
    {
      title: 'RCC',
      points: [
        'Quality controlled earth quake resistant, r.c.c. frame structure'
      ]
    },
    {
      title: 'Kitchen',
      points: [
        'Granite platform with ss sink.',
        'Decorative tiles dado up to lintel level.'
      ]
    },
    {
      title: 'Kitchen Wash Area',
      points: [
        'Dado of glazed tiles.',
        'Electric point for washing machine.'
      ]
    },
    {
      title: 'Bathroom Plumbing',
      points: [
        'Sanitary ware & c.p. fitting jaquar / kohler / toto or equivalent.',
        'Floor-antiskid floor tiles with designers wall tiles up to lintel level.'
      ]
    },
    {
      title: 'Doors',
      points: [
        'Main door: flush doors with laminate finish.',
        'Other doors: flush doors.'
      ]
    },
    {
      title: 'Windows',
      points: [
        'Sliders dgu glass.',
        'Full body vitrified'
      ]
    },
    {
      title: 'Electrification',
      points: [
        'Adequate points as per architecture drawings.',
        'Concealed 3 phase electrification with good quality isi copper wire / cable.',
        'Branded modular switches, accessories and distribution board with mcb & elcb.'
      ]
    },
    {
      title: 'Paint',
      points: [
        'Internal walls finished with wall putty.',
        'External walls with textured apex paint.'
      ]
    },
    {
      title: 'Lift',
      points: [
        'Fully automatic elevators.'
      ]
    },
    {
      title: 'Terrace',
      points: [
        'China mosaic with required water proofing on terrace.'
      ]
    }
  ];

  faqs = [
    {
      question: 'How to calculate the value of the property?',
      answer: 'Precision in property valuation demands a skilled touch. When it comes to determining the true worth of your property, enlist the assistance of property valuation professionals. These experts possess a wealth of knowledge regarding the dynamic property market, enabling them to provide you with a precise and well-informed assessment.'
    },
    {
      question: 'What is the fair market value of the property?',
      answer: 'Fair market value is the estimated price at which a property would sell in the open market under normal conditions.'
    },
    {
      question: 'Services included in the home valuation process',
      answer: 'Property inspection, market analysis, area evaluation, legal verification and final valuation report.'
    },
    {
      question: 'Types of property valuation methods',
      answer: 'Sales comparison approach, income approach, cost approach and residual valuation methods.'
    },
    {
      question: 'Documents required for property valuation',
      answer: 'Sale deed, property tax receipts, approved plan, ownership documents and utility bills.'
    }
  ];

  galleryImages = [
    '../../../assets/images/gallary_img.png',
    '../../../assets/images/gallery-2.jpg',
    '../../../assets/images/gallery-3.jpg',
    '../../../assets/images/gallery-4.jpg',
    '../../../assets/images/gallery-5.jpg',
    '../../../assets/images/gallery-6.jpg'
  ];

  showViewer = false;

  currentIndex = 4;

  zoomLevel = 1;
  showThumbnails = true;
  touchStartY = 0;
  touchEndY = 0;
  showFilters = false;
  selectedSegments: string[] = ['Buy'];
  selectedPropertyTypes: string[] = [];
  selectedBHKs: string[] = ['2 BHK'];
  city1: { cid: number, cname: string }[] = [];
  priceTooltipVisible: boolean = false;
  showStickyHeader = false;
  countryCode: any;
  otpArray = [0, 1, 2, 3];
  brochureSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    infinite: false
  };
  brochureOtp: string[] = ['', '', '', ''];

  googleMapUrl =
    'https://www.google.com/maps?q=22.2865,73.1812';
  timer: any;
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private _lightbox: Lightbox,
    private route: ActivatedRoute,
    private projectApproveDetailService: ProjectApproveDetailsService,
    private projectdetailsService: ProjectdetailsService,
    private http: HttpClient,
    private sponsorservice: IssponsoredService,
    private verifyservice: IsverifiedService,
    private location: Location,
    // private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private activityTrackerService: ActivityTrackerService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {
    this._album.push({
      src: 'assets/images/advertisement.png',
      caption: 'Image 1',
    });
  }

  categoryDisplayNames: { [key: string]: string } = {
    educationalinstitute: 'Educational Institute',
    shoppingcentre: 'Shopping Centre',
    hospital: 'Hospital',
    commercialhub: 'Commercial Hub'
  };

  hasKeysOrValues(obj: any): boolean {
    return Object.keys(obj).some(
      key => obj[key] && obj[key].length > 0
    );
  }

  showReadMore: boolean = false;
  isReadMore: boolean = false;
  charLimit: number = 20;
  isAboutExpanded: boolean = false;
  isWhyBuyExpanded: boolean = false;
  isDeveloperExpanded: boolean = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScrollPosition());
    Fancybox.bind('[data-fancybox="gallery"]', {

    });
    Fancybox.bind('[data-fancybox="floor-plans"]', {
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ["zoom", "close"],
        },
      },
    });
  }

  moveNext(event: Event, index: number) {
    const input = event.target as HTMLInputElement;

    if (input.value && index < this.otpArray.length - 1) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  }

  movePrevious(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').slice(0, 4);

    for (let i = 0; i < this.otpArray.length; i++) {
      if (i < digits.length) {
        this.brochureOtp[i] = digits[i];
      } else {
        this.brochureOtp[i] = '';
      }
    }

    const currentInput = event.target as HTMLInputElement;
    const parent = currentInput.parentElement;
    if (parent) {
      const siblingInputs = Array.from(parent.querySelectorAll('.otp-box')) as HTMLInputElement[];
      const focusIndex = Math.min(digits.length, siblingInputs.length - 1);
      siblingInputs[focusIndex]?.focus();
    }
  }



  playReel(reel: any) {
    console.log(reel);
  }

  getFormattedDate(dateString: string) {
    // return this.datePipe.transform(dateString, 'MMMM, yyyy');
  }

  openLightbox(index: number = 0): void {
    this._lightbox.open(this._album, index);
  }

  openViewer(index: number = 0): void {
    // Merge all album images into galleryImages if albums are populated
    const allImages = [
      ...this.photoAlbum.map((a: any) => a.src || a),
      ...this.layoutAlbum.map((a: any) => a.src || a),
      ...this.videoAlbum.map((a: any) => a.proj_video_link || a.src || a)
    ];
    if (allImages.length > 0) {
      this.galleryImages = allImages;
    }
    this.currentIndex = index;
    this.updateCurrentVideoSafeUrl();
    this.showViewer = true;
    document.body.style.overflow = 'hidden';
  }

  openPhotoViewer(index: number = 0): void {
    const allImages = [
      ...this.photoAlbum.map((a: any) => a.src || a),
      ...this.layoutAlbum.map((a: any) => a.src || a)
    ];
    if (allImages.length > 0) {
      this.galleryImages = allImages;
    }
    this.currentIndex = index;
    this.updateCurrentVideoSafeUrl();
    this.showViewer = true;
    document.body.style.overflow = 'hidden';
  }

  openVideoViewer(index: number = 0): void {
    const allVideos = [
      ...this.videoAlbum.map((a: any) => a.proj_video_link)
    ];
    if (allVideos.length > 0) {
      this.galleryImages = allVideos;
    }
    this.currentIndex = index;
    this.updateCurrentVideoSafeUrl();
    this.showViewer = true;
    document.body.style.overflow = 'hidden';
  }

  closeViewer(): void {
    this.showViewer = false;
    this.zoomLevel = 1;
    this.showThumbnails = true;
    this.currentVideoSafeUrl = null;
    document.body.style.overflow = '';
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
  }

  prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.updateCurrentVideoSafeUrl();
  }

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.galleryImages.length;
    this.updateCurrentVideoSafeUrl();
  }

  selectImage(index: number): void {
    this.currentIndex = index;
    this.updateCurrentVideoSafeUrl();
  }

  isVideo(url: any): boolean {
    if (!url) return false;
    const urlStr = String(url).toLowerCase();
    return (
      urlStr.includes('youtube.com') ||
      urlStr.includes('youtu.be') ||
      urlStr.includes('vimeo.com') ||
      urlStr.endsWith('.mp4') ||
      urlStr.endsWith('.webm') ||
      urlStr.endsWith('.ogg') ||
      urlStr.endsWith('.mov') ||
      urlStr.includes('.mp4?') ||
      urlStr.includes('.webm?') ||
      urlStr.includes('.ogg?') ||
      urlStr.includes('.mov?')
    );
  }

  isYouTube(url: any): boolean {
    if (!url) return false;
    const urlStr = String(url).toLowerCase();
    return urlStr.includes('youtube.com') || urlStr.includes('youtu.be');
  }

  getThumbnailUrl(url: any): string {
    if (!url) return '';
    if (this.isVideo(url)) {
      // Check if this video has a custom thumbnail in videoAlbum
      const found = this.videoAlbum.find(v => (v.proj_video_link === url));
      if (found && found.proj_video_thumbnail) {
        let thumb = found.proj_video_thumbnail;
        if (!thumb.startsWith('http')) {
          thumb = 'https://realtymart.com/backend/public/images/project_video/' + thumb;
        }
        return thumb;
      }

      if (this.isYouTube(url)) {
        let videoId = '';
        const urlStr = String(url);
        if (urlStr.includes('youtu.be/')) {
          videoId = urlStr.split('youtu.be/')[1].split('?')[0].split('&')[0];
        } else if (urlStr.includes('v=')) {
          videoId = urlStr.split('v=')[1].split('&')[0];
        } else if (urlStr.includes('embed/')) {
          videoId = urlStr.split('embed/')[1].split('?')[0];
        }
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return 'assets/images/play.svg';
    }
    return url;
  }

  getSanitizedGalleryVideoUrl(url: any): SafeResourceUrl {
    let embedUrl = String(url);
    if (this.isYouTube(url)) {
      let videoId = '';
      const urlStr = String(url);
      if (urlStr.includes('youtu.be/')) {
        videoId = urlStr.split('youtu.be/')[1].split('?')[0].split('&')[0];
      } else if (urlStr.includes('v=')) {
        videoId = urlStr.split('v=')[1].split('&')[0];
      } else if (urlStr.includes('embed/')) {
        videoId = urlStr.split('embed/')[1].split('?')[0];
      }
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&enablejsapi=1`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  updateCurrentVideoSafeUrl(): void {
    const currentUrl = this.galleryImages && this.galleryImages[this.currentIndex];
    if (currentUrl && this.isYouTube(currentUrl)) {
      if (this.sanitizedVideoUrlCache.has(currentUrl)) {
        this.currentVideoSafeUrl = this.sanitizedVideoUrlCache.get(currentUrl) || null;
      } else {
        const sanitized = this.getSanitizedGalleryVideoUrl(currentUrl);
        this.sanitizedVideoUrlCache.set(currentUrl, sanitized);
        this.currentVideoSafeUrl = sanitized;
      }
    } else {
      this.currentVideoSafeUrl = null;
    }
  }

  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.25;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.25;
    }
  }

  toggleThumbnails(): void {
    this.showThumbnails = !this.showThumbnails;
  }

  toggleFullscreen(): void {
    const element = document.querySelector('.gallery-overlay');
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }

  cleanUrl(url: string): string {
    if (!url) return '';
    // Clean up local relative assets containing parent directories (e.g. ../../../assets/...)
    if (url.includes('assets/images/')) {
      const idx = url.indexOf('assets/images/');
      return '/' + url.substring(idx);
    }
    // Make absolute URLs root-relative if they match the current domain host,
    // which eliminates CORS blocks in staging and production environments.
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === window.location.hostname) {
        return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      }
    } catch (e) {
      // Already relative or not a valid absolute URL
    }
    return url;
  }

  downloadCurrentImage(): void {
    const rawUrl = this.galleryImages[this.currentIndex];
    if (!rawUrl) return;

    if (this.isYouTube(rawUrl)) {
      this.toastr.warning('Video download is not supported.');
      return;
    }

    const currentUrl = this.cleanUrl(rawUrl);

    const link = document.createElement('a');
    link.href = currentUrl;
    link.download = currentUrl.split('/').pop() || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  activeButton: string = 'buy';

  setActiveButton(button: string) {
    this.activeButton = button;
  }

  // Properties  slider

  slideConfig1 = {
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
          dots: true,
          arrows: false,
        }
      },
    ],
  };

  // Properties  slider

  // units_featured slider

  slideConfig2 = {
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
        breakpoint: 520,  // Max width 1024px
        settings: {
          slidesToShow: 1,
        }
      },
    ],
  };

  // units_featured slider

  // gallery slider

  slideConfig3 = {
    slidesToShow: 3,
    slidesToScroll: 3,
    dots: false,
    arrows: true,
    infinite: true,
    // autoplay: true,
    prevArrow:
      "<img class='a-left control-c prev slick-prev' src='../assets/images/prev.svg'>",
    nextArrow:
      "<img class='a-right control-c next slick-next' src='../assets/images/next.svg'>",
    responsive: [
      {
        breakpoint: 768,  // Max width 1024px
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 520,  // Max width 1024px
        settings: {
          slidesToShow: 1,
        }
      },
      {
        breakpoint: 480,  // Max width 1024px
        settings: {
          slidesToShow: 1,
          dots: true,
          arrows: false,
        }
      },
    ],
  };

  // gallery slider

  // Properties  slider

  slideConfig4 = {
    slidesToShow: 4,
    slidesToScroll: 1,
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
        breakpoint: 520,  // Max width 1024px
        settings: {
          slidesToShow: 1,
        }
      },
    ],
  };

  // Properties  slider

  // ===== Brochure Form =====
  brochureMode: string = 'brochure'; // 'brochure' | 'payment'
  brochureFormData: any = { name: '', email: '', mobile: '', termsAccepted: true };
  brochureNameError: boolean = false;
  brochureEmailError: boolean = false;
  brochureMobileError: boolean = false;
  brochureTermsError: boolean = false;
  brochureOtpVisible: boolean = false;
  brochureOtpError: boolean = false;
  brochureNameTouched: boolean = false;
  brochureEmailTouched: boolean = false;
  brochureMobileTouched: boolean = false;
  brochureRegisterVisible: boolean = false;
  isUserRegistered: boolean = false;
  showContactDetails: boolean = false;

  // Download Brochure otp
  showOTP: boolean = false;
  otp: string = '';

  // ===== Gallery =====
  photoAlbum: any[] = [];
  layoutAlbum: any[] = [];
  videoAlbum: any[] = [];
  galleryVisible: boolean = false;
  galleryActiveTab: string = 'photos';
  galleryActiveIndex: number = 0;
  galleryZoom: number = 1;
  galleryFormType: string = ''; // 'contact' | 'brochure' | 'payment' | ''

  // ===== Brochure Images =====
  projectBrochureImages: string[] = [];

  // ===== Gallery Inline Contact Form =====
  galleryContactData: any = { name: '', email: '', mobile: '', termsAccepted: true };
  galleryContactNameErr: boolean = false;
  galleryContactEmailErr: boolean = false;
  galleryContactMobileErr: boolean = false;
  galleryContactTermsErr: boolean = false;
  galleryContactOtpVisible: boolean = false;
  galleryContactOtp: string = '';
  galleryContactOtpErr: boolean = false;
  galleryContactSubmitted: boolean = false;

  get currentAlbum(): any[] {
    if (this.galleryActiveTab === 'layout') return this.layoutAlbum;
    if (this.galleryActiveTab === 'video') return this.videoAlbum;
    return this.photoAlbum;
  }

  // ===== Reviews =====
  projectReviews: any[] = [];
  reviewFormData: any = { review: '', ratings: 0 };
  reviewTextError: boolean = false;
  reviewRatingError: boolean = false;
  hoveredReviewRating: number = 0;

  get averageRating(): number {
    if (!this.projectReviews.length) return 0;
    const sum = this.projectReviews.reduce((acc: number, r: any) => acc + (Number(r.ratings) || 0), 0);
    return parseFloat((sum / this.projectReviews.length).toFixed(1));
  }



  center: google.maps.LatLngLiteral = {
    lat: 22.2865,
    lng: 73.1812
  };
  zoom = 15;

  ngOnInit(): void {
    const token = localStorage.getItem('myrealtylogintoken');
    if (token) {
      this.is_token = true;
      this.formData.username = localStorage.getItem('name') || '';
      this.formData.useremail = localStorage.getItem('email') || '';
      this.formData.contact_no = localStorage.getItem('contact_no') || '';
      this.formData.termsAccepted = true;
      this.formDataphone.contactusername = localStorage.getItem('name') || '';
      this.formDataphone.contactuseremail = localStorage.getItem('email') || '';
      this.formDataphone.contactcontact_no = localStorage.getItem('contact_no') || '';
      this.formDataphone.termsContactAccepted = true;

    }
    this.observeSections();
    this.detectActiveSectionOnScroll();
    this.fetchProjectApproveDetails();
    // this.loadissponsored();
    // this.loadisverified();
    if (this.latitude && this.longitude) {
      this.updateMapCoordinates(this.latitude, this.longitude);
    } else if (this.singleproject?.latitude && this.singleproject?.longitude) {
      this.updateMapCoordinates(this.singleproject.latitude, this.singleproject.longitude);
    }
    this.route.fragment.subscribe(fragment => {
      this.currentSection = fragment;
    });
    const modalElement = document.getElementById('get-builder');
    if (modalElement) {
      modalElement.addEventListener('hide.bs.modal', () => {
        this.resetContactForm();
      });
    }
    this.route.queryParams.subscribe(params => {
      if (params['reels'] === 'true') {
        const index = params['reel'] ? parseInt(params['reel'], 10) : 0;
        this.openReelsView(index);
      }
    });
    this.fetchCities();
  }

  checkLoggedIn() {
    this.checkToken = localStorage.getItem('myrealtylogintoken');
    if (this.checkToken) {
      this.is_token = true;
    }
    else {
      this.is_token = false;
    }
  }

  updateMapCoordinates(latVal: any, lngVal: any) {
    if (latVal && lngVal) {
      const lat = parseFloat(String(latVal).trim());
      const lng = parseFloat(String(lngVal).trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        this.center = { lat, lng };
        this.markerPosition = { lat, lng };
        this.googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      }
    }
  }

  // scrollToSection(sectionId: string): void {
  //   const section = document.getElementById(sectionId);
  //   if (section) {
  //     section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   }
  // }
  checkDescriptionHeight(): void {
    //     const descriptionText = this.item.property_description || '';
    // console.log(descriptionText)
    //     if (descriptionText.length > this.charLimit) {
    //       this.showReadMore = true;
    //     } else {
    //       this.showReadMore = false;
    //     }
  }

  getPlainText(html: string): string {
    if (!html) return '';
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return (div.textContent || div.innerText || '').trim();
    } catch (e) {
      return String(html);
    }
  }

  shouldTruncate(html: string, wordLimit: number = 150): boolean {
    const text = this.getPlainText(html);
    if (!text) return false;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return words.length > wordLimit;
  }

  getPreviewText(html: string, wordLimit: number = 150): string {
    const text = this.getPlainText(html);
    if (!text) return '';
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  goToFloorPlanSlide(index: number): void {
    this.selectedFloorPlanIndex = index;
  }

  parseImagesArray(img: any): string[] {
    if (!img) return [];
    if (Array.isArray(img)) return img;
    if (typeof img === 'string') {
      const trimmed = img.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) { }
      }
      return trimmed.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  }

  // hasKeysOrValues(obj: any): boolean {
  //   return Object.keys(obj).length > 0 &&
  //          !Object.values(obj).every(value => value === null || value === undefined || value === '');
  // }

  submitEnquiry() {
    this.nameTouched = true;
    this.emailTouched = true;
    this.phoneTouched = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.nameError = !this.formData.username?.trim() || this.formData.username.trim().length < 3;
    this.emailError = !this.formData.useremail || !emailPattern.test(this.formData.useremail);
    this.phoneError = !this.formData.contact_no || String(this.formData.contact_no).length < 10;
    this.termsError = !this.formData.termsAccepted;

    if (this.nameError || this.phoneError || this.emailError || this.termsError) {
      return;
    }

    this.spinner.show();
    const payload = {
      contact_no: this.formData.contact_no,
      useremail: this.formData.useremail,
      username: this.formData.username,
      project_Id: this.singleproject.id,
      builder_id: '',
      leads_type: 'Project',
      leads_for: this.singleproject.property_for,
      receiver_user_id: this.singleproject.user_id,
      countrycode: '',
      request_price: 0,
    };
    const token = localStorage.getItem('myrealtylogintoken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    this.http.post(`${this.apiUrl}storeinquiry`, payload, { headers }).subscribe((response: any) => {
      this.spinner.hide();
      if (response.status === true) {
        this.activityTrackerService.logActivity('Inquiry stored for project', '');
        this.enquirySubmitted = true;
        this.resetForm();
      }
    },
      (error) => {
        this.spinner.hide();
        console.log('Error sending data', error)
      });
  }


  resetForm() {
    this.formData = {
      username: '',
      useremail: '',
      contact_no: ''
    };
    this.nameError = false;
    this.phoneError = false;
    this.emailError = false;
    this.termsError = false;
    this.nameTouched = false;
    this.emailTouched = false;
    this.phoneTouched = false;
  }

  openOTPModal() {
    this.nameTouched = true;
    this.emailTouched = true;
    this.phoneTouched = true;
    this.nameError = false;
    this.phoneError = false;
    this.emailError = false;
    this.termsError = false;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

    if (!this.formData.username?.trim() || this.formData.username.trim().length < 3) {
      this.nameError = true;
    }
    if (!this.formData.useremail || !emailPattern.test(this.formData.useremail)) {
      this.emailError = true;
    }
    if (!this.formData.contact_no || String(this.formData.contact_no).length < 10) {
      this.phoneError = true;
    }
    if (!this.formData.termsAccepted) {
      this.termsError = true;
    }

    if (this.nameError || this.phoneError || this.emailError || this.termsError) {
      return;
    }
    this.sendOTPToMobile(); // Call this to send OTP to mobile
  }

  openContactOTPModal() {
    this.nameContactTouched = true;
    this.emailContactTouched = true;
    this.phoneContactTouched = true;
    this.nameContactError = false;
    this.phoneContactError = false;
    this.emailContactError = false;
    this.termsContactError = false;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;



    if (!this.formDataphone.contactcontact_no || String(this.formDataphone.contactcontact_no).length < 10) {
      this.phoneContactError = true;
    }
    if (this.phoneContactError) {
      return;
    }
    this.sendOTPContactToMobile(); // Call this to send OTP to mobile
  }

  verifyContactOTP() {
    const otpVal = this.brochureOtp.join('');
    if (otpVal.length < 4) {
      this.toastr.error('Please Enter OTP');
      return;
    }

    this.spinner.show();

    if (this.isUserRegistered) {
      const enteredOtp = parseInt(otpVal, 10);
      const url = `${this.apiUrl}validateotp`;
      const data = { contact_no: this.brochureFormData.mobile, otp: enteredOtp };

      this.http.post(url, data).subscribe(
        (response: any) => {
          this.spinner.hide();
          if (response && response.status === true) {
            localStorage.setItem('myrealtylogintoken', response.data.token);
            localStorage.setItem('contact_no', response.data.contact_no);
            localStorage.setItem('userId', response.data.id);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('email', response.data.email);
            this.is_token = true;

            // Prefill formDataphone from localStorage
            this.formDataphone.contactusername = response.data.name;
            this.formDataphone.contactuseremail = response.data.email;
            this.formDataphone.contactcontact_no = response.data.contact_no;

            // Submit inquiry
            this.submitFormPhone();

            // Close login modal
            this.closeLoginModal();

            // Open brochure PDF
            if (this.selectedAction === 'brochure') {
              const pdfUrl = this.singleproject?.project_brochure;
              if (pdfUrl) {
                window.open(pdfUrl, '_blank');
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              } else {
                this.toastr.warning('Brochure is not available.');
              }
            } else if (this.selectedAction === 'view-contact') {
              this.showContactDetails = true;
            } else if (this.selectedAction === 'whatsapp') {
              this.redirectToWhatsApp();
              setTimeout(() => {
                window.location.reload();
              }, 100);
            } else if (this.selectedAction === 'schedule-visit') {
              this.openScheduleVisitModal();
            }
            this.toastr.success('Logged in successfully!');
          } else {
            this.toastr.error('Wrong OTP entered. Please try again.');
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error('Verification failed. Please try again.');
        }
      );
    } else {
      let payload = {
        contact_no: this.brochureFormData.mobile,
        otp: otpVal,
      }
      this.http.post(`${this.apiUrl}verifyinquiryotp`, payload).subscribe(
        (response: any) => {
          this.spinner.hide();
          if (response.status == true) {
            // OTP verified successfully. Now show the Name and Email form inside the modal.
            this.brochureOtpVisible = false;
            this.brochureRegisterVisible = true;
          } else {
            this.toastr.error('Wrong OTP entered. Please try again.');
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error('Verification failed. Please try again.');
        }
      );
    }
  }

  verifyOTP() {
    if (this.formData.otp == '') {
      this.toastr.error('Please Enter OTP');
      return
    }

    this.http
      .post(
        `${this.apiUrl}verifyinquiryotp`,
        this.formData
      )
      .subscribe(
        (response: any) => {
          if (response.status == true) {
            // this.toastr.success('OTP verified successfully.');
            const modalElement = this.otpModel.nativeElement;
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            } else {
              const newModal = new bootstrap.Modal(modalElement);
              newModal.hide();
            }
            this.submitEnquiry();
            this.isResendEnabled = false;
            this.isMobileNumberDisabled = true;

            // Optional: Delay for user feedback before hiding
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
            //   this.submitEnquiry();
            // }

            this.spinner.hide();
          } else {
            this.toastr.error('Wrong OTP entered. Please try again.');
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
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(this.timer);
        this.isResendEnabled = true;
      }
    }, 1000);
  }

  sendOTPToMobile() {
    this.isSendingOtp = true;
    this.spinner.show();
    this.http
      .post(`${this.apiUrl}genrateinquiryotp`, {
        contact_no: this.brochureFormData.mobile,
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
              this.toastr.success('OTP Sent Successfully.');
            }
            if (response.code === 101) {
              this.toastr.warning(response.message);
            }
          }
          else {
            this.phoneError = true;
          }
          this.isSendingOtp = false;
          this.spinner.hide();
        },
        (error) => {
          this.isSendingOtp = false;
          this.toastr.error('Failed to send OTP.');
          console.error('Error sending OTP', error);
          this.spinner.hide();
        }
      );
  }
  sendOTPContactToMobile() {
    this.isContactSendingOtp = true;
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
              this.toastr.success('OTP Sent Successfully.');
            }
            if (response.code === 101) {
              this.toastr.warning(response.message);
            }
          }
          else {
            this.phoneContactError = true;
          }
          this.isContactSendingOtp = false;
          this.spinner.hide();
        },
        (error) => {
          this.isContactSendingOtp = false;
          this.toastr.error('Failed to send OTP.');
          console.error('Error sending OTP', error);
          this.spinner.hide();
        }
      );
  }

  slideLeft() {
    this.slider.nativeElement.scrollBy({
      left: -320,
      behavior: 'smooth'
    });
  }

  slideRight() {
    this.slider.nativeElement.scrollBy({
      left: 320,
      behavior: 'smooth'
    });
  }

  resendOTP() {
    if (this.isResendEnabled) {
      this.sendOTPToMobile(); // Logic to send OTP
      this.startTimer(); // Restart the timer after resending OTP
    }
  }

  resendContactOTP() {
    clearInterval(this.timer);
    this.startTimer();
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
    this.nameTouched = true;
    const inputValue = event.target.value;
    const companyPattern = /^[a-zA-Z\s]+$/;
    this.nameError = !companyPattern.test(inputValue) || inputValue.trim().length < 3;
  }

  validateEmail(event: any) {
    this.emailTouched = true;
    const inputValue = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.emailError = !emailPattern.test(inputValue);
  }

  validatePhoneNumber(event: any) {
    this.phoneTouched = true;
    const inputValue = event.target.value;

    const validFormatPattern = /^[0-9]{10}$/;
    const allIdenticalPattern = /^(?!([0-9])\1{9})[0-9]{10}$/;
    const sequentialPattern = /^(0123456789|9876543210|1234567890|0987654321)$/;
    const mirroredPattern = /^(.)(.)(.)(.)(.).?\5\4\3\2\1$/;

    if (
      !validFormatPattern.test(inputValue) ||        // Check if it's 10 digits
      !allIdenticalPattern.test(inputValue) ||       // Reject if all identical digits
      sequentialPattern.test(inputValue) ||          // Reject if sequential
      mirroredPattern.test(inputValue)               // Reject if mirrored/palindromic
    ) {
      this.phoneError = true; // Display error
    } else {
      this.phoneError = false; // Valid number
      // this.sendOTPToMobile();
    }
  }
  observeSections() {
    const sections = document.querySelectorAll('#overview,#aboutProject,#reels,#floorPlan,#address,#amenities,#brochure,#project-detail,#developer');
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0.2, // Section is considered active when it crosses into view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, observerOptions);
    sections.forEach((section) => {
      return observer.observe(section)
    });
  }


  scrollToSection(sectionId: string): void {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    const section = document.getElementById(sectionId);
    const navbar = document.getElementById('navbar');

    if (section) {
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const stickyTop = navbar ? parseFloat(window.getComputedStyle(navbar).top) || 0 : 125;
      const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
      // Account for navbar's sticky top position + navbar height + extra padding
      const scrollToPosition = sectionPosition - stickyTop - navbarHeight - 20;

      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth',
      });
      this.activeSection = sectionId;
    }
  }


  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.detectActiveSectionOnScroll();

    const headerElement = document.getElementById('project-detail-header');
    const navbar = document.getElementById('navbar');
    if (headerElement && navbar) {
      const rect = headerElement.getBoundingClientRect();
      const stickyTop = parseFloat(window.getComputedStyle(navbar).top) || 125;
      this.showStickyHeader = rect.bottom <= stickyTop;
    } else {
      this.showStickyHeader = window.scrollY > 450;
    }
  }
  detectActiveSectionOnScroll(): void {
    const sections = [
      { id: 'overview', element: document.getElementById('overview') },
      { id: 'aboutProject', element: document.getElementById('aboutProject') },
      { id: 'reels', element: document.getElementById('reels') },
      { id: 'floorPlan', element: document.getElementById('floorPlan') },
      { id: 'address', element: document.getElementById('address') },
      { id: 'amenities', element: document.getElementById('amenities') },
      { id: 'brochure', element: document.getElementById('brochure') },
      { id: 'project-detail', element: document.getElementById('project-detail') },
      { id: 'developer', element: document.getElementById('developer') },
    ];

    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const stickyTop = navbar ? parseFloat(window.getComputedStyle(navbar).top) || 0 : 125;
    const scrollPosition = window.scrollY + navbarHeight + stickyTop + 25;

    // Find the section that is currently in view
    let activeSection = 'overview';
    for (const section of sections) {
      if (section.element) {
        const sectionTop = section.element.offsetTop;
        if (scrollPosition >= sectionTop) {
          activeSection = section.id;
        } else {
          break;
        }
      }
    }
    this.activeSection = activeSection;
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
    this.nameContactTouched = true;
    const inputValue = event.target.value;
    const companyPattern = /^[a-zA-Z\s]+$/;
    this.nameContactError = !companyPattern.test(inputValue) || inputValue.trim().length < 3;
  }

  validateContactEmail(event: any) {
    this.emailContactTouched = true;
    const inputValue = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.emailContactError = !emailPattern.test(inputValue);
  }
  validateContactPhoneNumber(event: any) {
    this.phoneContactTouched = true;
    const inputValue = event.target.value;

    const validFormatPattern = /^[0-9]{10}$/;
    const allIdenticalPattern = /^(?!([0-9])\1{9})[0-9]{10}$/;
    const sequentialPattern = /^(0123456789|9876543210|1234567890|0987654321)$/;
    const mirroredPattern = /^(.)(.)(.)(.)(.).?\5\4\3\2\1$/;

    if (
      !validFormatPattern.test(inputValue) ||        // Check if it's 10 digits
      !allIdenticalPattern.test(inputValue) ||       // Reject if all identical digits
      sequentialPattern.test(inputValue) ||          // Reject if sequential
      mirroredPattern.test(inputValue)               // Reject if mirrored/palindromic
    ) {
      this.phoneContactError = true;
    } else {
      this.phoneContactError = false;
      // this.sendOTPToMobile();
    }
  }

  fetchProjectApproveDetails() {
    const projectName: any = this.route.snapshot.paramMap.get('name');
    const projectId: any = this.route.snapshot.paramMap.get('id');

    if (projectName && projectId) {
      this.projectdetailsService
        .getprojectdetail1(projectName, projectId)
        .subscribe(
          (projectData: any) => {
            this.singleprojectData = projectData;
            this.singleproject = this.singleprojectData?.data;

            // Populate floor plans from API
            const rawFloorPlans = this.singleproject?.floor_plans;
            if (Array.isArray(rawFloorPlans) && rawFloorPlans.length > 0) {
              this.floorPlanList = rawFloorPlans.map((fp: any) => ({
                bhk_type: fp.bhk_type || '',
                carpet_area: fp.carpet_area || '',
                image: this.parseImagesArray(fp.image)
              }));
            } else if (typeof rawFloorPlans === 'string' && rawFloorPlans.trim()) {
              try {
                const parsed = JSON.parse(rawFloorPlans);
                if (Array.isArray(parsed)) {
                  this.floorPlanList = parsed.map((fp: any) => ({
                    bhk_type: fp.bhk_type || '',
                    carpet_area: fp.carpet_area || '',
                    image: this.parseImagesArray(fp.image)
                  }));
                }
              } catch (e) {
                console.error('Error parsing floor_plans:', e);
              }
            }
            this.selectedFloorPlanIndex = 0;

            // Populate FAQs from project_faq if available
            const rawFaqs = this.singleproject?.project_faq;
            if (rawFaqs) {
              let parsedFaqs: any[] = [];
              if (typeof rawFaqs === 'string') {
                try {
                  parsedFaqs = JSON.parse(rawFaqs);
                } catch (e) {
                  console.error('Error parsing project_faq:', e);
                }
              } else if (Array.isArray(rawFaqs)) {
                parsedFaqs = rawFaqs;
              }
              if (parsedFaqs && parsedFaqs.length > 0) {
                this.faqs = parsedFaqs.map(f => ({
                  question: f.faq_que || f.question || '',
                  answer: f.faq_ans || f.answer || ''
                }));
              }
            }

            // Update map coordinates from loaded project
            if (this.singleproject) {
              this.updateMapCoordinates(this.singleproject.latitude, this.singleproject.longitude);
            }

            // Populate gallery albums
            const imageBaseUrl = 'https://realtymart.com/backend/public/images/';

            // Project Photos tab: from 3d_project_images (comma-separated filenames)
            const raw3dImages = this.singleproject?.['project_images'];
            if (typeof raw3dImages === 'string' && raw3dImages.trim()) {
              this.photoAlbum = raw3dImages.split(',').map((f: string) => imageBaseUrl + '3d_project_images/' + f.trim()).filter((u: string) => u !== imageBaseUrl + '3d_project_images/');
            } else if (Array.isArray(raw3dImages)) {
              this.photoAlbum = raw3dImages;
            } else {
              this.photoAlbum = [];
            }

            // Layout Photos tab: from project_floor_plan_3d (already full URLs array)
            const rawFloor3d = this.singleproject?.project_floor_plan_3d;
            this.layoutAlbum = Array.isArray(rawFloor3d) ? rawFloor3d : [];

            // Brochure Images: from project_brochure_images
            const rawBrochureImages = this.singleproject?.project_brochure_images;
            if (Array.isArray(rawBrochureImages) && rawBrochureImages.length > 0) {
              this.projectBrochureImages = rawBrochureImages;
            } else if (typeof rawBrochureImages === 'string' && rawBrochureImages.trim()) {
              this.projectBrochureImages = rawBrochureImages.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            } else {
              this.projectBrochureImages = [];
            }
            this.singleproject.project_video.push({
              video_source: "video",
              proj_video_link: "",
              proj_video_file: "../../../assets/reels/reel-1.mp4",
              proj_video_thumbnail: "../../../assets/images/reel-1-thumbnail.jpg"
            },
              {
                video_source: "video",
                proj_video_link: "",
                proj_video_file: "../../../assets/reels/reel-2.mp4",
                proj_video_thumbnail: "../../../assets/images/reel-2-thumbnail.jpg"
              },
              {
                video_source: "video",
                proj_video_link: "",
                proj_video_file: "../../../assets/reels/reel-3.mp4",
                proj_video_thumbnail: "../../../assets/images/reel-3-thumbnail.jpg"
              }
            )
            if (this.singleproject.project_video.length > 0) {
              this.singleproject.project_video.forEach((element: {
                video_source: string,
                proj_video_link: string,
                proj_video_file: string,
                proj_video_thumbnail: string
              }) => {
                if (element.video_source === "youtube") {
                  this.videoAlbum.push(element)
                } else {
                  this.reels.push(element)
                }
              });
            }

            // Auto-select first tab that has content
            if (this.photoAlbum.length > 0) this.galleryActiveTab = 'photos';
            else if (this.layoutAlbum.length > 0) this.galleryActiveTab = 'layout';
            else if (this.videoAlbum.length > 0) this.galleryActiveTab = 'video';
            this.developerProjects = this.singleproject.aboutDeveloperProjects;
            // Populate reviews via separate API
            this.fetchProjectReviews(this.singleproject.id);

            // Set meta tags and title
            this.setMetaTags(this.singleproject.project_meta_title, this.singleproject.project_meta_description, this.singleproject.image);
          },
          (error: any) => {
            console.error('Error fetching project details:', error);
          }
        );
    }
  }
  fetchProjectReviews(projectId: any) {
    this.http.get(`${this.apiUrl}getreview`).subscribe(
      (res: any) => {
        const all: any[] = res?.responseData?.getenquiry || [];
        const currentUserId = localStorage.getItem('userId');
        const currentUserName = localStorage.getItem('name');
        this.projectReviews = all
          .filter((r: any) => String(r.review_id) === String(projectId))
          .map((r: any) => ({
            ...r,
            ratings: Number(r.ratings) || 0,
            name: (currentUserId && String(r.user_id) === String(currentUserId))
              ? (currentUserName || 'Verified User')
              : 'Verified User'
          }));
      },
      () => { }
    );
  }

  // meta title
  setMetaTags(title: string, description: string, image: string) {
    this.titleService.setTitle(title);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  submitFormPhone() {
    this.nameContactTouched = true;
    this.emailContactTouched = true;
    this.phoneContactTouched = true;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.phoneContactError = !this.formDataphone.contactcontact_no || String(this.formDataphone.contactcontact_no).length < 10;
    this.termsContactError = !this.formDataphone.termsContactAccepted;

    if (this.phoneContactError || this.termsContactError) {
      return;
    }
    this.spinner.show();
    const payload = {
      contact_no: this.formDataphone.contactcontact_no,
      useremail: this.formDataphone.contactuseremail,
      username: this.formDataphone.contactusername,
      project_Id: this.singleproject.id,
      builder_id: '',
      leads_type: 'Project',
      leads_for: this.singleproject.property_for,
      receiver_user_id: this.singleproject.user_id,
      countrycode: '',
      request_price: 0,
    }
    const token = localStorage.getItem('myrealtylogintoken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    this.http.post(`${this.apiUrl}storeinquiry`, payload, { headers })
      .subscribe((response: any) => {
        if (response.status === true) {
          this.activityTrackerService.logActivity('Inquiry stored for project', '');
          this.contactEnquirySubmitted = true;
        }
      }, (error) => {
        console.error('Error sending data', error);
      });
  }

  resetContactForm() {
    const name = localStorage.getItem('name') || '';
    const email = localStorage.getItem('email') || '';
    const phone = localStorage.getItem('contact_no') || '';
    this.formDataphone = {
      contactusername: name,
      contactuseremail: email,
      contactcontact_no: phone,
      termsContactAccepted: true,
    };
    this.nameContactError = false;
    this.phoneContactError = false;
    this.emailContactError = false;
    this.termsContactError = false;
    this.nameContactTouched = false;
    this.emailContactTouched = false;
    this.phoneContactTouched = false;
    this.contactEnquirySubmitted = false;
  }

  onTermsChange(event: Event) {
    this.termsError = !(event.target as HTMLInputElement).checked;
  }
  onTermsContactChange(event: Event) {
    this.termsContactError = !(event.target as HTMLInputElement).checked;
  }

  // objectKeys(obj: any): string[] {
  //   return Object.keys(obj);
  // }

  // loadissponsored(): void {
  //   this.sponsorservice.sponsorget()?.subscribe((sponsorData: any) => {
  //     this.sponsorData = sponsorData;
  //     this.sponsor = this.sponsorData?.responseData?.issponsored;
  //   });
  // }

  // loadisverified(): void {
  //   this.verifyservice.verifiedget()?.subscribe((verifyData: any) => {
  //     this.verifyData = verifyData;
  //     this.verify = this.verifyData?.responseData?.isverified;
  //   });
  // }

  submitForm(form: any) {
    this.showOTP = true;
  }

  getLandmarkCategories(): any[] {
    return Object.entries(this.singleproject.landmarksnearproject).map(([key, value]) => ({
      category: key,
      landmarks: value
    }));
  }

  getLandmarkEntries() {
    return Object.entries(this.singleproject.landmarksnearproject);
  }

  sendBrochureOTP() {
    this.brochureMobileTouched = true;
    const mobilePattern = /^[0-9]{10}$/;
    this.brochureMobileError = !mobilePattern.test(this.brochureFormData.mobile);

    if (this.brochureMobileError) return;

    this.isBrochureSendingOtp = true;

    // Call generateotp to check if user is registered
    this.http.post(`${this.apiUrl}generateotp`, { contact_no: this.brochureFormData.mobile })
      .subscribe((res: any) => {
        if (res.status === true && res.code !== 1) {
          // User is registered in the database, generateotp has successfully sent the login OTP
          this.isBrochureSendingOtp = false;
          this.isUserRegistered = true;
          this.brochureOtpVisible = true;
          this.startTimer();
          this.toastr.success('OTP sent successfully.');
        } else {
          // User is unregistered in the database, send guest inquiry OTP
          this.isUserRegistered = false;
          this.http.post(`${this.apiUrl}genrateinquiryotp`, { contact_no: this.brochureFormData.mobile })
            .subscribe((inqRes: any) => {
              this.isBrochureSendingOtp = false;
              if (inqRes.data === 'ok' && inqRes.status === true) {
                this.brochureOtpVisible = true;
                this.startTimer();
                this.toastr.success('OTP sent successfully.');
              } else {
                this.toastr.error(inqRes.message || 'Failed to send OTP.');
              }
            }, () => {
              this.isBrochureSendingOtp = false;
              this.toastr.error('Failed to send OTP.');
            });
        }
      }, () => {
        this.isBrochureSendingOtp = false;
        this.toastr.error('Failed to send OTP.');
      });
  }

  submitBrochure() {
    const otpVal = this.brochureOtp.join('');
    if (otpVal.length < 4) { this.brochureOtpError = true; return; }
    this.brochureOtpError = false;
    this.http.post(`${this.apiUrl}verifyinquiryotp`, { contact_no: this.brochureFormData.mobile, otp: otpVal })
      .subscribe((response: any) => {
        if (response.status === true) {
          const modalEl = document.getElementById('Brochure');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
          this.galleryFormType = ''; // close gallery panel if open
          const baseUrl = 'https://realtymart.com/backend/public/images/';
          const pdfUrl = this.brochureMode === 'payment'
            ? (this.singleproject?.project_payment_brochure ? baseUrl + 'project_payment_brochure/' + this.singleproject.project_payment_brochure : null)
            : this.singleproject?.project_brochure;
          if (pdfUrl) {
            window.open(pdfUrl, '_blank');
          } else {
            this.toastr.info(this.brochureMode === 'payment' ? 'Payment plan is not available.' : 'Brochure is not available.');
          }
          this.resetBrochureForm();
        } else {
          this.toastr.error('Wrong OTP. Please try again.');
        }
      });
  }

  resetBrochureForm() {
    this.brochureFormData = { name: '', email: '', mobile: '', termsAccepted: true };
    this.brochureOtp = ['', '', '', ''];
    this.brochureOtpVisible = false;
    this.brochureRegisterVisible = false;
    this.brochureNameError = false;
    this.brochureEmailError = false;
    this.brochureMobileError = false;
    this.brochureTermsError = false;
    this.brochureOtpError = false;
    this.brochureNameTouched = false;
    this.brochureEmailTouched = false;
    this.brochureMobileTouched = false;
  }

  validateBrochureName(event: any) {
    this.brochureNameTouched = true;
    const value = event.target.value;
    const pattern = /^[a-zA-Z\s]+$/;
    this.brochureNameError = !pattern.test(value) || value.trim().length < 3;
  }

  validateBrochureEmail(event: any) {
    this.brochureEmailTouched = true;
    const value = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.brochureEmailError = !emailPattern.test(value);
  }

  validateBrochureMobile(event: any) {
    this.brochureMobileTouched = true;
    const value = event.target.value;
    const mobilePattern = /^[0-9]{10}$/;
    this.brochureMobileError = !mobilePattern.test(value);
  }



  // ===== Gallery Inline Contact Form Methods =====
  openGalleryForm(type: string) {
    this.galleryFormType = type;
    if (type === 'contact') {
      this.resetGalleryContactForm();
    } else {
      this.brochureMode = type; // 'brochure' or 'payment'
      this.resetBrochureForm();
    }
  }

  closeGalleryForm() {
    this.galleryFormType = '';
    this.resetGalleryContactForm();
  }

  resetGalleryContactForm() {
    this.galleryContactData = { name: '', email: '', mobile: '', termsAccepted: true };
    this.galleryContactNameErr = false;
    this.galleryContactEmailErr = false;
    this.galleryContactMobileErr = false;
    this.galleryContactTermsErr = false;
    this.galleryContactOtpVisible = false;
    this.galleryContactOtp = '';
    this.galleryContactOtpErr = false;
    this.galleryContactSubmitted = false;
  }

  sendGalleryContactOTP() {
    this.galleryContactNameErr = !this.galleryContactData.name?.trim() || this.galleryContactData.name.trim().length < 3;
    const emailPat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.galleryContactEmailErr = !emailPat.test(this.galleryContactData.email);
    const mobilePat = /^[0-9]{10}$/;
    this.galleryContactMobileErr = !mobilePat.test(this.galleryContactData.mobile);
    this.galleryContactTermsErr = !this.galleryContactData.termsAccepted;

    if (this.galleryContactNameErr || this.galleryContactEmailErr || this.galleryContactMobileErr || this.galleryContactTermsErr) return;

    this.spinner.show();
    this.http.post(`${this.apiUrl}genrateinquiryotp`, { contact_no: this.galleryContactData.mobile })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res?.data === 'ok' && res?.status === true) {
          this.galleryContactOtpVisible = true;
          this.toastr.success('OTP sent successfully.');
        } else {
          this.toastr.error('Failed to send OTP. Please try again.');
        }
      }, () => { this.spinner.hide(); this.toastr.error('Failed to send OTP.'); });
  }

  submitGalleryContact() {
    if (!this.galleryContactOtp?.trim()) { this.galleryContactOtpErr = true; return; }
    this.galleryContactOtpErr = false;

    this.spinner.show();
    this.http.post(`${this.apiUrl}verifyinquiryotp`, { contact_no: this.galleryContactData.mobile, otp: this.galleryContactOtp })
      .subscribe((res: any) => {
        if (res?.status === true) {
          const token = localStorage.getItem('myrealtylogintoken');
          const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json');
          const payload = {
            contact_no: this.galleryContactData.mobile,
            useremail: this.galleryContactData.email,
            username: this.galleryContactData.name,
            project_Id: this.singleproject?.id,
            builder_id: '',
            leads_type: 'Project',
            leads_for: this.singleproject?.property_for,
            receiver_user_id: this.singleproject?.user_id,
            countrycode: '',
            request_price: 0,
          };
          this.http.post(`${this.apiUrl}storeinquiry`, payload, { headers })
            .subscribe((r: any) => {
              this.spinner.hide();
              if (r?.status === true) {
                this.galleryContactSubmitted = true;
              } else {
                this.galleryFormType = '';
                this.resetGalleryContactForm();
              }
            }, () => { this.spinner.hide(); this.galleryFormType = ''; this.resetGalleryContactForm(); });
        } else {
          this.spinner.hide();
          this.toastr.error('Wrong OTP. Please try again.');
        }
      }, () => { this.spinner.hide(); this.toastr.error('Something went wrong.'); });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  }

  setGalleryTab(tab: string) {
    this.galleryActiveTab = tab;
    this.galleryActiveIndex = 0;
    this.galleryZoom = 1;
  }

  setGalleryImage(index: number) {
    this.galleryActiveIndex = index;
    this.galleryZoom = 1;
  }

  nextGalleryImage() {
    if (this.currentAlbum.length === 0) return;
    if (this.galleryActiveIndex < this.currentAlbum.length - 1) {
      this.galleryActiveIndex++;
    } else {
      // auto advance to next tab
      const tabs = this.availableTabs;
      const currentTabIdx = tabs.indexOf(this.galleryActiveTab);
      if (currentTabIdx < tabs.length - 1) {
        this.galleryActiveTab = tabs[currentTabIdx + 1];
        this.galleryActiveIndex = 0;
      } else {
        // wrap to first tab first image
        this.galleryActiveTab = tabs[0];
        this.galleryActiveIndex = 0;
      }
    }
    this.galleryZoom = 1;
  }

  prevGalleryImage() {
    if (this.currentAlbum.length === 0) return;
    if (this.galleryActiveIndex > 0) {
      this.galleryActiveIndex--;
    } else {
      // auto go to previous tab last image
      const tabs = this.availableTabs;
      const currentTabIdx = tabs.indexOf(this.galleryActiveTab);
      if (currentTabIdx > 0) {
        this.galleryActiveTab = tabs[currentTabIdx - 1];
        this.galleryActiveIndex = this.currentAlbum.length - 1;
      } else {
        // wrap to last tab last image
        this.galleryActiveTab = tabs[tabs.length - 1];
        this.galleryActiveIndex = this.currentAlbum.length - 1;
      }
    }
    this.galleryZoom = 1;
  }

  get availableTabs(): string[] {
    const tabs: string[] = [];
    if (this.photoAlbum.length > 0) tabs.push('photos');
    if (this.layoutAlbum.length > 0) tabs.push('layout');
    if (this.videoAlbum.length > 0) tabs.push('video');
    return tabs;
  }

  // ===== Review Methods =====
  openReviewModal() {
    if (!this.is_token) {
      this.toastr.warning('Please login to write a review.');
      return;
    }
    const modal = new bootstrap.Modal(document.getElementById('WriteReview'));
    modal.show();
  }

  setReviewRating(n: number) {
    this.reviewFormData.ratings = n;
    this.reviewRatingError = false;
  }

  submitReview() {
    this.reviewTextError = !this.reviewFormData.review;
    this.reviewRatingError = this.reviewFormData.ratings === 0;
    if (this.reviewTextError || this.reviewRatingError) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.toastr.warning('Please login to write a review.');
      return;
    }

    const payload = {
      user_id: userId,
      review_id: this.singleproject.id,
      review: this.reviewFormData.review,
      ratings: this.reviewFormData.ratings,
    };
    this.http.post(`${this.apiUrl}storereview`, payload).subscribe(
      (response: any) => {
        if (response.isSuccess === true) {
          this.toastr.success('Review submitted successfully!');
          const modalEl = document.getElementById('WriteReview');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
          this.projectReviews.unshift({
            review: payload.review,
            ratings: payload.ratings,
            name: localStorage.getItem('name') || 'User',
            created_at: new Date().toISOString()
          });
          this.resetReviewForm();
        } else {
          this.toastr.error(response.message || 'Failed to submit review. Please try again.');
        }
      },
      (error) => { console.error('Error submitting review', error); }
    );
  }

  resetReviewForm() {
    this.reviewFormData = { review: '', ratings: 0 };
    this.reviewTextError = false;
    this.reviewRatingError = false;
    this.hoveredReviewRating = 0;
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.galleryImages.length - 1;
    }
  }


  openGallery() {
    this.showViewer = true;
  }


  // toggleShowMore(category: string): void {
  //   this.showMore[category] = !this.showMore[category];
  // }

  openReelsView(index: number = 0) {
    this.activeReelIndex = index;
    this.showReelsView = true;
    this.showReelComments = false;
    this.showReelDetailCard = false;
    document.body.style.overflow = 'hidden';
    this.updateSanitizedReelUrl();
  }

  closeReelsView() {
    this.showReelsView = false;
    this.showReelDetailCard = false;
    document.body.style.overflow = '';
    const urlWithoutParams = window.location.pathname;
    window.history.replaceState({}, '', urlWithoutParams);
  }

  openContactModalFromReels() {
    const modalEl = document.getElementById('get-builder');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  toggleReelDetailCard() {
    this.showReelDetailCard = !this.showReelDetailCard;
    if (this.showReelDetailCard) {
      this.showFilters = false;
    }
  }

  viewPropertyFromReel() {
    this.closeReelsView();
    setTimeout(() => {
      this.scrollToSection('overview');
    }, 100);
  }

  nextReel(): void {
    if (this.activeReelIndex < this.reels.length - 1) {
      this.activeReelIndex++;
      this.updateSanitizedReelUrl();
    }
  }

  previousReel(): void {
    if (this.activeReelIndex > 0) {
      this.activeReelIndex--;
      this.updateSanitizedReelUrl();
    }
  }

  toggleReelsLike(index: number) {
    this.reelsLikedStates[index] = !this.reelsLikedStates[index];
    if (this.reelsLikedStates[index]) {
      this.reelsLikesCount[index]++;
      this.toastr.success('Added to favorites');
    } else {
      this.reelsLikesCount[index]--;
    }
  }

  toggleReelsMute() {
    this.isReelsMuted = !this.isReelsMuted;
    this.updateSanitizedReelUrl();
  }

  shareReel(index: number) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?reels=true&reel=${index}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.toastr.success('Reel link copied to clipboard!');
      }, () => {
        this.toastr.error('Failed to copy link.');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.toastr.success('Reel link copied to clipboard!');
      } catch (err) {
        this.toastr.error('Failed to copy link.');
      }
      document.body.removeChild(textArea);
    }
  }

  getSanitizedVideoUrl(url: string): SafeResourceUrl {
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      }
      if (videoId === 'example1' || videoId === 'example2' || videoId === 'example3' || videoId === 'example4' || videoId === 'example5' || videoId === 'example6') {
        const dummyVideoIds = ['g9_VwacuNU8', '9DR3CqVgvgk', 'Oo_KUGQ7QjI', 'aqz-KE-bpKQ', '3PQm-JcpnaA', 'kYJ40_7i1sQ'];
        const idx = parseInt(videoId.replace('example', ''), 10) - 1;
        videoId = dummyVideoIds[idx >= 0 && idx < dummyVideoIds.length ? idx : 0];
      }
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${this.isReelsMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  updateSanitizedReelUrl(): void {
    if (this.reels && this.reels[this.activeReelIndex]) {
      const reel = this.reels[this.activeReelIndex];
      // Only sanitize for YouTube iframe; local mp4 uses [src] directly on <video>
      if (reel.proj_video_link) {
        this.currentSanitizedVideoUrl = this.getSanitizedVideoUrl(reel.proj_video_link);
      } else {
        this.currentSanitizedVideoUrl = null;
      }
    } else {
      this.currentSanitizedVideoUrl = null;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showReelsView) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.previousReel();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.nextReel();
      } else if (event.key === 'Escape') {
        this.closeReelsView();
      }
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndY = event.changedTouches[0].clientY;

    const swipeDistance = this.touchStartY - this.touchEndY;

    // Swipe Up → Next Reel
    if (swipeDistance > 50) {
      this.nextReel();
    }

    // Swipe Down → Previous Reel
    if (swipeDistance < -50) {
      this.previousReel();
    }
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const now = Date.now();
    if (now - this.lastReelSwitchTime < 800) {
      return;
    }
    if (event.deltaY > 30) {
      this.nextReel();
      this.lastReelSwitchTime = now;
    } else if (event.deltaY < -30) {
      this.previousReel();
      this.lastReelSwitchTime = now;
    }
  }

  @HostListener('click', ['$event'])
  onComponentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('read-more-link')) {
      event.preventDefault();
      const toggleType = target.getAttribute('data-toggle');
      if (toggleType === 'about') {
        this.isAboutExpanded = !this.isAboutExpanded;
      } else if (toggleType === 'why') {
        this.isWhyBuyExpanded = !this.isWhyBuyExpanded;
      }
    }
  }

  togglePriceTooltip(event: MouseEvent): void {
    event.stopPropagation();
    this.priceTooltipVisible = !this.priceTooltipVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && !target.closest('.price-tooltip-container')) {
      this.priceTooltipVisible = false;
    }
  }

  getProcessedHtml(html: string, isAbout: boolean): string {
    if (!html) return '';

    const wordLimit = 150;
    const isExpanded = isAbout ? this.isAboutExpanded : this.isWhyBuyExpanded;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || '';
    const words = plainText.split(/\s+/).filter(w => w.length > 0);

    if (words.length <= wordLimit) {
      return html;
    }

    let processedDoc = doc;
    if (!isExpanded) {
      processedDoc = this.truncateHtmlToWords(html, wordLimit);
    }

    const anchor = processedDoc.createElement('a');
    anchor.className = 'read-more-link';
    anchor.style.cursor = 'pointer';
    anchor.style.fontWeight = '600';
    anchor.style.color = '#ef3f23';
    anchor.style.marginLeft = '5px';
    anchor.style.textDecoration = 'none';
    anchor.setAttribute('data-toggle', isAbout ? 'about' : 'why');
    anchor.innerText = isExpanded ? 'Read Less' : '...Read More';

    this.appendToLastElement(processedDoc.body, anchor);

    return processedDoc.body.innerHTML;
  }

  truncateHtmlToWords(html: string, limit: number): Document {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let wordCount = 0;

    function traverse(node: Node): boolean {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || '';
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (wordCount + words.length >= limit) {
          const remaining = limit - wordCount;
          let currentWordIndex = 0;
          let charIndex = 0;
          while (currentWordIndex < remaining && charIndex < text.length) {
            while (charIndex < text.length && /\s/.test(text[charIndex])) {
              charIndex++;
            }
            if (charIndex === text.length) break;
            while (charIndex < text.length && !/\s/.test(text[charIndex])) {
              charIndex++;
            }
            currentWordIndex++;
          }
          node.nodeValue = text.substring(0, charIndex);
          wordCount = limit;
          return true;
        } else {
          wordCount += words.length;
        }
      } else {
        const children = Array.from(node.childNodes);
        for (const child of children) {
          const stop = traverse(child);
          if (stop) {
            let sibling = child.nextSibling;
            while (sibling) {
              const next = sibling.nextSibling;
              node.removeChild(sibling);
              sibling = next;
            }
            return true;
          }
        }
      }
      return false;
    }

    traverse(doc.body);
    return doc;
  }

  appendToLastElement(parent: Node, elementToAppend: HTMLElement): void {
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
    if (parent.hasChildNodes()) {
      const childNodes = Array.from(parent.childNodes);
      for (let i = childNodes.length - 1; i >= 0; i--) {
        const child = childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tagName = (child as HTMLElement).tagName.toLowerCase();
          if (!voidElements.includes(tagName)) {
            this.appendToLastElement(child, elementToAppend);
            return;
          }
        } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue && child.nodeValue.trim().length > 0) {
          parent.appendChild(elementToAppend);
          return;
        }
      }
    }
    parent.appendChild(elementToAppend);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.showReelDetailCard = false;
    }
  }

  resetFilters(): void {
    this.selectedSegments = [];
    this.selectedPropertyTypes = [];
    this.selectedBHKs = [];
  }

  selectSegment(segment: string): void {
    const index = this.selectedSegments.indexOf(segment);
    if (index > -1) {
      this.selectedSegments.splice(index, 1);
    } else {
      this.selectedSegments.push(segment);
    }
  }

  selectPropertyType(type: string): void {
    const index = this.selectedPropertyTypes.indexOf(type);
    if (index > -1) {
      this.selectedPropertyTypes.splice(index, 1);
    } else {
      this.selectedPropertyTypes.push(type);
    }
  }

  selectBHK(bhk: string): void {
    const index = this.selectedBHKs.indexOf(bhk);
    if (index > -1) {
      this.selectedBHKs.splice(index, 1);
    } else {
      this.selectedBHKs.push(bhk);
    }
  }

  isSegmentSelected(segment: string): boolean {
    return this.selectedSegments.includes(segment);
  }

  isPropertyTypeSelected(type: string): boolean {
    return this.selectedPropertyTypes.includes(type);
  }

  isBHKSelected(bhk: string): boolean {
    return this.selectedBHKs.includes(bhk);
  }

  fetchCities() {
    this.http.get<{ data: { id: number; name: string }[] }>(`${environment.apiUrl}cities`).subscribe(
      (response: any) => {
        response.responseData = response.responseData.filter((city: { id: number; name: string }) => FilteredCities.includes(city.name));
        this.city1 = response.responseData.map((city: any) => ({
          cid: city.id,
          cname: city.name
        }));
      },
      (error: any) => {
        console.error('API Error:', error);
      }
    );
  }

  checkScrollPosition() {
    const el = this.slider.nativeElement;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    this.isAtEnd = el.scrollLeft >= (maxScrollLeft - 5);
  }

  backToLogin() {
    this.brochureOtpVisible = false;
    this.brochureRegisterVisible = false;
    this.brochureOtp = ['', '', '', ''];
  }

  goToSignUp() {
    this.router.navigate(['/registration']);
  }

  closeLoginModal() {
    this.brochureOtpVisible = false;
    this.brochureRegisterVisible = false;
    const modalEl = document.getElementById('get-builder');
    if (modalEl) {
      const bootstrapModal = bootstrap.Modal.getInstance(modalEl);
      if (bootstrapModal) {
        bootstrapModal.hide();
      } else {
        const newModal = new bootstrap.Modal(modalEl);
        newModal.hide();
      }
    }
  }

  openOtpModal(action: "view-contact" | "whatsapp" | "schedule-visit" | "brochure"): void {
    this.selectedAction = action;
  }

  downloadBrochureDirectly() {
    this.selectedAction = 'brochure';
    // Prefill formDataphone from localStorage
    this.formDataphone.contactusername = localStorage.getItem('name') || '';
    this.formDataphone.contactuseremail = localStorage.getItem('email') || '';
    this.formDataphone.contactcontact_no = localStorage.getItem('contact_no') || '';
    this.formDataphone.termsContactAccepted = true;

    // Submit inquiry
    this.submitFormPhone();

    // Open brochure PDF
    const pdfUrl = this.singleproject?.project_brochure;
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      this.toastr.success('Opening brochure...');
    } else {
      this.toastr.warning('Brochure is not available.');
    }
  }

  registerAndDownloadBrochure() {
    this.brochureNameError = !this.brochureFormData.name || this.brochureFormData.name.trim().length < 3;
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    this.brochureEmailError = !this.brochureFormData.email || !emailPattern.test(this.brochureFormData.email);

    if (this.brochureNameError || this.brochureEmailError) {
      return;
    }

    this.spinner.show();

    // Store inquiry
    const payload = {
      contact_no: this.brochureFormData.mobile,
      useremail: this.brochureFormData.email || '',
      username: this.brochureFormData.name,
      project_Id: this.singleproject.id,
      builder_id: '',
      leads_type: 'Project',
      leads_for: this.singleproject.property_for,
      receiver_user_id: this.singleproject.user_id,
      countrycode: '',
      request_price: 0,
    };

    this.http.post(`${this.apiUrl}storeinquiry`, payload).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response.status === true) {
          this.activityTrackerService.logActivity('Inquiry stored for project', '');
          this.toastr.success('Inquiry stored successfully.');

          // Save details locally and establish login session with all keys
          if (response.data && response.data.token) {
            localStorage.setItem('myrealtylogintoken', response.data.token);
            localStorage.setItem('userId', response.data.id || response.data.userId || '');
            localStorage.setItem('email', response.data.email || this.brochureFormData.email || '');
            localStorage.setItem('contact_no', response.data.contact_no || this.brochureFormData.mobile || '');
            localStorage.setItem('role', response.data.role || 'user');
            localStorage.setItem('name', response.data.name || this.brochureFormData.name || '');
            localStorage.setItem('sessionId', response.data.sessionId || '');
          } else {
            localStorage.setItem('myrealtylogintoken', 'registered_guest_token');
            localStorage.setItem('userId', 'guest_user_id');
            localStorage.setItem('email', this.brochureFormData.email || '');
            localStorage.setItem('contact_no', this.brochureFormData.mobile || '');
            localStorage.setItem('role', 'user');
            localStorage.setItem('name', this.brochureFormData.name || '');
            localStorage.setItem('sessionId', 'guest_session_id');
          }
          this.is_token = true;

          // Close modal
          this.closeLoginModal();

          // Open brochure PDF
          if (this.selectedAction === 'brochure') {
            const pdfUrl = this.singleproject?.project_brochure;
            if (pdfUrl) {
              window.open(pdfUrl, '_blank');
            } else {
              this.toastr.warning('Brochure is not available.');
            }
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } else if (this.selectedAction === 'view-contact') {
            this.showContactDetails = true;
          } else if (this.selectedAction === 'whatsapp') {
            this.redirectToWhatsApp();
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } else if (this.selectedAction === 'schedule-visit') {
            this.openScheduleVisitModal();
          }
        } else {
          this.toastr.error('Failed to submit enquiry.');
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error('Error submitting enquiry.');
      }
    );
  }

  handleContactClick() {
    this.showContactDetails = !this.showContactDetails;
    if (this.showContactDetails) {
      this.formDataphone.contactusername = localStorage.getItem('name') || '';
      this.formDataphone.contactuseremail = localStorage.getItem('email') || '';
      this.formDataphone.contactcontact_no = localStorage.getItem('contact_no') || '';
      this.formDataphone.termsContactAccepted = true;
      this.submitFormPhone();
    }
  }

  formatContactNumber(num: any): string {
    if (!num) return '';
    let clean = String(num).replace(/\s+/g, '').replace(/-/g, '');
    if (clean.length === 10) {
      return '+91 ' + clean;
    }
    if (clean.length === 12 && clean.startsWith('91')) {
      return '+' + clean.slice(0, 2) + ' ' + clean.slice(2);
    }
    if (clean.startsWith('+91') && clean.length === 13) {
      return clean.slice(0, 3) + ' ' + clean.slice(3);
    }
    return num;
  }

  redirectToWhatsApp() {
    this.formDataphone.contactusername = localStorage.getItem('name') || '';
    this.formDataphone.contactuseremail = localStorage.getItem('email') || '';
    this.formDataphone.contactcontact_no = localStorage.getItem('contact_no') || '';
    this.formDataphone.termsContactAccepted = true;
    this.submitFormPhone();

    const contactNo = this.singleproject?.project_contact_no;
    if (contactNo) {
      let clean = String(contactNo).replace(/\D/g, '');
      if (clean.length === 10) {
        clean = '91' + clean;
      }
      const message = encodeURIComponent(`Hi, I'm interested in the project "${this.singleproject?.project_name}" on RealtyMart.`);
      const whatsappUrl = `https://wa.me/${clean}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      this.toastr.warning('WhatsApp number is not available.');
    }
  }

  openScheduleVisitModal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.scheduleVisitData.visitDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    this.scheduleVisitData.remarks = '';
    this.scheduleVisitDateTimeError = false;

    const modalEl = document.getElementById('schedule-visit-modal');
    if (modalEl) {
      const bootstrapModal = new bootstrap.Modal(modalEl);
      bootstrapModal.show();
    }
  }

  closeScheduleVisitModal() {
    const modalEl = document.getElementById('schedule-visit-modal');
    if (modalEl) {
      const bootstrapModal = bootstrap.Modal.getInstance(modalEl);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  submitScheduleVisit() {
    this.scheduleVisitDateTimeError = !this.scheduleVisitData.visitDateTime;
    if (this.scheduleVisitDateTimeError) {
      return;
    }

    this.spinner.show();

    const payload = {
      contact_no: localStorage.getItem('contact_no') || '',
      useremail: localStorage.getItem('email') || '',
      username: localStorage.getItem('name') || '',
      project_Id: this.singleproject.id,
      builder_id: '',
      leads_type: 'Project',
      leads_for: this.singleproject.property_for,
      receiver_user_id: this.singleproject.user_id,
      countrycode: '',
      request_price: 0,
      visit_date_time: this.scheduleVisitData.visitDateTime,
      remarks: this.scheduleVisitData.remarks || '',
    };

    const token = localStorage.getItem('myrealtylogintoken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');

    this.http.post(`${this.apiUrl}storeinquiry`, payload, { headers }).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response.status === true) {
          this.activityTrackerService.logActivity('Schedule Visit Inquiry stored', '');
          this.toastr.success('Visit scheduled successfully!');
          this.closeScheduleVisitModal();
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          this.toastr.error('Failed to schedule visit. Please try again.');
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error('Error scheduling visit.');
      }
    );
  }
}
