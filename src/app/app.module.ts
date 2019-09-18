// Core Angular Components
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Custom Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { ToolbarComponent } from './common/toolbar/toolbar.component';
import { EditComponent } from './edit/edit.component';
import { MaterialModule } from './material/material.module';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    ToolbarComponent,
    EditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
