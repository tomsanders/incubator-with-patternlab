'use strict';

//configuration file
const config = require('./config.json');
const patternlabConfig = require('./patternlab-config.json');

// Include Gulp & Tools We'll Use
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const del = require('del');
const browserSync = require('browser-sync');
const through2 = require('through2');
const browserify = require('browserify');
const path = require('path');
const yargs = require('yargs').argv;
const minify = yargs.minify ? true : false;
const tunnel = yargs.tunnel ? yargs.tunnel : false;
const patternlab = require('patternlab-node')(patternlabConfig);
const httpProxyMiddleware = require('http-proxy-middleware');
const spritesmith = require('gulp.spritesmith');
const concat = require('gulp-concat');
const layout = require('layout');

// needed to generate our own icon font
const consolidate = require('gulp-consolidate');
const iconfont = require('gulp-iconfont');


// Below constants and options are used to proxy requests
// We use this for loading of images and AJAX calls. Be carefull however, as we
// no longer strictly check for valid SSL certs.
const url = require('url');
const proxy = require('proxy-middleware');
let proxyOptions = url.parse('/INTERSHOP/static/WFS/images');
proxyOptions.route = '/INTERSHOP';
proxyOptions.rejectUnauthorized = false;

/******************************************************
 * ASSETS TASKS
 * clean task
 * compile tasks:
 * - font
 * - image
 * - js
 * - css
 ******************************************************/

// Clean Output Directories
gulp.task('clean', (cb) => {
    return del(config.path.build.root);
});

// Compile fonts
gulp.task('compile:font', () => {
    return gulp.src(config.path.src.asset.font)
        .pipe($.plumber())
        .pipe(gulp.dest(config.path.build.asset.font))
        .pipe($.size({title: 'fonts'}));
});

// optimize the images used within the frontend
gulp.task('compile:image', () => {
    return gulp.src(normalizePath(config.path.src.asset.image.root + '/**/*'))
        .pipe($.plumber())
        // optimizes image file if possible
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(normalizePath(config.path.build.asset.image.root)))
        .pipe($.size({title: 'image'}));
});

//  Tasks to generate the icon sprites
gulp.task('compile:image:sprite', function () {
    let grocerieSpriteData = gulp.src(normalizePath(config.path.src.asset.image.imageSprites.spriteGroceries + '/**/*')).pipe(spritesmith({
        cssSpritesheetName: 'sprite-groceries',
        imgName: 'sprite-groceries.jpg',
        imgPath: '../images/sprites/sprite-groceries.jpg',
        cssName: '_sprite-groceries.scss',
        cssFormat: 'scss',
        imgOpts: {background: [255, 255, 255, 255]},
        // cssOpts: {functions: false},
        cssVarMap: function (sprite) {sprite.name = 'icon-' + sprite.name;}
    }));

    let qualitySpriteData = gulp.src(normalizePath(config.path.src.asset.image.imageSprites.spriteQualitymarks + '/**/*')).pipe(spritesmith({
        cssSpritesheetName: 'sprite-quality',
        src:'src/asset/images/sprites/keurmerken/*',
        retinaSrcFilter:'src/asset/images/sprites/keurmerken/*@2x.png',
        imgName: 'sprite-quality.png',
        retinaImgName: 'sprite-quality@2x.png',
        imgPath: '../images/sprites/sprite-quality.png',
        retinaImgPath: '../images/sprites/sprite-quality@2x.png',
        cssName: '_sprite-quality.scss',
        cssFormat: 'scss_retina',
        // Removed variable name overrides
        padding: 2,
        cssVarMap: function (sprite) {sprite.name = 'icon-' + sprite.name;}
    }));

    // groceries image sprite
    let grocerieSpriteStream = grocerieSpriteData.img.pipe(buffer()).pipe($.imagemin())
        .pipe(gulp.dest(normalizePath(config.path.build.asset.image.imageSprites.spriteOutput)));

    // quality marks image sprite
    let qualitySpriteStream = qualitySpriteData.img.pipe(buffer()).pipe($.imagemin())
        .pipe(gulp.dest(normalizePath(config.path.build.asset.image.imageSprites.spriteOutput)));

    // Pipe CSS stream through CSS optimizer and onto disk
    let scssStream = merge(grocerieSpriteData.css, qualitySpriteData.css)
        .pipe(concat('_sprite.scss'))
        .pipe(gulp.dest(normalizePath(config.path.src.asset.cssSprite)));

    // Return a merged stream to handle both `end` events
    return merge(grocerieSpriteStream, qualitySpriteStream, scssStream);
});

