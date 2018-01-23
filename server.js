'use strict'

// This is an ugly hack:
// eslint has a synchronous API, while source-map only has an asynchronous one
// To solve this problem, we use execFileSync() to run this file
// This file will be spawned for each linted file to remap errors

let sourceMap = require('source-map'),
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

		for (let message of messages) {
			// Try to translate start position
			let start = consumer.originalPositionFor({
				line: message.line,
				column: message.column
			})
			if (!start.line || !start.column) {
				continue
			}
			message.line = start.line
			message.column = start.column

			if (message.endLine && message.endColumn) {
				// Try to translate end position
				let end = consumer.originalPositionFor({
					line: message.endLine,
					column: message.endColumn
				})
				if (end.line && end.column) {
					message.endLine = end.line
					message.endColumn = end.column
				}
			}

			finalMessages.push(message)
		}

		// eslint-disable-next-line no-console
		console.log(JSON.stringify(finalMessages))
	})
})