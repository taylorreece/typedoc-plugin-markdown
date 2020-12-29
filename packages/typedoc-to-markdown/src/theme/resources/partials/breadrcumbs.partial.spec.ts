import { TestApp } from '../../../../test/test-app';

describe(`Breadcrumbs:`, () => {
  let testApp: TestApp;

  describe(`(with readme)`, () => {
    beforeAll(() => {
      testApp = new TestApp();
      testApp.bootstrap();
      console.log(testApp.project);
    });

    test(`should compile README breadcrumbs'`, () => {
      expect('hello').toMatchSnapshot();
    });
  });
});
