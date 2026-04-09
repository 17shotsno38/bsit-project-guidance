import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppShellComponent } from './app/app-root.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppShellComponent, {
  providers: [provideRouter(routes)]
}).catch(err => console.error(err));