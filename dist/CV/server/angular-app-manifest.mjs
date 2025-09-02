
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
    'index.csr.html': {size: 4739, hash: 'aa6c89d1c37e3ffe0b986b36596733590bee1dba7db6124a6c2c4f43a08550b3', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1078, hash: '0ca7e182ee6d3391edb3f0a425f32a7deeb3b69ab4c8c46c5cce9a5d4a867cbd', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 16275, hash: '22af8c957584c8da2fd005b6e684a5a95c45ccc931a46b5a31d10d6d1a6db136', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'proyectos/index.html': {size: 17438, hash: '5fbbe187ef002e8133c5a1c77322f27b2e59e849093ef42600ecea92b5b45519', text: () => import('./assets-chunks/proyectos_index_html.mjs').then(m => m.default)},
    'experiencia/index.html': {size: 33592, hash: 'e5658eeeb666c7f8aab5322f941fdb1fac43768cbd84e00714b416cd5b56f3d3', text: () => import('./assets-chunks/experiencia_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 17349, hash: '0904c03df6d25a55936b446f5c95f2cc08cf1a6f34846247d9f5b939afeb1ccc', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 16821, hash: 'abf1b75c3e4e38acc24c0aa4c18f1b92aab732de70fca6dce355f9bf489d1a39', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'styles-EPY6WBAV.css': {size: 15241, hash: 'u+GaoZX7gag', text: () => import('./assets-chunks/styles-EPY6WBAV_css.mjs').then(m => m.default)}
  },
};
