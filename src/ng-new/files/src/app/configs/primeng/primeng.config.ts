import Aura from '@primeuix/themes/aura';
import { PrimeNGConfigType } from 'primeng/config';

export const primeNGConfig = (): PrimeNGConfigType => ({
  ripple: true,
  inputVariant: 'filled',
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
});
