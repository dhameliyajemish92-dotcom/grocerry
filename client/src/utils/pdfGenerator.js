import jsPDF from 'jspdf';

export const generateCartPDF = (cart, cartCount, getTotal) => {
    const doc = new jsPDF();
    const primaryColor = [0, 123, 255];
    const textColor = [51, 51, 51];
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 20;

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Grocery', margin, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Trusted Grocery Store', margin, 33);

    yPosition = 55;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    doc.text('Date: ' + currentDate, margin, yPosition);
    yPosition += 7;
    doc.text('Items: ' + cartCount, margin, yPosition);
    yPosition += 15;

    // Table Header
    const tableTop = yPosition;
    const tableHeaderHeight = 10;
    const rowHeight = 12; // Increased from 10 to 12
    const col1Width = 70;
    const col2Width = 25;
    const col3Width = 35;

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, tableTop, contentWidth, tableHeaderHeight, 'F');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Name', margin + 3, tableTop + 7);
    doc.text('Qty', margin + col1Width + 3, tableTop + 7);
    doc.text('Unit Price', margin + col1Width + col2Width + 3, tableTop + 7);
    doc.text('Total Price', margin + col1Width + col2Width + col3Width + 3, tableTop + 7);

    // Table Body
    yPosition = tableTop + tableHeaderHeight + 2; // Start 2px below header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let subtotal = 0;

    cart.forEach((product, index) => {
        const quantity = product.quantity || 1;
        const unitPrice = parseFloat(product.pricing?.selling_price ?? product.price);
        const totalPrice = unitPrice * quantity;
        subtotal += totalPrice;

        // Alternating row background
        if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPosition - 3, contentWidth, rowHeight, 'F');
        }

        const productName = product.name || 'Unknown Product';
        let displayName = productName;
        // Truncate long names
        if (doc.getTextWidth(displayName) > col1Width - 5) {
            while (doc.getTextWidth(displayName + '...') > col1Width - 5 && displayName.length > 0) {
                displayName = displayName.slice(0, -1);
            }
            displayName = displayName + '...';
        }

        // Draw text at current yPosition
        doc.text(displayName, margin + 3, yPosition + 5);
        doc.text(String(quantity), margin + col1Width + 3, yPosition + 5);
        doc.text('Rs.' + unitPrice.toFixed(2), margin + col1Width + col2Width + 3, yPosition + 5);
        doc.text('Rs.' + totalPrice.toFixed(2), margin + col1Width + col2Width + col3Width + 3, yPosition + 5);

        yPosition += rowHeight; // Move to next row

        // Check for page break
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
    });

    // Total Section
    yPosition += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
    const total = getTotal ? getTotal() : subtotal;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', margin, yPosition + 10);
    doc.text('Rs.' + total.toFixed(2), pageWidth - margin - doc.getTextWidth('Rs.' + total.toFixed(2)), yPosition + 10);

    // Footer
    const footerY = 285;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for shopping with Grocery!', pageWidth / 2, footerY, { align: 'center' });

    const fileName = 'Grocery_Cart_' + new Date().toISOString().slice(0, 10) + '.pdf';
    doc.save(fileName);
    return fileName;
};

