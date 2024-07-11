import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModRulesLoaderService } from '../services/modrulesloader/mod-rules-loader.service';
import { ModRuleData, RuleExportData, TroublesomeModsDatabase } from '../ModRuleData';
import {MatTabsModule} from '@angular/material/tabs';

import { FormControl, FormsModule } from '@angular/forms';
import { ModlistadvancedtabComponent } from "../modlistadvancedtab/modlistadvancedtab.component";

@Component({
  selector: 'modlist-uploader',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatTabsModule, FormsModule, ModlistadvancedtabComponent],
  templateUrl: './modlistuploader.component.html',
  styleUrl: './modlistuploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModlistuploaderComponent implements OnInit {
  public defaultRulesUrl: string = 'https://raw.githubusercontent.com/LinnielDW/rw-ts-app/master/public/assets/rules.csv';
  rulesUrl: string = this.defaultRulesUrl;
  
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private modlistAnalyserService: ModRulesLoaderService
  ) {}
  
  modsParsed: string[] = [];

  rulesData: TroublesomeModsDatabase = {};

  // pattern = /.*?\(.*?\)/g
  pattern = /\b(?<=\()[a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;
  // pattern = /\b(?<=\()[^0-9][a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;


  ngOnInit(): void {
    // this.getRules();
  }

  // xmlContent: string = '';
  // specificNodeContent: string = '';
  selected = new FormControl(0);

  //TODO: move mod list parsing to own service
  parseModsInput(event: Event): void{
    this.rulesData = this.modlistAnalyserService.getRules(this.rulesUrl);
    this.modsParsed = [];
    
    if(this.selected.value == 0){
      const file = (<HTMLInputElement>document.getElementsByName("ModConfigInput")[0])?.files?.[0];
      this.readModConfigFile(file);
    }
    else {
      const modsTextAreaInput = (<HTMLInputElement>document.getElementsByName("TextAreaInput")[0]).value;
      this.readModlistText(modsTextAreaInput);
    }
  }

  private readModlistText(modsTextAreaInput: string) {
    if (modsTextAreaInput) {
      var modsSplit = modsTextAreaInput.split(/\r?\n/);

      modsSplit.forEach(modLine => {
        var match = modLine.match(this.pattern);
        if (match) {
          this.modsParsed.push(match[0].toLowerCase());
        }
      });
    } else {
      this.modsParsed = [];
    }
  }

  private readModConfigFile(file: File | undefined) {
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        this.parseXML(reader.result as string);
      };

      reader.readAsText(file);
    }
  }

  parseXML(xmlString: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const specificNode = xmlDoc.querySelector('activeMods');
    var specificNodeContent = specificNode
      ? specificNode.textContent || ''
      : 'Node not found';

    // console.log(this.specificNodeContent);

    // console.log("Logging mods: ");
    specificNode?.querySelectorAll('li').forEach((element) => {
      var modString = element.textContent;

      if (modString) {
        if (modString.endsWith('_steam')) {
          modString = modString.substring(0, modString.indexOf('_steam'));
        }

        // console.log("    " + modString);
        this.modsParsed.push(modString);
      }
    });

    
    console.debug("loading modlist:")
    console.debug(this.modsParsed);
    // console.log("Logging mods finished.");
    this.changeDetectorRef.detectChanges();
  }

  //TODO: consider moving this to a soft match looking for keywords instead of hard dictionary match (like it was before basically)
  getSeverity(item: string): string {
    var r = this.rulesData[item]?.threat;

    switch(r){
      case "5": return "dire";
      case "4": return "severe";
      case "3": return "warning";
      case "2": return "info";
      case "1": 
      default: return "info";
    }
    return r;
  }

  getTooltip(item: string): string {
    return this.rulesData[item]?.reason;
  }
}
