import { NgSelectModule } from '@ng-select/ng-select';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Fancybox } from '@fancyapps/ui';
import { ActivityTrackerService } from '../service/activitytracker.service';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';
declare var bootstrap: any;
@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.css'],
  standalone:true,
  imports:[NgSelectModule, CommonModule]
})
export class CareerComponent implements OnInit{
  private apiUrl: string = environment.apiUrl;
  currentPage: number = 1;
  lastPage: number = 1;
  isLoading: boolean = false;
  cityss: any;
  loading: boolean = false;
  careerCategoryList: any;
  careerList: any;


    constructor(
      private titleService: Title,
      private metaService: Meta,
      public http: HttpClient,
      private elementRef: ElementRef,
      private tost: ToastrService,
      private spinner: NgxSpinnerService,
      private activityTrackerService: ActivityTrackerService,
      private router: Router,
      private seoService:SeoService
    ) {
        this.loadCareer();
        this.loadCareerCategory();
    }

    ngOnInit(): void {
     this.seoService.setCanonicalURL(
    'https://www.realtymart.com/career'
  );
    }

    loadCareer() {
    this.http
      .get<any>(`${environment.apiUrl}careerlist`).subscribe(
        (response) => {
          this.careerList = response.data;
          this.setCareerSchema();
          this.setMetaTags(
            response.responseData.meta.title,
            response.responseData.meta.description
          );
        },
        (error) => {
          console.error('Error fetching career list:', error);
        }
      );
    }

    loadCareerCategory() {
    this.http.get<any>(`${environment.apiUrl}getcareercategory`).subscribe(
        (response) => {
          this.careerCategoryList = response.data;
        },
        (error) => {
          console.error('Error fetching career category list:', error);
        }
      );
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

  setCareerSchema() {

  const jobs = this.careerList.map((job: any, index: number) => ({

    "@type": "ListItem",

    "position": index + 1,

    "item": {

      "@type": "JobPosting",

      "title": job.career_name,

      "description": job.description || "",

      "employmentType": "FULL_TIME",

      "experienceRequirements": `${job.experience_range} Years`,

      "jobLocation": {

        "@type": "Place",

        "address": {

          "@type": "PostalAddress",

          "addressLocality": job.location,

          "addressCountry": "IN"

        }

      },

      "hiringOrganization": {

        "@type": "Organization",

        "name": "Intelliworkz Business Solutions Pvt. Ltd.",

        "sameAs": "https://www.realtymart.com",

        "logo": "https://www.realtymart.com/assets/images/logo.png"

      }

    }

  }));


  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "CollectionPage",

        "@id": "https://www.realtymart.com/career",

        "name": "Career | RealtyMart",

        "url": "https://www.realtymart.com/career",

        "description": "Explore current job openings at RealtyMart.",

        "mainEntity": {

          "@type": "ItemList",

          "numberOfItems": this.careerList.length,

          "itemListElement": jobs

        }

      }

    ]

  };

  this.seoService.setSchema(schema);

}


}
