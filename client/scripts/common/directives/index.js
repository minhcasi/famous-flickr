'use strict';

module.exports = function(app) {
    // inject:start
    require('./calendar')(app);
    // inject:end
};