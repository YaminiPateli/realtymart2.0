import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SeoService } from 'src/app/seo.service';

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


  constructor(private seoService:SeoService) { }

  ngOnInit(): void {
     this.seoService.setCanonicalURL(
    'https://www.realtymart.com/project-plan'
  );
    this.selectedPlan =
      this.plans.find(plan => plan.recommended) || this.plans[0];
    this.scrollToSelectedPlan();
    this.setPricingSchema();
  }

setPricingSchema() {

  const offers = this.plans.map((plan: any) => ({
    "@type": "Offer",
    "name": plan.name,
    "price": plan.price,
    "priceCurrency": "INR",
    "description": `Subscription plan for properties up to ${plan.range}. Includes ${plan.leads} leads per month.`,
    "availability": "https://schema.org/InStock",
    "eligibleRegion": {
      "@type": "Place",
      "name": "Gujarat"
    }
  }));

  const webPage = {
    "@type": "WebPage",
    "@id": "https://www.realtymart.com/pricing",
    "url": "https://www.realtymart.com/pricing",
    "name": "Pricing Plans | RealtyMart",
    "description": "Compare RealtyMart subscription plans designed to help builders and property owners generate quality leads and promote their projects.",
    "mainEntity": {
      "@id": "https://www.realtymart.com/pricing#catalog"
    }
  };

  const service = {
    "@type": "Service",
    "@id": "https://www.realtymart.com/pricing#service",
    "name": "Real Estate Marketing Subscription",
    "serviceType": "Property Marketing",
    "provider": {
      "@type": "Organization",
      "name": "Intelliworkz Business Solutions Pvt. Ltd.",
      "brand": {
        "@type": "Brand",
        "name": "RealtyMart"
      }
    }
  };

  const offerCatalog = {
    "@type": "OfferCatalog",
    "@id": "https://www.realtymart.com/pricing#catalog",
    "name": "RealtyMart Pricing Plans",
    "itemListElement": offers
  };

  const faqPage = {
    "@type": "FAQPage",
    "mainEntity": this.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]+>/g, "")
      }
    }))
  };

  const schema: any = {
    "@context": "https://schema.org",
    "@graph": [
      webPage,
      service,
      offerCatalog
    ]
  };

  // Add FAQ schema only if FAQs exist
  if (this.faqs && this.faqs.length > 0) {
    schema["@graph"].push(faqPage);
  }

  this.seoService.setSchema(schema);
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

    const firstColumnWidth = 27;
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
