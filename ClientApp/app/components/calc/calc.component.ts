import { Component, Inject } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';


@Component({
    selector: 'calc',
    templateUrl: './calc.component.html',
    styleUrls: ['./calc.component.css']
})

export class CalcComponent {
    public expression: string;
    public eval: number | null;
    public syntaxError: string;

    public history: History[] = [];

    public http: Http;
    public baseUrl: string;

    public displayHistory: boolean;
    public displayError: boolean;
    
    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
        this.initView();
    }

    public initView(): void {
        this.expression = "null";
        this.eval = 0;
        this.syntaxError = "";

        this.displayHistory = false;
        this.displayError = false;
    }

    public pressBase(input: string): void {
        if (this.expression == "null")
            this.expression = "";

        this.expression += this.syntaxError;
        this.syntaxError = "";
        this.expression += input;
    }

    public pressDigit(digit: string): void {
        this.pressBase(digit);        
    }

    public pressOperator(operator: string): void {
        this.pressBase(operator);
    }

    public pressLeftBracket(): void {
        this.pressBase('(');
    }

    public pressRightBracket(): void {
        this.pressBase(')');
    }

    public pressClear(): void {
        this.initView();
    }

    public pressEval(): void {
        this.expression += this.syntaxError;
        this.syntaxError = "";
        this.http.get(this.baseUrl + 'api/Calc/Eval?expression=' + encodeURIComponent(this.expression)).subscribe(result => {
            let vm = result.json() as ViewModel;
            this.displayError = vm.eval == null && vm.syntaxErrorPosition != null;
            this.eval = vm.eval;

            let lastHistory = vm.lastHistory;
            if (lastHistory != null)
                this.history.push(lastHistory);
            
            let syntaxErrorPosition = vm.syntaxErrorPosition;
            if (syntaxErrorPosition != null) {
                this.syntaxError = this.expression.substring(syntaxErrorPosition);
                this.expression = this.expression.substring(0, syntaxErrorPosition);
            }
        }, error => console.error(error));
    }

    public showHistory(): void {
        this.displayHistory = !this.displayHistory;
    }
}

interface ViewModel {
    eval: number | null;
    lastHistory: History;
    syntaxErrorPosition: number | null;
}

interface History {
    expression: string;
    eval: number;
}