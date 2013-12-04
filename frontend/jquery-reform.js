/*
@name jquery-reform
@description Forms. Reinvent the wheel.
@version 2.3.0
@author Se7enSky studio <info@se7ensky.com>
@dependencies
	- [jQuery Ajax Form](http://malsup.com/jquery/form/)
*/


/*! jquery-reform 2.3.0 http://github.com/Se7enSky/jquery-reform*/


(function() {
  var plugin,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  plugin = function($) {
    "use strict";
    var Reform;
    Reform = (function() {
      Reform.prototype.defaults = {
        actionPrefix: false,
        ajax: true,
        invalidInputClass: 'invalid-field',
        invalidInputParentClass: 'invalid-field-parent',
        activeErrorClass: 'active-error',
        activeErrorParentClass: 'active-error-parent',
        submittingFormClass: 'submitting',
        invalidFormClass: 'submitted-invalid',
        successFormClass: 'submitted-success',
        successMessageClass: 'active-success-message',
        errorResponseCodes: ['ValidationError', 'validation_error', 'validationError', 'invalid', 'validation']
      };

      function Reform(el, options) {
        var _this = this;
        this.el = el;
        this.$el = $(this.el);
        this.options = $.extend({}, this.defaults, options);
        this.submitting = false;
        this.$el.on({
          'reform.validationError': function(event, errors) {
            return _this.showErrors(errors);
          },
          'reform.success': function(event, res) {
            if (_this.options.successFormClass) {
              _this.$el.addClass(_this.options.successFormClass);
            }
            if (_this.options.successMessageClass) {
              return _this.findSuccessMessages().addClass(_this.options.successMessageClass);
            }
          }
        });
        if (this.options.ajax) {
          this.initAjaxForm();
        }
      }

      Reform.prototype.startedSubmitting = function() {
        if (this.options.submittingClass) {
          this.$el.addClass(this.options.submittingClass);
        }
        this.submitting = true;
        return this.$el.trigger('reform.submitting');
      };

      Reform.prototype.stoppedSubmitting = function() {
        this.submitting = false;
        if (this.options.submittingClass) {
          return this.$el.removeClass(this.options.submittingClass);
        }
      };

      Reform.prototype.findSuccessMessages = function() {
        var formEl, result;
        result = $([]);
        formEl = this.el;
        $("[data-success-message-for]").each(function() {
          var forForm, successMessageFor;
          successMessageFor = $(this).data().successMessageFor;
          forForm = $(successMessageFor).get(0);
          if (formEl === forForm) {
            return result = result.add($(this));
          }
        });
        console.log(result);
        return result;
      };

      Reform.prototype.beforeSubmit = function(formData) {
        if (this.submitting) {
          return false;
        }
        this.clearErrors();
        this.$el.trigger('reform.beforeSubmit', {
          formData: formData
        });
        this.startedSubmitting();
        return true;
      };

      Reform.prototype.clearErrors = function() {
        if (this.options.successFormClass) {
          this.$el.removeClass(this.options.successFormClass);
        }
        if (this.options.invalidFormClass) {
          this.$el.removeClass(this.options.invalidFormClass);
        }
        if (this.options.activeErrorClass) {
          this.$el.find("[data-error-for]").removeClass(this.options.activeErrorClass);
        }
        if (this.options.activeErrorParentClass) {
          this.$el.find("[data-error-for]").parent().removeClass(this.options.activeErrorParentClass);
        }
        if (this.options.invalidInputParentClass) {
          this.$el.find("input." + this.options.invalidInputClass).parent().removeClass(this.options.invalidInputParentClass);
        }
        return this.$el.find("input." + this.options.invalidInputClass).removeClass(this.options.invalidInputClass);
      };

      Reform.prototype.showErrors = function(errors) {
        var $field, fieldErrors, fieldName, fixedFieldName, validatorDetails, validatorName, _results;
        if (this.options.invalidFormClass) {
          this.$el.addClass(this.options.invalidFormClass);
        }
        if (this.options.activeErrorClass) {
          this.$el.find("[data-error-for='*']").addClass(this.options.activeErrorClass);
        }
        if (this.options.activeErrorParentClass) {
          this.$el.find("[data-error-for='*']").parent().addClass(this.options.activeErrorParentClass);
        }
        _results = [];
        for (fieldName in errors) {
          fieldErrors = errors[fieldName];
          if (this.options.activeErrorClass) {
            this.$el.find("[data-error-for='" + fieldName + "']").addClass(this.options.activeErrorClass);
          }
          if (this.options.activeErrorParentClass) {
            this.$el.find("[data-error-for='" + fieldName + "']").parent().addClass(this.options.activeErrorParentClass);
          }
          fixedFieldName = fieldName.replace(/\.([^\.]+)/g, '[$1]');
          console.log(fixedFieldName);
          $field = this.$el.find("[name='" + fixedFieldName + "']");
          $field.addClass(this.options.invalidInputClass);
          if (this.options.invalidInputParentClass) {
            $field.parent().addClass(this.options.invalidInputParentClass);
          }
          _results.push((function() {
            var _results1;
            _results1 = [];
            for (validatorName in fieldErrors) {
              validatorDetails = fieldErrors[validatorName];
              if (this.options.activeErrorClass) {
                this.$el.find("[data-error-for='" + fieldName + " " + validatorName + "']").addClass(this.options.activeErrorClass);
                this.$el.find("[data-error-for='* " + validatorName + "']").addClass(this.options.activeErrorClass);
              }
              if (this.options.activeErrorParentClass) {
                this.$el.find("[data-error-for='" + fieldName + " " + validatorName + "']").parent().addClass(this.options.activeErrorParentClass);
                _results1.push(this.$el.find("[data-error-for='* " + validatorName + "']").parent().addClass(this.options.activeErrorParentClass));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };

      Reform.prototype.handleResponse = function(err, res) {
        var _ref, _ref1;
        this.stoppedSubmitting();
        this.$el.trigger('reform.response', {
          err: err,
          res: res
        });
        if ((_ref = res != null ? res.code : void 0, __indexOf.call(this.options.errorResponseCodes, _ref) >= 0) || (res != null ? res.errors : void 0)) {
          err = res;
          res = null;
        }
        if (err) {
          if (_ref1 = err != null ? err.code : void 0, __indexOf.call(this.options.errorResponseCodes, _ref1) >= 0) {
            return this.$el.trigger('reform.validationError', err.errors || []);
          } else {
            return this.$el.trigger('reform.unknownError', err);
          }
        } else {
          return this.$el.trigger('reform.success', res);
        }
      };

      Reform.prototype.initAjaxForm = function() {
        var _this = this;
        return this.$el.ajaxForm({
          url: this.options.actionPrefix ? "" + this.options.actionPrefix + (this.$el.attr("action")) : this.$el.attr("action"),
          beforeSubmit: function(formData, $form, options) {
            return _this.beforeSubmit(formData);
          },
          success: function(res, statusText, xhr, $form) {
            return _this.handleResponse(null, res);
          },
          error: function(xhr) {
            var contentType, e, err;
            try {
              contentType = xhr.getResponseHeader('Content-Type');
              err = (function() {
                switch (contentType) {
                  case 'application/json':
                    return JSON.parse(xhr.responseText);
                  default:
                    throw new Error("Unsupported response data format");
                }
              })();
              return _this.handleResponse(err);
            } catch (_error) {
              e = _error;
              return _this.$el.trigger('reform.unknownError', e);
            }
          }
        });
      };

      Reform.prototype.method = function() {
        return alert("I am a method");
      };

      return Reform;

    })();
    return $.fn.reform = function(option) {
      return this.each(function() {
        var $this, reform;
        $this = $(this);
        reform = $this.data('reform');
        if (!reform) {
          $this.data('reform', (reform = new Reform(this, option)));
        }
        if (typeof option === 'string') {
          return reform[option].call($this);
        }
      });
    };
  };

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], plugin);
  } else {
    plugin(jQuery);
  }

}).call(this);
