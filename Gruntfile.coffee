module.exports = (grunt) ->
	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')

		coffee:
			compile:
				files:
					'frontend/jquery-reform.js': 'frontend/jquery-reform.coffee'

		uglify:
			options:
				stripBanners: off
				report: 'gzip'
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= pkg.homepage %> */\n'
			
			dist:
				files:
					'frontend/jquery-reform.min.js': 'frontend/jquery-reform.js'

		watch:
			main:
				files: ['frontend/jquery-reform.coffee']
				tasks: ['default']

		nodestatic:
			server:
				options:
					port: 8080
					base: '.'

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-nodestatic'


	grunt.registerTask 'build', [
		'coffee'
		'uglify'
	]

	grunt.registerTask 'dev', [
		'build'
		'nodestatic:server'
		'watch'
	]

	grunt.registerTask 'default', [
		'build'
	]
