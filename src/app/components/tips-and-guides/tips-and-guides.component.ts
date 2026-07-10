import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-tips-and-guides',
  templateUrl: './tips-and-guides.component.html',
  styleUrls: ['./tips-and-guides.component.css']
})
export class TipsAndGuidesComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private seoService:SeoService
  ) {
    this.setMetaTags(
      'Tips & Guides in RealtyMart',
      '',
    );
  }

  ngOnInit(): void {
     this.setTipsGuideSchema();
      this.seoService.setCanonicalURL(
    'https://www.realtymart.com/tips-and-guides'
  );
  }

  setTipsGuideSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "WebPage",

        "@id": "https://www.realtymart.com/tips-and-guides",

        "url": "https://www.realtymart.com/tips-and-guides",

        "name": "Property Buying Tips & Guides | RealtyMart",

        "description": "Explore property buying tips, ROI advice, legal guidance, tax implications and real estate FAQs from RealtyMart.",

        "mainEntity": {
          "@id": "https://www.realtymart.com/tips-and-guides#faq"
        }

      },

      {

        "@type": "FAQPage",

        "@id": "https://www.realtymart.com/tips-and-guides#faq",

        "mainEntity": [

          {
            "@type": "Question",
            "name": "Is real estate a better option than the stock market?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Real estate offers tangible assets and relatively stable long-term appreciation, while stocks generally provide greater liquidity and potentially higher growth with higher volatility."
            }
          },

          {
            "@type": "Question",
            "name": "What percentage of income should a person invest in real estate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Experts generally recommend keeping total monthly home loan payments within approximately 30–35% of gross monthly income."
            }
          },

          {
            "@type": "Question",
            "name": "How should a first-time buyer decide a property budget?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Choose a property that fits your financial capacity and keep your EMI within an affordable percentage of your monthly income."
            }
          },

          {
            "@type": "Question",
            "name": "When should stamp duty be paid?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Stamp duty is generally payable whenever ownership of a property is transferred and is calculated according to applicable state regulations."
            }
          },

          {
            "@type": "Question",
            "name": "What factors affect a home loan EMI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Loan amount, loan tenure, interest rate and household income are the primary factors affecting monthly EMI."
            }
          },

          {
            "@type": "Question",
            "name": "What taxes are applicable while buying a property?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Taxes may include stamp duty, registration charges and GST for eligible under-construction properties."
            }
          },

          {
            "@type": "Question",
            "name": "What documents are required while buying a property?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Common documents include identity proof, address proof, PAN card, photographs and the sale agreement or title documents."
            }
          },

          {
            "@type": "Question",
            "name": "How can I verify whether a project has legal approvals?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Verify RERA registration where applicable, title documents, approved building plans, bank approvals, commencement certificate, occupancy certificate and other statutory approvals."
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
