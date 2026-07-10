import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css']
})
export class TermsConditionsComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private seoService:SeoService
  ) {
    this.setMetaTags(
      'Terms & Conditions in RealtyMart',
      '',
    );
    
  }

  ngOnInit(): void {
  this.seoService.setCanonicalURL(
    'https://www.realtymart.com/terms-conditions'
  );
    this.setTermsSchema()
  }

  setTermsSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "TermsOfService",

        "@id": "https://www.realtymart.com/terms-and-conditions",

        "name": "Terms & Conditions",

        "url": "https://www.realtymart.com/terms-and-conditions",

        "description": "Read the Terms & Conditions governing the use of RealtyMart website and services.",

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

        "@id": "https://www.realtymart.com/terms-and-conditions#webpage",

        "name": "Terms & Conditions | RealtyMart",

        "url": "https://www.realtymart.com/terms-and-conditions",

        "description": "Terms and Conditions for using RealtyMart and its services.",

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
