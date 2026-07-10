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
