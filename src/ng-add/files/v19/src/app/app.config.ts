import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { primeNGConfig } from '@configs/primeng/primeng.config';
import { routerConfig } from '@configs/router/router.config';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    routerConfig(),
    providePrimeNG(primeNGConfig()),
  ],
};
