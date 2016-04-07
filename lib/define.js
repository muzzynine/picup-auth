'use strict';

/**
 * Created by impyeong-gang on 9/18/15.
 */
module.exports.kind = {
    type : {
        password: {
            name: "password",
            token_refreshable: true,
            token_duration: 3600 * 24 * 365
        },

	refreshToken: {
	    name: "refresh_token"
	}
    },

    scope : {
        picup_user : "picup_user",
        picup_operator : "picup_operator"
    }
};
