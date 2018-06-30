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
    public history: History[] = [];

    public http: Http;
    public baseUrl: string;

    public displayDigits = true;
    public displayOperators = false;
    public displayEval = false;
    public displayHistory = false;
    private evalHistory: BehaviorSubject<History[]> = new BehaviorSubject<History[]>([]);

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        this.http = http;
        this.baseUrl = baseUrl;

        this.getEvalHistory().subscribe((values: History[]) => {
            //this.history = values;
        });
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
            this.eval = result.json() as number;
            //this.getHistory();
            this.addToHistory();
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

    private addToHistory(): void {
        const newHistory: History = { expression: this.expression, result: this.eval };
        const allHistory: History[] = this.evalHistory.getValue();
        allHistory.push(newHistory);
        this.setEvalHistory(allHistory);

        this.history.push(newHistory);
    }

    private setEvalHistory(values: History[]): void {
        this.evalHistory.next(values);
    }

    private getEvalHistory(): Observable<History[]> {
        return this.evalHistory.asObservable();
    }
}

interface History {
    expression: string;
    result: number;
}