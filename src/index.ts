import fs from 'node:fs';

import { Node, asyncWalk } from 'estree-walker';
import MagicString from 'magic-string';
import { Plugin } from 'rollup';

const SEARCH_REGEX = /const path = .*\.join\(__dirname, '.*_bg\.wasm'\)/;

const astSearchHelpers = {
  VARIABLE_NAME: 'path',
  CALLEE_NAME: 'join',
  ARGUMENT_0: '__dirname',
  ARGUMENT_1_SUFFIX: '.wasm',
};

/**
 * check if an AST node represent the special wasm-pack statement we search for
 * @param node
 */
const isWasmPackWasmPathStatement = (node: Node) =>
  node.type === 'VariableDeclaration' &&
  node.declarations[0].id.type === 'Identifier' &&
  node.declarations[0].id.name === astSearchHelpers.VARIABLE_NAME &&
  node.declarations[0].init?.type === 'CallExpression' &&
  node.declarations[0].init?.callee.type === 'MemberExpression' &&
  node.declarations[0].init?.callee.property.type === 'Identifier' &&
  node.declarations[0].init?.callee.property.name ===
    astSearchHelpers.CALLEE_NAME &&
  node.declarations[0].init.arguments[0].type === 'Identifier' &&
  node.declarations[0].init.arguments[0].name === astSearchHelpers.ARGUMENT_0 &&
  node.declarations[0].init.arguments[1].type === 'Literal' &&
  typeof node.declarations[0].init.arguments[1].value === 'string' &&
  node.declarations[0].init.arguments[1].value.endsWith(
    astSearchHelpers.ARGUMENT_1_SUFFIX
  );

const plugin = (): Plugin => {
  return {
    name: 'rollup-plugin-node-wasm',
    async transform(code, id) {
      if (!SEARCH_REGEX.test(code)) {
        return null;
      }

      const ast = this.parse(code);
      const magicString = new MagicString(code);

      await asyncWalk(ast as Node, {
        async enter(node, parent, key, index) {
          if (isWasmPackWasmPathStatement(node)) {
            const bytes = await fs.promises.readFile(
              id.slice(0, -3) + '_bg.wasm'
            );
            const bytesString = bytes.toString('base64');

            magicString.update(
              (node as any).start,
              (parent as any).body[(index || 0) + 1].end,
              `const bytes = Buffer.from('${bytesString}', 'base64');`
            );

            this.skip();
          }
        },
      });

      return {
        code: magicString.toString(),
        map: magicString.generateMap(),
      };
    },
  };
};

export default plugin;
