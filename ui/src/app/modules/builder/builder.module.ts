import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDateFnsModule } from '@angular/material-date-fns-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { enGB } from 'date-fns/locale';
import { components } from './components';
import { MainComponent } from './components/main/main.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [...components],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: enGB,
    },
  ],
  imports: [
    CommonModule,
    MatTreeModule,
    FontAwesomeModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDateFnsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    MatSlideToggleModule,
  ],
  exports: [MainComponent],
})
export class BuilderModule {}
