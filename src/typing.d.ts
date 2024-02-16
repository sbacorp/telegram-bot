import {DataTypes, Model} from "sequelize";
import {InlineKeyboard, Keyboard} from "grammy";

export type SessionData = {
    selectedProduct?: string;
    subscribedToChannel?: boolean;
    phoneNumber: string;
    fio: string;
    sex: "male" | "female" | "child" | "";
    consultationStep: number;
    consultation: {
        buyDate: string;
        questionsAnswered: number;
        dateString: string;
        answers: string[];
        messanger: string;
    };
    individual: {
        individualSex: string;
        individualStep: number;
        questionsAnswered: number;
        answers: string[];
        messanger: string;
    };
    group: {
        sex: "male" | "female" | "child" | "";
        name?: string;
        questionsAnswered?: number;
        answers?: string[];
        number?: string;
    }
};

export interface IProduct {
    id: number;
    name: string;
    price: number;
    answer?: string;
    docId?: string;
    type?: "link" | "doc";
}

export interface IUserModel extends Model {
    id: number;
    chatId: string;
    status: string;
    phoneNumber: string;
    fio: string;
    sex: string;
    promoCode: string;
    boughtProducts?: string;
    consultationPaidStatus: boolean;
    buyDate?: string;
    consultationDate?: string;
}

export interface IPromocodeModel extends Model {
    id: number;
    promoTitle: string;
    discount: number;
    timesUsed: number;
}

export interface ILinkModel extends Model {
    id: number;
    linkTitle: string;
    link: string;
    timesUsed: number;
    usersBoughtSub?: number;
}

export interface IConsultationModel {
    id: number;
    date: string;
    time10: boolean;
    time11: boolean;
    time12: boolean;
    time13: boolean;
    time14: boolean;
    time15: boolean;
    time16: boolean;
    time17: boolean;
    time18: boolean;
    time19: boolean;
    time20: boolean;
}

export interface IConsultationModelModel extends Model {
    id: number;
    date: string;
    time10: boolean;
    time11: boolean;
    time12: boolean;
    time13: boolean;
    time14: boolean;
    time15: boolean;
    time16: boolean;
    time17: boolean;
    time18: boolean;
    time19: boolean;
    time20: boolean;
}

export interface IBriefQuestion {
    text: string;
    keyboard?: Keyboard | InlineKeyboard;
    type?: "select" | "withPhoto" | "withMultiAnswer";
}

export interface Question {
    question: string;
    answer: string;
    keyboard?: boolean;
}

export interface IConsultationObject {
    day: string;
    date?: Date;
    dateString: string;
    year: number;
    month: number;
    calendar?: InlineKeyboard;
    phoneNumber: string;
    fio: string;
    sex: string;
    consultation?: IConsultationModel;
    answers: string[];
    massanger: string;
}
