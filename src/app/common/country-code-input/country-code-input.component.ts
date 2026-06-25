import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CountrycodeService } from 'src/app/components/service/countrycode.service';

@Component({
  selector: 'app-country-code-input',
  templateUrl: './country-code-input.component.html',
  styleUrls: ['./country-code-input.component.css'],
  standalone:true,
  imports:[CommonModule
  ],
})
export class CountryCodeInputComponent implements OnInit {
  countryCode: string = "+91";
  @Input() isText?:boolean = false;
  @Input() isInput?:boolean = false;
  @Input() isDropdown?:boolean = false;
  @Input() inputClass?:string;
  constructor(private countryCodeService: CountrycodeService) { 

  }

  ngOnInit(): void {
    console.log(this.isInput)
    this.countryCodeService.getIPCountryCode().subscribe((res: any) => {
      if(res.country_calling_code){
        this.countryCode = res.country_calling_code;
      }
    })
  }
}
