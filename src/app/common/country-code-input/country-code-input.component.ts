import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CountrycodeService } from 'src/app/components/service/countrycode.service';

@Component({
  selector: 'app-country-code-input',
  templateUrl: './country-code-input.component.html',
  styleUrls: ['./country-code-input.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CountryCodeInputComponent implements OnInit {
  countryCode: string = "+91";
  countryList: any[] = [];
  @Input() isText?: boolean = false;
  @Input() isInput?: boolean = false;
  @Input() isDropdown?: boolean = false;
  @Input() inputClass?: string;

  constructor(private countryCodeService: CountrycodeService) {}

  ngOnInit(): void {
    this.countryCodeService.getcountrycode().subscribe({
      next: (res: any) => {
        if (res && res.responseData && Array.isArray(res.responseData.countrycode)) {
          this.countryList = res.responseData.countrycode;
        } else if (Array.isArray(res)) {
          this.countryList = res;
        }
        this.detectIPCountry();
      },
      error: () => {
        this.detectIPCountry();
      }
    });
  }

  detectIPCountry(): void {
    this.countryCodeService.getIPCountryCode().subscribe({
      next: (res: any) => {
        if (res && res.country_code && this.countryList.length > 0) {
          const match = this.countryList.find(
            (c: any) => c.shortname && c.shortname.toUpperCase() === res.country_code.toUpperCase()
          );
          if (match) {
            this.countryCode = match.code || ('+' + match.phonecode);
          }
        }
      }
    });
  }
}
