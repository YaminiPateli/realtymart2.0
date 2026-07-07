import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor(private seoService:SeoService){}

  ngOnInit(): void {
  this.setContactSchema();
}
setContactSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {
        "@type": "ContactPage",

        "@id": "https://www.realtymart.com/contact-us",

        "name": "Contact Us | RealtyMart",

        "url": "https://www.realtymart.com/contact-us",

        "description": "Contact RealtyMart for property buying, selling, renting and property-related services.",

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

        "contactPoint": {

          "@type": "ContactPoint",

          "telephone": "+91-7378373783",

          "contactType": "customer service",

          "email": "hello@realtymart.com",

          "availableLanguage": [
            "English",
            "Hindi",
            "Gujarati"
          ]

        },

        "address": {

          "@type": "PostalAddress",

          "streetAddress": "A401-412, World Trade Tower, Near BMW Showroom, SG Highway",

          "addressLocality": "Ahmedabad",

          "addressRegion": "Gujarat",

          "postalCode": "380051",

          "addressCountry": "IN"

        }

      }

    ]

  };

  this.seoService.setSchema(schema);

}
}
