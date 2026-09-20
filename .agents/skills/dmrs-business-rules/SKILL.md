Request Number = MR-YYYY-NNNNNN

SOH = database stock balance

Balance = SOH - Requested Quantity

Approval ≠ STOCK_OUT

Reject membutuhkan reason

Cancellation membutuhkan reason

User hanya dapat melihat request sendiri

Approver hanya dapat approve request dalam scope

Admin dapat melihat seluruh request

Approved request:
Admin dapat mengubah field tertentu
+
wajib reason
+
old value
+
new value
+
audit

Cancellation sebelum STOCK_OUT:
NO STOCK_OUT
NO stock reduction

Cancellation setelah STOCK_OUT:
REVERSAL
+
restore stock
+
preserve original STOCK_OUT
