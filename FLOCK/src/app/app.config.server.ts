import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    provideRouter(routes)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
