'use strict'

// This is an ugly hack:
// eslint has a synchronous API, while source-map only has an asynchronous one
// To solve this problem, we use execFileSync() to run this file
// This file will be spawned for each linted file to remap errors

let sourceMap = require('source-map'),
	log = require('fs').createWriteStream('gui.txt', {
		flags: 'w'
	}),
	input = ''

// Read data from stdin
process.stdin.setEncoding('utf8')
process.stdin.on('data', data => {
	input += data
})

process.stdin.once('end', () => {
	// Parse input data
	let {
		map,
		messages
	} = JSON.parse(input)

	sourceMap.SourceMapConsumer.with(map, null, consumer => {
		let finalMessages = []

		log.write('original -> generated\n')
		consumer.eachMapping(each => log.write(`${each.originalLine}:${each.originalColumn} -> ${each.generatedLine}:${each.generatedColumn}\n`))

		for (let message of messages) {
			// Try to translate start position
			let start = translate(message.line, message.column - 1)
			if (!start) {
				continue
			}
			log.write('\n' + message.message + '\n')
			message.line = start.line
			message.column = start.column + 1

			if (message.endLine && message.endColumn) {
				// Try to translate end position
				let end = translate(message.endLine, message.endColumn - 1)
				if (end) {
					message.endLine = end.line
					message.endColumn = end.column + 1
				}
			}

			finalMessages.push(message)
		}

		// eslint-disable-next-line no-console
		console.log(JSON.stringify(finalMessages))

		/**
		 * @param {number} line - 1-based
		 * @param {number} column - 0-based
		 * @returns {?{line: number, column: number}}
		 */
		function translate(line, column) {
			// generated -> original
			let original = consumer.originalPositionFor({
				line,
				column
			})
			if (original.line === null || original.column === null) {
				return
			}

			// Since the first call return the start of the token,
			// we should get the diff and add it
			let generated = consumer.generatedPositionFor(original)
			if (generated.line !== line) {
				return
			}

			log.write(`Search ${line}:${column}, get ${original.line}:${original.column}, remaps to ${generated.line}:${generated.column}, returns ${original.line}:${original.column + (column - generated.column)}\n`)

			return {
				line: original.line,
				column: original.column + (column - generated.column)
			}
		}

		log.end()
	})
})