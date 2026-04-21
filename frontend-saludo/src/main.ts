import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { initAuth } from './app/auth';

initAuth()
  .then(() => {
    return bootstrapApplication(AppComponent, {
      providers: [provideHttpClient()]
    });
  })
  .catch((err) => console.error(err));
