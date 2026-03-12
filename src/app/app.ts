import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AuthModalComponent} from './features/auth/login/login';
import {NavbarComponent} from './components/navbar/navbar';
import {HomeComponent} from './pages/home/home';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    StockTickerComponent,
    FeaturesComponent,
    AuthModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
