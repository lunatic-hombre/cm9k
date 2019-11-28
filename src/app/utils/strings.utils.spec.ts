import {lastChar, trim} from './strings.util';

describe('string utils', () => {

  describe('trim', () => {

    it('should do nothing when there is nothing to trim', () => {
      expect(trim('this is a test', '%')).toBe('this is a // test');
    });

    it('should trim the given characters', () => {
      const expected = 'this is a // test';
      expect(trim('///this is a // test', '/')).toBe(expected);
      expect(trim('this is a // test///', '/')).toBe(expected);
      expect(trim('///this is a // test///', '/')).toBe(expected);
    });

  });

  describe('last char', () => {

    it('should return nothing if nothing is entered', () => {
      expect(lastChar(undefined)).toBeUndefined();
      expect(lastChar('')).toBe('');
    });

    it('should return the last char of a string', () => {
      expect(lastChar('a')).toBe('a');
      expect(lastChar('abc')).toBe('c');
    });

  });

});
