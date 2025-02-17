import { t } from "i18next";
import * as yup from "yup";

export const addressSchema = yup.object().shape({
  first_name: yup.string().required(t("This field is required")),
  last_name: yup.string().required(t("This field is required")),
  phone: yup.string().required(t("This field is required")),
  address1: yup.string().required(t("This field is required")),
  address2: yup.string().optional(),
  city: yup.string().required(t("This field is required")),
  state: yup.string().required(t("This field is required")),
  postal_code: yup.string().required(t("This field is required")),
  country: yup.string().required(t("This field is required")),
  type: yup.string().required(t("This field is required")),
  is_default: yup.boolean()
});