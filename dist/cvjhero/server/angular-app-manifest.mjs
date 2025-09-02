
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/cvjhero/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/cvjhero"
  },
  {
    "renderMode": 2,
    "route": "/cvjhero/contacto"
  },
  {
    "renderMode": 2,
    "route": "/cvjhero/experiencia"
  },
  {
    "renderMode": 2,
    "route": "/cvjhero/proyectos"
  },
  {
    "renderMode": 2,
    "route": "/cvjhero/servicios"
  },
  {
    "renderMode": 2,
    "redirectTo": "/cvjhero",
    "route": "/cvjhero/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 16582, hash: '97720aa5bc0d3511454f9ad56a670b7bdc2ca1314960b094311e42d8c47280ed', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1096, hash: 'a04b92f57616c5c1472b1f0abaca7807928d74d7c860cf306db3085965b8b680', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 29619, hash: 'd3728fe7b22534c33041230dc72ce9bc2da06468c9d65166eeda6b0914f5852b', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 30147, hash: '1f4ab08ee16ebcc8fc1943c51552206e61363c74b9765e5e0e50fba5a170c8de', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'experiencia/index.html': {size: 46563, hash: '0edf60404de90a531dc4be46a9583330bc189bdc8dd7e9b616f73b1c2a68089f', text: () => import('./assets-chunks/experiencia_index_html.mjs').then(m => m.default)},
    'proyectos/index.html': {size: 30297, hash: '7c70dddc5f3ab258c3ec1819b69a564141e1d2282f561e759873203ed075200d', text: () => import('./assets-chunks/proyectos_index_html.mjs').then(m => m.default)},
    'index.html': {size: 29134, hash: '2e3c75399407f31a93f1b133e344980e47698d1eff3e4336399b2baaf911ee7d', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-VFLBS7KN.css': {size: 27418, hash: '68YaKcNDHMo', text: () => import('./assets-chunks/styles-VFLBS7KN_css.mjs').then(m => m.default)}
  },
};
