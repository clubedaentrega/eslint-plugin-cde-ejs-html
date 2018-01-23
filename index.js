'use strict'

let ejs = require('ejs-html'),
	cp = require('child_process'),
	path = require('path'),
	compiled = new Map

module.exports = {
	processors: {
		'.ejs': {
			/**
			 * @param {string} text
			 * @param {string} filename
			 * @returns {Array<string>}
			 */
			preprocess(text, filename) {
				// Load locals file
				let locals = require(filename.slice(0, -4) + '-locals.js')

				// Add super global values
				let vars = ['formatMoney', 't', 'l', 'locale']

				// Get local variable names
				for (let name of Object.keys(locals.locals)) {
					let pos = name.indexOf('=')
					if (pos !== -1) {
						vars.push(name.slice(0, pos))
					} else if (name[name.length - 1] === '?') {
						vars.push(name.slice(0, -1))
					} else {
						vars.push(name)
					}
				}

				let fn = ejs.compile(text, {
					filename,
					sourceMap: true,
					compileDebug: false,
					vars
				})
				compiled.set(filename, fn)
				return [fn.code]
			},

			/**
			 * @param {Array<Array<Object>>} messages
			 * @param {string} filename
			 */
			postprocess(messages, filename) {
				let fn = compiled.get(filename)
				compiled.delete(filename)

				// Spawn and wait for server.js
				return JSON.parse(cp.execFileSync('node', [path.join(__dirname, 'server.js')], {
					input: JSON.stringify({
						map: fn.map,
						messages: messages[0]
					}),
					encoding: 'utf8'
				}))
			}
		}
	}
}