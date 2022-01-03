import React from "react";
import { Table } from "react-bootstrap";
import { Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CardForm, BankForm } from ".";
import { DisplayBox, Loading } from "../../components";
import { ApiHelper, UserHelper } from "../../helpers";
import { PersonInterface, StripePaymentMethod, Permissions } from "../../interfaces";

interface Props { person: PersonInterface, customerId: string, paymentMethods: StripePaymentMethod[], stripePromise: Promise<Stripe>, appName: string, dataUpdate: (message?: string) => void }

export const PaymentMethods: React.FC<Props> = (props) => {
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<StripePaymentMethod>(new StripePaymentMethod());
  const [mode, setMode] = React.useState("display");
  const [verify, setVerify] = React.useState<boolean>(false);

  const handleEdit = (pm?: StripePaymentMethod, verifyAccount?: boolean) => (e: React.MouseEvent) => {
    e.preventDefault();
    setEditPaymentMethod(pm);
    setVerify(verifyAccount)
    setMode("edit");
  }

  const handleDelete = async () => {
    let confirmed = window.confirm("Are you sure you want to delete this payment method?");
    if (confirmed) {
      ApiHelper.delete("/paymentmethods/" + editPaymentMethod.id + "/" + props.customerId, "GivingApi").then(() => {
        setMode("display");
        props.dataUpdate("Payment method deleted.");
      })
    }
  }

  const getNewContent = () => {
    if (!UserHelper.checkAccess(Permissions.givingApi.settings.edit) && props.appName !== "B1App") return null;
    return (
      <>
        <a id="addBtnGroup" aria-label="add-button" type="button" data-toggle="dropdown" aria-expanded="false" href="about:blank"><i className="fas fa-plus"></i></a>
        <div className="dropdown-menu" aria-labelledby="addBtnGroup">
          <a className="dropdown-item" aria-label="add-card" href="about:blank" onClick={handleEdit(new StripePaymentMethod({ type: "card" }))}><i className="fas fa-credit-card"></i> Add Card</a>
          <a className="dropdown-item" aria-label="add-bank" href="about:blank" onClick={handleEdit(new StripePaymentMethod({ type: "bank" }))}><i className="fas fa-university"></i> Add Bank</a>
        </div>
      </>
    );
  }

  const getEditOptions = (pm: StripePaymentMethod) => {
    if (!UserHelper.checkAccess(Permissions.givingApi.settings.edit) && props.appName !== "B1App") return null;
    return <a aria-label="edit-button" onClick={handleEdit(pm)} href="about:blank"><i className="fas fa-pencil-alt"></i></a>;
  }

  const getPMIcon = (type: string) => (type === "card" ? <i className="fas fa-credit-card"></i> : <i className="fas fa-university"></i>)

  const getPaymentRows = () => {
    let rows: JSX.Element[] = [];

    props.paymentMethods.forEach((method: StripePaymentMethod) => {
      rows.push(
        <tr key={method.id}>
          <td className="capitalize">{getPMIcon(method.type)} {method.name + " ****" + method.last4}</td>
          <td>{method?.status === "new" && <a href="about:blank" aria-label="verify-account" onClick={handleEdit(method, true)}>Verify Account</a>}</td>
          <td className="text-right">{getEditOptions(method)}</td>
        </tr>
      );
    });
    return rows;
  }

  const PaymentMethodsTable = () => {
    if (!props.paymentMethods) return <Loading></Loading>
    if (props.paymentMethods.length) {
      return (
        <Table>
          <tbody>
            {getPaymentRows()}
          </tbody>
        </Table>
      );
    }
    else return <div>No payment methods. Add a payment method to make a donation.</div>
  }

  const EditForm = () => (
    <Elements stripe={props.stripePromise}>
      {editPaymentMethod.type === "card" && <CardForm card={editPaymentMethod} customerId={props.customerId} person={props.person} setMode={setMode} deletePayment={handleDelete} updateList={(message) => { props.dataUpdate(message) }} />}
      {editPaymentMethod.type === "bank" && <BankForm bank={editPaymentMethod} showVerifyForm={verify} customerId={props.customerId} person={props.person} setMode={setMode} deletePayment={handleDelete} updateList={(message) => { props.dataUpdate(message) }} />}
    </Elements>
  )

  const PaymentMethods = () => {
    if (mode === "display") {
      return (
        <DisplayBox aria-label="payment-methods-box" headerIcon="fas fa-credit-card" headerText="Payment Methods" editContent={getNewContent()}>
          <PaymentMethodsTable></PaymentMethodsTable>
        </DisplayBox>
      );
    }
    else return <EditForm></EditForm>;
  }

  return props.stripePromise ? <PaymentMethods></PaymentMethods> : null;

}
