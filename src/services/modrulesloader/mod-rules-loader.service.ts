import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModRuleData, RuleExportData, TroublesomeModsDatabase } from '../../ModRuleData';
@Injectable({
  providedIn: 'root',
})
export class ModRulesLoaderService {
  constructor(private http: HttpClient) {}

  fetchRulesData(url: string): Observable<any[]> {
    //TODO: move this to an env variable or configurable on the frontend
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((csvData: string) => {
        const parsedData = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
        });
        return parsedData.data;
      })
    );
  }

  getTroublesomeMods(url: string): Observable<TroublesomeModsDatabase> {
    return this.http.get<TroublesomeModsDatabase>(url, {responseType: 'json'});
  }

  getRules(url: string): TroublesomeModsDatabase {
    var troublesomModsDb: TroublesomeModsDatabase = {};
    this.getTroublesomeMods(url).subscribe(data => {
      troublesomModsDb = data;
    },(error) => {
      console.error('Error fetching troublesome mods data:', error);
    });
    return troublesomModsDb;
  }

  //DEPRICATED
  getRulesOld(rulesUrl: string): { [id: string] : ModRuleData; }  {
    var rulesData: { [id: string] : ModRuleData; }  = {};

    this.fetchRulesData(rulesUrl).subscribe(
      (exportData: RuleExportData[]) => {
        if (exportData.length > 0) {
          // this.rulesHeaders = Object.keys(exportData[0]);
          exportData.forEach(exportedRule => {
            rulesData[exportedRule.name] = { ratingClass: exportedRule.ratingClass, note: exportedRule.note };
          });
        }
        console.debug("loading ruleset:");
        console.debug(rulesData);
      },
      (error) => {
        console.error('Error fetching CSV data:', error);
      }
    );
    return rulesData;
  }
}