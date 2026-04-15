import { Component } from '@angular/core';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  plans = [
    { key: 'FREE', label: 'FREE', price: 0, oldPrice: null, off: null },
    { key: 'BASIC', label: 'BASIC', price: 1599, oldPrice: 3198, off: '50% Off' },
    { key: 'PRO', label: 'PRO', price: 2199, oldPrice: 4398, off: '50% Off' }
  ];
  selectedPlan = 'BASIC';
  agree = false;

  selectPlan(plan: string) {
    this.selectedPlan = plan;
  }

  onAgreeChange(event: any) {
    this.agree = event.target.checked;
  }

  get continueButtonText() {
    return `Continue with ${this.selectedPlan.charAt(0) + this.selectedPlan.slice(1).toLowerCase()}`;
  }

  get canContinue() {
    return !!this.selectedPlan && this.agree;
  }
}
