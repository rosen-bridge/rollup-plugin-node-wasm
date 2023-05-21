import { Plugin, RollupBuild } from 'rollup';

/**
 * a test helper virtual plugin, returning a piece of code for all module ids
 * @param code fake code to return for every module id
 */
export const virtualPlugin = (code: string): Plugin => ({
  name: 'virtual',
  resolveId(id) {
    return id;
  },
  load() {
    return code;
  },
});

/**
 * get code from a rollup bundle object
 * @param bundle
 */
export const getCodeFromBundle = async (bundle: RollupBuild) => {
  const { output } = await bundle.generate({});
  const [{ code }] = output;

  return code;
};
