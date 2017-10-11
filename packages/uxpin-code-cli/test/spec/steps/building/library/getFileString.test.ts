import { getFileString } from '../../../../../src/steps/building/library/getFileString';
import { ComponentImplementationInfo } from '../../../../../src/steps/discovery/component/ComponentInfo';
import { ComponentDefinition } from '../../../../../src/steps/serialization/component/ComponentDefinition';

describe('getFileString', () => {

  const implementation:ComponentImplementationInfo = { path: '', framework: 'reactjs', lang: 'javascript' };

  it('returns content of library file for list of ComponentInfo', () => {
    const components:ComponentDefinition[] = [
      {
        dirPath: 'src/components/button',
        implementation,
        name: 'button',
        properties: [],
      },
      {
        dirPath: 'src/components/button-list',
        implementation,
        name: 'button-list',
        properties: [],
      },
    ];

    const expectedFileString:string = `import Button from '../src/components/button/button';
import ButtonList from '../src/components/button-list/button-list';
export {
  Button,
  ButtonList,
};`;

    // when
    const result:string = getFileString(components);

    // then
    expect(result).toEqual(expectedFileString);
  });

  it('returns content of library file for list of ComponentInfo and path of custom wrapper', () => {
    const components:ComponentDefinition[] = [
      {
        dirPath: 'src/components/button',
        implementation,
        name: 'button',
        properties: [],
      },
      {
        dirPath: 'src/components/button-list',
        implementation,
        name: 'button-list',
        properties: [],
      },
    ];

    const wrapperPath:string = './wrapper/wrapper.jsx';

    const expectedFileString:string = `import Button from '../src/components/button/button';
import ButtonList from '../src/components/button-list/button-list';
import Wrapper from './wrapper/wrapper.jsx';
export {
  Button,
  ButtonList,
  Wrapper,
};`;

    // when
    const result:string = getFileString(components, wrapperPath);

    // then
    expect(result).toEqual(expectedFileString);
  });
});
