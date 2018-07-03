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

    public displayDigits: boolean;
    public displayOperators: boolean;
    public displayEval: boolean;
    public displayHistory: boolean;
    public displayLeftBracket: boolean;
    public displayRightBracket: boolean;
    public displayError: boolean;

    public insideBracket: boolean;
    
    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
        this.initView();
    }

    public initView(): void {
        this.expression = "null";
        this.eval = 0;
        this.syntaxError = "";

        this.displayDigits = true;
        this.displayOperators = false;
        this.displayEval = false;
        this.displayHistory = false;
        this.displayLeftBracket = true;
        this.displayRightBracket = false;
        this.displayError = false;

        this.insideBracket = false;
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

    public pressClear(): void {
        this.initView();
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     * 
     * source: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
     */
    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public pressError(): void {
        this.displayEval = true;
        this.displayDigits = true;
        this.displayOperators = true;
        this.displayLeftBracket = true;
        this.displayRightBracket = true;

        this.insideBracket = false;

        let terms: string = "0123456789*+()";
        let randomIndex = this.getRandomInt(0, terms.length - 1);
        this.pressBase(terms[randomIndex]);
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