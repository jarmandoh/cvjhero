
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/CV/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/CV"
  },
  {
    "renderMode": 2,
    "route": "/CV/contacto"
  },
  {
    "renderMode": 2,
    "route": "/CV/experiencia"
  },
  {
    "renderMode": 2,
    "route": "/CV/proyectos"
  },
  {
    "renderMode": 2,
    "route": "/CV/servicios"
  },
  {
    "renderMode": 2,
    "redirectTo": "/CV",
    "route": "/CV/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 17985, hash: 'ec01d4bd44f45460c880f03ee405cce958b43c48cb064076318ed27660a8e740', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1091, hash: '92c9c2b0fb5a35d15b14e7a86934c6a93f3e9a4c15b42f4cb33ed80d88e5eac0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 31084, hash: '686fe557aecb5b94ad2a2e602f963a44ff8597eb3690aed623006746ee048d31', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 31612, hash: '29fde2cb6ac069887422a300817b9a24b2753addd9bb27c09ee014f2deb23e31', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'index.html': {size: 30599, hash: 'e48351e2f037d77aacacf71e80e52b836726d26b8ae63ba782e92821d88e32f5', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'proyectos/index.html': {size: 31762, hash: '8ebf52094d5cccd1775139bb474dd3d5bbb348834f574b37df84430774ba7dc8', text: () => import('./assets-chunks/proyectos_index_html.mjs').then(m => m.default)},
    'experiencia/index.html': {size: 48028, hash: '763ed524a415a42cb260137d86514389fad38bc2c9ca1980f82f53cf16ebdf01', text: () => import('./assets-chunks/experiencia_index_html.mjs').then(m => m.default)},
    'styles-JCKWOO4X.css': {size: 30205, hash: 'QsqnTSdOZuY', text: () => import('./assets-chunks/styles-JCKWOO4X_css.mjs').then(m => m.default)}
  },
};
