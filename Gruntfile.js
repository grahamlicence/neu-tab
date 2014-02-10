/*
    Gruntfile. To run:
    - install node
    - run `npm install` in the root directory
    - type in `grunt` to do run the build
    - type in `grunt watch` whilst developing


    Check out the registerTask statements at the bottom for an idea of
    task grouping.
*/
module.exports = function(grunt) {

    grunt.initConfig({
        /*  Read the package.json file for config values.
            package.json keeps devDependencies as well, which make it easy 
            for us to track and install node dependencies 
        */
        pkg: grunt.file.readJSON('package.json'),

        // Compass uses config.rb automatically so we don't need to specify anything
        compass: {
            build: {}
        },

        /*  Concat concatenates the minified jQuery and our uglified code.
            We should try to refrain from re-minifying libraries because
            they probably do a better job of minifying their own code then us.   
        */
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
            },
            dist: {
                src: [
                    'src/js/*'
                ],
                dest: 'src/assets/tab.min.js'
            }
        },

        /*  Copy files to production folder.
        */
        copy: {
            main: {
                files: [
                // main files
                {expand: true, flatten: true, src: ['src/index.html'], dest: 'build'},
                // manifest
                {expand: true, flatten: true, src: 'src/manifest.json', dest: 'build'},
                // all assets
                {expand: true, flatten: true, src: ['src/assets/**'], dest: 'build/assets/', filter: 'isFile'}
                ]
            }
        },

        /*  Uglify seems to be the industry standard for minification and obfuscation nowadays.
        */
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
            },
            build: {
                src: [
                    'src/js/*'
                ],
                dest: 'src/assets/tab.min.js'
            }
        },

        watch: {
            css: {
                files: 'src/sass/**/*.scss',
                tasks: ['compass']
            },
            js: {
                files: 'src/js/**/*.js',
                tasks: ['concat']
            }
        }
    });

    /*  Loading the grunt plugins.
        If you're having problems loading any plugins, make sure you have the latest package.json file
        and try running `npm install`.
    */
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    /*  The default task runs when you just run `grunt`.
        "js" and "css" tasks process their respective files. 
    */
    grunt.registerTask('css', ['compass']);
    grunt.registerTask('js', ['uglify']);
    grunt.registerTask('release', ['uglify', 'compass', 'copy']);

    grunt.registerTask('default', ['css', 'js']);
};
