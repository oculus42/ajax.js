(function(window){
	"use strict";
	var Ajax = function(url, verb){
		this.req = new XMLHttpRequest();
		this.req_verb = verb;
		this.url = url;
		this.parse_json = false;
		return this;
	};

	Ajax.prototype.send = function(callback){
		var promise = (typeof callback === "undefined")?true:false;

		//default to current page if no url is specified
		typeof this.url === "undefined" && (this.url = window.location.href);

		if (typeof this.req_verb === "undefined" || !this.req_verb.match(/^(get|post|put|delete)$/i)){
			this.req_verb = "get";
		}

		this.req.open(this.req_verb, this.url);
		/*this has to be here, because it can only be called after open() is called*/
		if(typeof this.headers !== "undefined"){
			var keys = Object.keys(this.headers);
			for (var i = 0; i < keys.length; i++) {
				this.req.setRequestHeader(keys[i], this.headers[keys[i]]);
			}
		}
		var parse_json = this.parse_json;
		if (promise){
			return new Promise(function(resolve, reject){
				this.req.onload = function() {
					//on error - reject
					if (parse_json === true){
						return resolve(JSON.parse(this.response), this.status, this.getAllResponseHeaders());
					} else {
						return resolve(this.response, this.status, this.getAllResponseHeaders());
					}
				};
				this.req.onerror = function() {
					return reject(this.error_callback);
				};
				this.req.send();
			});
		} else {
			this.req.onload = function(){
				if (parse_json === true){
					callback(JSON.parse(this.response), this.status, this.getAllResponseHeaders());
				} else {
					callback(this.response, this.status, this.getAllResponseHeaders());
				}
			};
			this.req.send();
		}
	};

	Ajax.prototype.verb = function(verb){
		this.req_verb = verb;
		return this;
	};

	Ajax.prototype.vars = function(vars){
		var parts = "?";
		var keys = Object.keys(vars);
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			var v = vars[keys[i]];
			if (i === 0) {
				this.url_var += encodeURI(k) + "=" + encodeURI(v);
			} else {
				this.url_var += "&" + encodeURI(k) + "=" + encodeURI(v);
			}
		}
		this.url += parts;
		return this;
	};

	Ajax.prototype.json = function(json){
		this.parse_json = typeof(json === "undefined")?true:json;
		return this;
	};

	Ajax.prototype.headers = function(headers){
		this.set_headers = headers;
		return this;
	};

	Ajax.prototype.progress = function(callback){
		this.req.addEventListener("progress", callback, false);
		return this;
	};

	Ajax.prototype.error = function(callback){
		this.req.addEventListener("error", callback, false);
		return this;
	};

	if (typeof window.ajax === "undefined") {
		window.ajax = function(url, verb) {
			return new Ajax(url, verb);
		}
	}
})(window);