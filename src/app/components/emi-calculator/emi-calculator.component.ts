import { Component, Input, OnInit } from '@angular/core';
import { Options, LabelType } from 'ngx-slider-v2';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-emi-calculator',
  templateUrl: './emi-calculator.component.html',
  styleUrls: ['./emi-calculator.component.css']
})
export class EmiCalculatorComponent implements OnInit {

  filters: any;

  pemi = {
    value: 25
  };
  remi = {
    value: 8.5
  };

  temi = {
    value: 20
  };
  memi = {
    value: 240
  };

  query = {
    amount: "",
    interest: "",
    tenureYr: "",
    tenureMo: ""
  };

  result = {
    emi: "",
    interest: "",
    total: ""
  };

  yrToggel: boolean = true;

  poptions: Options = {
    floor: 0,
    ceil: 800,
    translate: (value: number, label: LabelType): string => {
      return value + '<b>L</b>';
    }
  };

  roptions: Options = {
    floor: 1,
    ceil: 20,
    step: 0.1,
    translate: (value: number, label: LabelType): string => {
      return value + '<b>%</b>';
    }
  };

  toptions: Options = {
    floor: 1,
    ceil: 30,
    translate: (value: number, label: LabelType): string => {
      return value + '<b>Yr</b>';
    }
  };

  moptions: Options = {
    floor: 1,
    ceil: 360,
    translate: (value: number, label: LabelType): string => {
      return value + '<b>Mo</b>';
    }
  };

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private seoService:SeoService
  ) {
    this.yrToggel = true;
    this.setMetaTags(
      'Investment Hotspot in RealtyMart',
      '',
    );
  }

  ngOnInit(): void {
    this.setHomeLoanSchema();
     this.seoService.setCanonicalURL(
    'https://www.realtymart.com/emi-calculator'
  );
  }


  setHomeLoanSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {
        "@type": "WebPage",

        "@id": "https://www.realtymart.com/home-loan-emi-calculator",

        "name": "Home Loan EMI Calculator | RealtyMart",

        "url": "https://www.realtymart.com/home-loan-emi-calculator",

        "description": "Calculate your Home Loan EMI instantly using RealtyMart's free Home Loan EMI Calculator.",

        "mainEntity": {
          "@id": "https://www.realtymart.com/home-loan-emi-calculator#calculator"
        }

      },

      {

        "@type": "WebApplication",

        "@id": "https://www.realtymart.com/home-loan-emi-calculator#calculator",

        "name": "Home Loan EMI Calculator",

        "applicationCategory": "FinanceApplication",

        "operatingSystem": "Web",

        "url": "https://www.realtymart.com/home-loan-emi-calculator",

        "description": "A free online calculator to estimate monthly home loan EMI, total interest payable and total repayment amount."

      },

      {

        "@type": "FinancialProduct",

        "name": "Home Loan",

        "category": "Home Loan",

        "provider": {

          "@type": "Organization",

          "name": "Intelliworkz Business Solutions Pvt. Ltd.",

          "brand": {

            "@type": "Brand",

            "name": "RealtyMart"

          }

        }

      }

    ]

  };

  this.seoService.setSchema(schema);

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

  ngAfterViewInit() {
    this.update();
  }

  tbupdate(id: number) {
    if (id === 0) {
      this.pemi.value = Number(this.query.amount) / 100000;
    } else if (id === 1) {
      // this.remi.value = parseFloat(this.query.interest);
      let interestValue = parseFloat(this.query.interest);
      if (isNaN(interestValue) || interestValue <= 1) {
        interestValue = 1;
        this.query.interest = interestValue.toString();
        this.remi.value = 1;
      } else {
        this.remi.value = interestValue;
      }
    } else if (id === 2) {
      this.temi.value = parseFloat(this.query.tenureYr);
    } else if (id === 3) {
      this.memi.value = parseFloat(this.query.tenureMo);
    }
    this.update();
  }
  update() {
    const loanAmount = this.pemi.value * 100000;
    const numberOfMonths = this.yrToggel ? this.temi.value * 12 : this.memi.value;
    const rateOfInterest = this.remi.value;
    const monthlyInterestRatio = (rateOfInterest / 100) / 12;

    this.query.amount = loanAmount.toString();
    this.query.interest = rateOfInterest.toString();
    if (this.yrToggel) {
      this.query.tenureYr = this.temi.value.toString();
    } else {
      this.query.tenureMo = this.memi.value.toString();
    }

    const top = Math.pow((1 + monthlyInterestRatio), numberOfMonths);
    const bottom = top - 1;
    const sp = top / bottom;
    const emi = (loanAmount * monthlyInterestRatio) * sp;
    const full = numberOfMonths * emi;
    const interest = full - loanAmount;
    const int_pge = (interest / full) * 100;

    this.result.emi = emi.toFixed(0).replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const loanAmount_str = loanAmount.toFixed(0).replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    this.result.total = full.toFixed(0).replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    this.result.interest = interest.toFixed(0).replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
