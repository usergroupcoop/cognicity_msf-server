/*
 * model.js - database models for CogniCity MSF Server events interaction
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all events
	 * TODO - filter by status {active|inactive}
	 */
	all: (status) => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT id, status, type, created, report_key, metadata, uuid, the_geom
			FROM ${config.TABLE_EVENTS}
			WHERE ($1 is null or status = $1)
			ORDER BY created DESC`;

		let values = [ status ];

		// Execute
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),


  /**
   * Return event specified by ID
   * @param {integer} id ID of event
   */
	byId: (id) => new Promise((resolve, reject) => {

		// Setup query
    let query = `SELECT id, status, type, created, report_key, metadata, uuid, the_geom
      FROM ${config.TABLE_EVENTS}
      WHERE id = $1
      ORDER BY created DESC`;

		// Setup values
		let values = [ id ];

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),

	/**
	 * Create a new event
	 * @param {object} body Body of request with event details
	 */
	createEvent: (reportKey, body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `INSERT INTO ${config.TABLE_EVENTS}
			(status, type, created, report_key, metadata, the_geom)
			VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_Point($6,$7),4326))
			RETURNING id, report_key, uuid, the_geom`;

			// Setup values
		let values = [ body.status, body.type, body.created, reportKey, body.metadata, body.location.lng, body.location.lat ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, report_key:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
			.catch((err) => reject(err));
	})

	/**
	 *
	 *
	 */
	// update event -- status. require UUID.

});
