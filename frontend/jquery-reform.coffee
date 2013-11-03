###
@name jquery-reform
@description Forms. Reinvent the wheel.
@version 2.0.0
@author Se7enSky studio <info@se7ensky.com>
@dependencies
	- [jQuery Ajax Form](http://malsup.com/jquery/form/)
###
###! jquery-reform 2.0.0 http://github.com/Se7enSky/jquery-reform###

plugin = ($) ->

	"use strict"

	class Reform
		defaults:
			actionPrefix: off
			ajax: on
			invalidInputClass: 'invalid'
			invalidInputParentClass: 'invalid-parent'
			activeErrorClass: 'active-error'
			activeErrorParentClass: 'active-error-parent'
			invalidFormClass: 'invalid-form'
			submittingClass: 'submitting'

		constructor: (@el, options) ->
			@$el = $ @el
			@options = $.extend {}, @defaults, options
			@submitting = no

			@$el.on
				'reform.validationError': (event, errors) => @showErrors errors
			@initAjaxForm() if @options.ajax

		startedSubmitting: ->
			@$el.addClass @options.submittingClass if @options.submittingClass
			@submitting = yes
			@$el.trigger 'reform.submitting'
		stoppedSubmitting: ->
			@submitting = no
			@$el.removeClass @options.submittingClass if @options.submittingClass

		beforeSubmit: (formData) ->
			return off if @submitting
			@clearErrors()
			@$el.trigger 'reform.beforeSubmit', formData: formData
			@startedSubmitting()
			on

		clearErrors: ->
			@$el.removeClass @options.invalidFormClass if @options.invalidFormClass
			if @options.activeErrorClass
				@$el.find("[data-error-for]").addClass @options.activeErrorClass
			if @options.activeErrorParentClass
				@$el.find("[data-error-for]").parent().addClass @options.activeErrorParentClass
			if @options.invalidInputParentClass
				@$el.find("input.#{@options.invalidInputClass}").parent().removeClass @options.invalidInputParentClass
			@$el.find("input.#{@options.invalidInputClass}").removeClass @options.invalidInputClass

		showErrors: (errors) ->
			@$el.addClass @options.invalidFormClass if @options.invalidFormClass

			if @options.activeErrorClass
				@$el.find("[data-error-for='*']").addClass @options.activeErrorClass
			if @options.activeErrorParentClass
				@$el.find("[data-error-for='*']").parent().addClass @options.activeErrorParentClass

			for fieldName, fieldErrors of errors

				if @options.activeErrorClass
					@$el.find("[data-error-for='#{fieldName}']").addClass @options.activeErrorClass
				if @options.activeErrorParentClass
					@$el.find("[data-error-for='#{fieldName}']").parent().addClass @options.activeErrorParentClass

				fixedFieldName = fieldName.replace ///\.([^\.]+)///g, '[$1]'
				console.log fixedFieldName
				$field = @$el.find("[name='#{fixedFieldName}']")
				
				$field.addClass @options.invalidInputClass
				if @options.invalidInputParentClass
					$field.parent().addClass @options.invalidInputParentClass

				for validatorName, validatorDetails of fieldErrors
					# $field.addClass "#{@options.invalidInputClass}-#{validatorName}"
					# if @options.invalidInputParentClass
					# 	$field.parent().addClass "#{@options.invalidInputParentClass}-#{validatorName}"

					if @options.activeErrorClass
						@$el.find("[data-error-for='#{fieldName} #{validatorName}']").addClass @options.activeErrorClass
						@$el.find("[data-error-for='* #{validatorName}']").addClass @options.activeErrorClass
					if @options.activeErrorParentClass
						@$el.find("[data-error-for='#{fieldName} #{validatorName}']").parent().addClass @options.activeErrorParentClass
						@$el.find("[data-error-for='* #{validatorName}']").parent().addClass @options.activeErrorParentClass


		handleResponse: (err, res) ->
			@stoppedSubmitting()
			@$el.trigger 'reform.response', err, res
			if err
				if err?.code in ['ValidationError', 'validation_error', 'validationError', 'invalid', 'validation']
					@$el.trigger 'reform.validationError', err.errors or []
				else
					@$el.trigger 'reform.unknownError', err
			else
				@$el.trigger 'reform.success', res

		initAjaxForm: ->
			@$el.ajaxForm
				url: if @options.actionPrefix then "#{@options.actionPrefix}#{@$el.attr("action")}" else @$el.attr("action")
				beforeSubmit: (formData, $form, options) =>
					@beforeSubmit formData
				success: (res, statusText, xhr, $form) =>
					@handleResponse null, res
				error: (xhr) =>
					try
						contentType = xhr.getResponseHeader 'Content-Type'
						err = switch contentType
							when 'application/json' then JSON.parse xhr.responseText
							else throw new Error "Unsupported response data format"

						@handleResponse err
					catch e
						@$el.trigger 'reform.unknownError', e

		method: ->
			alert "I am a method"
	
	$.fn.reform = (option) ->
		@each ->
			$this = $(@)
			reform = $this.data 'reform'
			if not reform then $this.data 'reform', (reform = new Reform @, option)
			if typeof option is 'string' then reform[option].call $this

# UMD 
if typeof define is 'function' and define.amd then define(['jquery'], plugin) else plugin(jQuery)