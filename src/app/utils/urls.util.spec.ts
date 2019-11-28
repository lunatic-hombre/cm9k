import {path} from './urls.util';

describe('url utils', () => {

  describe('path', () => {

    it('should combine paths', () => {
      expect(path('http://localhost:8080/', '/api', 'foo', '//bar', '/100')).toBe('http://localhost:8080/api/foo/bar/100');
      expect(path('http://localhost:8080/', '/api', 'foo', 'bar', '/100/')).toBe('http://localhost:8080/api/foo/bar/100/');
      expect(path('http://localhost:8080/', '/api', undefined, 'bar', '/100/')).toBe('http://localhost:8080/api/bar/100/');
    });

  });

});
