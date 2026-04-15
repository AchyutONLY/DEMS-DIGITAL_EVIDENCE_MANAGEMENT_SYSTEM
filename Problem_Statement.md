# Digital Evidence Management System (DEMS)

> A comprehensive, role-based digital evidence management platform designed for law enforcement with audit logging, secure file handling, and custody chain tracking.

---

## 🎯 Problem Statement & Solution

### The Problem We Solved

Law enforcement agencies face critical challenges in managing evidence:

1. **No Centralized Repository**: Evidence files scattered across local drives, external storage with poor organization and discoverability.
2. **Lack of Accountability**: No way to track who accessed, modified, or transferred evidence → legal liability and chain-of-custody violations.
3. **Manual Custody Records**: Paper-based or spreadsheet evidence custody tracking = human error, inconsistency, legal disputes.
4. **No Role-Based Access Control**: Officers, inspectors, and admins need different permissions; no system to enforce them.
5. **File Loss & Corruption**: No backup, no version control, no integrity verification.
6. **Compliance Risk**: Case files, custody records, and audit trails required for legal proceedings are scattered and unauditable.

### How We Solved It

**DEMS** is a full-stack evidence management system built with modern web technologies that:

✅ **Centralized Storage**: Evidence files uploaded to secure backend with metadata in PostgreSQL  
✅ **Audit Trail**: Every action (login, file access, custody transfer, case updates) logged with user, timestamp, and details  
✅ **Role-Based Control**: Three user roles (Admin, Inspector, Officer) with granular permissions per endpoint  
✅ **Digital Custody Chain**: Track evidence possession transfer between officers with timestamps and notes  
✅ **Secure Authentication**: JWT-based auth with bcrypt_sha256 password hashing  
✅ **Chain-of-Custody Integrity**: Prevent modification of closed cases; officers can only work on assigned cases  
✅ **File Integrity**: Uploaded files preserve extensions; download returns correct filename  
✅ **Responsive UI**: Modern React frontend with clean design, real-time notifications, and role-based views  

---

## 📦 Key Features

### 1. **Authentication & Access Control**
- **JWT Bearer Token** authentication with configurable expiry
- **Three Roles**: Admin (system management), Inspector (case creation & oversight), Officer (evidence handling)
- **Last Login Tracking** for security audits
- **Password Hashing** using bcrypt_sha256 (salted, secure)
- **Status-based Access**: Inactive users cannot log in

### 2. **User Management (Admin Only)**
- Create, read, update, delete users
- Auto-generate secure passwords + send via email
- Filter by status (ACTIVE/INACTIVE)
- Search by name or badge
- Bulk user operations support

### 3. **Case Lifecycle Management**
- **Create Cases** (Inspectors only) with title, type, description, and assigned officers
- **Case States**: Open, Under Investigation, Closed (INACTIVE)
- **Case Assignment**: Inspector assigns officers to cases (1:many relationship)
- **Case Reactivation**: Close cases and reactivate if needed
- **Search & Filter**: By title, status, date range
- **Officer Assignment Management**: Add/remove officers from cases

### 4. **Digital Evidence Handling**
- **Upload Evidence**: Inspector/Officer upload files with type, source/origin, description
- **File Preservation**: Original file extension preserved in storage (e.g., `.pdf`, `.jpg`, `.docx`)
- **Metadata Tracking**: Evidence type, collection date, submitting officer, case association
- **Download with Integrity**: Download returns file with correct filename and extension (fixed in latest release)
- **Full-Text Search**: Search evidence by description, type
- **Soft Delete Support**: Admin-only deletion with audit trail
- **Case-Scoped Evidence**: Evidence tied to specific cases; cross-case access prevented

### 5. **Custody Chain Tracking**
- **Record Evidence Possession**: Track which officer has evidence at what time
- **Timestamp Every Transfer**: Automatic timestamps for legal compliance
- **Transfer Notes**: Officers add context (e.g., "Transferred to evidence room")
- **Chain Integrity**: Only inspectors can add custody records for their cases
- **Read-Only History**: Custody records cannot be modified once case is closed
- **Audit Trail**: Every custody change logged with inspector, officer, timestamp

### 6. **Comprehensive Audit Logging**
- **All Actions Logged**: CREATE, READ, UPDATE, DELETE events
- **User Attribution**: Every log entry includes UserID, timestamp, event type, detailed description
- **Admin Audit Dashboard**: Filter logs by:
  - User ID
  - Event type (CREATE, UPDATE, DELETE, READ)
  - Date range
  - Keyword search in details
