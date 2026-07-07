import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit{
constructor(private seoService:SeoService){}
ngOnInit(): void {
  this.setPrivacyPolicySchema();
}

setPrivacyPolicySchema() {

  const schema = {
    "@context": "https://schema.org",
    "@graph": [

      {
        "@type": "PrivacyPolicy",
        "@id": "https://www.realtymart.com/privacy-policy",

        "name": "Privacy Policy",

        "url": "https://www.realtymart.com/privacy-policy",

        "description": "Read the Privacy Policy of RealtyMart to understand how personal information is collected, used, stored and protected.",

        "publisher": {
          "@type": "Organization",
          "name": "Intelliworkz Business Solutions Pvt. Ltd.",
          "brand": {
            "@type": "Brand",
            "name": "RealtyMart"
          }
        }
      },

      {
        "@type": "WebPage",

        "@id": "https://www.realtymart.com/privacy-policy#webpage",

        "name": "Privacy Policy | RealtyMart",

        "url": "https://www.realtymart.com/privacy-policy",

        "isPartOf": {
          "@type": "WebSite",
          "name": "RealtyMart",
          "url": "https://www.realtymart.com"
        }

      }

    ]
  };

  this.seoService.setSchema(schema);

}
}
