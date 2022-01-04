import React, { useRef } from "react";
import { Row, Col, FormGroup, Form, InputGroup } from "react-bootstrap"
import { ApiHelper } from "../../helpers"
import { ChurchInterface, RegisterChurchRequestInterface } from "../../interfaces";
import * as yup from "yup"
import { Formik, FormikHelpers } from "formik"
import { InputBox } from "../../components"

interface Props {
  initialChurchName: string,
  registeredChurchCallback?: (church: ChurchInterface) => void,
  selectChurch: (churchId: string) => void,
  appName: string
}

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  subDomain: yup.string().required("Subdomain is required"),
  address1: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zip: yup.string().required("Zip is required"),
  country: yup.string().required("Country is required")
})

export const SelectChurchRegister: React.FC<Props> = (props) => {
  const formikRef: any = useRef(null);
  const initialValues: RegisterChurchRequestInterface = { name: props.initialChurchName, address1: "", address2: "", city: "", state: "", zip: "", country: "", subDomain: props.initialChurchName.toLowerCase().replace(" ", ""), appName: props.appName }

  const handleSave = (church: RegisterChurchRequestInterface, { setSubmitting }: FormikHelpers<RegisterChurchRequestInterface>) => {
    setSubmitting(true);
    ApiHelper.post("/churches/add", church, "AccessApi").then(async resp => {
      setSubmitting(false);
      if (resp.errors !== undefined) {
        let handleError = formikRef.current.setErrors;
        handleError({ subDomain: resp.errors[0] })
      }
      else {
        if (props.registeredChurchCallback) props.registeredChurchCallback(resp);
        props.selectChurch(resp.id);
      }
    });
  }

  return (
    <>
      <Formik validationSchema={schema} onSubmit={handleSave} initialValues={initialValues} enableReinitialize={true} innerRef={formikRef}>
        {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
          <Form noValidate>
            <InputBox id="churchBox" saveFunction={handleSubmit} headerText="Register a New Church" headerIcon="fas fa-church" isSubmitting={isSubmitting}>
              <Row>
                <Col>
                  <FormGroup>
                    <Form.Label htmlFor="name">Church Name</Form.Label>
                    <Form.Control name="name" id="name" value={values.name || ""} onChange={handleChange} isInvalid={touched.name && !!errors.name} />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label htmlFor="subDomain">Subdomain</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" placeholder="yourchurch" name="subDomain" value={values.subDomain || ""} onChange={handleChange} isInvalid={touched.subDomain && !!errors.subDomain} />
                      <InputGroup.Text>.churchapps.org</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">{errors.subDomain}</Form.Control.Feedback>
                    </InputGroup>

                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Form.Label htmlFor="address1">Address Line 1</Form.Label>
                    <Form.Control name="address1" id="address1" value={values.address1 || ""} onChange={handleChange} isInvalid={touched.address1 && !!errors.address1} />
                    <Form.Control.Feedback type="invalid">{errors.address1}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <Form.Label htmlFor="address2">Address Line 2</Form.Label>
                    <Form.Control name="address2" id="address2" value={values.address2 || ""} onChange={handleChange} isInvalid={touched.address2 && !!errors.address2} />
                    <Form.Control.Feedback type="invalid">{errors.address2}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm={6}>
                  <FormGroup>
                    <Form.Label htmlFor="city">City</Form.Label>
                    <Form.Control name="city" id="city" value={values.city || ""} onChange={handleChange} isInvalid={touched.city && !!errors.city} />
                    <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
                <Col sm={3}>
                  <FormGroup>
                    <Form.Label htmlFor="state">State</Form.Label>
                    <Form.Control name="state" id="state" value={values.state || ""} onChange={handleChange} isInvalid={touched.state && !!errors.state} />
                    <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
                <Col sm={3}>
                  <FormGroup>
                    <Form.Label htmlFor="zip">Zip</Form.Label>
                    <Form.Control name="zip" id="zip" value={values.zip || ""} onChange={handleChange} isInvalid={touched.zip && !!errors.zip} />
                    <Form.Control.Feedback type="invalid">{errors.zip}</Form.Control.Feedback>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Form.Label htmlFor="country">Country</Form.Label>
                <Form.Control name="country" id="country" value={values.country || ""} onChange={handleChange} isInvalid={touched.country && !!errors.country} />
                <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
              </FormGroup>
            </InputBox>
          </Form>
        )}
      </Formik>
    </>
  );
};
