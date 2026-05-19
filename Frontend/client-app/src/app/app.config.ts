import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(),

    {
      provide: 'SocialAuthServiceConfig',

      useValue: {

        autoLogin: false,

        providers: [

          {
            id: GoogleLoginProvider.PROVIDER_ID,

            provider: new GoogleLoginProvider(
              '679144999056-4ap178auubdlvdj2a11a6kdrovoljueh.apps.googleusercontent.com'
            )
          }

        ]

      } as SocialAuthServiceConfig
    }

  ]
};