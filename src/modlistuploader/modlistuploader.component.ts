import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModRulesLoaderService } from '../services/modrulesloader/mod-rules-loader.service';
import {
  ModRuleData,
  RuleExportData,
  TroublesomeModsDatabase,
} from '../ModRuleData';
import { MatTabsModule } from '@angular/material/tabs';

import { FormControl, FormsModule } from '@angular/forms';
import { ModlistadvancedtabComponent } from '../modlistadvancedtab/modlistadvancedtab.component';

import {MatChipsModule, MatChipEvent, MatChipListbox, MatChipOption} from '@angular/material/chips';


@Component({
  selector: 'modlist-uploader',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatTabsModule,
    FormsModule,
    ModlistadvancedtabComponent,
    MatChipsModule,
  ],
  templateUrl: './modlistuploader.component.html',
  styleUrl: './modlistuploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModlistuploaderComponent implements OnInit {
  
  @ViewChild('chipList') chipList !: ElementRef;

  public defaultRulesUrl: string =
    'https://raw.githubusercontent.com/LinnielDW/rw-ts-app/master/public/assets/TroublesomeDatabase.json';
  rulesUrl: string = this.defaultRulesUrl;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private modlistAnalyserService: ModRulesLoaderService
  ) {}

  modsParsed: string[] = [];

  rulesData: TroublesomeModsDatabase = {};

  // pattern = /.*?\(.*?\)/g
  pattern = /\b(?<=\()[a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;

  pattern2 = /\b[a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;
  rentryPattern = /packageId:.*\b[a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;
  // pattern = /\b(?<=\()[^0-9][a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/g;

  ngOnInit(): void {
    this.modlistAnalyserService.getRules(this.rulesUrl);
  }

  // xmlContent: string = '';
  // specificNodeContent: string = '';
  selected = new FormControl(0);

  //TODO: move mod list parsing to own service
  parseModsInput(event: Event): void {
    this.rulesData = this.modlistAnalyserService.getRules(this.rulesUrl);
    console.log(this.rulesData)
    this.modsParsed = [];

    if (this.selected.value == 0) {
      const file = (<HTMLInputElement>(
        document.getElementsByName('ModConfigInput')[0]
      ))?.files?.[0];
      this.readModConfigFile(file);
    } else {
      const modsTextAreaInput = (<HTMLInputElement>(
        document.getElementsByName('TextAreaInput')[0]
      )).value;
      // console.log(modsTextAreaInput);
      this.readModlistText(modsTextAreaInput);
    }
  }

  private readModlistText(modsTextAreaInput: string) {
    if (modsTextAreaInput) {
      var modsSplit = modsTextAreaInput.split(/\r?\n/);

      var match;
      modsSplit.forEach((modLine) => {
        match = modLine.match(this.pattern);
        if(modLine.includes("packageId:")){
          match = modLine.match(this.rentryPattern);
          if(match) {
            match[0] = match[0].substring(10, match[0].length).trim();
          }
        }
        if (match) {
          this.modsParsed.push(match[0].toLowerCase());
        } else {
          match = modLine.match(this.pattern2);
          if (match) {
            this.modsParsed.push(match[0].toLowerCase());
          }
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

    console.debug('loading modlist:');
    console.debug(this.modsParsed);
    // console.log("Logging mods finished.");
    this.changeDetectorRef.detectChanges();
  }

  //TODO: consider moving this to a soft match looking for keywords instead of hard dictionary match (like it was before basically)
  getSeverity(item: string): string {
    var r = this.rulesData[item.toLowerCase()]?.threat;

    switch (r) {
      case '5':
        return 'dire';
      case '4':
        return 'severe';
      case '3':
        return 'warning';
      case '1':
      case '2':
        return 'info';
      default:
        return 'none';
    }
  }

  getTooltip(item: string): string {
    return this.rulesData[item.toLowerCase()]?.reason;
  }


  shouldHide(item: string): boolean {
    var chipOptions = this.chipList as unknown as MatChipListbox;

    if (Array.isArray(chipOptions.selected)) {
      return !(chipOptions.selected).some(e => e.selected && e.value.toLowerCase() == this.getSeverity(item.toLowerCase()));
    } else {

      return (chipOptions.selected).value.toLowerCase() != this.getSeverity(item.toLowerCase());
    }
  }

  shouldHaveClass(severity: string): boolean {
    var chipOptions = this.chipList as unknown as MatChipListbox;

    if (Array.isArray(chipOptions?.selected)) {
      return (chipOptions.selected).some(e => e.selected && e.value.toLowerCase() == severity);
    } else {

      return (chipOptions?.selected)?.value.toLowerCase() == severity;
    }
  }
}