- **Immutable Logs**: Audit trail cannot be deleted or modified
- **Security Events**: Login attempts, access denials, password changes logged
- **Compliance Ready**: Export-friendly JSON format for legal discovery

### 7. **Modern UI/UX**
- **Role-Based Dashboards**: Different views for Admin, Inspector, Officer
- **Clean Design System**: White background, deep blue accents (#2f4ea2), professional typography
- **Responsive Layout**: Sidebar navigation, topbar with profile access
- **Empty States**: Helpful messages and icons for no-data scenarios
- **Real-Time Feedback**: Toast notifications for success/error messages
- **Modal Dialogs**: Safe forms for critical operations (create, edit, delete)
- **Data Tables**: Search, filter, pagination for large datasets
- **Loading States**: Clear spinners during async operations

### 8. **Background Maintenance**
- **Periodic File Integrity Check**: APScheduler runs every N minutes (configurable)
- **Missing File Detection**: Alert if evidence metadata points to non-existent file
- **Logging of Repairs**: Any missing file is logged for admin investigation
- **Configurable Schedule**: Set `APP_SCHEDULING_TIME` in `.env`

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────────┐
│  React Frontend │ (Vite dev server / static build)
│  - Dashboard    │
│  - Case views   │
│  - Evidence UI  │
└────────┬────────┘
         │ HTTP + JWT Bearer
         ▼
┌──────────────────────────────┐
│      FastAPI Backend         │
│  ┌──────────────────────┐    │
│  │ Auth / JWT Verify    │    │
│  │ Role-Based Deps      │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │ Routers (API Routes) │    │
│  │ - /auth              │    │
│  │ - /users             │    │
│  │ - /cases             │    │
│  │ - /evidence          │    │
│  │ - /custody           │    │
│  │ - /audit             │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │ APScheduler          │    │
│  │ (file checks)        │    │
│  └──────────────────────┘    │
└────────┬────────┬────────────┘
         │        │
         │        ▼
         │   ┌─────────────────┐
         │   │  evidences/     │
         │   │  (local storage)│
         │   └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │   PostgreSQL    │
    │  - Users        │
    │  - Cases        │
    │  - Evidence     │
    │  - Custody      │
    │  - Audit Logs   │
    └─────────────────┘
```

### Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts (admin, inspector, officer) |
| `cases` | Investigation cases |
| `case_assignments` | Officers assigned to cases (M:M) |
| `evidenceitems` | Evidence metadata + file paths |
| `custodyrecords` | Evidence possession transfers |
| `auditlog` | Immutable audit trail |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended) OR
- Python 3.11+, PostgreSQL 15, Node.js 18+

### Option 1: Docker Compose (Recommended)

```bash
cd /Users/pashantraj/Desktop/dbms_project/Digital_Evidence_Management_System

# Copy environment template
cp .env.example .env

# Update .env with your PostgreSQL credentials and JWT secret
nano .env

# Start all services
docker-compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

### Option 2: Local Development

**Backend:**
```bash
cd app/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env with DATABASE_HOSTNAME=localhost, DATABASE_PORT=5432, etc.
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd dems_frontend/
npm install
npm run dev
# Vite dev server on http://localhost:5173
```

### Initial Login

**Bootstrap Admin** (created automatically on first run):
- Badge: `ADM00001` (or custom via `BOOTSTRAP_ADMIN_BADGE` env)
- Password: From `.env` `BOOTSTRAP_ADMIN_PASSWORD`

---

## 📋 API Overview

### Authentication
```
POST   /login                    # Login with badge + password
GET    /me                       # Get current user profile
POST   /users/change-password    # Change own password
```

### User Management (Admin Only)
```
POST   /users/                              # Create user (sends password email)
GET    /users/                              # List users with filters
GET    /users/officers/active               # List active officers
PUT    /users/{badge_number}                # Update user
DELETE /users/{badge_number}                # Deactivate/delete user
```

### Cases (Inspector-led, Officer-executed)
```
POST   /cases/                                      # Create case (Inspector only)
GET    /cases/                                      # List all cases (Admin/Inspector)
GET    /cases/assigned                              # Get assigned/owned cases (Inspector/Officer)
GET    /cases/assigned/{officer_id}                 # Cases for specific officer (Admin/Inspector)
GET    /cases/assigned-officers/{case_id}           # Officers assigned to case (Inspector owner)
PUT    /cases/{case_id}                             # Update case (Inspector owner)
PUT    /cases/{case_id}/close                       # Close case (Inspector owner)
PUT    /cases/{case_id}/reactivate                  # Reactivate closed case (Inspector owner/Officer)
DELETE /cases/{case_id}                             # Delete case (Admin only)
POST   /cases/{case_id}/assign                      # Assign officers (Inspector owner)
POST   /cases/{case_id}/remove-officers             # Remove officers (Inspector owner)
```

### Evidence Handling
```
POST   /evidence/                           # Upload evidence (Inspector/Officer on assigned case)
GET    /evidence/case/{case_id}             # List evidence for case
GET    /evidence/{case_id}/{evidence_id}/download  # Download file with proper filename
PUT    /evidence/{case_id}/{evidence_id}    # Update evidence metadata (Inspector/Officer)
DELETE /evidence/{evidence_id}              # Delete evidence (Admin only)
```

### Custody Chain
```
POST   /custody/                    # Add custody record (Inspector owner)
GET    /custody/                    # List custody records (all authenticated)
GET    /custody/{record_id}         # Get specific custody record
PUT    /custody/{record_id}         # Update custody record (Inspector owner)
DELETE /custody/{record_id}         # Delete custody record (Admin only)
```

### Audit Logs (Admin Only)
```
GET    /audit/                      # List audit logs with filters
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - Bearer token in Authorization header
   - Configurable expiry (default: 30 min)
   - Secret key-based signing

2. **Password Security**
   - bcrypt_sha256 hashing (salt included)
   - Minimum 6 characters enforced
   - Change password endpoint available

3. **Role-Based Access Control**
   - Function-level decorators check user role
   - Case ownership validation (inspectors can only manage own cases)
   - Officer assignment validation (can only work on assigned cases)

4. **Data Integrity**
   - Timestamps on all records (server-side generated)
   - Immutable audit logs
   - Foreign key constraints prevent orphaned records
   - Soft deletes for critical data (e.g., cases marked INACTIVE, not hard-deleted)

5. **File Security**
   - Files stored outside web root
   - File extension preserved (prevents double-extension attacks)
   - Content-Disposition header prevents inline viewing
   - Case-scoped access (can't download evidence from cases you don't have access to)

---

## 🔧 Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Database
DATABASE_HOSTNAME=postgres          # 'localhost' for local, 'postgres' for Docker
DATABASE_PORT=5432
DATABASE_NAME=dems_db
DATABASE_USERNAME=dems_user
DATABASE_PASSWORD=your_secure_password

# JWT & Security
SECRET_KEY=your-super-secret-key-min-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Bootstrap Admin (created on first startup)
BOOTSTRAP_ADMIN_NAME=Administrator
BOOTSTRAP_ADMIN_BADGE=ADM00001
BOOTSTRAP_ADMIN_EMAIL=admin@dems.local
BOOTSTRAP_ADMIN_PASSWORD=SecurePassword123
BOOTSTRAP_ADMIN_CONTACT=+1-555-0000

# Email (for credential delivery)
SENDER_MAIL=your-gmail@gmail.com
APP_PASSWORD_MAIL=your-app-password  # Gmail app password, not regular password
SUPERADMIN_MAIL=admin@dems.local

# Scheduling
APP_SCHEDULING_TIME=5               # Run integrity check every 5 minutes
```

---

## 📊 Extra Features & Enhancements

### 1. **Email Credential Delivery**
- When admin creates a user, a temporary password is generated
- Credentials (Badge, Temporary Password) sent to user's email
- Professional HTML email template with branding
- Uses Gmail SMTP (or compatible)

### 2. **File Integrity Monitoring**
- Background job checks if evidence files exist on disk
- If metadata points to missing file, logs alert
- Admin can investigate and repair references
- Prevents "phantom evidence" errors

### 3. **Real-Time Status Tracking**
- Last login timestamp for each user
- Case open/close dates tracked
- Evidence collection date captured
- Custody transfer timestamps (to the second)

### 4. **Advanced Search & Filtering**
- Full-text search on evidence descriptions
- Filter cases by status, date range, inspector
- Audit logs searchable by user, event, date range, keyword
- Pagination for large datasets

### 5. **Modern Frontend Design**
- **Clean Design System**: White bg, deep blue accents, professional typography (Inter font)
- **Responsive Layout**: Sidebar nav + topbar with profile circle
- **Role-Based Views**: 
  - Admin: User management + audit log + case overview
  - Inspector: Case creation/management + evidence upload + custody tracking
  - Officer: View assigned cases + upload evidence + see custody chain
- **Empty States**: Helpful icons and messages when no data
- **Modal Dialogs**: Safe CRUD operations with confirmation
- **Data Tables**: Sort, search, paginate with real data

### 6. **Audit Trail Integration**
- Every endpoint logs a CREATE, READ, UPDATE, or DELETE event
- Search logs by user, event type, date, keyword
- Immutable: admin cannot modify/delete audit logs
- Legal discovery ready: JSON export format

### 7. **Error Handling & Validation**
- Comprehensive input validation (Pydantic schemas)
- Descriptive error messages (don't leak system details)
- HTTP status codes properly used (403 Forbidden, 404 Not Found, etc.)
- Database rollback on error

### 8. **Deployment Ready**
- Docker + Docker Compose for one-command deployment
- Environment-based configuration (no hardcoded secrets)
- Health checks in docker-compose (DB readiness)
- Volume mounts for persistence (evidence files, DB data)
- Nginx-ready (can add reverse proxy in compose)

---

## 🐛 Known Issues & Fixes

### Issue: Downloaded files had no extension
**Root Cause**: Backend didn't set `Content-Disposition` header correctly  
**Fix Applied**: Explicitly set header with filename in download endpoint  
**Result**: Files now download with correct extension (e.g., `case_id1_evidence_id1.pdf`)

### Issue: Custody records visible for all cases
**Root Cause**: Query didn't filter by case ownership  
**Fix Applied**: Filter custody records by case evidence IDs on load  
**Result**: Officers only see custody for their assigned cases

### Issue: Inactive users could log in
**Root Cause**: Status check was missing in login endpoint  
**Fix Applied**: Added `Status == ACTIVE` check before issuing JWT  
**Result**: Only active users can authenticate

---

## 📈 Performance Considerations

- **Pagination**: Large tables paginated (limit/skip params)
- **Indexes**: Badge, CaseID, UserID indexed for fast queries
- **Background Jobs**: File checks run in separate scheduler thread (non-blocking)
- **JWT Caching**: Client stores token in sessionStorage (reduces login calls)
- **Lazy Loading**: Frontend loads case details only when opened

---

## 🎓 Usage Examples

### Example 1: Create a Case with Assigned Officers
```bash
curl -X POST http://localhost:8000/cases/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Bank Robbery Investigation",
    "Type": "Robbery",
    "Status": "Open",
    "Description": "Investigation into downtown bank robbery on April 10",
    "AssignedOfficerIDs": [2, 3]
  }'
```

### Example 2: Upload Evidence
```bash
curl -X POST http://localhost:8000/evidence/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "CaseID=1" \
  -F "EvidenceType=Security Footage" \
  -F "SourceOrigin=Bank Camera #3" \
  -F "Description=HD recording of robbery" \
  -F "file=@/path/to/footage.mp4"
```

### Example 3: Record Custody Transfer
```bash
curl -X POST http://localhost:8000/custody/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EvidenceID": 5,
    "ActingOfficerID": 3,
    "Notes": "Transferred to evidence room for safekeeping"
  }'
```

### Example 4: View Audit Logs
```bash
curl http://localhost:8000/audit/?limit=50&user_id=2&search=evidence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Testing Checklist

- [ ] Login as Admin, create Inspector user, verify email sent
- [ ] Login as Inspector, create case, assign officers
- [ ] As Officer, view assigned case and upload evidence
- [ ] As Inspector, record custody transfer for evidence
- [ ] Admin views audit log, filters by user and event type
- [ ] Download evidence file, verify extension preserved
- [ ] Close case, try to modify evidence (should fail)
- [ ] View empty cases/evidence (confirm helpful message)
- [ ] Search evidence by description
- [ ] Attempt to access non-owned case as Officer (should fail)

---

## 📞 Support & Contributions

For issues or feature requests, open an issue on the GitHub repository.

**Key Contributors**: DEMS Development Team  
**Last Updated**: April 2026  
**License**: MIT

---

**DEMS: Making evidence management secure, auditable, and compliant.** 
