#!/usr/bin/env node

const dirName = process.argv[2];
const mkdirp = require('mkdirp');
const { exec } = require('child_process');
const replace = require('replace-in-file');
const fs = require('fs');

const gitIgnoreText = `/node_modules
/build`;

const npmIgnoreText = `/src`;

const webpackText = `
var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDevelopment = false;

module.exports = {
  mode: 'production',

  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components|build)/,
        loader: 'babel-loader',
        options:{
            presets: ['env']
        }
      },
      {
        test: /\.scss$/,
        loader: 'inline-css-webpack-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss']
  },
  
  plugins: [
    /*
    new MiniCssExtractPlugin({
      //filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      //chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
      filename:'[name].css',
      chunkFilename: '[id].css'
    })*/
  ],
  externals: {
    'react': 'commonjs react' // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
  }
};


`;

const webpackDemoText = `
var path = require('path');

module.exports = {
    mode: 'production',

    entry:{
      'something':'./src/index.js',
      'AsyncActionOnInterval':'./src/AsyncActionOnInterval/demo.js',
      'SkinnyPano':'./src/BootstrapFrames/SkinnyPano/demo.js',
      'InfiniteScroll':'./src/InfiniteScroll/demo.js',
      'Article':'./src/Article/demo.js',
      'DialogBasedOnDialogMessage':'./src/DialogBasedOnDialogMessage/demo.js',
      'MultipleArticleHeaderFrames':'./src/BootstrapFrames/MultipleArticleHeaderFrames/demo.js'

    },
    output:{
        path: path.resolve(__dirname, 'build'),
        filename: 'demo/[name].js'
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /(node_modules|bower_components|build)/,
            loader: 'babel-loader',
            options:{
                presets: ['env']
            }
          },
          {
            test: /\.scss$/,
            loader: 'inline-css-webpack-loader'
          }
        ]
    }
}
`;

const devDependencies ='babel-cli babel-core babel-loader babel-plugin-transform-object-rest-spread babel-plugin-transform-react-jsx babel-preset-env css-loader inline-css-webpack-loader mini-css-extract-plugin node-sass postcss-css-variables react-dom sass-loader style-loader webpack webpack-cli webpack-dev-server';

function installDevDependencies(){
    return new Promise((resolve,reject)=>{
        exec(`npm install --save-dev ${devDependencies}`,(err)=>{
            if(err) {
                reject(err);
            }
            else resolve();
        });
    })
}

function writeDemoWebpackFile(){
    return new Promise((resolve,reject)=>{
        fs.writeFile("demo.config.js",webpackDemoText, function(err) {
            if(err) {
                reject(err);
            }
            else resolve();
        }); 
    })
}

function writeWebpackFile(){
    return new Promise((resolve,reject)=>{
        fs.writeFile("webpack.config.js",webpackText, function(err) {
            if(err) {
                reject(err);
            }
            else resolve();
        }); 
    })
}

function initNpm(){
    return new Promise((resolve,reject)=>{
        exec('npm init -y',(err)=>{
            if (err) reject(err);
            else {
                replace.sync({
                    files: 'package.json',
                    from: /1\.0\.0/g,
                    to: '0.0.0',
                  }); //I like versions to start at 0.0.0
                  resolve();
            }
        });
    });
}

function makeDir(){
    return new Promise((resolve,reject)=>{
        mkdirp(dirName,(err)=>{
            if (err) reject(err);
            else resolve();
        })
    })
}

function cdIntoDir(){
    return new Promise((resolve,reject)=>{
        /*
        exec(`cd ${dirName}`,(err)=>{
            if (err) reject(err);
            else resolve();
        });
        
        //doesn't remain
        
        */

        process.chdir(dirName);
        resolve();


    });
}

function initGit(){
    return new Promise((resolve,reject)=>{
        exec(`git init`,(err)=>{
            if (err) reject(err);
            else resolve();
        });
    });
}

function writeGitIgnore(){
    return new Promise((resolve,reject)=>{
        fs.writeFile(".gitignore",gitIgnoreText, function(err) {
            if(err) {
                reject(err);
            }
            else resolve();
        }); 
    })
}

function writeNpmIgnore(){
    return new Promise((resolve,reject)=>{
        fs.writeFile(".npmignore",npmIgnoreText, function(err) {
            if(err) {
                reject(err);
            }
            else resolve();
        }); 
    })
}

async function run(){
    
    //with error handling I prefer promises.

    makeDir(dirName)
        .then(cdIntoDir)
        .then(initGit)
        .then(initNpm)
        .then(writeGitIgnore)
        .then(writeNpmIgnore)
        .then(writeWebpackFile)
        .then(writeDemoWebpackFile)
        .then(installDevDependencies)
        .then(()=>{
            console.log("Done");
        })
        .catch(e=>{
            console.log(e)
        });


}

run();

