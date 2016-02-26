const StringLiteral = 'StringLiteral';
const NumericLiteral = 'NumericLiteral';
const BinaryExpression = 'BinaryExpression';

export default babel => ({
  visitor: {
    CallExpression(path) {
      if (path.get('callee').isIdentifier({ name: 'calc' }) && path.node.arguments.length == 1) {
        path.replaceWith(calc(path.node.arguments[0]));
      }
    }
  }
});

const calc = ({ left, operator, right }) => {
  if (left.type === BinaryExpression) {
    return calc({ left: calc(left), operator: operator, right: right });
  }

  if (right.type === BinaryExpression) {
    return calc({ left: left, operator: operator, right: calc(right) });
  }

  if (left.type == NumericLiteral && right.type == NumericLiteral) {
    return { type: NumericLiteral, value: evaluate(left.value + operator + right.value) };
  }

  if (left.type == NumericLiteral && right.type == StringLiteral) {
    const r = split(right.value);
    return { type: StringLiteral, value: evaluate(left.value + operator + r.value, r.units) };
  }

  if (left.type == StringLiteral && right.type == NumericLiteral) {
    const l = split(left.value);
    return { type: StringLiteral, value: evaluate(l.value + operator + right.value, l.units) };
  }

  if (left.type == StringLiteral && right.type == StringLiteral) {
    const l = split(left.value);
    const r = split(right.value);
    if (l.units == r.units) {
      return { type: StringLiteral, value: evaluate(l.value + operator + r.value, l.units) };
    }
  }

  return { type: StringLiteral, value: `calc(${String(left.value) + operator + String(right.value)})` };
};

const evaluate = (code, units) => eval(code) + units;

const split = input => {
  const regex = /([0-9]+\.?[0-9]*)(\w+)?/;
  const value = input.replace(regex, '$1');
  const units = input.replace(regex, '$2');

  return { value, units };
};
