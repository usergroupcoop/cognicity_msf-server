/*
 * model.js - database models for CogniCity MSF Server missions data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    all: (oid) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT markdown
     FROM ${config.TABLE_BOOKMARKS}
     WHERE oid = $1`;
        let values = [ oid ];
        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => {
                if(!data)
                    db.oneOrNone(query,['00000000-0000-0000-0000-000000000000']).timeout(config.PGTIMEOUT).then(data=> resolve(data)).catch((err) => reject(err));
                else
                    resolve(data);
            })
            .catch((err) => reject(err));
    }),
    createBookmark: (oid, markdownText) => new Promise((resolve, reject) => {
        // Setup query
        let query = `INSERT INTO ${config.TABLE_BOOKMARKS}
           (oid,markdown) values ($1,$2) returning oid,markdown`;
        let values = [ oid, markdownText ];

        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    updateBookmark: (oid, markdownText) => new Promise((resolve, reject) => {
        // Setup query
        let query = `UPDATE ${config.TABLE_BOOKMARKS}
     SET markdown = $2
     WHERE oid is $1 returning oid,markdown`;
        let values = [ oid, markdownText ];

        // Execute
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),



});
