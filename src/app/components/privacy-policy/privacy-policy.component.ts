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
  this.seoService.setCanonicalURL(
    'https://www.realtymart.com/privacy-policy'
  );
}
}
