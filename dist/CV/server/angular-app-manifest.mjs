
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
    'index.csr.html': {size: 18060, hash: '54e4d08bdd738fb49958d0cf78addf5a45ed7890278856fb6989a8e5f05c89fd', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1091, hash: '4c8d4386187e24f0471c777997f2e4a2300bbb6e74f568ecd656be196670a3d0', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'contacto/index.html': {size: 31164, hash: '5a17b2bdd9bfa8e0bf598f1804b5a3f604c3fc5e1ef60801e10003ab61d9e95f', text: () => import('./assets-chunks/contacto_index_html.mjs').then(m => m.default)},
    'proyectos/index.html': {size: 31842, hash: '18a7a408d7e216a312aabc2fffeccb8a0615ba6b0b474b24a40aa1d3bb2164ea', text: () => import('./assets-chunks/proyectos_index_html.mjs').then(m => m.default)},
    'index.html': {size: 30679, hash: '3326f774df81e7db6c8f57ce4ac6cb87095081e1b8fb108723d4aa8e9802e219', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'experiencia/index.html': {size: 48108, hash: '5ae079107f5b7499eef9a67718f247f03be01d1c90da3e24e0e1c6d3ba08a4b8', text: () => import('./assets-chunks/experiencia_index_html.mjs').then(m => m.default)},
    'servicios/index.html': {size: 31692, hash: '87689152ea5f305294cadd9080fbc2aae217b6eb8f8da58a938eefe3f0f7b516', text: () => import('./assets-chunks/servicios_index_html.mjs').then(m => m.default)},
    'styles-67LQAMSA.css': {size: 31076, hash: 'ApMLXCp47cg', text: () => import('./assets-chunks/styles-67LQAMSA_css.mjs').then(m => m.default)}
  },
};
