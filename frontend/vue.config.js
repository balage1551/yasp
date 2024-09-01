// vue.config.js
const StringReplacePlugin = require('string-replace-webpack-plugin')
const path = require('path')

module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        },
        // configure replacements for file patterns
        {
          test: /\.vue$/,
          loader: StringReplacePlugin.replace({
            replacements: [
              {
                pattern: /<[^>]+v-model[^>/]+/g,
                replacement: function(match, p1, offset, string) {
                  if (!match.includes('id="')) {
                    const innerRegex = /(?<=v-model=")[^"]+/g
                    const vmodelRegexResult = match.match(innerRegex)[0]
                    match += '   id="' + vmodelRegexResult.replace('.', '-').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) + '"'
                  }
                  return match
                }
              }
            ]
          })
        }
      ]
    },
    plugins: [
      new StringReplacePlugin(),
    ]
  },
}
