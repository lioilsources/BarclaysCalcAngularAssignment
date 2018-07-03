using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Calc.Controllers
{
    [Route("api/[controller]")]
    public class CalcController : Controller
    {
        [HttpGet("[action]")]
        public ViewModel Eval(string expression)
        {
            var syntaxErrorPosition = new ExpressionValidator(expression).Validate();
            if (syntaxErrorPosition >= 0)
            {
                return new ViewModel
                {
                    Eval = null,
                    LastHistory = null,
                    SyntaxErrorPosition = syntaxErrorPosition
                };
            }

            var res = ResolveExpression(ResolveBrackets(expression)); 
            return new ViewModel
            {
                Eval = res,
                LastHistory = new History
                {
                    Expression = expression,
                    Eval = res
                },
                SyntaxErrorPosition = null
            };
        }

        private string ResolveBrackets(string expression)
        {
            var pattern = @"(\([\d\*\+]+\))";
	        return Regex.Replace(expression, pattern, m => ResolveExpression(m.Groups[0].Value.Substring(1, m.Groups[0].Value.Length - 2)).ToString());
        }

        private int ResolveExpression(string expression) 
            => expression.Split("+").Select(s => ResolveMultiply(s)).Sum(i => i);

        private int ResolveMultiply(string expression)
            => expression.Split("*").Select(s => Int32.Parse(s)).Aggregate((a, b) => a * b);
    }

    public class ViewModel
    {
        public int? Eval { get; set; }
        public History LastHistory { get; set; }
        public int? SyntaxErrorPosition { get; set; }
    }

    public class History
    {
        public string Expression { get; set; }
        public int Eval { get; set; }
    }

    public class ExpressionValidator
    {
	    readonly String expression;
	    int position = 0;
	    bool insideBracket = false;

        enum TermType { Digit, Operator, LeftBracket, RightBracket, Unknown }
	
	    public ExpressionValidator(string expression)
	    {
		    this.expression = expression;
	    }

        private TermType GetTermType(string e)
        {
            if (IsDigit(e))
                return TermType.Digit;
            if (IsOperator(e))
                return TermType.Operator;
            if (IsLeftBracket(e))
                return TermType.LeftBracket;
            if (IsRightBracket(e))
                return TermType.RightBracket;
            return TermType.Unknown;
        }

        public int Validate()
        {
            var e = expression[0].ToString();
            if (IsOperator(e) || IsRightBracket(e))
                return 0;
		    if (e == "(")
			    insideBracket = true;
		
		    while (position < expression.Length - 1)
		    {
			    var term = expression[position].ToString();
			    var nextTerm = expression[position + 1].ToString();
                var type = GetTermType(term);
                switch (type)
                {
                    case TermType.Digit:
			            if ((!insideBracket && !IsOperator(nextTerm)) || (insideBracket && !IsOperator(nextTerm) && !IsRightBracket(nextTerm)))
					        return position + 1;
                        break;
                    case TermType.Operator:
                        if ((insideBracket && !IsDigit(nextTerm)) || (!insideBracket && !IsDigit(nextTerm) && !IsLeftBracket(nextTerm)))
					        return position + 1;
                        break;
                    case TermType.LeftBracket:
				        if (!IsDigit(nextTerm))
					        return position + 1;
				        insideBracket = true;
                        break;
                    case TermType.RightBracket:
                        if (!IsOperator(nextTerm))
					        return position + 1;
                        insideBracket = false;
                        break;
                    default:
                        return 0;
			    }
			    position++;
		    }
		
            if (insideBracket && expression[position] != ')')
                return expression.LastIndexOf('(');

            return -1;
	    }
	
	    private bool IsDigit(string e) => Regex.Match(e, @"\d").Success;
	    private bool IsOperator(string e) => e == "+" || e == "*";
	    private bool IsLeftBracket(string e) => e == "(";
	    private bool IsRightBracket(string e) => e == ")";
    }
}
