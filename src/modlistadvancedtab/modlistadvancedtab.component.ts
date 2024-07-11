import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'modlistadvancedtab',
  standalone: true,
  imports: [
    CommonModule,FormsModule
  ],
  templateUrl: './modlistadvancedtab.component.html',
  styleUrl: './modlistadvancedtab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModlistadvancedtabComponent {
  @Input() defaultRulesUrl!: string;
  @Input() rulesUrl!: string;
  @Output() rulesUrlChange = new EventEmitter<string>();
}
