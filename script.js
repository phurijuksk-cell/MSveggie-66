// Shared interactions for all five demo pages.

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('active');
}

function filterProducts(category, btnElement) {
    document.querySelectorAll('.category-btn').forEach((button) => button.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    document.querySelectorAll('.product-grid .card').forEach((card) => {
        card.style.display = category === 'all' || card.dataset.category === category ? 'flex' : 'none';
    });
}

const qtyModal = document.getElementById('qtyModal');
let currentProduct = '';
let currentProductPrice = 0;

function openQtyModal(productName, productPrice) {
    currentProduct = productName;
    currentProductPrice = Number(String(productPrice).replace(/[^0-9.]/g, '')) || 0;

    setText('qtyProductName', productName);
    setText('qtyProductPrice', productPrice);

    const qtyInput = document.getElementById('qtyInput');
    if (qtyInput) qtyInput.value = 1;
    updateQtyPreview();

    if (qtyModal) qtyModal.style.display = 'flex';
}

function closeQtyModal() {
    if (qtyModal) qtyModal.style.display = 'none';
}

function updateQtyPreview() {
    const qtyInput = document.getElementById('qtyInput');
    if (!qtyInput) return;

    const quantity = Math.max(1, Number(qtyInput.value) || 1);
    setText('qtyTotalPreview', formatThaiBaht(quantity * currentProductPrice));
}

function confirmAddToCart() {
    const quantity = Number(document.getElementById('qtyInput')?.value || 0);
    if (quantity < 1) {
        alert('กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น');
        return;
    }

    alert(`เพิ่ม "${currentProduct}" จำนวน ${quantity} ชิ้น รวม ${formatThaiBaht(quantity * currentProductPrice)} ลงในตะกร้าแล้ว (ตัวอย่าง)`);
    closeQtyModal();
}

let activeCoupon = null;

function formatThaiBaht(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount).replace('฿', '').trim() + ' บาท';
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
}

function updateCartQty(button, change) {
    const row = button.closest('tr');
    if (!row) return;

    const qtySpan = row.querySelector('.qty-display');
    const priceCell = row.querySelector('.item-price');
    const unitPrice = Number(row.dataset.price);
    const currentQuantity = Number(qtySpan.innerText);
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) return;

    qtySpan.innerText = newQuantity;
    priceCell.innerText = formatThaiBaht(newQuantity * unitPrice);
    recalculateCartTotal();
}

function recalculateCartTotal() {
    const rows = document.querySelectorAll('#cartTable tbody tr');
    if (!rows.length) return null;

    let subtotal = 0;
    rows.forEach((row) => {
        const quantity = Number(row.querySelector('.qty-display').innerText);
        const unitPrice = Number(row.dataset.price);
        subtotal += quantity * unitPrice;
    });

    const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'standard';
    const shipping = delivery === 'express' ? 80 : (subtotal >= 500 ? 0 : 40);

    let discount = 0;
    if (activeCoupon === 'FRESH10' && subtotal >= 200) {
        discount = Math.min(subtotal * 0.10, 100);
    } else if (activeCoupon === 'VEGGIE50' && subtotal >= 500) {
        discount = 50;
    }

    const grandTotal = Math.max(0, subtotal + shipping - discount);

    setText('subtotalDisplay', formatThaiBaht(subtotal));
    setText('shippingDisplay', shipping === 0 ? 'ฟรี' : formatThaiBaht(shipping));
    setText('discountDisplay', '− ' + formatThaiBaht(discount));
    setText('totalPriceDisplay', formatThaiBaht(grandTotal));

    const remaining = Math.max(0, 500 - subtotal);
    setText('freeShippingText', remaining > 0
        ? `อีก ${formatThaiBaht(remaining)} รับสิทธิ์ส่งฟรีแบบมาตรฐาน`
        : 'คุณได้รับสิทธิ์ส่งฟรีแบบมาตรฐานแล้ว 🎉');

    const progress = document.getElementById('shippingProgress');
    if (progress) progress.style.width = Math.min(100, (subtotal / 500) * 100) + '%';

    return { subtotal, shipping, discount, grandTotal };
}

function applyCoupon() {
    const input = document.getElementById('couponInput');
    const message = document.getElementById('couponMessage');
    if (!input || !message) return;

    const code = input.value.trim().toUpperCase();
    message.className = 'coupon-message';

    if (code === 'FRESH10') {
        activeCoupon = code;
        message.innerText = 'ใช้โค้ดสำเร็จ: ลด 10% สูงสุด 100 บาท (ขั้นต่ำ 200 บาท)';
        message.classList.add('success');
    } else if (code === 'VEGGIE50') {
        activeCoupon = code;
        message.innerText = 'ใช้โค้ดสำเร็จ: ลด 50 บาท เมื่อซื้อครบ 500 บาท';
        message.classList.add('success');
    } else {
        activeCoupon = null;
        message.innerText = code ? 'ไม่พบโค้ดส่วนลดนี้ กรุณาลองอีกครั้ง' : 'กรุณากรอกโค้ดส่วนลด';
        message.classList.add('error');
    }

    recalculateCartTotal();
}

function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (!checkoutModal) return;

    const totals = recalculateCartTotal();
    setText('popupTotalPrice', 'ราคารวมสุทธิ: ' + (totals ? formatThaiBaht(totals.grandTotal) : '0 บาท'));
    checkoutModal.style.display = 'flex';
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.style.display = 'none';
}

function confirmPayment() {
    alert('ยืนยันคำสั่งซื้อเรียบร้อย! นี่เป็นขั้นตอนชำระเงินจำลอง ไม่มีการตัดเงินจริง');
    closeCheckout();
}

window.addEventListener('click', (event) => {
    if (event.target === qtyModal) closeQtyModal();

    const checkoutModal = document.getElementById('checkoutModal');
    if (event.target === checkoutModal) closeCheckout();
});

const scrollTopButton = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (!scrollTopButton) return;
    scrollTopButton.style.display = window.scrollY > 180 ? 'block' : 'none';
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    recalculateCartTotal();

    const couponInput = document.getElementById('couponInput');
    if (couponInput) {
        couponInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') applyCoupon();
        });
    }
});
