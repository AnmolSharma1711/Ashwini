# Project Ashwini - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Backend Setup

```powershell
# Navigate to backend folder
cd d:\Ashwini\backend

# Create virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Enter username: admin
# Enter email: admin@example.com
# Enter password: admin123 (or your choice)

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

Backend is now running at: http://localhost:8000

---

### Step 2: Main Frontend Setup (Registration + Health Monitoring)

Open a **new terminal**:

```powershell
# Navigate to frontend-main folder
cd d:\Ashwini\frontend-main

# Install dependencies
npm install

# Start development server (automatically runs on port 4000)
npm start
```

Main Frontend is now running at: http://localhost:4000

---

### Step 3: Unified Frontend Setup (Doctor's Dashboard)

Open **another new terminal**:

```powershell
# Navigate to frontend-unified folder
cd d:\Ashwini\frontend-unified

# Install dependencies
npm install

# Start development server (automatically runs on port 3000)
npm start
```

Doctor's Dashboard is now running at: http://localhost:3000

---

## ✅ Verify Everything Works

1. **Backend API**: Open http://localhost:8000/api/patients/ in browser
   - Should see an empty list: `[]`

2. **Django Admin**: Open http://localhost:8000/admin
   - Login with the credentials you created
   - You should see Patients, Prescriptions, Measurements, Devices, etc.

3. **Main Frontend**: Open http://localhost:4000
   - You should see the Registration Dashboard

4. **Doctor's Dashboard**: Open http://localhost:3000
   - Should show "No patients to review" initially

---

## 🎯 Test the Complete Workflow

### 1. Register a Patient

1. Go to http://localhost:4000
2. Click "Registration Dashboard" tab
3. Fill in the form:
   - Name: John Doe
   - Age: 35
   - Gender: Male
   - Phone: 1234567890
   - Reason: Fever and cough
4. Click "Register Patient"
5. Patient appears in the table with status "waiting"

### 2. Record Vitals

1. Stay on http://localhost:4000
2. Click "Health Monitoring Station" tab
3. Select the patient from dropdown
4. Click "Start Health Check" (status changes to "checking")
5. Enter vitals:
   - Blood Pressure: 120/80
   - Temperature: 98.6
   - SpO₂: 98
   - Heart Rate: 72
6. Click "Save Measurement"
7. Patient status changes to "examined"

### 3. Doctor Consultation

1. Go to http://localhost:3000
2. You should see the patient details
3. Review the vitals displayed
4. Add prescription:
   - Name: Paracetamol
   - Dose: three times a day
   - Type: Tablet
   - Quantity: Full
   - Click "+ Add Medicine"
   - Click "Save All Changes to Prescription"
5. Add notes:
   - Enter: "Patient has mild fever. Prescribed Paracetamol. Follow up in 3 days."
   - Set Next Visit Date: 3 days from today
   - Click "Save Notes & Next Visit"
6. Click "Mark as Completed"

### 4. Verify in Admin

1. Go to http://localhost:8000/admin
2. Click on "Patients" - you should see the completed patient
3. Click on "Measurements" - you should see the recorded vitals
4. Click on "Prescriptions" - you should see the medicine list

---

## 🔍 Troubleshooting

### Backend Issues

**"Port 8000 is already in use"**
- Check if another Django server is running
- Kill the process: `taskkill /F /IM python.exe` (use carefully)
- Or use a different port: `python manage.py runserver 8001`

**"No module named 'rest_framework'"**
- Activate virtual environment: `.\venv\Scripts\Activate`
- Install dependencies again: `pip install -r requirements.txt`

**Database errors**
- Delete db.sqlite3 file
- Run migrations again:
  ```powershell
  python manage.py makemigrations
  python manage.py migrate
  ```

### Frontend Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Port 3000/4000 is already in use"**
- Check if another React app is running
- Kill the process or change port in package.json

**"Network Error" or "CORS error"**
- Ensure backend is running on port 8000
- Check .env file has correct API URL: `REACT_APP_API_URL=http://localhost:8000`
- Restart the React development server after changing .env

**Blank page or JavaScript errors**
- Open browser console (F12)
- Check for error messages
- Clear browser cache and reload

---

## 📊 Sample Data Creation

To test with multiple patients quickly, use Django admin or Django shell:

```powershell
cd d:\Ashwini\backend
python manage.py shell
```

```python
from patients.models import Patient
from prescriptions.models import Prescription

# Create sample patients
patient1 = Patient.objects.create(
    name="Alice Smith",
    age=28,
    gender="Female",
    phone="9876543210",
    reason="Regular checkup",
    status="waiting"
)
Prescription.objects.create(patient=patient1, medicines=[])

patient2 = Patient.objects.create(
    name="Bob Johnson",
    age=45,
    gender="Male",
    phone="5551234567",
    reason="Back pain",
    status="waiting"
)
Prescription.objects.create(patient=patient2, medicines=[])

print("Created 2 sample patients!")
```

Exit shell: `exit()`

---

## 🎓 Next Steps

1. **Explore the Admin Interface**: Add devices, view all data
2. **Test Different Workflows**: Multiple patients, different statuses
3. **Review the Code**: Understand the architecture
4. **Plan IoT Integration**: Review the IoT integration points in README.md

---

## 📝 Important URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8000/api/ | REST API endpoints |
| Django Admin | http://localhost:8000/admin | Data management |
| Main Frontend | http://localhost:4000 | Registration + Health Monitoring |
| Doctor's Dashboard | http://localhost:3000 | Patient consultation |

---

## 🆘 Need Help?

1. Check the main README.md for detailed documentation
2. Review API endpoints in README.md
3. Check browser console for frontend errors
4. Check terminal/command prompt for backend errors
5. Verify all three servers are running simultaneously

---

**Happy coding! 🎉**
