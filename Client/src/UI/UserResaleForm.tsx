// UserResaleForm.tsx
import React, { useRef, useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SystemHelpMaster from "../Helper/HelpComponent/SystemMasterHelp";

// Define the validation schema with Zod
const schema = z.object({
  Date: z.string().nonempty("Date is required"),
  Mill_Code: z.number().positive("Company is required"),
  Grade: z.string().nonempty("Grade is required"),
  Season: z.string().nonempty("Season is required"),
  Lifting_date: z.string().nonempty("Lifting Date is required"),
  Payment_Date: z.string().nonempty("Payment Date is required"),
  Display_Rate: z.string().nonempty("Sale Rate is required"),
  Display_Qty: z.string().nonempty("Sale Quantal is required"),
  Start_Date: z.string().nonempty("Start_Date  is required"),
  Start_Time: z.string().nonempty("Start_Time is required"),
  End_Date: z.string().nonempty("End_Date  is required"),
  End_Time: z.string().nonempty("End_Time is required"),
});

type FormData = z.infer<typeof schema>;

const apiKey = process.env.REACT_APP_API_KEY;

interface UserResaleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserResaleForm: React.FC<UserResaleFormProps> = ({ isOpen, onClose }) => {
  const initialRef = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLButtonElement>(null);

  const userId = sessionStorage.getItem("user_id");
  const ac_code = sessionStorage.getItem("ac_code");
  const accoid = sessionStorage.getItem("accoid");

  const [companies, setCompanies] = useState<{ id: number; name: string, accoid: number }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [itemCode, setItemCode] = useState<number | null>(null);
  const [Item_Name, setItemName] = useState<String | null>(null);
  const [ic, setIc] = useState<number | null>(null);

  const [systemDataS, setSystemDataS] = useState<any[]>([]);
  const [systemDataZ, setSystemDataZ] = useState<any[]>([]);


  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      Date: getCurrentDate(),
      Mill_Code: NaN,
      Grade: "",
      Season: "",
      Lifting_date: getCurrentDate(),
      Payment_Date: getCurrentDate(),
      Display_Rate: "",
      Display_Qty: "",
      Start_Date: getCurrentDate(),
      End_Date: getCurrentDate()
    },
  });

  useEffect(() => {
    axios
      .get(`${apiKey}/companieslist`)
      .then((response) => {
        const fetchedCompanies = response.data.map(
          (company: { user_id: number; company_name: string, accoid: number, ac_code: number }) => ({
            id: company.ac_code,
            name: company.company_name,
            accoid: company.accoid
          })
        );
        setCompanies(fetchedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching company data:", error);
      });

    fetchAllSystemData();
  }, []);



  const fetchAllSystemData = async () => {
    try {
      const response = await axios.get(`${apiKey}/get_system_master`);
      if (response.data && response.data.length > 0) {
        const systemDataS = response.data.filter((item: any) => item.System_Type === 'S');
        const systemDataZ = response.data.filter((item: any) => item.System_Type === 'Z');
        const systemDataU = response.data.filter((item: any) => item.System_Type === 'U');

        setSystemDataS(systemDataS);
        setSystemDataZ(systemDataZ);

      } else {
        console.warn("No system master data found");
        setSystemDataS([]);
        setSystemDataZ([]);

      }
    } catch (error) {
      console.error("Error fetching system master data:", error);
      setSystemDataS([]);
      setSystemDataZ([]);

    }
  };

  const handleResaleAdd = (data: FormData, itemcode: number | null, Item_Name: String | null, ic: number | null,) => {

    const selectedCompany = companies.find(company => company.id === data.Mill_Code);

    if (!selectedCompany) {
      console.error("Selected user or company not found");
      return;
    }

    const formDataWithItemCode = {
      ...data,
      itemcode: itemCode || 0,
      Tender_No: 0,
      Item_Name: Item_Name || 0,
      user_id: userId,
      Payment_ToAcCode: ac_code,
      Pt_Accoid: accoid,
      mc: selectedCompany.accoid,
      ic: ic
    };

    const formDataArray = [formDataWithItemCode]

    axios
      .post(`${apiKey}/publishlist-tender`, formDataArray, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {

        onClose();
      })
      .catch((error) => {
        console.error("Error publishing form data:", error);
      });
  };

  const handleMillItemSelect = (code: number, name: string, ic: number) => {
    setItemCode(code);
    setItemName(name)
    setIc(ic)
  };

  const onSubmit = (data: FormData) => {
    handleResaleAdd(data, itemCode, Item_Name, ic);
  };

  return (
    <Modal show={isOpen} onHide={onClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ textAlign: 'center', width: '100%' }}>My Order Resale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Date">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register("Date")}
                  isInvalid={!!errors.Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Company_Name">
                <Form.Label>Mill Name</Form.Label>
                <Form.Select
                  as="select"
                  {...register("Mill_Code", { valueAsNumber: true })}
                  isInvalid={!!errors.Mill_Code}
                >
                  <option value="">Select Mill</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.Mill_Code?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12}>
              <Form.Label>Select Product</Form.Label>
              <SystemHelpMaster
                onAcCodeClick={handleMillItemSelect}
                name="system-help-master"
                CategoryName=""
                CategoryCode={0}
              />
            </Col>
          </Row>

          {/* Start Date and Time Fields */}
          <Row>
            <Col md={6}>
              <Form.Group controlId="Start_Date">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register("Start_Date")}
                  isInvalid={!!errors.Start_Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Start_Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Start_Time">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register("Start_Time")}
                  isInvalid={!!errors.Start_Time}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Start_Time?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            {/* End Date and Time Fields */}
            <Col md={6}>
              <Form.Group controlId="End_Date">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register("End_Date")}
                  isInvalid={!!errors.End_Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.End_Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="End_Time">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  {...register("End_Time")}
                  isInvalid={!!errors.End_Time}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.End_Time?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="Grade">
                <Form.Label>Grade</Form.Label>
                <Form.Control
                  as="select"
                  {...register("Grade")}
                  isInvalid={!!errors.Grade}
                >
                  {systemDataS.map((item: { id: number; System_Name_E: string }) => (
                    <option key={item.id} value={item.System_Name_E}>
                      {item.System_Name_E}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.Grade?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Season">
                <Form.Label>Season</Form.Label>
                <Form.Control
                  as="select"
                  {...register("Season")}
                  isInvalid={!!errors.Season}
                >
                  {systemDataZ.map((item: { id: number; System_Name_E: string }) => (
                    <option key={item.id} value={item.System_Name_E}>
                      {item.System_Name_E}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.Season?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Lifting_Date">
                <Form.Label>Lifting Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Lifting Date"
                  {...register("Lifting_date")}
                  isInvalid={!!errors.Lifting_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Lifting_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Payment_Date">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Payment Date"
                  {...register("Payment_Date")}
                  isInvalid={!!errors.Payment_Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Payment_Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Sale_Rate">
                <Form.Label>Sale Rate</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sale Rate"
                  {...register("Display_Rate")}
                  isInvalid={!!errors.Display_Rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Display_Rate?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Sale_Quantal">
                <Form.Label>Sale Quantal</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sale Quantal"
                  {...register("Display_Qty")}
                  isInvalid={!!errors.Display_Qty}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Display_Qty?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} ref={finalRef}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ marginLeft: "15px" }}
              >
                Publish
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserResaleForm;
