# Firestore Security Specification - Giriraj Power

## 1. Data Invariants
1. **Catalog Integrity**: Products can only be created or modified by authorized administrators. All customers and visitors have read access to view products.
2. **Order Authenticity**: Orders must include required customer information (name, phone, address, area, total amount, items list) and cannot have negative totals or arbitrary unauthorized status changes.
3. **User Profile Isolation**: Users can only read and modify their own user profile document (`users/{userId}`).
4. **Service Bookings**: Bookings can be submitted by customers with contact and project information. Status transitions can be updated by admin or the booking creator.

## 2. The Dirty Dozen Payloads (Negative Security Tests)
1. Unauthenticated anonymous write trying to overwrite a product price to 0.
2. User attempting to read another user's private profile document.
3. User attempting to forge an order with `totalAmount: -500`.
4. User attempting to spoof `role: "admin"` on profile creation.
5. User attempting to delete another customer's order.
6. Payload injecting 500KB string into the `orderId` or `productId` path parameter.
7. Payload omitting required `customerName` or `phone` on order creation.
8. Unauthenticated client trying to list or scrape all private user profiles.
9. Updating order status to an invalid enum state like `hacked`.
10. Injecting oversized note fields (> 1000 characters).
11. Client attempting to overwrite immutable fields like `createdAt`.
12. Attempting to bypass validation by injecting ghost keys not defined in the schema.
