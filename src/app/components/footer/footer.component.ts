import { Component } from '@angular/core';
import { NewsletterSignupComponent } from '../newsletter-signup/newsletter-signup.component';

@Component({
  selector: 'app-footer',
  imports: [NewsletterSignupComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

}
