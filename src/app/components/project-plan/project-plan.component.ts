import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-project-plan',
  templateUrl: './project-plan.component.html',
  styleUrls: ['./project-plan.component.css']
})
export class ProjectPlanComponent implements OnInit, AfterViewInit {
  @ViewChild('tableContainer')
  tableContainer!: ElementRef;

  isMobile = window.innerWidth <= 767;
  isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

  plans = [
    {
      id: 1,
      name: 'Affordable',
      price: 1.5,
      range: '1.5 CR',
      leads: 25,
      recommended: false,
      features: {
        propertyValue: 'Upto 1.5 Cr',
        monthlyLeads: '25',
        crmDashboard: true,
        instagramReels: '1 Reel',
        dedicatedBlogs: false,
        detailedProjectVideo: '✖',
        influencerVideo: '✖',
        droneShotVideo: '✖'
      }
    },
    {
      id: 2,
      name: 'Premium',
      price: 2.5,
      range: '1.5 to 3 CR',
      leads: 30,
      recommended: true,
      features: {
        propertyValue: '1.5 - 3 Cr',
        monthlyLeads: '30',
        crmDashboard: true,
        instagramReels: '2 Reels',
        dedicatedBlogs: true,
        detailedProjectVideo: '1 Video',
        influencerVideo: '1 Video',
        droneShotVideo: '✖'
      }
    },
    {
      id: 3,
      name: 'Luxury',
      price: 4.0,
      range: '3 to 6 CR',
      leads: 20,
      recommended: false,
      features: {
        propertyValue: '3 - 6 Cr',
        monthlyLeads: '20',
        crmDashboard: true,
        instagramReels: '3 Reels',
        dedicatedBlogs: true,
        detailedProjectVideo: '2 Videos',
        influencerVideo: '2 Videos',
        droneShotVideo: '1 Video'
      }
    },
    {
      id: 4,
      name: 'Ultra Luxury',
      price: 7.0,
      range: '6 to 15 CR',
      leads: 10,
      recommended: false,
      features: {
        propertyValue: '6 - 15 Cr',
        monthlyLeads: '10',
        crmDashboard: true,
        instagramReels: '4 Reels',
        dedicatedBlogs: true,
        detailedProjectVideo: '2 Videos',
        influencerVideo: '2 Videos',
        droneShotVideo: '2 Videos'
      }
    }
  ];

  selectedPlan: any;

  faqs = [
    {
      question: 'How are leads generated?',
      answer:
        'Leads are generated through digital marketing campaigns, property listings, and targeted promotions.'
    },
    {
      question: 'Can I upgrade my plan later?',
      answer:
        'Yes, you can upgrade to a higher package at any time by paying the difference amount.'
    },
    {
      question: 'What is the package validity?',
      answer:
        'All packages remain active for 12 months from the date of activation.'
    },
    {
      question: 'Do unused leads carry forward?',
      answer:
        'No, unused monthly leads cannot be carried forward to the next month.'
    },
    {
      question: 'Is GST included?',
      answer:
        'No, GST will be charged separately as per government regulations.'
    }
  ];


  constructor() { }

  ngOnInit(): void {
    this.selectedPlan =
      this.plans.find(plan => plan.recommended) || this.plans[0];
    this.scrollToSelectedPlan();
  }

  ngAfterViewInit() {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        this.scrollToSelectedPlan();
      }, 300);
    }
  }

  scrollToSelectedPlan() {
    const planIndex = this.plans.findIndex(
      p => p.id === this.selectedPlan.id
    );

    const firstColumnWidth = 20;
;
    const planColumnWidth = 183;

    this.tableContainer.nativeElement.scrollTo({
      left: firstColumnWidth + (planIndex * planColumnWidth),
      behavior: 'smooth'
    });
  }

  selectPlan(plan: any) {
    this.selectedPlan = plan;
    this.scrollToSelectedPlan();
    if(this.isMobile || this.isTablet ){
      setTimeout(() => {
        this.tableContainer.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    }
  }
  isSelected(plan: any): boolean {
    return this.selectedPlan?.id === plan.id;
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 767;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
  }

  getPriceSectionMargin(plan: any): string {
    if (!this.isSelected(plan)) {
      return 'auto';
    }
    return '59px';
  }


}
