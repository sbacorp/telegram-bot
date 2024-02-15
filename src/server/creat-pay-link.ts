import {IProduct} from "#root/typing.js";
import CryptoJS from "crypto-js";
import {PaymentModel} from "./models.js";

const createUniqueInvoiceId = async (): Promise<number> => {
    const invoiceId = Math.floor(Math.random() * 2_147_483_647) + 1;
    const invoice = await PaymentModel.findOne({
        where: {
            invoiceId,
        },
    });
    if (invoice) {
        return createUniqueInvoiceId();
    }
    return invoiceId;
};
export const createPaymentLink = async (product: IProduct, chatId: string) => {
    const invoiceId = await createUniqueInvoiceId();

    const reciept = {
        sno: "usn_income",
        items: [
            {
                name: product.name,
                quantity: 1,
                sum: product!.price,
                payment_method: "full_payment",
                payment_object: "service",
                tax: "none",
            },
        ],
    };
    const recieptString = JSON.stringify(reciept);
    const paymentParameters = {
        MerchantLogin: "BOT.RU",
        OutSum: product!.price,
        InvId: invoiceId,
        Description: encodeURIComponent(product!.name),
        Reciept: encodeURIComponent(recieptString),
        SignatureValue: "",
        Shp_chatId: chatId,
        password1: "m8mPZVNLj33pybLAZ0b6",
        password2: "CWdNAdpGx2mC3Rk0W2N5",
    };
    const signitureString = `${paymentParameters.MerchantLogin}:${paymentParameters.OutSum}:${invoiceId}:${paymentParameters.Reciept}:${paymentParameters.password1}:Shp_chatId=${paymentParameters.Shp_chatId}`;
    const SignatureValue = CryptoJS.MD5(signitureString);

    const link = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${
        paymentParameters.MerchantLogin
    }&OutSum=${
        paymentParameters.OutSum
    }&InvId=${invoiceId}&Receipt=${encodeURIComponent(
        paymentParameters.Reciept
    )}&Description=${
        paymentParameters.Description
    }&SignatureValue=${SignatureValue}&Shp_chatId=${
        paymentParameters.Shp_chatId
    }`;
    const payment = await PaymentModel.create({
        chatId,
        invoiceId,
        productName: product.name,
        amount: product.price,
    });
    return {link, invoiceId};
};
