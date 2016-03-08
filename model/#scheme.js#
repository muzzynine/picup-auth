var Sequelize = require('sequelize');

/**
 * Created by impyeong-gang on 1/11/16.
 */
module.exports = {
    USER : {
        TABLE : "user",
        SCHEME : {
            id : {type: Sequelize.UUID, defaultValue:Sequelize.UUIDV1, primaryKey : true},
            nickname : { type : Sequelize.STRING(40), allowNull: false},
            profile_path : { type : Sequelize.STRING, allowNull: false }
        }
    },

    GROUP : {
        TABLE : "groups",
        SCHEME : {
            id : { type : Sequelize.UUID, defaultValue:Sequelize.UUIDV1, primaryKey: true},
            group_name : { type : Sequelize.STRING(40), allowNull: false},
            revision : { type : Sequelize.BIGINT, allowNull: false},
            created_date : { type : Sequelize.BIGINT, allowNull: false },
            repository : { type : Sequelize.STRING, allowNull: false },
            last_mod_date : { type : Sequelize.BIGINT, defaultValue: Date.now(), allowNull : false},
            color : { type : Sequelize.INTEGER, allowNull: false }
        }
    },

    DELTA : {
        TABLE : "delta",
        SCHEME : {
            id : { type : Sequelize.UUID, defaultValue:Sequelize.UUIDV1, primaryKey: true},
            revision : { type : Sequelize.BIGINT, allowNull: false},
            data : { type : Sequelize.TEXT }
        }
    },

    AUTH : {
        TABLE : "auth",
        SCHEME : {
            id : { type : Sequelize.BIGINT, autoIncrement: true, primaryKey: true},
            auth_id : {type : Sequelize.STRING(40), allowNull: false},
            auth_type : { type: Sequelize.ENUM('kakao', 'facebook'), allowNull: false }
        }
    },

    ACCESS_TOKEN : {
        TABLE : "accessToken",
        SCHEME : {
            id : { type : Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
            access_token : { type : Sequelize.STRING, allowNull: false},
            refresh_token : { type : Sequelize.STRING, allowNull: false},
            expired_in : { type : Sequelize.BIGINT, allowNull: false},
            created_time : { type : Sequelize.BIGINT, allowNull : false}
        }
    },

    CLIENT : {
        TABLE : "client",
        SCHEME : {
            id : { type : Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
            client_id : { type : Sequelize.STRING, allowNull: false},
            client_secret : { type : Sequelize.STRING, allowNull: false}
        }
    },

    PUSH_REGISTRATION : {
        TABLE : "pushRegistration",
        SCHEME : {
            id : { type : Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
            registration_id : { type : Sequelize.STRING, allowNull : false }
        }
    }
};