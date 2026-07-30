import { Injectable, Inject, RendererFactory2, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
     rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
   }

  setCanonicalURL(url: string): void {
    let link: HTMLLinkElement = this.document.querySelector("link[rel='canonical']")!;

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }

    this.renderer.setAttribute(link, 'href', url);
  }

  setSchema(schema: any, id: string = 'structured-data'): void {
  // Remove existing schema with same id
  const existingSchema = this.document.getElementById(id);

  if (existingSchema) {
    existingSchema.remove();
  }

  const script = this.document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(schema);

  this.document.head.appendChild(script);
  }
  setLocalBusinessSchema() {

    const schema =
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "realtymart",
      "image": window.location.href + "assets/images/logo.svg",
      "@id": "",
      "url": window.location.href,
      "telephone": "+91 8320864223",
      "priceRange": "-",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "WTT, Makarba",
        "addressLocality": "Ahmedabad",
        "postalCode": "382210",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 22.9894657,
        "longitude": 72.4970037
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:00",
        "closes": "20:00"
      }
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = "local-business-schema";
    script.text = JSON.stringify(schema);

    this.document.head.appendChild(script);
  }

  setOrganizationSchema(){
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "realtymart",
      "url": window.location.href,
      "logo": window.location.href + "assets/images/logo.svg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91 8320864223",
        "contactType": "technical support",
        "areaServed": "IN",
        "availableLanguage": "en"
      },
      "sameAs": [
        "https://www.instagram.com/realtymart.official/",
        "https://www.facebook.com/realtymartcom",
        "https://www.linkedin.com/company/realtymart-com"
      ]
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = "organization-schema";
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }
}
