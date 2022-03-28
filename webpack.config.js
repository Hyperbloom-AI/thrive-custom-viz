var path = require('path')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var webpackConfig = {
  mode: 'production',
  entry: {
    advanced_table: './src/visualizations/advanced_table/advanced_table.js',
    v1_common: './src/common/common-entry.js',
    liquid_fill_gauge: './src/visualizations/liquid_fill_gauge/liquid_fill_gauge.ts',
    sunburst: './src/visualizations/sunburst/sunburst.ts',
    chord: './src/visualizations/chord/chord.ts',
    treemap: './src/visualizations/treemap/treemap.ts',
    image_carousel: './src/visualizations/image_carousel/image_carousel.js',
    d3_test: './src/visualizations/tests/custom-d3-test.js',
    custom_companies_table: './src/visualizations/custom_companies_table/custom_companies_table.js',
    custom_intent_table: './src/visualizations/custom_intent_table/custom_intent_table.js',
    custom_companies_synopsis: './src/visualizations/custom_companies_synopsis/custom_companies_synopsis.js',
    custom_intent_synopsis: './src/visualizations/custom_intent_synopsis/custom_intent_synopsis.js',
    custom_company_headcount: './src/visualizations/company_headcount/company_headcount.js',
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
    maxAssetSize: 512000
  },
  devServer: {
    allowedHosts: [
      'all',
    ],
    disableHostCheck: true,
  }
}

module.exports = webpackConfig
