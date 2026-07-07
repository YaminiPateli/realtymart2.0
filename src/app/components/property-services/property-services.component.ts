import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PropertyservicesService } from '../service/propertyservices.service';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-property-services',
  templateUrl: './property-services.component.html',
  styleUrls: ['./property-services.component.css'],
})
export class PropertyServicesComponent implements OnInit, AfterViewInit {
  searchdata: string[] = [];
  propertyget: any;
  data: any;
  result: any;
  selectedService: string = '';

  constructor(private titleService: Title, private metaService: Meta, public http: HttpClient, private propertyservicesService: PropertyservicesService, private seoService:SeoService) {
    this.setMetaTags(
      'Property Services in RealtyMart',
      '',
    );
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
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

  ngOnInit(): void {
    this.fetchSportsData();
  }

  ngAfterViewInit(): void {
    this.seoService.setSchema({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Property Services | RealtyMart",
      "url": window.location.href,
      "description": "Explore property-related services including Architects, Interior Designers, Home Loan, Legal Services, Vastu Consultants and more.",
      "publisher": {
        "@type": "Organization",
        "name": "Intelliworkz Business Solutions Pvt. Ltd.",
        "brand": {
          "@type": "Brand",
          "name": "RealtyMart"
        }
      }
    });
  }

  fetchSportsData() {
    this.propertyservicesService.propertyget().subscribe((data) => {
      this.propertyget = data;
      this.result = this.propertyget['responseData'];
      this.searchdata = this.result.map((item: any) => item.name);
    });
  }

  onServiceSelect(event: any) {
    this.selectedService = event.value;
  }

}
