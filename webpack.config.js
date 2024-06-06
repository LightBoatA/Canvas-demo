const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
          },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg|woff|eot|otf|webp|tff)$/i,
                type: "asset",
                // include:[srcDir], // 可以转为base64
                parser: {
                    dataUrlCondition: {
                        maxSize: 0.01 * 1024 // 小于10kb的图片被base64处理
                    }
                },
                generator: {
                    filename: 'static/image/[name]-[hash:6][ext]' // 图片的输出路径
                }
            },  // 字体视频文件的处理
            {
                test: /\.(ttf|woff2?|map4|map3|avi|xlsx|ttc)$/,
                type: "asset/resource", // 原封不动的输出
                generator: {
                    filename: "static/media/[name]-[hash:6][ext]",
                },
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
                type: 'javascript/auto',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    devServer: {
        static: path.join(__dirname, 'dist'), // 指定提供静态资源的目录
        port: 8000,
    },
};
