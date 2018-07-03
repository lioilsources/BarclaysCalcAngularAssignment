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
    public syntaxError = "";

    public http: Http;
    public baseUrl: string;

    public displayDigits = true;
    public displayOperators = false;
    public displayEval = false;
    public displayHistory = false;
    public displayLeftBracket = true;
    public displayRightBracket = false;
    public displayError = false;

    public insideBracket = false;
    
    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;
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
        this.expression = "null";
        this.syntaxError = "";
        this.eval = 0;

        this.displayDigits = true;
        this.displayOperators = false;
        this.displayEval = false;
        this.displayHistory = false;
        this.displayLeftBracket = true;
        this.displayRightBracket = false;
        this.displayError = false;
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

        let terms: string = "0123456789*+()";
        let randomIndex = this.getRandomInt(0, terms.length - 1);
        this.pressBase(terms[randomIndex]);
    }
    public pressEval(): void {
        this.http.get(this.baseUrl + 'api/Calc/Eval?expression=' + encodeURIComponent(this.expression)).subscribe(result => {
            let vm = result.json() as ViewModel;
            let res = vm.result;
            if (res <= 0)
                this.displayError = true;
            else
                this.displayError = false;
            this.eval = res;
            this.history = vm.history;

            let syntaxErrorPosition = vm.syntaxErrorPosition;
            if (syntaxErrorPosition >= 0) {
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
    result: number;
    history: History[];
    syntaxErrorPosition: number;
}

interface History {
    expression: string;
    result: number;
}