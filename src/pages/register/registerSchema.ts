import { t } from "i18next";
import * as yup from "yup";

export const registerSchema = yup.object().shape({
  first_name: yup.string().required(t("This field is required")),
  last_name: yup.string().required(t("This field is required")),
  phone: yup.string().required(t("This field is required")),
  email: yup
    .string()
    .email(t("Invalid email"))
    .required(t("Email is required")),
});
