import { COCOS } from 'compile-constant';
import { expect, test } from 'vitest';

test('The Environment is default.', () => {
  expect(COCOS).toBe(false);
});
