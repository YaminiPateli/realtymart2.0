import { Component, OnInit, HostListener  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BlogslistingService } from '../service/blogslisting.service';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/seo.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  listArray : string[] = [];
  bloglistData: any;
  bloglist: any[] = []; // Assuming bloglist is an array of blog data
  initialBlogCount = 8;
  blogsToLoad = 8;
  blog: any;
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private http: HttpClient,
    private BlogService: BlogslistingService,
  private seoService:SeoService) {
    this.setMetaTags(
      'Blog in RealtyMart',
      '',
    );
    this.Loadblogs();
  }

  // meta title
  setMetaTags(title: string, description: string) {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({
      property: 'og:description',
      content: description,
    });
    // this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    // this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  ngOnInit() {
    this.Loadblogs();
  }

  Loadblogs() {
    this.BlogService.getblogslisting().subscribe((bloglistData: any) => {
      this.bloglistData = bloglistData;
      this.bloglist = this.bloglistData?.responseData?.bloglistData;
      this.setBlogListSchema();
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      this.initialBlogCount < this.bloglist.length
    ) {
      this.initialBlogCount += this.blogsToLoad;
    }
  }

  sanitizeUrl(url: string): string {
  return url.trim().toLowerCase().replace(/ /g, ' ');
}

setBlogListSchema() {

  const blogs = this.bloglist.map((blog: any, index: number) => ({

    "@type": "ListItem",

    "position": index + 1,

    "item": {

      "@type": "BlogPosting",

      "headline": blog.title,

      "description": blog.short_description,

      "image": blog.image,

      "datePublished": blog.publish_date,

      "url": `https://www.realtymart.com/blog-details/${blog.url}`

    }

  }));


  const schema = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "CollectionPage",

        "@id": "https://www.realtymart.com/blog",

        "name": "Real Estate Blog | RealtyMart",

        "url": "https://www.realtymart.com/blog",

        "description": "Read the latest real estate news, property buying guides, investment tips, home loan information and market updates from RealtyMart.",

        "mainEntity": {

          "@type": "ItemList",

          "numberOfItems": this.bloglist.length,

          "itemListElement": blogs

        }

      },

      {

        "@type": "Blog",

        "@id": "https://www.realtymart.com/blog#blog",

        "name": "RealtyMart Blog",

        "url": "https://www.realtymart.com/blog",

        "publisher": {

          "@type": "Organization",

          "name": "Intelliworkz Business Solutions Pvt. Ltd.",

          "brand": {
            "@type": "Brand",
            "name": "RealtyMart"
          }

        }

      }

    ]

  };

  this.seoService.setSchema(schema);

}

}
