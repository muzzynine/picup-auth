/**
 * Created by impyeong-gang on 12/7/15.
 */
module.exports = {
    server: {
        /* https option
        certificate : null,
        key : null,
        */
        name: 'picup-oauth-api',
        version: ["0.0.1"]
    },

    DB: {
        MYSQL: {
	    HOST : 'picup.cluster-cqm2majqgqx4.ap-northeast-1.rds.amazonaws.com',
            DATABASE: 'picup',
            PROTOCOL: 'mysql',
            PORT: 3306,
            USERNAME: 'muzzynine',
            PASSWORD: 'su1c1delog1c'
        }
    },

    SESSION : {
	url : 'redis://picup-session.ui4wps.0001.apne1.cache.amazonaws.com:6379',
	//develop option
	disableTTL : false
    },

    OAUTH: {
        TYPE: {
            KAKAO : "kakao",
            FACEBOOK : "facebook"
        },

        KAKAO: {
            HOST : "kapi.kakao.com",
            PORT : 443,
            PATH : {
                GET_USER_INFO : "/v1/user/me",
                UNLINK : "/v1/user/unlink"
            },
            ADMIN_KEY : "62590acc8af6c1aaa195a081427c8a1c"
        },

        FACEBOOK: {
            HOST : "graph.facebook.com",
            PORT : 443,
            PATH : {
                GET_USER_INFO : "/v2.5/me",
                DEBUG_TOKEN : "/v2.5/debug_token"

            }
        }
    }
};
