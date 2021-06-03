import { Component } from '@angular/core';
import { CachingService } from './services/caching.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private cachingService: CachingService) {
    this.cachingService.initStorage();
  }
}
