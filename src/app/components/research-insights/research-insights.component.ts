import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-research-insights',
  templateUrl: './research-insights.component.html',
  styleUrls: ['./research-insights.component.css']
})
export class ResearchInsightsComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private seoService:SeoService
  ) {
    this.setMetaTags(
      'Research Insights in RealtyMart',
      '',
    );
  }
ngOnInit(): void {
   this.setResearchInsightsSchema();
}
setResearchInsightsSchema() {

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "CollectionPage",

        "@id": "https://www.realtymart.com/research-insights",

        "url": "https://www.realtymart.com/research-insights",

        "name": "Research Insights | RealtyMart",

        "description": "Explore the latest real estate market reports, housing trends, research insights and property market analysis from RealtyMart.",

        "publisher": {
          "@type": "Organization",
          "name": "Intelliworkz Business Solutions Pvt. Ltd.",
          "brand": {
            "@type": "Brand",
            "name": "RealtyMart"
          },
          "url": "https://www.realtymart.com"
        },

        "mainEntity": {
          "@type": "ItemList",

          "numberOfItems": 1,

          "itemListElement": [

            {

              "@type": "ListItem",

              "position": 1,

              "item": {

                "@type": "Article",

                "headline": "How India Searched For Homes in 2023",

                "description": "The Indian housing market continued its growth trajectory in 2023. Mumbai Metropolitan Region (MMR), National Capital Region (NCR) and Bengaluru emerged as the top cities in terms of property searches.",

                "image": "https://www.realtymart.com/assets/images/reserch_mg.jpg",

                "publisher": {

                  "@type": "Organization",

                  "name": "Intelliworkz Business Solutions Pvt. Ltd.",

                  "brand": {

                    "@type": "Brand",

                    "name": "RealtyMart"

                  }

                }

              }

            }

          ]

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
