import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './components/login/login';
import { PurchaseBill } from './components/purchase-bill/purchase-bill';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    PurchaseBill
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BaseChartDirective
  ],
  providers: [
    provideHttpClient(),
    provideCharts(withDefaultRegisterables())
  ],
  bootstrap: [App]
})
export class AppModule { } 
