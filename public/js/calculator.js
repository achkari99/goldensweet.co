/**
 * CALCULATOR.JS - Service pricing calculator
 */

class PricingCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.prices = {
                rolls: { base: 20, bulk: 18 },
                canneles: { base: 10, bulk: 8 },
                pasteis: { base: 8, bulk: 7 },
                drinks: { base: 35, bulk: 32 },
                boxes: { base: 110, bulk: 100 }
            };
            this.render();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="calculator-card">
                <h3>Catering Calculator</h3>
                <p>Estimate your order cost</p>
                
                <div class="calculator-grid">
                    ${Object.keys(this.prices).map(item => `
                        <div class="calc-item">
                            <label>${this.capitalize(item)}</label>
                            <input type="number" min="0" value="0" data-item="${item}" class="calc-input">
                        </div>
                    `).join('')}
                </div>
                
                <div class="calc-summary">
                    <div class="calc-total">
                        <span>Total Items:</span>
                        <strong id="calc-items">0</strong>
                    </div>
                    <div class="calc-total">
                        <span>Base Price:</span>
                        <strong id="calc-base">0 MAD</strong>
                    </div>
                    <div class="calc-total">
                        <span>Bulk Discount:</span>
                        <strong id="calc-discount" class="text-success">-0 MAD</strong>
                    </div>
                    <div class="calc-total final">
                        <span>Final Price:</span>
                        <strong id="calc-final">0 MAD</strong>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-animated" onclick="Calculator.requestQuote()">Request Quote</button>
            </div>
        `;

        // Add listeners
        this.container.querySelectorAll('.calc-input').forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        this.addStyles();
    }

    calculate() {
        let totalItems = 0;
        let basePrice = 0;
        let bulkPrice = 0;

        this.container.querySelectorAll('.calc-input').forEach(input => {
            const item = input.dataset.item;
            const quantity = parseInt(input.value) || 0;

            totalItems += quantity;
            basePrice += quantity * this.prices[item].base;
            bulkPrice += quantity * this.prices[item].bulk;
        });

        const discount = basePrice - bulkPrice;
        const finalPrice = totalItems >= 50 ? bulkPrice : basePrice;

        document.getElementById('calc-items').textContent = totalItems;
        document.getElementById('calc-base').textContent = `${basePrice} MAD`;
        document.getElementById('calc-discount').textContent = totalItems >= 50 ? `-${discount} MAD` : '0 MAD';
        document.getElementById('calc-final').textContent = `${finalPrice} MAD`;

        // Highlight if bulk discount applies
        if (totalItems >= 50) {
            document.getElementById('calc-discount').style.color = '#28a745';
        } else {
            document.getElementById('calc-discount').style.color = '#999';
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    requestQuote() {
        const inputs = Array.from(this.container.querySelectorAll('.calc-input'));
        const items = inputs
            .filter(input => parseInt(input.value) > 0)
            .map(input => `${input.dataset.item}: ${input.value}`);

        if (items.length === 0) {
            alert('Please add some items to your order');
            return;
        }

        const message = `Hi! I'd like a quote for:\n${items.join('\n')}`;
        const phone = '212637629395';
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    addStyles() {
        if (!document.getElementById('calculator-styles')) {
            const style = document.createElement('style');
            style.id = 'calculator-styles';
            style.textContent = `
                .calculator-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .calculator-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: #2f2f2b;
                }
                .calculator-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                    margin: 1.5rem 0;
                }
                .calc-item label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #597362;
                }
                .calc-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #c8d7cb;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .calc-input:focus {
                    outline: none;
                    border-color: #7f9c89;
                    box-shadow: 0 0 0 4px rgba(127, 156, 137, 0.1);
                }
                .calc-summary {
                    background: #f8f4ec;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin: 1.5rem 0;
                }
                .calc-total {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.95rem;
                }
                .calc-total.final {
                    font-size: 1.25rem;
                    padding-top: 1rem;
                    border-top: 2px solid #c8d7cb;
                    margin-bottom: 0;
                }
                .calc-total.final strong {
                    color: #7f9c89;
                }
                .text-success {
                    color: #28a745;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize
window.Calculator = null;
document.addEventListener('DOMContentLoaded', () => {
    const calcContainer = document.getElementById('pricing-calculator');
    if (calcContainer) {
        window.Calculator = new PricingCalculator('pricing-calculator');
    }
});
