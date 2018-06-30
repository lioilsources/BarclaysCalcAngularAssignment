import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { CalcComponent } from './components/calc/calc.component';

@NgModule({
    declarations: [
        AppComponent,
        CalcComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'calc', pathMatch: 'full' },
            { path: 'calc', component: CalcComponent },
            { path: '**', redirectTo: 'calc' }
        ])
    ]
})
export class AppModuleShared {
}
