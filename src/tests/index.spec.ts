import { it, expect, vi } from 'vitest';
import { rollup } from 'rollup';
import fs from 'node:fs';

import nodeWasmPlugin from '../index';

import { getCodeFromBundle, virtualPlugin } from './testUtils';

import { matchingCode, notMatchingCode } from './testData';

/**
 * run rollup with `nodeWasm` plugin
 * @param code fake code representing the input module
 * @returns transformed code
 */
const runRollupForInputCodeString = async (code: string) => {
  const bundle = await rollup({
    input: 'no-match',
    treeshake: false,
    plugins: [virtualPlugin(code), nodeWasmPlugin()],
  });

  return getCodeFromBundle(bundle);
};

/**
 * @target the plugin should ignore any code that does not contain search regex
 * @dependencies
 * @scenario
 * - run rollup with an input module which doesn't represent a valid wasm
 *   wrapper module
 * @expected
 * - transformed code should not contain any inline wasm
 */
it('should ignore any code that does not contain search regex', async () => {
  const code = await runRollupForInputCodeString(notMatchingCode);

  expect(code).not.toContain('Buffer.from');
});

/**
 * @target the plugin should transform wasm correctly
 * @dependencies
 * @scenario
 * - run rollup with an input module which represents a valid wasm wrapper
 *   module
 * @expected
 * - transformed code should contain inline wasm
 */
it('should transform wasm correctly', async () => {
  vi.spyOn(fs.promises, 'readFile').mockResolvedValue('foo');

  const code = await runRollupForInputCodeString(matchingCode);

  expect(code).toContain("const bytes = Buffer.from('foo', 'base64');");
});
