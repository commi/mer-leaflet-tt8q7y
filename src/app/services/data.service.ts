import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private dataCache = new Map<string, any>();

  /**
   * Function to fetch JSON data using cache
   * @param filename URL to the JSON file
   * @returns Observable with the JSON data
   */
  fetchJSON(filename: string): Observable<any> {
    if (this.dataCache.has(filename)) {
      return of(this.dataCache.get(filename));
    }

    return this.http.get(filename).pipe(
      tap(data => this.dataCache.set(filename, data))
    );
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.dataCache.clear();
  }
}
