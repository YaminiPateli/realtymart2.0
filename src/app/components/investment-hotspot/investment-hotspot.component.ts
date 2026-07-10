import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-investment-hotspot',
  templateUrl: './investment-hotspot.component.html',
  styleUrls: ['./investment-hotspot.component.css']
})
export class InvestmentHotspotComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private seoService: SeoService
  ) {
    this.setMetaTags(
      'Investment Hotspot in RealtyMart',
      '',
    );
  }

  ngOnInit(): void {
    this.setInvestmentAdviceSchema();
     this.seoService.setCanonicalURL(
    'https://www.realtymart.com/investment-hotspot'
  );
  }

  setInvestmentAdviceSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "WebPage",

        "@id": "https://www.realtymart.com/investment-hotspot",

        "url": "https://www.realtymart.com/investment-hotspot",

        "name": "Investment Hotspot | RealtyMart",

        "description": "Get free property investment advice from RealtyMart's experienced property advisors. Receive expert guidance before buying your next property.",

        "mainEntity": {
          "@id": "https://www.realtymart.com/investment-hotspot#service"
        }

      },

      {

        "@type": "Service",

        "@id": "https://www.realtymart.com/investment-hotspot#service",

        "name": "Property Investment Advisory",

        "serviceType": "Real Estate Investment Consultation",

        "description": "Receive free expert guidance on property investment, project selection, builder information, locality insights and home buying decisions.",

        "provider": {

          "@type": "Organization",

          "name": "Intelliworkz Business Solutions Pvt. Ltd.",

          "brand": {

            "@type": "Brand",

            "name": "RealtyMart"

          },

          "url": "https://www.realtymart.com"

        },

        "areaServed": {

          "@type": "Country",

          "name": "India"

        },

        "availableChannel": {

          "@type": "ServiceChannel",

          "serviceUrl": "https://www.realtymart.com/investment-hotspot",

          "servicePhone": {

            "@type": "ContactPoint",

            "telephone": "+91-7378373783",

            "contactType": "customer support"

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
}
