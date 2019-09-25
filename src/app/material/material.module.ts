import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// Angular Material Components
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select'; 
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';

const Material = [
  MatToolbarModule,
  MatIconModule,
  BrowserAnimationsModule,
  MatCardModule,
  MatTabsModule,
  MatGridListModule,
  MatListModule,
  MatSidenavModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatSelectModule,
  MatPaginatorModule,
  MatTooltipModule,
  MatDialogModule
]

@NgModule({
  imports: [Material],
  exports: [Material],
})
export class MaterialModule { }
