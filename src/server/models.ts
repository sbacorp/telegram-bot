/* eslint-disable unicorn/no-null */
/* eslint-disable import/no-cycle */
import {DataTypes, Model} from "sequelize";
import {
    IConsultationModelModel,
    ILinkModel,
    IPromocodeModel,
    IUserModel,
} from "#root/typing.js";
import {sequelize} from "./database.js";

export const UserModel = sequelize.define<IUserModel>("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatId: {
        type: DataTypes.STRING,
        unique: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "active",
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    fio: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    sex: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    promoCode: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    boughtProducts: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    consultationPaidStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    buyDate: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    consultationDate: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
});
export const PromocodeModel = sequelize.define<IPromocodeModel>("promocode", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    promoTitle: {
        type: DataTypes.STRING,
        unique: true,
    },
    discount: {
        type: DataTypes.INTEGER,
    },
    timesUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    product: {
        type: DataTypes.STRING,
    },
});

export const BotSiteLinkModel = sequelize.define<ILinkModel>(
    "botSiteLink",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        linkTitle: {
            type: DataTypes.STRING,
            unique: true,
        },
        link: {
            type: DataTypes.STRING,
            unique: true,
        },
        timesUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: false,
    }
);

export const NutrLinkModel = sequelize.define<ILinkModel>(
    "nutrLink",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        linkTitle: {
            type: DataTypes.STRING,
            unique: true,
        },
        link: {
            type: DataTypes.STRING,
            unique: true,
        },
        timesUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        usersBoughtSub: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: false,
    }
);

export const ConsultationModel = sequelize.define<IConsultationModelModel>(
    "consultation",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: DataTypes.STRING,
        },
        time10: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time11: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time12: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time13: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time14: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time15: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time16: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time17: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time18: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time19: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        time20: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }
);

export interface IConsultationAppointment extends Model {
    id: number;
    date: string;
    time: string;
}

export const ConsultationAppointmentModel =
    sequelize.define<IConsultationAppointment>(
        "consultationAppointment",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            date: {
                type: DataTypes.STRING,
            },
            chatId: {
                type: DataTypes.STRING,
            },
            paidAt: {
                type: DataTypes.STRING,
            },
            paid: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            updatedAt: false,
        }
    );

ConsultationAppointmentModel.belongsTo(UserModel, {
    foreignKey: "chatId",
    targetKey: "chatId",
    onDelete: "cascade",
});

export interface IPayment extends Model {
    id: number;
    chatId: string;
    invoiceId: number;
    amount: number;
    productName: string;
    status: string;
}

export const PaymentModel = sequelize.define<IPayment>("payment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatId: {
        type: DataTypes.STRING,
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
    },
    productName: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
    },
});


export interface IWebsitePayment extends Model {
    id: number,
    phoneNumber: string
}

export const WebsitePaymentModel = sequelize.define<IWebsitePayment>("websitePayment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export interface ISession extends Model {
    id: number;
    key: string;
    value: string;
}

export const SessionModel = sequelize.define<ISession>("session", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    value: {
        type: DataTypes.JSON,
        defaultValue: "{}",
        allowNull: false,
    },
});

const botStateModel = sequelize.define(
    "botState",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        allowIndividual: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: false,
    }
);
