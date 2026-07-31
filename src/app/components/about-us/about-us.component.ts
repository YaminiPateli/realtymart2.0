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
 
}

}
