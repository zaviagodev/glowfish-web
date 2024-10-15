import { t } from "i18next";
import * as yup from "yup";

export const phoneSchema = yup.object().shape({
  music: yup.number().required("This field is requried"),
  art: yup.number().required("This field is requried"),
  wellness: yup.number().required("This field is requried"),
  fun: yup.number().required("This field is requried"),
  social: yup.number().required("This field is requried"),
  sport: yup.number().required("This field is requried"),
  family: yup.number().required("This field is requried"),
  food: yup.number().required("This field is requried")
});