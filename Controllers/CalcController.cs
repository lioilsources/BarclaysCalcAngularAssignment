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
        static readonly List<History> history = new List<History>();

        [HttpGet("[action]")]
        public ViewModel Eval(string expression)
        {
            var syntaxErrorPosition = new ExpressionValidator(expression).Validate();
            if (syntaxErrorPosition >= 0)
            {
                return new ViewModel
                {
                    Result = -1,
                    History = history.ToArray(),
                    SyntaxErrorPosition = syntaxErrorPosition
                };
            }

            var res = ResolveExpression(ResolveBrackets(expression));
            history.Add(new History
            {
                Expression = expression,
                Result = res
            });
            return new ViewModel
            {
                Result = res,
                History = history.ToArray(),
                SyntaxErrorPosition = -1
            };
        }

        string ResolveBrackets(string expression)
        {
            var pattern = @"(\([\d\*\+]+\))";
	        return Regex.Replace(expression, pattern, m => ResolveExpression(m.Groups[0].Value.Substring(1, m.Groups[0].Value.Length - 2)).ToString());
        }

        int ResolveExpression(string expression) 
            => expression.Split("+").Select(s => ResolveMultiply(s)).Sum(i => i);

        int ResolveMultiply(string expression)
            => expression.Split("*").Select(s => Int32.Parse(s)).Aggregate((a, b) => a * b);
    }

    public class ViewModel
    {
        public int Result { get; set; }
        public History[] History { get; set; }
        public int SyntaxErrorPosition { get; set; }
    }

    public class History
    {
        public string Expression { get; set; }
        public int Result { get; set; }
    }

    public class ExpressionValidator
    {
	    readonly String expression;
	    int position = 0;
	    bool insideBracket = false;
	
	    public ExpressionValidator(string expression)
	    {
		    this.expression = expression;
	    }
	
	    public int Validate()
	    {
		    var e = expression[0].ToString();
		    if (!(isDigit(e) || (e == "(" && expression.Length == 1)))
                return 0;
		    if (e == "(")
			    insideBracket = true;
		
		    while (position < expression.Length - 1)
		    {
			    var term = expression[position].ToString();
			    var nextTerm = expression[position + 1].ToString();
			    if (isDigit(term))
			    {
				    if ((!insideBracket && !isOperator(nextTerm)) || (insideBracket && !isOperator(nextTerm) && !isRightBracket(nextTerm)))
					    return position + 1;
			    }
			    if (isLeftBracket(term))
			    {
				    if (!isDigit(nextTerm))
					    return position + 1;
				    insideBracket = true;
			    }
			    if (isOperator(term))
			    {
				    if ((insideBracket && !isDigit(nextTerm)) || (!insideBracket && !isDigit(nextTerm) && !isLeftBracket(nextTerm)))
					    return position + 1;
			    }
			    if (isRightBracket(term))
			    {
				    if (!isOperator(nextTerm))
					    return position + 1;
                    insideBracket = false;
			    }
			    position++;
		    }
		
            if (insideBracket && expression[position] != ')')
                return expression.LastIndexOf('(');

            return -1;
	    }
	
	    bool isDigit(string e) => Regex.Match(e, @"\d").Success;
	    bool isOperator(string e) => e == "+" || e == "*";
	    bool isLeftBracket(string e) => e == "(";
	    bool isRightBracket(string e) => e == ")";
}

}
