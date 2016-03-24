import test from 'ava';
import { transform as babel } from 'babel-core';
import calc from '../src';

const transform = code => babel(code, { plugins: [calc] }).code;

test(t => {
  t.is(transform('var foo = calc("5px" * 3);'), 'var foo = "15px";');
});
