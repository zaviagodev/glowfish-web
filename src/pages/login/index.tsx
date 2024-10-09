import { AuthPage } from "@refinedev/core";
import GlowfishIcon from "../../components/icons/GlowfishIcon";
import Button from "../../components/ui/Button";
import LineIcon from "../../components/icons/LineIcon";

export const Login = () => {
  return (
    <section className="p-5 flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        <GlowfishIcon />
        <h1>Sign in to see all the event happening.</h1>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button icon={<LineIcon className="absolute left-4"/>} bgColor="#04DD00">
          Continue with Line
        </Button>

        <p className="text-center">By proceeding, you agree to our terms of use and Confirm  you have read our Privacy and Cookie statement.</p>
      </div>

      {/* <AuthPage
        type="login"
        renderContent={(content) => (
          <div>
            <p
              style={{
                padding: 10,
                color: "#004085",
                backgroundColor: "#cce5ff",
                borderColor: "#b8daff",
                textAlign: "center",
              }}
            >
              email: demo@refine.dev
              <br /> password: demodemo
            </p>
            {content}
          </div>
        )}
      /> */}
    </section>
  );
};
