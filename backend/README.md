# 🏥 Doctor Appointment Scheduling Backend

A production-ready backend system for doctor–patient appointment scheduling built using **NestJS**, **PostgreSQL**, and **TypeORM**.

This system supports:

- 🔐 JWT Authentication
- 👨‍⚕️ Doctor & Patient Roles
- 🗓 Custom and Recurring Slots
- ⚡ STREAM & WAVE booking modes
- 🔒 Concurrency-safe booking (Pessimistic Locking)
- ⏳ Slot Expiry Protection
- ❌ Cancellation with automatic capacity release

---

## 🚀 Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT
- **Language:** TypeScript

---

## 🏗 System Overview

The system allows:

### Doctor
- Login / Register
- Add specialization
- Create custom slots
- Create recurring slots
- Define booking mode (STREAM / WAVE)

### Patient
- Login / Register
- Search doctor by specialization
- View available slots
- Book appointment
- Cancel appointment

---

## 🗓 Slot Types

### 1️⃣ Custom Slot
Single-day slot.

Example:

Date: 2026-02-20
Time: 10:00–12:00
Duration: 30 mins
Max Patient: 1


---

### 2️⃣ Recurring Slot
Repeats between date range on specific days.

Example:

Start Date: 2026-02-20
End Date: 2026-03-10
Days: Monday, Wednesday
Time: 09:00–11:00
Duration: 30 mins
Mode: STREAM
Max Patient: 10


---

## ⚙ Booking Modes

### 🔹 STREAM Mode
- Patients are distributed across generated time blocks.
- Each time block allows up to `maxPatient`.

### 🔹 WAVE Mode
- Multiple patients can book same time block.
- Capacity enforced per time block.

---

## 🧠 Automatic Time Generation

If a slot is:


09:00–11:00
Duration: 30 mins


System auto-generates:


09:00
09:30
10:00
10:30


Patients can only book valid generated times.

---

## 🔒 Concurrency Control

To prevent double booking:

- Uses **Database Transactions**
- Uses **Pessimistic Write Lock**
- Capacity checked inside transaction

Ensures race-condition-safe booking under concurrent requests.

---

## ⏳ Expiry Protection

Patients cannot book:
- Past time slots
- Outside recurring date range
- On unavailable recurring days

---

## ❌ Cancellation Logic

- Marks appointment as `CANCELLED`
- Capacity automatically freed
- Future bookings allowed

---

## 📡 API Endpoints

### Auth

POST /auth/google


### Doctor

GET /doctor
GET /doctor/:id
GET /doctor/specialization?value=cardio


### Slots

POST /slots


### Appointments

POST /appointments/book
POST /appointments/cancel/:id


---

## 🗄 Database Tables

- users
- doctor
- slot
- appointment

---

## 📊 Key Features

✔ Role-based access  
✔ Custom & Recurring slot support  
✔ Automatic time block generation  
✔ Capacity control  
✔ STREAM & WAVE logic  
✔ Expiry validation  
✔ Concurrency-safe booking  
✔ Clean modular architecture  

---

## 🎯 Project Level

Internship-level project with production-grade booking logic and concurrency safety.

---

## 👨‍💻 Author

Built as part of backend internship learning journey.