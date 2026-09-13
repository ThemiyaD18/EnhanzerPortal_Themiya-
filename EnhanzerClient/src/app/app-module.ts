import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './components/login/login'; // 1. Added import here
import { PurchaseBill } from './components/purchase-bill/purchase-bill';
// ... Add it under LoginComponent in the declarations array!

@NgModule({
  declarations: [
    App,
    LoginComponent, // 2. Added to declarations here
    PurchaseBill
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
