var path = require('path')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var webpackConfig = {
  mode: 'production',
  entry: {
    v1_common: './src/common/common-entry.js',
    custom_companies_table: './src/visualizations/custom/tables/custom_companies_table.js',
    custom_intent_table: './src/visualizations/custom/tables/custom_intent_table_firebolt.js',
    firebolt_intent_table: './src/visualizations/custom/tables/custom_intent_table_firebolt.js',
    custom_companies_synopsis: './src/visualizations/custom/synopses/custom_companies_synopsis.js',
    custom_intent_synopsis: './src/visualizations/custom/synopses/custom_intent_synopsis_firebolt.js',
    firebolt_intent_synopsis: './src/visualizations/custom/synopses/custom_intent_synopsis_firebolt.js',
    horizontal_bar: './src/visualizations/recycleable/bar_charts/h-bar.js',
    vertical_bar: './src/visualizations/recycleable/bar_charts/v-bar.js',
    line: './src/visualizations/recycleable/line_charts/line.js',
    custom_pbg_table: './src/visualizations/custom/tables/custom-pbg-table.js',
    map_test: './src/visualizations/custom/maps/map_test.js',
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  module: {
    rules: [
      { test: /\.js$/, loader: "babel-loader" },
      { test: /\.ts$/, loader: "ts-loader" },
      { test: /\.css$/, loader: [ 'to-string-loader', 'css-loader' ] }
    ]
  },
  stats: {
    warningsFilter: /export.*liquidfillgauge.*was not found/
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devServer: {
    allowedHosts: [
      'all',
    ],
    disableHostCheck: true,
  }
}

module.exports = webpackConfig
