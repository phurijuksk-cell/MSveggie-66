/* script.js - ฉบับ Clean (รองรับ 5 หน้า) */

// --- Mobile Menu Toggle ---
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// --- Category Filter Logic (สำหรับหน้าแรก) ---
function filterProducts(category, btnElement) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const cards = document.querySelectorAll('.product-grid .card');
    
    cards.forEach(card => {
        const productCategory = card.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- Quantity Modal Logic (สำหรับหน้าแรก - เลือกจำนวนก่อนใส่ตะกร้า) ---
const qtyModal = document.getElementById('qtyModal');
let currentProduct = "";

function openQtyModal(productName, productPrice) {
    currentProduct = productName;
    document.getElementById('qtyProductName').innerText = productName;
    document.getElementById('qtyProductPrice').innerText = productPrice;
    document.getElementById('qtyInput').value = 1;
    
    if(qtyModal) qtyModal.style.display = 'flex';
}

function closeQtyModal() {
    if(qtyModal) qtyModal.style.display = 'none';
}

function confirmAddToCart() {
    const qty = document.getElementById('qtyInput').value;
    if(qty < 1) {
        alert("กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น");
        return;
    }
    
    alert(`เพิ่ม "${currentProduct}" จำนวน ${qty} ชิ้น ลงในตะกร้าเรียบร้อย!`);
    closeQtyModal();
}

// --- Cart Calculation Logic (สำหรับหน้าตะกร้า) ---

function updateCartQty(btn, change) {
    const row = btn.closest('tr');
    const qtySpan = row.querySelector('.qty-display');
    const priceCell = row.querySelector('.item-price');
    const unitPrice = parseFloat(row.getAttribute('data-price'));
    
    let currentQty = parseInt(qtySpan.innerText);
    let newQty = currentQty + change;
    
    if (newQty < 1) return;
    
    qtySpan.innerText = newQty;
    
    const newPrice = newQty * unitPrice;
    priceCell.innerText = newPrice + ' บาท';
    
    recalculateCartTotal();
}

function recalculateCartTotal() {
    const rows = document.querySelectorAll('#cartTable tbody tr');
    let total = 0;
    
    rows.forEach(row => {
        const qty = parseInt(row.querySelector('.qty-display').innerText);
        const unitPrice = parseFloat(row.getAttribute('data-price'));
        total += (qty * unitPrice);
    });
    
    const totalText = 'ราคารวมทั้งหมด: ' + total + ' บาท';
    const totalDisplay = document.getElementById('totalPriceDisplay');
    if(totalDisplay) totalDisplay.innerText = totalText;
}

// --- Checkout Logic (Popup ยืนยันการจ่ายเงิน) ---
function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if(checkoutModal) {
        const currentTotalText = document.getElementById('totalPriceDisplay').innerText;
        const priceOnly = currentTotalText.replace('ราคารวมทั้งหมด: ', '');
        
        const popupPrice = document.getElementById('popupTotalPrice');
        if(popupPrice) {
            popupPrice.innerText = 'ราคารวมสุทธิ: ' + priceOnly;
        }
        
        checkoutModal.style.display = 'flex';
    }
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if(checkoutModal) checkoutModal.style.display = 'none';
}

function confirmPayment() {
    alert('ชำระเงินเสร็จสิ้น! ขอบคุณที่ใช้บริการ M&S veggie');
    closeCheckout();
}

// --- Close Modal when clicking outside ---
window.onclick = function(event) {
    if (event.target == qtyModal) {
        closeQtyModal();
    }
    const checkoutModal = document.getElementById('checkoutModal');
    if (event.target == checkoutModal) {
        closeCheckout();
    }
}

/* --- Back to Top Logic --- */

// ดึงตัวปุ่มมาเก็บไว้
let mybutton = document.getElementById("scrollTopBtn");

// ดักจับการเลื่อนหน้าจอ
window.onscroll = function() { scrollFunction() };

function scrollFunction() {
    // ถ้าหาปุ่มไม่เจอ (บางหน้าอาจไม่ได้ใส่) ให้จบฟังก์ชัน
    if (!mybutton) return;

    // ถ้าเลื่อนลงมาเกิน 100px ให้แสดงปุ่ม
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// ฟังก์ชันกดแล้วเลื่อนไปบนสุด
function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}