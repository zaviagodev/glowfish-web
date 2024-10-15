import { t } from "i18next";
import * as yup from "yup";

export const phoneSchema = yup.object().shape({
  phone_verification: yup.number()
    .typeError(t('This field is required'))
    .required(t('This field is required'))
    .test('len', t("Invalid phone number"), val => `0${val.toString()}`.length == 10)
});

export const otpSchema = yup.object().shape({
  otp: yup.string().required(t('This field is required')).min(6, t("Incorrect OTP"))
})