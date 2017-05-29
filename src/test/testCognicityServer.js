// Testing for CogniCity MSF Server
// Unit tests run together against live app, and database
// Data is passed between tests for form integration tests

// Import Unit.js
const test = require('unit.js');

// Import server object
import { init } from '../server.js';

// Mocker object for app
const winston = require('winston');
const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ raw: true }),
	]
});

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {
 it('Server starts', function(done){
	init(logger).then((app) => {
		describe('Events endpoint', function() {

			// Shared variables, for transferring data between tests
			let event_id = 0;
			let report_key = 'key';

			// Can get events
			it('Get all events (GET /events)', function(done){
					test.httpAgent(app)
						.get('/events')
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
								done();
							}
					});
			});

			// Can create events, returning new event
			it('Create an event (POST /events)', function(done){
					test.httpAgent(app)
						.post('/events')
						.send({
								"status": "active",
								"type": "flood",
								"created": "2017-05-22T20:35Z",
								"location":{
									"lat":45,
									"lng":140
								},
								"metadata":{
									"user":"integrated tester"
								}
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
									event_id = res.body.result.objects.output.geometries[0].properties.id;
									report_key = res.body.result.objects.output.geometries[0].properties.report_key;
									done()
							}

						});
				});

			// Can get specified event (tested against just created)
			it('Get the event that was just created (GET /events/:id)', function(done){
				test.httpAgent(app)
					.get('/events/' + event_id)
					.expect(200)
					.expect('Content-Type', /json/)
					.end(function(err, res){
						if (err) {
							test.fail(err.message + ' ' + JSON.stringify(res));
						}
						else {
							// Now http tests passed, we test specific properties of the response against known values
							test.value(res.body.result.objects.output.geometries[0].properties.metadata.user).is('integrated tester');
							test.value(res.body.result.objects.output.geometries[0].properties.report_key).is(report_key);
							done();
						}
				});
			});
		return (done())})
	});
});
});
