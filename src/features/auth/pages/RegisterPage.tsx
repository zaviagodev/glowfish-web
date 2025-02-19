import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";

export const RegisterPage = () => {
  const t = useTranslate();

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-card-foreground">
          {t("Create your account")}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-tertiary px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <RegisterForm />

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t("Already have an account?")}{" "}
            <Link
              to="/login"
              className="font-semibold leading-6 text-primary hover:text-primary/90"
            >
              {t("Login here")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}; 