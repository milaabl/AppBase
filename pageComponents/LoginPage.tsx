import * as React from "react";
import { ErrorMessages, PasswordField } from "../components";
import { LoginResponseInterface, UserContextInterface, ChurchInterface, UserInterface } from "../interfaces";
import { ApiHelper, ArrayHelper, UserHelper } from "../helpers";
import { Button, FormControl, Alert, Form } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie"
import * as yup from "yup"
import { Formik, FormikHelpers } from "formik"
import jwt_decode from "jwt-decode"
import { Register } from "./components/Register"
import { SelectChurchModal } from "./components/SelectChurchModal"
import { Forgot } from "./components/Forgot";

const schema = yup.object().shape({
  email: yup.string().required("Please enter your email address.").email("Please enter a valid email address."),
  password: yup.string().required("Please enter your password.")
})

interface Props {
  context: UserContextInterface,
  jwt: string, auth: string,
  keyName?: string,
  logo?: string,
  appName?: string,
  appUrl?: string,
  returnUrl?: string,
  loginSuccessOverride?: () => void,
  userRegisteredCallback?: (user: UserInterface) => Promise<void>;
  churchRegisteredCallback?: (church: ChurchInterface) => Promise<void>;
  callbackErrors?: string[];
}

export const LoginPage: React.FC<Props> = (props) => {
  const [welcomeBackName, setWelcomeBackName] = React.useState("");
  const [errors, setErrors] = React.useState([]);
  const [redirectTo, setRedirectTo] = React.useState<string>("");
  const [cookies, setCookie] = useCookies(["jwt", "name", "email"]);
  const [showForgot, setShowForgot] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showSelectModal, setShowSelectModal] = React.useState(false);
  const [loginResponse, setLoginResponse] = React.useState<LoginResponseInterface>(null)
  const [userJwt, setUserJwt] = React.useState("");
  const location = typeof window !== "undefined" && window.location;
  let selectedChurchId = "";
  let registeredChurch: ChurchInterface = null;
  let userJwtBackup = ""; //use state copy for storing between page updates.  This copy for instant availability.

  React.useEffect(() => {
    if (props.callbackErrors?.length > 0) {
      setErrors(props.callbackErrors)
    }
  }, [props.callbackErrors])

  const init = () => {
    const search = new URLSearchParams(location?.search);
    const action = search.get("action");
    if (action === "forgot") setShowForgot(true);
    else if (action === "register") setShowRegister(true);
    else {
      if (props.auth) login({ authGuid: props.auth });
      if (props.jwt) {
        setWelcomeBackName(cookies.name);
        login({ jwt: props.jwt });
      }
    }
  };

  const handleLoginSuccess = async (resp: LoginResponseInterface) => {
    userJwtBackup = resp.user.jwt;
    setUserJwt(userJwtBackup);
    ApiHelper.setDefaultPermissions(resp.user.jwt);
    setLoginResponse(resp)
    resp.churches.forEach(church => { if (!church.apis) church.apis = []; });
    UserHelper.churches = resp.churches;

    setCookie("name", `${resp.user.firstName} ${resp.user.lastName}`, { path: "/" });
    setCookie("email", resp.user.email, { path: "/" });
    UserHelper.user = resp.user;

    if (props.jwt) {
      const decoded: any = jwt_decode(props.jwt)
      selectedChurchId = decoded.churchId
    }

    if (props.keyName) selectChurchByKeyName();
    else if (selectedChurchId) selectChurchById();
    else setShowSelectModal(true);
  }

  const selectChurchById = async () => {
    await UserHelper.selectChurch(props.context, selectedChurchId, undefined);
    if (props.churchRegisteredCallback && registeredChurch) {
      props.churchRegisteredCallback(registeredChurch).then(() => {
        registeredChurch = null;
        login({ jwt: userJwt || userJwtBackup }, undefined);
      });
    } else continuedLoginProcess();
  }

  const selectChurchByKeyName = async () => {
    if (!ArrayHelper.getOne(UserHelper.churches, "subDomain", props.keyName)) {
      const church: ChurchInterface = await ApiHelper.post("/churches/select", { subDomain: props.keyName }, "AccessApi");
      UserHelper.setupApiHelper(church);
      //create/claim the person record and relogin
      const personClaim = await ApiHelper.get("/people/claim/" + church.id, "MembershipApi");
      await ApiHelper.post("/userChurch/claim", { encodedPerson: personClaim.encodedPerson }, "AccessApi");
      login({ jwt: userJwt || userJwtBackup }, undefined);
      return;
    }
    await UserHelper.selectChurch(props.context, undefined, props.keyName);
    continuedLoginProcess()
    return;
  }

  function continuedLoginProcess() {
    if (UserHelper.currentChurch) {
      UserHelper.currentChurch.apis.forEach(api => {
        if (api.keyName === "AccessApi") setCookie("jwt", api.jwt, { path: "/" });
      })
    }

    const search = new URLSearchParams(location?.search);
    const returnUrl = search.get("returnUrl") || props.returnUrl;
    if (returnUrl) {
      setRedirectTo(returnUrl);
    }

    if (props.loginSuccessOverride !== undefined) props.loginSuccessOverride();
    else props.context.setUserName(UserHelper.currentChurch.id.toString());
  }

  async function selectChurch(churchId: string) {
    setErrors([])
    selectedChurchId = churchId;
    if (!ArrayHelper.getOne(UserHelper.churches, "id", churchId)) {
      const church: ChurchInterface = await ApiHelper.post("/churches/select", { churchId: churchId }, "AccessApi");
      UserHelper.setupApiHelper(church);

      //create/claim the person record and relogin
      const personClaim = await ApiHelper.get("/people/claim/" + churchId, "MembershipApi");
      await ApiHelper.post("/userChurch/claim", { encodedPerson: personClaim.encodedPerson }, "AccessApi");
      login({ jwt: userJwt || userJwtBackup }, undefined);
      return;
    }

    UserHelper.selectChurch(props.context, churchId, null).then(() => {
      continuedLoginProcess()
    });
  }

  const handleLoginErrors = (errors: string[]) => {
    setWelcomeBackName("");
    console.log(errors);
    setErrors(["Invalid login. Please check your email or password."]);
  }

  const login = (data: any, helpers?: FormikHelpers<any>) => {
    setErrors([])
    ApiHelper.postAnonymous("/users/login", data, "AccessApi")
      .then((resp: LoginResponseInterface) => {
        if (resp.errors) {
          handleLoginErrors(resp.errors);
          helpers?.setSubmitting(false);
        } else {
          handleLoginSuccess(resp);
        }
      })
      .catch((e) => { setErrors([e.toString()]); helpers?.setSubmitting(false); throw e; });

  };

  const getWelcomeBack = () => {
    if (welcomeBackName === "") return null;
    else {
      return <Alert variant="info">Welcome back, <b>{welcomeBackName}</b>!  Please wait while we load your data.</Alert>
    }
  }

  const getCheckEmail = () => {
    const search = new URLSearchParams(location?.search);
    if (search.get("checkEmail") === "1") return <Alert variant="info">Thank you for registering.  Please check your email for your temporary password.</Alert>
  }

  const handleShowRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRegister(true);
  }

  const getRegisterLink = () => (
    <><a href="about:blank" onClick={handleShowRegister}>Register</a> &nbsp; | &nbsp; </>
  )

  const handleRegisterCallback = () => {
    setShowForgot(false);
    setShowRegister(true);
  }

  const handleLoginCallback = () => {
    setShowForgot(false);
    setShowRegister(false);
  }

  const getLoginBox = () => (
    <div id="loginBox" style={{ backgroundColor: "#FFF", border: "1px solid #CCC", borderRadius: 5, padding: 20 }}>
      <h2>Please sign in</h2>
      <Formik validationSchema={schema} initialValues={initialValues} onSubmit={login}>
        {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group>
              <FormControl type="text" aria-label="email" id="email" name="email" value={values.email} onChange={handleChange} placeholder="Email address" isInvalid={touched.email && !!errors.email} />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <PasswordField value={values.password} onChange={handleChange} onKeyDown={e => e.key === "Enter" && login} isInvalid={touched.password && !!errors.password} errorText={errors.password} />
            </Form.Group>
            <Button type="submit" id="signInButton" size="lg" variant="primary" block disabled={isSubmitting} style={{ width: "100%" }}>
              {isSubmitting ? "Please wait..." : "Sign in"}
            </Button>
          </Form>
        )}
      </Formik>
      <br />
      <div className="text-right">
        {getRegisterLink()}
        <a href="about:blank" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>Forgot Password</a>&nbsp;
      </div>
    </div>
  )

  const getLoginRegister = () => {
    if (showRegister) return (
      <div id="loginBox" style={{ backgroundColor: "#FFF", border: "1px solid #CCC", borderRadius: 5, padding: 20 }}>
        <h2>Create an Account</h2>
        <Register updateErrors={setErrors} appName={props.appName} appUrl={props.appUrl} userRegisteredCallback={props.userRegisteredCallback} />
      </div>
    );
    if (showForgot) return (
      <div id="loginBox" style={{ backgroundColor: "#FFF", border: "1px solid #CCC", borderRadius: 5, padding: 20 }}>
        <h2>Reset Password</h2>
        <Forgot registerCallback={handleRegisterCallback} loginCallback={handleLoginCallback} />
      </div>
    );
    else return getLoginBox();
  }

  const handleChurchRegistered = (church: ChurchInterface) => {
    registeredChurch = church;
  }

  React.useEffect(init, []); //eslint-disable-line

  const initialValues = { email: "", password: "" }

  if (redirectTo) return <Navigate to={redirectTo} />;
  else return (
    <div style={{ maxWidth: 350, marginLeft: "auto", marginRight: "auto" }}>
      <img src={props.logo || "/images/logo.png"} alt="logo" className="img-fluid" style={{ width: "100%", marginTop: 100, marginBottom: 60 }} />
      <ErrorMessages errors={errors} />
      {getWelcomeBack()}
      {getCheckEmail()}
      {getLoginRegister()}
      <SelectChurchModal show={showSelectModal} churches={loginResponse?.churches} selectChurch={selectChurch} registeredChurchCallback={handleChurchRegistered} errors={errors} />
    </div>
  );

};
