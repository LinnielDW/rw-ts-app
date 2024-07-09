import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ModRulesLoaderService {
  constructor(private http: HttpClient) {}

  fetchRulesData(): Observable<any[]> {
    return this.http.get('assets/rules.csv', { responseType: 'text' }).pipe(
      map((csvData: string) => {
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
        });
        return parsedData.data;
      })
    );
  }
}
