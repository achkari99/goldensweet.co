// Invoice Generator for Golden Sweet Bakery
// Generates a beautiful invoice design and converts it to an image for WhatsApp

class InvoiceGenerator {
    constructor() {
        this.businessWhatsApp = '212637629395'; // Corrected business number
    }

    async sendToWhatsApp(customerInfo, cartItems, totals) {
        // Create WhatsApp message with all details
        const message = this.createWhatsAppMessage(customerInfo, cartItems, totals);

        // Record the order locally for the Admin Panel
        this.recordOrderLocally(customerInfo, cartItems, totals);

        // Open WhatsApp Web with the message
        const whatsappUrl = `https://wa.me/${this.businessWhatsApp}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        return {
            success: true,
            message: 'WhatsApp opened'
        };
    }

    recordOrderLocally(customerInfo, cartItems, totals) {
        try {
            const KEYS = { ORDERS: 'cinnamona-orders' };
            const stored = localStorage.getItem(KEYS.ORDERS);
            const orders = stored ? JSON.parse(stored) : [];

            const itemsSummary = cartItems.map(item => {
                const t = (key, fallback) => window.I18n ? window.I18n.t(key, fallback) : fallback;
                const itemName = item.productKey ? t(item.productKey, item.name) : item.name;
                return `${item.quantity}x ${itemName}`;
            }).join(', ');

            orders.push({
                id: 'o' + Date.now(),
                customer: customerInfo.name,
                items: itemsSummary,
                total: totals.total,
                date: new Date().toISOString(),
                status: 'WhatsApp Sent'
            });

            localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders.slice(-100))); // Keep last 100 orders
        } catch (e) {
            console.error('Failed to record order locally:', e);
        }
    }

    createWhatsAppMessage(customerInfo, cartItems, totals) {
        const t = (key, fallback) => window.I18n ? window.I18n.t(key, fallback) : fallback;

        let message = `*${t('whatsapp.order_title', 'NEW ORDER - Golden Sweet')}* \n\n`;

        message += `*${t('whatsapp.customer_info', 'CUSTOMER INFORMATION:')}*\n`;
        message += `${t('whatsapp.name', 'Name')}: ${customerInfo.name}\n`;
        message += `${t('whatsapp.phone', 'Phone')}: ${customerInfo.phone}\n`;
        message += `${t('whatsapp.address', 'Address')}: ${customerInfo.address}\n`;
        if (customerInfo.notes) {
            message += `${t('whatsapp.notes', 'Notes')}: ${customerInfo.notes}\n`;
        }
        message += `\n`;

        message += `*${t('whatsapp.order_details', 'ORDER DETAILS:')}*\n`;
        cartItems.forEach(item => {
            const itemName = item.productKey ? t(item.productKey, item.name) : item.name;
            message += `• ${itemName} x${item.quantity} - ${item.price * item.quantity} ${t('common.currency', 'MAD')}\n`;
        });
        message += `\n`;

        message += `*${t('whatsapp.summary', 'SUMMARY:')}*\n`;
        message += `${t('whatsapp.subtotal', 'Subtotal')}: ${totals.subtotal} ${t('common.currency', 'MAD')}\n`;
        const deliveryText = totals.delivery === 0 ? t('whatsapp.free_delivery', 'Free') : totals.delivery + ' ' + t('common.currency', 'MAD');
        message += `${t('whatsapp.delivery', 'Delivery')}: ${deliveryText}\n`;
        message += `*${t('whatsapp.total', 'TOTAL TO PAY')}: ${totals.total} ${t('common.currency', 'MAD')}*\n\n`;

        message += `${t('whatsapp.thank_you', 'Thank you for confirming my order!')}`;

        return message;
    }

    downloadInvoice(dataUrl, invoiceNumber) {
        try {
            // Convert data URL to blob for better handling
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });

            // Create object URL from blob
            const blobUrl = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `GoldenSweet-Facture-${invoiceNumber}.png`;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            // Fallback to simple download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `GoldenSweet-Facture-${invoiceNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    setBusinessWhatsApp(number) {
        this.businessWhatsApp = number;
    }
}

// Export for use in other scripts
window.InvoiceGenerator = InvoiceGenerator;
