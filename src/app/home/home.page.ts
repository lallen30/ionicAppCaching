import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { finalize } from 'rxjs/operators';
import { CachingService } from '../services/caching.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  joke = null;
  users = null;

  constructor(private apiService: ApiService, private cachingService: CachingService, private loadingController: LoadingController) { }

  async loadChuckJoke(forceRefresh) {
    const loading = await this.loadingController.create({
      message: 'Loading data..'
    });
    await loading.present();

    this.apiService.getChuckJoke(forceRefresh).subscribe(res => {
      this.joke = res;
      loading.dismiss();
    });
  }

  async refreshUsers(event?) {
    const loading = await this.loadingController.create({
      message: 'Loading data..'
    });
    await loading.present();

    const refresh = event ? true : false;

    this.apiService.getUsers(refresh).pipe(
      finalize(() => {
        if (event) {
          event.target.complete();
        }
        loading.dismiss();
      })
    ).subscribe(res => {
      this.users = res;
    })
  }

  async clearCache() {
    this.cachingService.clearCachedData();
  }

}
