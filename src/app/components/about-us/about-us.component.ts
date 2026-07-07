import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {

  constructor(private seoService:SeoService){}

ngOnInit(): void {
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
