import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {

  constructor(private seoService:SeoService, private metaService:Meta){}

ngOnInit(): void {
  this.seoService.setCanonicalURL(
    'https://www.realtymart.com/about-us'
  );
  this.metaService.updateTag({
    name: 'description',
    content:
      'Learn about RealtyMart, our mission, vision, and comprehensive real estate services. We help buyers, sellers, investors, and property owners make informed real estate decisions.'
  });

  // Open Graph Tags
  this.metaService.updateTag({
    property: 'og:title',
    content: 'About RealtyMart | Trusted Real Estate Company in India'
  });

  this.metaService.updateTag({
    property: 'og:description',
    content:
      'Discover RealtyMart, your trusted real estate partner offering property buying, selling, renting, investment consultation, legal assistance, and property management services.'
  });

  this.metaService.updateTag({
    property: 'og:url',
    content: 'https://www.realtymart.com/about-us'
  });

  this.metaService.updateTag({
    property: 'og:type',
    content: 'website'
  });

  this.metaService.updateTag({
    property: 'og:site_name',
    content: 'RealtyMart'
  });

  this.metaService.updateTag({
    property: 'og:locale',
    content: 'en_IN'
  });
  this.setAboutSchema();
}

setAboutSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {
        "@type": "AboutPage",

        "@id": "https://www.realtymart.com/about-us",

        "name": "About Us | RealtyMart",

        "url": "https://www.realtymart.com/about-us",

        "description": "Learn about RealtyMart, our mission, vision, and comprehensive real estate services for buyers, sellers, investors, and property owners.",

        "mainEntity": {
          "@id": "https://www.realtymart.com/#organization"
        }
      },

      {
        "@type": "Organization",

        "@id": "https://www.realtymart.com/#organization",

        "name": "Intelliworkz Business Solutions Pvt. Ltd.",

        "brand": {
          "@type": "Brand",
          "name": "RealtyMart"
        },

        "url": "https://www.realtymart.com",

        "logo": "https://www.realtymart.com/assets/images/logo.png",

        "description": "RealtyMart is a comprehensive real estate platform that helps users buy, sell, rent, and manage properties while providing property-related professional services.",

        "knowsAbout": [
          "Real Estate",
          "Property Buying",
          "Property Selling",
          "Property Rental",
          "Property Management",
          "Investment Consultation",
          "Legal Assistance",
          "Home Loans"
        ]

      }

    ]

  };

  this.seoService.setSchema(schema);

}

}
