import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-property-valuation',
  templateUrl: './property-valuation.component.html',
  styleUrls: ['./property-valuation.component.css']
})
export class PropertyValuationComponent implements OnInit {

// TOP SLIDER
  slideConfig1 = {
    slidesToShow: 2,
    slidesToScroll: 2,
    dots: true,
    arrows: false,
    infinite: true,
    "autoplay": true,
    responsive: [
      {
        breakpoint: 1365,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  slideConfig2 = {
    slidesToShow: 2,
    slidesToScroll: 2,
    dots: true,
    arrows: false,
    infinite: true,
    "autoplay": true,
    responsive: [
      {
        breakpoint: 1365,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };


    constructor(
      private titleService: Title,
      private metaService: Meta,
      private seoService:SeoService
    ) {
        this.setMetaTags(
          'Property Valuation in RealtyMart',
          '',
            );
    }

    ngOnInit(): void {
      this.setPropertyValuationSchema();
      this.seoService.setCanonicalURL(
    'https://www.realtymart.com/property-valuation'
  );
    }

  setPropertyValuationSchema() {

    const schema = {

      "@context": "https://schema.org",

      "@graph": [

        {

          "@type": "WebPage",

          "@id": "https://www.realtymart.com/property-valuation",

          "name": "Property Valuation | RealtyMart",

          "url": "https://www.realtymart.com/property-valuation",

          "description": "Get an accurate property valuation from government-registered experts before buying or selling your property.",

          "mainEntity": {
            "@id": "https://www.realtymart.com/property-valuation#service"
          }

        },

        {

          "@type": "Service",

          "@id": "https://www.realtymart.com/property-valuation#service",

          "name": "Property Valuation",

          "serviceType": "Property Valuation",

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

          "description": "Professional property valuation service for residential, commercial and industrial properties by government-registered valuers."

        },

        {

          "@type": "FAQPage",

          "mainEntity": [

            {

              "@type": "Question",

              "name": "How to calculate the value of the property?",

              "acceptedAnswer": {

                "@type": "Answer",

                "text": "Property valuation professionals inspect the property, analyse market conditions and provide an accurate valuation report."

              }

            },

            {

              "@type": "Question",

              "name": "What is the fair market value of the property?",

              "acceptedAnswer": {

                "@type": "Answer",

                "text": "The fair market value is the estimated price at which a property would sell between a willing buyer and seller in the current market."

              }

            },

            {

              "@type": "Question",

              "name": "Services included in the home valuation process",

              "acceptedAnswer": {

                "@type": "Answer",

                "text": "The valuation process includes site inspection, property measurements, market analysis, legal verification and a detailed valuation report."

              }

            },

            {

              "@type": "Question",

              "name": "Types of property valuation methods",

              "acceptedAnswer": {

                "@type": "Answer",

                "text": "Common valuation methods include market comparison, income approach and cost approach depending on the property type."

              }

            },

            {

              "@type": "Question",

              "name": "Documents required for property valuation",

              "acceptedAnswer": {

                "@type": "Answer",

                "text": "Documents generally include ownership papers, property tax receipts, approved plans and identity proof."

              }

            }

          ]

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
