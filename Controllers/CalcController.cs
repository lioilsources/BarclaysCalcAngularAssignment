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
            var res = ResolveExpression(ResolveBrackets(expression));
            history.Add(new History
            {
                Expression = expression,
                Result = res
            });
            return new ViewModel
            {
                Result = res,
                History = history.ToArray()
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
    }

    public class History
    {
        public string Expression { get; set; }
        public int Result { get; set; }
    }
}
