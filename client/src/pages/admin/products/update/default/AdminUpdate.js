import styles from './adminUpdate.module.css';
import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import Error from "../../../../../components/feedback/error/Error";
import Loading from "../../../../../components/loading/Loading";
import {useDispatch} from "react-redux";
import {adminUpdateDatabase, uploadProductsFromPDF} from "../../../../../actions/products";
import Warning from "../../../../../components/feedback/warning/Warning";

const AdminUpdate = () => {

    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState("csv"); // 'csv' or 'pdf'
    const [data, setData] = useState("");
    const [mode, setMode] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setData("");
        if (file != null && fileType === 'csv') {
            const reader = new FileReader()
            reader.onload = () => {
                const lines = reader.result;
                setData(lines);
            };
            reader.readAsText(file);
        }
    }, [file, fileType])

    const handleSubmit = () => {
        if (loading) return;

        // Check if mode is selected
        if (!mode)
            return setError("Please select a mode");

        if (fileType === 'csv') {
            // CSV handling
            if (!data || !file)
                return setError("Please upload a CSV file");

            // check that all fields are included in the header
            const fields = ['product_id', 'name', 'price', 'image', 'weight', 'measurement', 'category', 'stock'];
            const headers = data.split("\n")[0].split(",");
            for (const field of fields) {
                let found = false;
                for (const header of headers) {
                    const headerCleaned = header.toLowerCase().replace(/(\r)+/, "");
                    if (headerCleaned === field.toLowerCase()) {
                        found = true;
                        break;
                    }
                }

                if (!found)
                    return setError(`Field ${field} was not found in the CSV header`);
            }

            const onSuccess = (updatedData) => {
                setLoading(false);
                if (!updatedData.length)
                    return setWarning('No changes; database matches the csv file');
                navigate('/admin/products/update/success');
            }

            const onError = (e) => {
                setError(e.message);
                setLoading(false);
            }

            setLoading(true);
            dispatch(adminUpdateDatabase(data, mode, onSuccess, onError));
        } else {
            // PDF handling
            if (!file)
                return setError("Please upload a PDF file");

            // Validate it's actually a PDF
            if (file.type !== 'application/pdf')
                return setError("Please upload a valid PDF file");

            const onSuccess = (updatedData) => {
                setLoading(false);
                if (!updatedData || !updatedData.products || updatedData.products.length === 0)
                    return setWarning('No products found in the PDF');
                navigate('/admin/products/update/success');
            }

            const onError = (e) => {
                setError(e.response?.data?.message || e.message || "Failed to process PDF");
                setLoading(false);
            }

            setLoading(true);
            dispatch(uploadProductsFromPDF(file, mode, onSuccess, onError));
        }
    }

    return (
        <div className={styles['wrapper']}>
            {loading && <Loading text={'Updating Database'} overlay={true}/>}
            {error && <Error error={error} setError={setError}/>}
            {warning && <Warning warning={warning} setWarning={setWarning}/>}
            <div className={styles['header']}>
                <div className={'heading'}>
                    <h1>Update Products</h1>
                </div>
                <p><span className={styles['note']}>Warning:</span> Once the database is updated it cannot be restored.
                </p>
            </div>
            <div className={styles['action']}>
                {/* File Type Selection */}
                <div className={styles['file-type']}>
                    <div className={styles['file-type-title']}>File Type</div>
                    <div 
                        onClick={() => { setFileType("csv"); setFile(null); setData(""); }}
                        className={`${styles[`file-type-btn`]} ${fileType === "csv" && styles['active']}`}
                    >
                        CSV File
                    </div>
                    <div 
                        onClick={() => { setFileType("pdf"); setFile(null); setData(""); }}
                        className={`${styles[`file-type-btn`]} ${fileType === "pdf" && styles['active']}`}
                    >
                        PDF File
                    </div>
                </div>

                {/* File Upload */}
                {fileType === 'csv' ? (
                    <input onChange={(e) => setFile(e.target.files[0])} type={'file'} accept={'text/csv,.csv'}/>
                ) : (
                    <input onChange={(e) => setFile(e.target.files[0])} type={'file'} accept={'application/pdf,.pdf'}/>
                )}

                {/* Mode Selection */}
                <div className={styles['mode']}>
                    <div className={styles['mode-title']}>Mode</div>
                    <div onClick={() => setMode("UPDATE")}
                         className={`${styles[`mode-btn`]} ${mode === "UPDATE" && styles['active']}`}>Update products by
                        id
                    </div>
                    <div onClick={() => setMode("REGENERATE")}
                         className={`${styles[`mode-btn`]} ${mode === "REGENERATE" && styles['active']}`}>Delete all
                        entries and upload file
                    </div>
                </div>
                
                <div onClick={handleSubmit} className={`btn1 ${styles['update']}`} style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                    {loading ? 'Updating...' : 'Update'}
                </div>
                
                <div className={styles['format-links']}>
                    <Link className={styles['format']} to={'/admin/products/update/help'}>CSV Format Guidelines</Link>
                    {fileType === 'pdf' && (
                        <button 
                            className={styles['format']} 
                            onClick={(e) => {
                                e.preventDefault();
                                alert('PDF Format Options:\n\nOption 1 - Invoice/Purchase Format (Recommended):\nColumns: Name, QTY, Rate, GST%, GST Amt, Total\n\nExample:\nProduct Name 1  2  150  18  27  327\nProduct Name 2  1  250  0  0  250\n\nOption 2 - Standard CSV Format:\nproduct_id, name, price, image, weight, measurement, category, stock\n\nExample:\nPRD001, Organic Basmati Rice, 250, images/rice.jpg, 1, kg, Grains, 100');
                            }}
                        >
                            PDF Format Guidelines
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminUpdate;
