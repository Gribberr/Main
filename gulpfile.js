let source = 'source';
let dist = 'dist';

let fs = require('fs');

let path = {
  build: {
    html: dist + "/",
    css: dist + "/css",
    js: dist + "/js",
    img: dist + "/img",
    fonts: dist + "/fonts"
  },

  src: {
    html: [source + "/*.html", "!" + source + "/_*.html"],
    css: source + "/scss/*.scss",
    js: source + "/js/*.js",
    img: source + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source + "/fonts/*.ttf"
  },

  watch: {
    html: source + "/**/*.html",
    css: source + "/scss/**/*.scss",
    js: source + "/js/**/*.js",
    img: source + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },

  clean: "./" + dist + "/"
}

let {
  src,
  dest,
  watch,
  series,
  parallel
} = require('gulp'),
  gulp = require('gulp'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  //clean_css = require('gulp-clean-css'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webpHTML = require('gulp-webp-html'),
  webpcss = require("gulp-webpcss"),
  svgSprite = require('gulp-svg-sprite'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter');


function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + dist,
      port: 3000,
      notify: false
    }
  });
};

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webpHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}


// scss.compiler = require('node-sass');
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    ).on('error', scss.logError)

    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(src(path.build.css + '/' + '*.css'))
    .pipe(group_media())
    .pipe(browsersync.stream())
};

function js() {
  return src(path.src.js)
    // .pipe(fileinclude())
    .pipe(dest(path.build.js))
    // .pipe(uglify())
    // .pipe(
    //   rename({
    //     extname: '.min.js'
    //   })
    // )
    // .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [{
          removeViewBox: false
        }]
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function() {
  return src([source + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(source + '/fonts/'));
})

// function fontsStyle(params) {
//
//   let file_content = fs.readFileSync(source + '/scss/fonts.scss');
//   if (file_content == '') {
//     fs.writeFile(source + '/scss/fonts.scss', '', cb);
//     return fs.readdir(path.build.fonts, function(err, items) {
//       if (items) {
//         let c_fontname;
//         for (var i = 0; i < items.length; i++) {
//           let fontname = items[i].split('.');
//           fontname = fontname[0];
//           if (c_fontname != fontname) {
//             fs.appendFile(source + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
//           }
//           c_fontname = fontname;
//         }
//       }
//     })
//   }
// }

// function cb() {
// }

function watching() {
  watch(path.watch.css, series('css'));
  watch(path.watch.html, series('html'));
  watch(path.watch.js, js);
  watch(path.watch.img, images);
};

function clean() {
  return del(path.clean);
}

// exports.cb = cb;
// exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.js = js;
exports.browserSync = browserSync;
exports.html = html;
exports.css = css;
exports.watching = watching;
exports.default = series(clean, html, css, js, fonts, images, parallel(watching, browserSync));
