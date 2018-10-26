var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var autoprefixer = require('autoprefixer');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

var env = (process.env.NODE_ENV || 'development').trim();
console.log('WEBPACK CONFIG ENV', env);
module.exports = {
    devtool: 'source-map',
    context: path.join(__dirname, './client'),
    entry: {
        jsx: ['./styles.js', './index.js'],
        //html: env==='production'?'./index-prod.htm':'./index-dev.html',
        //html: './index.html',
        // vendor: ['react']
    },
    output: {
        path: path.join(__dirname, './'+env+'/build'),
        //path: path.join(__dirname, './build'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
    sassLoader: {
      data: "@import '"+path.resolve(__dirname, 'client/sass/react-toolbox-theme.scss').replace(/\\/g, '/')+"';"
    },
    plugins: [
        env === 'production' ? new webpack.optimize.UglifyJsPlugin() : ()=>{},
       // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new webpack.DefinePlugin({
            'process.env': {NODE_ENV: JSON.stringify(env)},
            // 'SERVICE_URL': JSON.stringify(process.env.SERVICE_URL),
            'API_KEY': JSON.stringify(process.env[env+'_API_KEY']),
            'AUTH_DOMAIN': JSON.stringify(process.env[env+'_AUTH_DOMAIN']),
            'DATABASE_URL': JSON.stringify(process.env[env+'_DATABASE_URL']),
            'STORAGE_URL': JSON.stringify(process.env[env+'_STORAGE_URL']),
            'TEMPLATE_ID': JSON.stringify(process.env[env+'_TEMPLATE_ID']),
            'INTERCOM_KEY': JSON.stringify(process.env[env+'_INTERCOM_KEY']),
            'STRIPE_PUBLIC_KEY': JSON.stringify(process.env[env+'_STRIPE_PUBLIC_KEY']),
            'STRIPE_PAYMENT_URL': JSON.stringify(process.env[env+'_STRIPE_PAYMENT_URL']),
        }),
        new ExtractTextPlugin('style.css', {
            allChunks: true
        }),
        new CopyWebpackPlugin([
            { from: 'public', to: 'public' }
        ]),
        new HtmlWebpackPlugin({
            hash: true,
            //path: path.join(__dirname, './'+env+'/build'),
            path: path.join(__dirname, './client'),
            //path: path.join(__dirname, './build'),
            filename: 'index.html', //relative to root of the application,
            //title: 'My Awesome application',
            intercomId: JSON.stringify(process.env[env+'_INTERCOM_KEY']),
            template: env==='production'?'./index-prod.htm':'./index-dev.html'
        })
    ],
    devServer: {
        contentBase: './client',
        hot: true
    },
    module: {
        loaders: [
            /*{
                test: /\.html$/,
                loader: 'file?name=[name].[ext]'
            },*/
            //{ test: /\.html?$/, loader: 'html-loader'},
            {
                test: /(\.scss|\.css)$/,
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[path][name]---[local]---[hash:base64:5]!postcss!sass')
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, './client')
                ],
                loaders: ['react-hot', 'babel-loader']
            },
            {
                test: /\.json$/, loader: "json-loader"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&name=[name].[ext]'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&name=[name].[ext]'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&name=[name].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&&name=[name].[ext]'
            },
            {
                test: /\.png$/,
                loader: 'url?limit=100000&mimetype=image/png'
            },
            {
                test: /\.svg$/,
                loader: 'url?limit=100000&mimetype=image/svg+xml'
            },
            {
                test: /\.gif$/,
                loader: 'url?limit=100000&mimetype=image/gif'
            },
            {
                test: /\.jpg$/,
                loader: 'file'
            },
            {
                test: /\.swf$/,
                loader: 'file'
            }
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    }
};
