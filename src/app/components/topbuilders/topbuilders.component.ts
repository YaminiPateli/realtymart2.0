import { Component, OnInit } from '@angular/core';
import { TopbuilderslistingService } from '../service/topbuilderslisting.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-topbuilders',
  templateUrl: './topbuilders.component.html',
  styleUrls: ['./topbuilders.component.css']
})
export class TopbuildersComponent implements OnInit{

  topbuilderData: any; // Replace with the actual data type
  topbuilders: any = {}; // Replace with the actual data type
  keys: string[] = [];
  locationCookie: any;
  activeLocality: string = 'sg';
  topbuildersbase64: any;
  locationget: any;


  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private topbuildersService: TopbuilderslistingService,
    private seoService:SeoService
    ) {
      this.loadTopBuilders();
    }

    ngOnInit() {
      this.locationget = this.locationCookie = localStorage.getItem('location');
      this.seoService.setCanonicalURL(
    'https://www.realtymart.com/top-builders'
  );
    }

    trackCustomActivity() {
      this.router.navigate(['builder-detail/:id']);
    }
    loadTopBuilders(): void {
      const locationCookie = localStorage.getItem('location');
      if (!locationCookie) {
      console.log(locationCookie);
      this.topbuildersService.topbuilderget('Ahmedabad').subscribe((data) => {
        this.topbuilderData = data;
        this.topbuilders = this.topbuilderData?.responseData;
        this.setTopBuildersSchema();
        this.keys = Object.keys(this.topbuilders);
        // Initialize the active locality with the first key
        if (this.keys.length > 0) {
          this.activeLocality = this.keys[0];
        }

        this.setMetaTags(
          this.topbuilderData.meta.title,
          this.topbuilderData.meta.description,
        );
      });
    }
    else {
      console.log(locationCookie);
      this.topbuildersService.topbuilderget(locationCookie).subscribe((data) => {
        this.topbuilderData = data;
        this.topbuilders = this.topbuilderData?.responseData;
        this.setTopBuildersSchema();
        this.topbuildersbase64 = console.log(btoa("stringAngular2"));
        this.keys = Object.keys(this.topbuilders);
        // Initialize the active locality with the first key
        if (this.keys.length > 0) {
          this.activeLocality = this.keys[0];
        }
        this.setMetaTags(
          this.topbuilderData.meta.title,
          this.topbuilderData.meta.description,
        );
      });
    }
    }

    setTopBuildersSchema() {

  const builders: any[] = [];
  let position = 1;

  Object.keys(this.topbuilders).forEach(locality => {

    this.topbuilders[locality].forEach((builder: any) => {

      builders.push({

        "@type": "ListItem",

        "position": position++,

        "item": {

          "@type": "RealEstateAgent",

          "name": builder.name,

          "image": builder.builder_logo,

          "url": `https://www.realtymart.com/builder-detail/${builder.builderUrl}`,

          "address": {

            "@type": "PostalAddress",

            "addressLocality": locality,

            "addressRegion": this.locationget,

            "addressCountry": "IN"

          },

          "memberOf": {

            "@type": "Organization",

            "name": "Intelliworkz Business Solutions Pvt. Ltd.",

            "brand": {

              "@type": "Brand",

              "name": "RealtyMart"

            }

          }

        }

      });

    });

  });

  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "CollectionPage",

        "@id": window.location.href,

        "name": `Top Builders in ${this.locationget}`,

        "url": window.location.href,

        "description": `Explore top real estate builders in ${this.locationget}, including ongoing and completed projects across different localities.`,

        "mainEntity": {

          "@type": "ItemList",

          "numberOfItems": builders.length,

          "itemListElement": builders

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

    setActiveLocality(locality: string): void {
      this.activeLocality = locality;
    }
}
