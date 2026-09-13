import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { PurchaseBill} from './components/purchase-bill/purchase-bill'; // Added Import

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'purchase-bill', component: PurchaseBill}, // Added Route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
