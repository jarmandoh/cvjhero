
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://jarmandoh.github.io/CV/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/https:/jarmandoh.github.io/CV"
  },
  {
    "renderMode": 2,
    "route": "/https:/jarmandoh.github.io/CV/contacto"
  },
  {
    "renderMode": 2,
    "route": "/https:/jarmandoh.github.io/CV/experiencia"
  },
  {
    "renderMode": 2,
    "route": "/https:/jarmandoh.github.io/CV/proyectos"
  },
  {
    "renderMode": 2,
    "route": "/https:/jarmandoh.github.io/CV/servicios"
  },
  {
    "renderMode": 2,
    "redirectTo": "/https://jarmandoh.github.io/CV",
    "route": "/https:/jarmandoh.github.io/CV/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 16604, hash: 'd1bc6e69472ccabfe6411a66650df09642af1375cad28b0157c46147980b1264', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1118, hash: '34e021775066363a323e1e0292e85e58e03ea56e62a8ed6e73e66f6c64cc2e0d', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'https:/jarmandoh.github.io/CV/experiencia/index.html': {size: 29244, hash: '2d68795390f116c02e66c9137d954f40e11a31d853b180a9a38a814881843db5', text: () => import('./assets-chunks/https:_jarmandoh_github_io_CV_experiencia_index_html.mjs').then(m => m.default)},
    'https:/jarmandoh.github.io/CV/index.html': {size: 29244, hash: '2d68795390f116c02e66c9137d954f40e11a31d853b180a9a38a814881843db5', text: () => import('./assets-chunks/https:_jarmandoh_github_io_CV_index_html.mjs').then(m => m.default)},
    'https:/jarmandoh.github.io/CV/contacto/index.html': {size: 29244, hash: '2d68795390f116c02e66c9137d954f40e11a31d853b180a9a38a814881843db5', text: () => import('./assets-chunks/https:_jarmandoh_github_io_CV_contacto_index_html.mjs').then(m => m.default)},
    'https:/jarmandoh.github.io/CV/proyectos/index.html': {size: 29244, hash: '2d68795390f116c02e66c9137d954f40e11a31d853b180a9a38a814881843db5', text: () => import('./assets-chunks/https:_jarmandoh_github_io_CV_proyectos_index_html.mjs').then(m => m.default)},
    'https:/jarmandoh.github.io/CV/servicios/index.html': {size: 29244, hash: '2d68795390f116c02e66c9137d954f40e11a31d853b180a9a38a814881843db5', text: () => import('./assets-chunks/https:_jarmandoh_github_io_CV_servicios_index_html.mjs').then(m => m.default)},
    'styles-VFLBS7KN.css': {size: 27418, hash: '68YaKcNDHMo', text: () => import('./assets-chunks/styles-VFLBS7KN_css.mjs').then(m => m.default)}
  },
};
