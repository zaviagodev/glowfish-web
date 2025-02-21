import { t } from "i18next";
import * as yup from "yup";

export const rateSchema = yup.object().shape({
  music: yup.number().required(t("This field is required")),
  art: yup.number().required(t("This field is required")),
  wellness: yup.number().required(t("This field is required")),
  fun: yup.number().required(t("This field is required")),
  social: yup.number().required(t("This field is required")),
  sport: yup.number().required(t("This field is required")),
  family: yup.number().required(t("This field is required")),
  food: yup.number().required(t("This field is required"))
}); 