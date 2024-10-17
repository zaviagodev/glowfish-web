import { t } from "i18next";
import * as yup from "yup";

export const dateGroupSchema = yup.object().shape({
  event_date: yup.date(),
  event_time: yup.string()
});