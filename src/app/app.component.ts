import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModlistuploaderComponent } from '../modlistuploader/modlistuploader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, ModlistuploaderComponent],
})
export class AppComponent {
  title = 'rw-ts-app';
}
