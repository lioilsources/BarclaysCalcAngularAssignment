import { Component, Inject } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';
@Component({
    selector: 'calc',
    templateUrl: './calc.component.html',
    styleUrls: ['./calc.component.css']
})
export class CalcComponent {
    public expression = "null";
    public eval = 0;
    public history: History[];

    public http: Http;
    public baseUrl: string;

    public displayDigits = true;
    public displayOperators = false;
    public displayEval = false;
    public displayHistory = false;
    
    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
    }

    public pressDigit(digit: string) {
        if (this.expression == "null")
            this.expression = "";

        this.expression += digit;
        
        this.displayDigits = false;
        this.displayOperators = true;
        this.displayEval = true;
    }

    public pressOperator(operator: string) {
        this.expression += operator;

        this.displayDigits = true;
        this.displayOperators = false;
        this.displayEval = false;
    }

    public pressEval() {
        this.http.get(this.baseUrl + 'api/Calc/Eval?expression=' + encodeURIComponent(this.expression)).subscribe(result => {
            let vm = result.json() as ViewModel;
            this.eval = vm.result;
            this.history = vm.history;
        }, error => console.error(error));
    }

    public showHistory(): void {
        this.displayHistory = !this.displayHistory;
    }

    private getHistory(): void {
        this.http.get(this.baseUrl + 'api/Calc/ListHistory').subscribe(result => {
            this.history = result.json() as History[];
        }, error => console.error(error));
    }
}

interface ViewModel {
    result: number;
    history: History[];
}

interface History {
    expression: string;
    result: number;
}