// when need include in the build setup
gulp.task('iconfont', () => {
    return gulp.src(config.path.src.asset.svg.base)
        .pipe(iconfont({
            fontName: 'iconfont',
            formats: ['woff', 'woff2'],
            appendCodepoints: true,
            appendUnicode: false,
            normalize: true,
            fontHeight: 1000,
            centerHorizontally: true
        }))

        //Todo: Automatically output HTML/CSS dumy files?
        // .on('glyphs', function (glyphs, options) {
        //     console.log(glyphs);
        //     gulp.src(config.path.src.asset.svg.base)
        //         .pipe(consolidate('underscore', {
        //             glyphs: glyphs,
        //             fontName: options.fontName,
        //             fontDate: new Date().getTime()
        //
        //         }))
        //         .pipe(gulp.dest(config.path.build.asset.svg));
        //
        //     gulp.src(config.path.src.asset.svg.base)
        //         .pipe(consolidate('underscore', {
        //             glyphs: glyphs,
        //             fontName: options.fontName
        //         }))
        //         .pipe(gulp.dest(config.path.build.asset.svg));
        //
        // })
        .pipe(gulp.dest(config.path.build.asset.svgsrc))
        .pipe(gulp.dest(config.path.build.asset.svg));
});


gulp.task('compile:css', () => {
    return gulp.src(normalizePath(config.path.src.asset.scss + '/*.scss'))

    .pipe($.sass(config.sass).on('error', $.sass.logError))

    .pipe($.ignore('**/*.css.map'))

    // autoprefixes css properties
    .pipe($.autoprefixer(config.preferences.autoprefix.support.split(', ')))

    // minifies css if minify property is enabled
    .pipe($.if(minify, $.cssnano()))

    .pipe(gulp.dest(normalizePath(config.path.build.asset.css)))
    .pipe($.size({title: 'styles:scss'}))

    .pipe(browserSync.stream());
});
//
gulp.task('compile:js:libs', () => {
    let browserifyOpts = {
        paths: config.javascript.paths,
        noParse: config.javascript.noParse.map(file => require.resolve(file))
    };
    const scriptsIndex = require('./' + config.path.src.asset.javascript.libraries);
    const scriptsIndexPath = scriptsIndex.libraries({webAppJavaScriptRoot: `${config.path.src.asset.javascript.root}/`});

    return gulp.src(scriptsIndexPath)
        .pipe($.plumber())

        .pipe(concat('libs.min.js') )

        // uglifies code if minification is enabled
        .pipe($.if(minify, $.uglify()))

        .pipe(gulp.dest(config.path.build.asset.javascript))
        .pipe($.size({title: 'javascript: libs'}));
});

gulp.task('compile:js:scripts', () => {
    const scriptsIndex = require('./' + config.path.src.asset.javascript.scripts);
    const scriptsIndexPath = scriptsIndex.scripts({webAppJavaScriptRoot: `${config.path.src.asset.javascript.root}/`});

    return gulp.src(scriptsIndexPath)
        .pipe($.plumber())

        .pipe(concat('scripts.min.js') )

        // uglifies code if minification is enabled
        .pipe($.if(minify, $.uglify()))

        .pipe(gulp.dest(config.path.build.asset.javascript))
        .pipe($.size({title: 'javascript: scripts'}));
});

gulp.task('compile:js:footerScripts', () => {
    return gulp.src(config.path.src.asset.javascript.footerScripts)
        .pipe($.plumber())

        .pipe(concat('scripts.footer.min.js') )

        // uglifies code if minification is enabled
        .pipe($.if(minify, $.uglify()))

        .pipe(gulp.dest(config.path.build.asset.javascript))
        .pipe($.size({title: 'javascript: footer scripts'}));
});


