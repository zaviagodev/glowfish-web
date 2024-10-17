import { t } from "i18next";
import * as yup from "yup";

export const phoneSchema = yup.object().shape({
  phone_verification: yup.number()
    .typeError('This field is required')
    .required('This field is required')
    .test('len', "Invalid phone number", val => `0${val.toString()}`.length == 10)
});

export const otpSchema = yup.object().shape({
  otp: yup.string().required('This field is required').min(6, "Incorrect OTP")
})