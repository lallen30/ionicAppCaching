import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, delay, tap } from 'rxjs/operators';
import { CachingService } from './caching.service';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
const { Network } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  connected = true;

  constructor(private http: HttpClient, private cachingService: CachingService, private toastController: ToastController) {
    Network.addListener('networkStatusChange', async status => {
      this.connected = status.connected;
    });

    // Can be removed once #17450 is resolved: https://github.com/ionic-team/ionic/issues/17450
    this.toastController.create({ animated: false }).then(t => { t.present(); t.dismiss(); });
  }

  // Standard API Functions

  getUsers(forceRefresh: boolean) {
    const url = 'https://randomuser.me/api?results=10';
    return this.getData(url, forceRefresh).pipe(
      map(res => res['results'])
    );
  }

  getChuckJoke(forceRefresh: boolean) {
    const url = 'https://api.chucknorris.io/jokes/random';
    return this.getData(url, forceRefresh);
  }

  // Caching Functions

  private getData(url, forceRefresh = false): Observable<any> {

    // Handle offline case
    if (!this.connected) {
      this.toastController.create({
        message: 'You are viewing offline data.',
        duration: 2000
      }).then(toast => {
        toast.present();
      });
      return from(this.cachingService.getCachedRequest(url));
    }

    // Handle connected case
    if (forceRefresh) {
      // Make a new API call
      return this.callAndCache(url);
    } else {
      // Check if we have cached data
      const storedValue = from(this.cachingService.getCachedRequest(url));
      return storedValue.pipe(
        switchMap(result => {
          if (!result) {
            // Perform a new request since we have no data
            return this.callAndCache(url);
          } else {
            // Return cached data
            return of(result);
          }
        })
      );
    }
  }

  private callAndCache(url): Observable<any> {
    return this.http.get(url).pipe(
      delay(2000), // Only for testing!
      tap(res => {
        // Store our new data
        this.cachingService.cacheRequest(url, res);
      })
    )
  }
}
