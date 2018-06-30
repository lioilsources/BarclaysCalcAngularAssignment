using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Calc.Controllers
{
    [Route("api/[controller]")]
    public class CalcController : Controller
    {
        static readonly List<(string expression, int result)> history = new List<(string expression, int result)>();

        [HttpGet("[action]")]
        public int Eval(string expression)
        {
            var res = expression.Split("+").Select(s => ResolveMultiply(s)).Sum(i => i);
            history.Add((expression, res));
            return res;
        }

        int ResolveMultiply(string expression)
        {
	        return expression.Split("*").Select(s => Int32.Parse(s)).Aggregate((a, b) => a * b);
        }

        [HttpGet("[action]")]
        public List<(string expression, int result)> ListHistory() => history;
    }
}
