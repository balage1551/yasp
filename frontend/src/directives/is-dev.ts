// import Vue from 'vue'
// TODO
// Vue.directive('is-dev', {
//
//     bind: function(el, binding, vnode) {
//         if (isNotDevMode()) {
//             vnode.elm.style.display = 'none'
//         }
//     }
// })

export function isNotDevMode() {
  return import.meta.env.MODE !== 'development' && import.meta.env.MODE !== 'local'
}
