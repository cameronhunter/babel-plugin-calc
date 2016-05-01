{
  const createValue = (value, units) => ({
    value,
    units,
    toString() {
      return units ? value + units : parseInt(value, 10);
    }
  });

  const equalUnits = (left, right) => {
    const objects = typeof left === "object" && typeof right === "object";
    const units = !(left.units && right.units) && left.units === right.units;
    return objects && units;
  };

  const buildExpression = (head, tail) => {
    return tail.reduce((left, { operator, right }) => {
      if (equalUnits(left, right)) {
        return createValue(eval(left.value + operator + right.value), left.units || right.units);
      } else {
        return `calc(${left}${operator}${right})`;
      }
    }, head);
  }
}

Start
  = result:Atom
    { return result.toString(); }

Atom
  = Value
  / "calc"? "(" expression:Expression ")"
  	{ return expression; }

Expression
  = head:MultiplyExpression tail:(_ operator:("+" / "-") _ right:MultiplyExpression { return { operator, right } })*
    { return buildExpression(head, tail); }

MultiplyExpression
  = head:Atom tail:(_ operator:("*" / "/") _ right:Atom { return { operator, right }; })*
    { return buildExpression(head, tail); }

Value
  = value:Number units:Units?
    { return createValue(value, units); }

Units
  = "px" / "rem" / "em"

Number
  = $("-"? ([0-9] / [1-9][0-9]*))

_ "Whitespace"
  = [ ]*
