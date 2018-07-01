import { Component, Inject } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';

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
    public displayLeftBracket = true;
    public displayRightBracket = false;

    public insideBracket = false;
    
    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
    }

    public pressBase(input: string): void {
        if (this.expression == "null")
            this.expression = "";

        this.expression += input;
    }

    public pressDigit(digit: string): void {
        this.pressBase(digit);
        
        this.displayDigits = false;
        this.displayOperators = true;
        this.displayEval = true;

        if (this.insideBracket)
            this.displayRightBracket = true;
        else
            this.displayLeftBracket = false;
    }

    public pressOperator(operator: string): void {
        this.pressBase(operator);

        this.displayDigits = true;
        this.displayOperators = false;
        this.displayEval = false;

        if (this.insideBracket) 
            this.displayRightBracket = false;
        else
            this.displayLeftBracket = true;
    }

    public pressLeftBracket(): void {
        this.pressBase('(');

        this.displayLeftBracket = false;
        this.displayRightBracket = false;

        this.insideBracket = true;
    }

    public pressRightBracket(): void {
        this.pressBase(')');

        this.displayRightBracket = false;
        this.displayLeftBracket = false;

        this.insideBracket = false;
    }

    public pressEval(): void {
        this.http.get(this.baseUrl + 'api/Calc/Eval?expression=' + encodeURIComponent(this.expression)).subscribe(result => {
            let vm = result.json() as ViewModel;
            this.eval = vm.result;
            this.history = vm.history;
        }, error => console.error(error));
    }

    public showHistory(): void {
        this.displayHistory = !this.displayHistory;
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