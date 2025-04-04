import * as yup from "yup";

export const phoneSchema = yup.object().shape({
  phone_verification: yup
    .string()
    .matches(/^0[0-9]{9}$/, "Must start with 0 and be exactly 10 digits")
    .required("Phone number is required"),
});

export const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .length(6, "Must be exactly 6 digits")
    .required("OTP is required"),
}); 