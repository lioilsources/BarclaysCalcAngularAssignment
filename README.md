Simple SPA application with front-end in Angular 4 and back-end in .NET CORE MVC.

Application consist of two displays for displaying entered expression and its
evaluation. You can find a small H (History) button here.
Enter expression by calculation like buttons, digits, operators, brackets
and eval button.
There is also C (Clear) button to clear unwanted expression either.

All validation logic is implemented on server.

Application is handling its history on client b/c of performance.
Instead of transferring full history on every eval request, history
is incremented by actual expression and its result.
It solve the problem of refreshing history list if it is visible on eval.

If history is stored on server, you need to get full history in every request or
either send two request on server on eval (first for evaluating expression,
second for updating full history). So it is inefficient.

In my solution, there is no need to push notification from server to client
on history update.

Application is handling expression on client too. I think it is inefficient to
make server request on every expression term. Business logic on client is
simple.

Both a) and b) optional tasks were implemented.
a) expression is under dotted where starts to be invalid
b) “Sorry, this is too complex" is not implemented, instead of that, expression
is visually emphasize invalid expression