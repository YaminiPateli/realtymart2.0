import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  @Input() currentPage = 1;
  @Input() totalPages = 1;


   @Output() pageChanged = new EventEmitter<number>();

   ngOnInit(): void {
     
   }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.pageChanged.emit(page);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, this.currentPage + 2);

    if (this.currentPage <= 3) {
      end = Math.min(5, this.totalPages);
    }

    if (this.currentPage >= this.totalPages - 2) {
      start = Math.max(1, this.totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
