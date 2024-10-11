import { t } from "i18next";
import * as yup from "yup";

export const phoneSchema = yup.object().shape({
  phone_verification: yup.string().required("This field is requried"),
});
