const path = require('path');
const fileExists = require('file-exists');
const gulp = require('gulp');
const less = require('gulp-less');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const del = require('del');
const qcloud = require('qcloud-upload');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const replace = require('gulp-replace');
const px2rpx = require('gulp-px2rpx');
const ci = require('miniprogram-ci');
const sourcemaps = require('gulp-sourcemaps');
const alias = require('gulp-path-alias');
const pkg = require('./package.json')
const projectConfig = require('./src/project.config.json')

const buildPath = path.join(__dirname, 'dist/')

const uploadFolder = path.join(__dirname, './src/images')

const isPro = process.env.NODE_ENV === 'production'

const config = {
// 腾讯CDN油漆桶配置
  assetsCDN: 'https://xxx.cos.ap-guangzhou.myqcloud.com/',
  cos: {
    Bucket: 'xxx',
    Region: 'xxx',
    SecretId: 'xxx',
    SecretKey: 'xxx',
    prefix: `${pkg.name}/images`, // 上传到油漆桶的哪个文件夹
    src: uploadFolder, // 上传哪个文件夹到油漆桶
    overWrite: 1,
  },
  enablePx2Rpx: true,
  enableCleanCSS: false,
  enableAuto: true, // 自动补全css
  enableUglify: false,
  enableSourcemap: true,
  enableCDN:false,
};


const paths = {
  styles: {
    src: ['src/**/*.less'],
    dest: buildPath
  },
  images: {
    src: 'src/images/**/*.{png,jpg,jpeg,svg,gif}',
    dest: buildPath
  },
  scripts: {
    src: 'src/**/*.js',
    dest: buildPath
  },
  copy: {
    src: ['src/**', '!src/**/*.less', '!src/images/**', '!src/**/*.js', 'package.json'],
    dest: buildPath
  },
}


// 删除构建
function clean() {
  return del([buildPath])
}

function log() {
  const data = Array.prototype.slice.call(arguments)
  gutil.log.apply(false, data)
}

function upload() {
  return new Promise(function (resolve, reject) {
    // 普通函数，resolve()的时候，qcloud不一定执行结束
    qcloud(config.cos)
    resolve()
  })
}


// 任务处理函数
function styles() {
  return gulp
    .src(paths.styles.src, { base: 'src' })
    .pipe(alias({
      paths: {
        '@': path.resolve(__dirname, './src/'),
      }
    }))
    .pipe(less())
    .pipe(gulpif(config.enableCDN,replace('%CDN_IMG%/', config.assetsCDN + config.cos.prefix + '/')))
    .pipe(gulpif(config.enableCleanCSS, cleanCSS()))
    .pipe(gulpif(config.enablePx2Rpx, px2rpx({
      screenWidth: 375, // 设计稿屏幕, 默认750
      wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
      remPrecision: 6
    })))
    .pipe(replace('PX', 'px'))
    .pipe(rename(path => (path.extname = '.wxss')))
    .pipe(gulp.dest(paths.styles.dest))
}

function scripts() {
  return gulp
    .src(paths.scripts.src, { base: 'src' })
    .pipe(alias({
      paths: {
        '@': path.resolve(__dirname, './src/'), // src 目录
      }
    }))
    .pipe(gulpif(config.enableSourcemap, sourcemaps.init()))
    .pipe(gulpif(isPro, replace('%ENV%', 'production'), replace('%ENV%', 'development'))) // 环境变量静态替换
    .pipe(gulpif(config.enableCDN,replace('%CDN_IMG%/', config.assetsCDN + config.cos.prefix + '/')))
    .pipe(replace('%VERSION%', pkg.version))
    .pipe(gulpif(config.enableUglify, uglify()))
    .pipe(gulpif(config.enableSourcemap, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.scripts.dest))
}

// 不需要处理的文件直接复制过去
function copy() {
  return gulp
    .src(paths.copy.src)
    .pipe(gulpif(config.enableCDN,replace('%CDN_IMG%/', config.assetsCDN + config.cos.prefix + '/')))
    .pipe(gulp.dest(paths.copy.dest))
}

function watchFiles() {
  const w1 = gulp.watch(paths.styles.src, styles).on('unlink', function (file) {
    log(gutil.colors.yellow(file) + ' is deleted')
    const filePath = file.replace(/src\\/, 'dist\\')
    del([filePath])
  });

  const w2 = gulp.watch(paths.scripts.src, scripts).on('unlink', function (file) {
    log(gutil.colors.yellow(file) + ' is deleted')
    const filePath = file.replace(/src\\/, 'dist\\')
    del([filePath])
  });


  const w3 = gulp.watch(paths.copy.src, copy).on('unlink', function (file) {
    log(gutil.colors.yellow(file) + ' is deleted')
    const filePath = file.replace(/src\\/, 'dist\\')
    del([filePath])
  });

  const w4 = gulp.watch(paths.images.src, upload).on('unlink', function (file) {
    log(gutil.colors.yellow(file) + ' is deleted')
    const filePath = file.replace(/src\\/, 'tmp\\')
    del([filePath])
  });
  return Promise.all([w1, w2, w3, w4])
}

/**
 * 小程序ci相关函数
 */
let project = {}

const keyFile = fileExists.sync(`./private.${projectConfig.appid}.key`)
console.log(keyFile);
if (keyFile) {
  project = new ci.Project({
    appid: projectConfig.appid,
    type: 'miniProgram',
    projectPath: './dist',
    privateKeyPath: `./private.${projectConfig.appid}.key`,
    ignores: [],
  })
}
async function npmBuild() {
  console.log('npm run build')
  await ci.packNpmManually({
    packageJsonPath: './package.json',
    miniprogramNpmDistDir: './src/',
  })
}

async function mpUpload() {

  const uploadResult = await ci.upload({
    project,
    version: pkg.version,
    desc: pkg.description,
    setting: {
      es6: true,
      minify: true,
      autoPrefixWXSS: true,
    },
    onProgressUpdate: console.log,
  })
  console.log('[uploadResult:]', uploadResult)
}

async function preview() {
  const previewResult = await ci.preview({
    project,
    desc: pkg.description, // 此备注将显示在“小程序助手”开发版列表中
    qrcodeFormat: 'image',
    qrcodeOutputDest: './preview.jpg',
    onProgressUpdate: console.log,
  })
  console.log('[previewResult:]', previewResult)
}
exports.watch = watchFiles
exports.preview = preview
// ci 自动构建npm
exports.npm = npmBuild
exports.upload = mpUpload

exports.default = gulp.series(styles, scripts, copy, upload, watchFiles)

exports.build = gulp.series(clean, styles, scripts, copy, upload)