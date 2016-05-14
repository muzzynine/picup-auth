'use strict';

/**
 * Created by impyeong-gang on 9/18/15.
 */
module.exports.kind = {
    type : {
        password: {
            name: "password",
            tokenRefreshable: true,
            tokenDuration: 3600 * 24 * 365
        },

	refreshToken: {
	    name: "refresh_token"
	}
    },

    scope : {
        picupUser : "picupUser",
        picupOperator : "picupOperator"
    }
};
