var gulp = require( 'gulp' ),
	plugins = require( 'gulp-load-plugins' )(),
	files = [ 'main.js', 'unittests.js', 'modules/*.js', 'nls/**/*.js' ];

gulp.task( 'lint', function() {
	return gulp.src( files )
		.pipe( plugins.jshint() )
		.pipe( plugins.jshint.reporter( 'default' ) )
		.pipe( plugins.jscs() );
} );

gulp.task( 'sprite', function() {
	return gulp.src( 'images/svg/*.svg' )
		.pipe( plugins.svgSprites( {
			mode: 'symbols',
			svg: { symbols: 'sprite.svg' },
			preview: false
		} ) )
		.pipe( gulp.dest( 'images' ) );
} );

gulp.task( 'default', [ 'lint' ] );