import { t } from "i18next";
import * as yup from "yup";

export const registerSchema = yup.object().shape({
  first_name: yup.string().required("This field is requried"),
  last_name: yup.string().required("This field is requried"),
  phone: yup.string().required("This field is required"),
  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
});
