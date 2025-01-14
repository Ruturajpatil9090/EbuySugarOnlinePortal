import React, { useEffect, useState } from 'react';
import { Modal, Button, TextField, Box, Grid, IconButton, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import styles from '../../../styles/EditTenderPopup.module.css';
import CloseIcon from '@mui/icons-material/Close';
import SystemHelpMaster from "../../../Helper/HelpComponent/SystemMasterHelp";

const apiKey = process.env.REACT_APP_API_KEY;

interface Tender {
    MillTenderId: number;
    Mill_Code: number;
    Delivery_From: string;
    Sugar_Type: string;
    Quantity: number;
    Packing: number;
    Season: string;
    Lifting_Date: string;
    Last_Dateof_Payment: string;
    Rate_Including_GST: string;
    UserId: number | null;
    mill_user_name: string;
    item_name: string;
    Start_Date: string;
    Start_Time: string;
    End_Date: string;
    End_Time: string;
    MillUserId: string;
    Base_Rate: string;
    Base_Rate_GST_Perc: string;
    Base_Rate_GST_Amount: string;
    Tender_Type: string;
}

interface EditTenderPopupProps {
    open: boolean;
    onClose: () => void;
    tender: Tender | null;
    onTenderUpdated: (updatedTender: Tender) => void;
}

const EditTenderPopup: React.FC<EditTenderPopupProps> = ({ open, onClose, tender, onTenderUpdated }) => {
    const [formData, setFormData] = useState<Tender | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [itemCode, setItemCode] = useState<number | null>(null);
    const [Item_Name, setItemName] = useState<string | null>(null);
    const [ic, setIc] = useState<number | null>(null);
    const [systemMinRate, setSystemMinRate] = useState<string | null>(null);
    const [systemMaxRate, setSyatemMaxRate] = useState<string | null>(null);

    useEffect(() => {
        setFormData(tender);
    }, [tender]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        if (formData) {
            const { name, value } = e.target;
            if (name) {
                setFormData((prev) => ({
                    ...prev!,
                    [name]: value,
                }));
            }
        }
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        if (formData) {
            setFormData((prev) => ({ ...prev!, Delivery_From: event.target.value }));
        }
    };

    const calculateGST = (data: Tender) => {
        const baseRate = parseFloat(data.Base_Rate) || 0;
        const gstPercentage = parseFloat(data.Base_Rate_GST_Perc) || 0;
        const gstAmount = (baseRate * gstPercentage) / 100;
        const rateIncludingGST = baseRate + gstAmount;

        setFormData(prev => ({
            ...prev!,
            Base_Rate_GST_Amount: gstAmount.toFixed(2),
            Rate_Including_GST: rateIncludingGST.toFixed(2),
            Tender_Type: 'T'
        }));
    };

    useEffect(() => {
        if (formData) {
            calculateGST(formData);
        }
    }, [formData?.Base_Rate, formData?.Base_Rate_GST_Perc]);

    const handleSubmit = async () => {
        if (!formData) return;

        try {
            const response = await axios.put(`${apiKey}/update_mill_tender?MillTenderId=${formData.MillTenderId}`, formData);
            onTenderUpdated(response.data.MillTender);
            setSnackbarMessage('Tender updated successfully!');
            setSnackbarSeverity('success');
        } catch (error) {
            setSnackbarSeverity('error');
            console.error('Error updating tender:', error);
        } finally {
            setSnackbarOpen(true);

            setTimeout(() => {
                onClose();
            }, 500);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // const handleSelctProduct = (code: number, name: string, ic: number, minRate: string, maxRate: string) => {
    //     setItemCode(code);
    //     setItemName(name);
    //     setIc(ic);
    //     setSystemMinRate(minRate);
    //     setSyatemMaxRate(maxRate)
    // };

    if (!formData) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box className={styles.modalContainer}>
                <h2>Update eTender</h2>
                <IconButton onClick={onClose} aria-label="close" style={{ float: "right", marginLeft: "700px", marginTop: "-50px" }}>
                    <CloseIcon />
                </IconButton>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            name="mill_user_name"
                            label="Mill Name"
                            value={formData.mill_user_name}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}

                        />
                    </Grid>

                    {/* <Grid item xs={12} sm={12} md={6}>
                        <SystemHelpMaster
                            onAcCodeClick={handleSelctProduct}
                            name="system-help-master"
                        />
                    </Grid> */}
                    <Grid item xs={6}>
                        <TextField
                            name="item_name"
                            label="Product"
                            value={formData.item_name}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth className={styles.textField}>
                            <InputLabel id="delivery-from-label">Delivery From</InputLabel>
                            <Select
                                labelId="delivery-from-label"
                                name="Delivery_From"
                                value={formData.Delivery_From}
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="ExMill">Ex Mill</MenuItem>
                                <MenuItem value="ExWarehouse">Mill Warehouse</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Quantity"
                            label="Quantity"
                            type="number"
                            value={formData.Quantity}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Packing"
                            label="Packing"
                            type="number"
                            value={formData.Packing}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Season"
                            label="Season"
                            value={formData.Season}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Lifting_Date"
                            label="Lifting Date"
                            type="date"
                            value={formData.Lifting_Date}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Last_Dateof_Payment"
                            label="Payment Date"
                            type="date"
                            value={formData.Last_Dateof_Payment}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Base_Rate"
                            label="Base Rate"
                            value={formData.Base_Rate}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Base_Rate_GST_Perc"
                            label="GST %"
                            value={formData.Base_Rate_GST_Perc}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Base Rate GST Amount"
                            variant="outlined"
                            value={formData.Base_Rate_GST_Amount || '0.00'}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Rate_Including_GST"
                            label="Rate Including GST"
                            value={formData.Rate_Including_GST}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Start_Date"
                            label="Start Date"
                            type="date"
                            value={formData.Start_Date}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="Start_Time"
                            label="Start Time"
                            type="time"
                            value={formData.Start_Time}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="End_Date"
                            label="End Date"
                            type="date"
                            value={formData.End_Date}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="End_Time"
                            label="End Time"
                            type="time"
                            value={formData.End_Time}
                            onChange={handleChange}
                            fullWidth
                            className={styles.textField}
                        />
                    </Grid>
                </Grid>
                <div className={styles.buttonContainer}>
                    <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Update</Button>
                </div>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Modal>
    );
};

export default EditTenderPopup;
