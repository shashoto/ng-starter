import { InjectionToken } from '@angular/core';

import { IEnvironment } from '@/app/shared/types/environment/environment';
import { environment } from '@/env/environment';

// Define the token with a descriptive name and the expected type
export const Env_Token = new InjectionToken<IEnvironment>('app.config');

export const provideEnv = () => ({
  apiBaseUrl: environment.baseUrl,
});
