import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModRulesLoaderService } from '../services/modrulesloader/mod-rules-loader.service';
import { ModRuleData, RuleExportData } from '../ModRuleData';
import {MatTabsModule} from '@angular/material/tabs';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'modlist-uploader',
  standalone: true,
  imports: [CommonModule, MatTooltipModule,MatTabsModule],
  templateUrl: './modlistuploader.component.html',
  styleUrl: './modlistuploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModlistuploaderComponent implements OnInit {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private modlistAnalyserService: ModRulesLoaderService
  ) {}

  
  modlistUploadStyle: string = "upload";
  // rulesHeaders: string[] = [];

  
  modsParsed: string[] = [];

  rulesData: { [id: string] : ModRuleData; } = {};

  ngOnInit(): void {
    this.modlistAnalyserService.fetchRulesData().subscribe(
      (exportData: RuleExportData[]) => {
        if (exportData.length > 0) {
          // this.rulesHeaders = Object.keys(exportData[0]);
          exportData.forEach(exportedRule => {
            this.rulesData[exportedRule.name] = {ratingClass: exportedRule.ratingClass, note: exportedRule.note}
          });
        }
        console.debug("loading ruleset:")
        console.debug(this.rulesData);
      },
      (error) => {
        console.error('Error fetching CSV data:', error);
      }
    );
  }

  // xmlContent: string = '';
  // specificNodeContent: string = '';
  selected = new FormControl(0);

  parseModsInput(event: Event): void{
    const file = (<HTMLInputElement>document.getElementsByName("ModConfigInput")[0])?.files?.[0];
    
    if(this.selected.value == 0){

      this.readModConfigFile(file);
    }
    else{
      const modsTextAreaInput = (<HTMLInputElement>document.getElementsByName("TextAreaInput")[0]).value;
      // console.log(bla)

      if (modsTextAreaInput) {
        this.modsParsed = modsTextAreaInput.split(/\r?\n/);
      } else {
        this.modsParsed = [];
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    this.readModConfigFile(file);
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
    this.modsParsed = [];
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

  getSeverity(item: string): string {
    var r = this.rulesData[item]?.ratingClass;

    return r;
  }

  getTooltip(item: string): string {
    return this.rulesData[item]?.note;
  }
}