export const generateOrderPDF = (order) => {
    console.log('generateOrderPDF called with:', order);
    console.log('Order products:', order?.products);

    const doc = new jsPDF();
    const primaryColor = [0, 177, 6];
    const textColor = [51, 51, 51];
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 20;

    // Get products from order - handle different data structures
    const products = order.products || [];
    console.log('Products for PDF:', products);

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Grocery', margin, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Order Invoice', margin, 33);

    yPosition = 55;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const orderDate = new Date(order.ordered_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Order Info Box
    doc.setFillColor(250, 250, 250);
    doc.rect(margin - 5, yPosition - 5, contentWidth + 10, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin - 5, yPosition - 5, contentWidth + 10, 35, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text('Order ID: ' + order.order_id, margin, yPosition + 5);
    doc.text('Date: ' + orderDate, margin + 80, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Status: ' + order.status, margin, yPosition + 15);
    doc.text('Payment: ' + (order.payment_method || 'N/A'), margin + 80, yPosition + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 123, 255);
    doc.text('Total: Rs.' + order.total, margin, yPosition + 25);

    // Table
    doc.setTextColor(...textColor);
    yPosition += 50;

    const tableTop = yPosition;
    const tableHeaderHeight = 12;
    const rowHeight = 12;
    const col1Width = 55;
    const col2Width = 20;
    const col3Width = 15;
    const col4Width = 25;

    doc.setFillColor(...primaryColor);
    doc.rect(margin, tableTop, contentWidth, tableHeaderHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Product', margin + 3, tableTop + 8);
    doc.text('Price', margin + col1Width + 3, tableTop + 8);
    doc.text('Qty', margin + col1Width + col2Width + 3, tableTop + 8);
    doc.text('Amount', margin + col1Width + col2Width + col3Width + 3, tableTop + 8);
    doc.text('Tax (5%)', margin + col1Width + col2Width + col3Width + col4Width + 3, tableTop + 8);

    // Table Body
    yPosition = tableTop + tableHeaderHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textColor);

    // Inclusive tax logic
    const taxRate = 0.05;
    const grandTotalValue = parseFloat(order.total) || 0;
    const taxableValue = grandTotalValue / (1 + taxRate);
    const totalTaxValue = grandTotalValue - taxableValue;

    // If no products, show a message
    if (products.length === 0) {
        doc.setFontSize(10);
        doc.text('No products found in this order', margin + 3, yPosition + 10);
        yPosition += 20;
    } else {
        products.forEach((product, index) => {
            const quantity = product.quantity || 1;
            const price = parseFloat(product.price) || 0;
            const amount = price * quantity;

            if (index % 2 === 1) {
                doc.setFillColor(250, 250, 250);
                doc.rect(margin, yPosition - 3, contentWidth, rowHeight, 'F');
            }

            const packaging = product.packaging ? ` (${product.packaging.quantity} ${product.packaging.unit})` : '';
            const brand = product.brand ? `[${product.brand}] ` : '';
            const productName = brand + (product.name || 'Unknown Product') + packaging;

            let displayName = productName;
            if (doc.getTextWidth(displayName) > col1Width + col2Width - 5) {
                while (doc.getTextWidth(displayName + '...') > col1Width + col2Width - 5 && displayName.length > 0) {
                    displayName = displayName.slice(0, -1);
                }
                displayName = displayName + '...';
            }

            doc.text(displayName, margin + 3, yPosition + 5);
            doc.text('Rs.' + price.toFixed(2), margin + col1Width + col2Width + 3, yPosition + 5);
            doc.text(String(quantity), margin + col1Width + col2Width + col3Width + 3, yPosition + 5);
            doc.text('Rs.' + amount.toFixed(2), margin + col1Width + col2Width + col3Width + col4Width + 3, yPosition + 5);

            yPosition += rowHeight;

            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
        });
    }

    // Total Section
    yPosition += 5;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFillColor(250, 250, 250);
    doc.rect(pageWidth - margin - 60, yPosition - 5, 60, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(pageWidth - margin - 60, yPosition - 5, 60, 35, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Taxable Value:', pageWidth - margin - 55, yPosition + 3);
    doc.text('Rs.' + taxableValue.toFixed(2), pageWidth - margin - 5, yPosition + 3, { align: 'right' });
    doc.text('GST (5% Incl):', pageWidth - margin - 55, yPosition + 13);
    doc.text('Rs.' + totalTaxValue.toFixed(2), pageWidth - margin - 5, yPosition + 13, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Grand Total:', pageWidth - margin - 55, yPosition + 25);
    doc.text('Rs.' + grandTotalValue.toFixed(2), pageWidth - margin - 5, yPosition + 25, { align: 'right' });

    // Footer
    const footerY = 285;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for shopping with Grocery!', pageWidth / 2, footerY, { align: 'center' });

    const fileName = 'Grocery_Order_' + order.order_id + '.pdf';
    doc.save(fileName);
    console.log('PDF generated:', fileName);
    return fileName;
};

const pdfExports = {
    generateCartPDF,
    generateOrderPDF
};

export default pdfExports;
