import { parse, Syntax, Token } from 'markdown-to-ast';
import { WarningDetails } from '../../../../common/warning/WarningDetails';
import { readFile } from '../../../../utils/fs/readFile';
import { ExamplesSerializationResult } from './ExamplesSerializationResult';

interface TokenWithValue extends Token {
  value:string;
}

export function serializeExamples(filePath:string):Promise<ExamplesSerializationResult> {
  return readFile(filePath, { encoding: 'utf8' })
    .then((content) => parse(content).children
      .filter((node) => node.type === Syntax.CodeBlock && isSupportedLang(node.lang) && node.value)
      .map((codeBlock) => ({ code: (codeBlock as TokenWithValue).value })))
    .then((examples) => ({ result: examples, warnings: [] }))
    .catch(thunkGetResultForInvalidExamples(filePath));
}

function isSupportedLang(lang?:string):boolean {
  return !!lang && [
    'javascript',
    'js',
    'jsx',
    'typescript',
    'ts',
    'tsx',
  ].includes(lang);
}

function thunkGetResultForInvalidExamples(sourcePath:string):(e:Error) => ExamplesSerializationResult {
  return (originalError) => {
    const warning:WarningDetails = {
      message: 'Cannot serialize component examples',
      originalError,
      sourcePath,
    };
    return { result: [], warnings: [warning] };
  };
}
