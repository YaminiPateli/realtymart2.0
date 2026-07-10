import { Component } from '@angular/core';
import { BuilderpropertylistingService } from '../service/builderpropertylisting.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-builder-property-listing',
  templateUrl: './builder-property-listing.component.html',
  styleUrls: ['./builder-property-listing.component.css']
})
export class BuilderPropertyListingComponent {

  allbuilderpropertyData:any;
  allbuilderpropertycount:any;
  allbuilderproperty:any = [];

  constructor(
    public http: HttpClient,
    private builderpropertylistingService: BuilderpropertylistingService,
    private route: ActivatedRoute,
    private seoService:SeoService
  ) {
    const builderId = this.route.snapshot.paramMap.get('id');
    const propertytype = this.route.snapshot.paramMap.get('type');
  }

  ngOnInit(): void {
    this.loadAllBuilders();
     const id = this.route.snapshot.paramMap.get('id');
  const type = this.route.snapshot.paramMap.get('type');

  this.seoService.setCanonicalURL(
    `https://www.realtymart.com/builder-property-listing/${id}/${type}`
  );
  }
  loadAllBuilders(): void {
    const builderId = this.route.snapshot.paramMap.get('id');
    const propertytype = this.route.snapshot.paramMap.get('type');

    if (builderId && propertytype) {
      this.builderpropertylistingService.getbuilderpropertylisting(parseInt(builderId), propertytype).subscribe(
        (response: any) => {
          this.allbuilderpropertyData = response;
          this.allbuilderpropertycount = this.allbuilderpropertyData?.responseData?.builderallpropertylistingcount;
          this.allbuilderproperty = this.allbuilderpropertyData?.responseData?.builderallpropertylisting;
        },
        (error: any) => {
          console.error('Error fetching all builders:', error);
        }
      );
    }
  }
}