gulp.task('compile:css', () => {
    return gulp.src(normalizePath(config.path.src.asset.scss + '/*.scss'))

        .pipe($.sass(config.sass).on('error', $.sass.logError))

        .pipe($.ignore('**/*.css.map'))

        // autoprefixes css properties
        .pipe($.autoprefixer(config.preferences.autoprefix.support.split(', ')))

        // minifies css if minify property is enabled
        .pipe($.if(minify, $.cssnano()))

        .pipe(gulp.dest(normalizePath(config.path.build.asset.css)))
        .pipe($.size({title: 'styles:scss'}))

        .pipe(browserSync.stream());
});

// Styleguide Copy everything but css
gulp.task('pl-copy:styleguide', function () {
    return gulp.src(normalizePath(patternlabPaths().source.styleguide) + '/**/!(*.css)')
        .pipe(gulp.dest(normalizePath(patternlabPaths().public.root)))
        .pipe(browserSync.stream());
});

// Styleguide Copy and flatten css
gulp.task('pl-copy:styleguide-css', function () {
    return gulp.src(normalizePath(patternlabPaths().source.styleguide) + '/**/*.css')
        .pipe(gulp.dest(function (file) {
            //flatten anything inside the styleguide into a single output dir per http://stackoverflow.com/a/34317320/1790362
            file.path = path.join(file.base, path.basename(file.path));
            return normalizePath(path.join(patternlabPaths().public.styleguide, '/css'));
        }))
        .pipe(browserSync.stream());
});

// JS tasks
gulp.task('compile:js', gulp.series([
        'compile:js:libs',
        'compile:js:scripts',
        'compile:js:footerScripts'
]));

// build assets
gulp.task('compile:asset', gulp.series([
    'compile:font',
    'compile:image',
    'compile:image:sprite',
    'compile:js',
    'compile:css',
    'pl-copy:styleguide',
    'pl-copy:styleguide-css'
]));

// patternlab tasks
gulp.task('patternlab:version', function (done) {
    patternlab.version();
    done();
});

gulp.task('patternlab:help', function (done) {
    patternlab.help();
    done();
});

gulp.task('patternlab:patternsonly', function (done) {
    patternlab.patternsonly(done, getConfiguredCleanOption());
});

gulp.task('patternlab:installplugin', function (done) {
    patternlab.installplugin(argv.plugin);
    done();
});

gulp.task('patternlab:build', gulp.series('compile:asset', build));

gulp.task('patternlab:connect', gulp.series(function (done) {
    browserSync.init({
        server: {
            baseDir: [
                config.path.build.root,
                config.path.build.root + '/asset'
            ],
            routes: {
                // allowed production urls to be used in images
                '/INTERSHOP/static/WFS/nl_NL/images': config.path.build.root + '/asset/images'
            },
            middleware: [
                // httpProxyMiddleware(
                //     "/actions",
                //     {
                //         "target": "https://www.website.com/actions",
                //         "changeOrigin": true,
                //         "pathRewrite": {
                //             "^/actions": "",
                //
                //         }
                //     }
                // )
            ]
        },
        notify: false,
        tunnel: tunnel,
        startPath: '/prototype',
        snippetOptions: {
            // Ignore all HTML files within the templates folder
            blacklist: ['/index.html', '/', '/?*']
        }
    }, function () {
        done();
    });
}));



/**
 * Normalize all paths to be plain, paths with no leading './',
 * relative to the process root, and with backslashes converted to
 * forward slashes. Should work regardless of how the path was
 * written. Accepts any number of parameters, and passes them along to
 * path.resolve().
 *
 * This is intended to avoid all known limitations of gulp.watch().
 *
 * @param {...string} pathFragment - A directory, filename, or glob.
 */
function normalizePath() {
    return path
        .relative(
            process.cwd(),
            path.resolve.apply(this, arguments)
        )
        .replace(/\\/g, "/");
}

