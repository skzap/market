"use strict";

(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
                }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];return o(n || r);
                }, p, p.exports, r, e, n, t);
            }return n[i].exports;
        }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
            o(t[i]);
        }return o;
    }return r;
})()({ 1: [function (require, module, exports) {
        var proxy = new Proxy({}, {
            get: function get(obj, prop) {
                return _get(obj, prop);
            },
            set: function set(obj, prop, value) {
                return _set(obj, prop, value);
            }
        });

        function _set(obj, prop, value) {
            obj[prop] = value;

            // for single values where we dont want to update the full template
            if (!obj._template && document.getElementById(prop)) {
                document.getElementById(prop).innerHTML = value;
                return true;
            }
            for (var i = 0; i < templates.length; i++) {
                if (!obj || !obj._template) break;
                if (obj._template.startsWith(templates[i])) {
                    if (!window[templates[i]]) return true;
                    window[templates[i]].outerHTML = template(templates[i] + '.html', proxy);
                    bind[templates[i]]();
                }
            }
            return true;
        }

        function _get(obj, prop) {
            if (!(prop in obj)) obj[prop] = new Proxy({ _template: prop }, {
                get: function get(obj, prop) {
                    return _get(obj, prop);
                },
                set: function set(obj, prop, value) {
                    return _set(obj, prop, value);
                }
            });

            return obj[prop];
        }
    }, {}] }, {}, [1]);

