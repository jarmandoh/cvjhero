
export default {
  basePath: 'https://jarmandoh.github.io/CV',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
