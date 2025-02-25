import { t } from "i18next";
import * as yup from "yup";

export const registerSchemaOld = yup.object().shape({
  first_name: yup.string().required(t("First name is required")),
  last_name: yup.string().required(t("Last name is required")),
  company: yup.string().optional(),
  // phone: yup.string().required(t("Phone is required")),
  email: yup
    .string()
    .email(t("Invalid email"))
    .required(t("Email is required")),
  date_of_birth: yup.string().required(t("Date of birth is required"))
});