/******************************************************
 * PATTERN LAB CONFIGURATION - API with core library
 ******************************************************/
function patternlabPaths() {
    return patternlabConfig.paths;
}

function getConfiguredCleanOption() {
    return patternlabConfig.cleanPublic;
}

/**
 * Performs the actual build step. Accomodates both async and sync
 * versions of Pattern Lab.
 * @param {function} done - Gulp done callback
 */
function build(done) {
    const buildResult = patternlab.build(() => {}, getConfiguredCleanOption());

    // handle async version of Pattern Lab
    if (buildResult instanceof Promise) {
        return buildResult.then(done);
    }

    // handle sync version of Pattern Lab
    done();
    return null;
}

/******************************************************
 * SERVER AND WATCH TASKS
 ******************************************************/
// watch task utility functions
function getSupportedTemplateExtensions() {
    let engines = require('./node_modules/patternlab-node/core/lib/pattern_engines');
    return engines.getSupportedFileExtensions();
}
function getTemplateWatches() {
    return getSupportedTemplateExtensions().map(function (dotExtension) {
        return normalizePath(patternlabPaths().source.patterns, '**', '*' + dotExtension);
    });
}

/**
 * Reloads BrowserSync.
 * Note: Exits more reliably when used with a done callback.
 */
function reload(done) {
    browserSync.reload();
    done();
}

/**
 * Reloads BrowserSync, with JS injection.
 * Note: Exits more reliably when used with a done callback.
 */
function reloadJS(done) {
    browserSync.reload('*.js');
    done();
}

/**
 * Reloads BrowserSync, with CSS injection.
 * Note: Exits more reliably when used with a done callback.
 */
function reloadCSS(done) {
    browserSync.reload('*.css');
    done();
}

function watch() {
    const watchers = [
        {
            name: 'SCSS',
            paths: [normalizePath(config.path.src.asset.scss + '/**/*.scss')],
            config: { awaitWriteFinish: true },
            tasks: gulp.series('compile:css', reloadCSS)
        },
        {
            name: 'Images',
            paths: [normalizePath(config.path.src.asset.image.root + '/**/*')],
            config: { awaitWriteFinish: true },
            tasks: gulp.series('compile:image')
        },
        {
            name: 'Fonts',
            paths: [normalizePath(config.path.src.asset.font + '/**/*')],
            config: { awaitWriteFinish: true },
            tasks: gulp.series('compile:font')
        },
        {
            name: 'JavaScript',
            paths: [normalizePath(config.path.src.asset.javascript.root + '/**/*.js')],
            config: { awaitWriteFinish: true },
            tasks: gulp.series('compile:js', reloadJS)
        },
        {
            name: 'Styleguide Files',
            paths: [normalizePath(patternlabPaths().source.styleguide, '**', '*')],
            config: { awaitWriteFinish: true },
            tasks: gulp.series('pl-copy:styleguide', 'pl-copy:styleguide-css', reloadCSS)
        },
        {
            name: 'Source Files',
            paths: [
                normalizePath(patternlabPaths().source.patterns, '**', '*.json'),
                normalizePath(patternlabPaths().source.patterns, '**', '*.md'),
                normalizePath(patternlabPaths().source.data, '**', '*.json'),
                normalizePath(patternlabPaths().source.meta, '**', '*')
            ].concat(getTemplateWatches()),
            config: { awaitWriteFinish: true },
            tasks: gulp.series(build, reload)
        }
    ];

    watchers.forEach(watcher => {
        // console.log('\n' + chalk.bold('Watching ' + watcher.name + ':'));
        watcher.paths.forEach(p => console.log('  ' + p));
        gulp.watch(watcher.paths, watcher.config, watcher.tasks);
    });
}

/******************************************************
 * COMPOUND TASKS
 ******************************************************/
gulp.task('compile', gulp.series('clean', 'patternlab:build'));
gulp.task('serve', gulp.series('compile', 'patternlab:connect', watch));

gulp.task('help', () => {
    gulp.src('./tasks.json')
        .pipe($.list());
});

// Default is alias for build
gulp.task('default', gulp.series(
    'help'
));
