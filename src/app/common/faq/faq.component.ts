import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  @Input() faqs: any[] = [];
  @Input() isInnerHtmlAnswer: boolean = false;

  ngOnInit(): void {
    console.log(this.faqs);
  }
}
