import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  setSchema(schema: any): void {

    // Remove existing schema
    const existingSchema = this.document.getElementById('schema-script');

    if (existingSchema) {
      existingSchema.remove();
    }

    // Create new schema
    const script = this.document.createElement('script');

    script.type = 'application/ld+json';
    script.id = 'schema-script';
    script.text = JSON.stringify(schema);

    this.document.head.appendChild(script);
  }
}
