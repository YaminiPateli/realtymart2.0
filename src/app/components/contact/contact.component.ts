import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  googleMapUrl:string = ""

  constructor(private seoService:SeoService, private metaService:Meta){}

  ngOnInit(): void {

    const query = `A401-412, Intelliworkz Business Solutions Pvt. Ltd, World Trade Tower, Nr. BMW Showroom, SG Highway, Ahmedabad - 380051 Gujarat - India.`;

    this.googleMapUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    this.seoService.setCanonicalURL(
    window.location.href
  );
  this.metaService.updateTag({
  name: 'description',
  content: 'Contact RealtyMart for property buying, selling, renting and real estate enquiries.'
});

this.metaService.updateTag({
  property: 'og:title',
  content: 'Contact RealtyMart | Get in Touch'
});

this.metaService.updateTag({
  property: 'og:description',
  content: 'Contact RealtyMart for property buying, selling, renting and real estate enquiries.'
});

this.metaService.updateTag({
  property: 'og:url',
  content: 'https://www.realtymart.com/contact'
});
}
}
