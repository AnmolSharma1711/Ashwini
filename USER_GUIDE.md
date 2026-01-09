# Project Ashwini - Visual User Guide

## 🎯 For Reception/Registration Staff

### Registration Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Project Ashwini - Main System                                          │
│  [Registration Dashboard]  [Health Monitoring Station]                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌─────────────────────────────────────────────┐
│ Register New Patient │  │ Patient Queue (3)                           │
├──────────────────────┤  ├─────────────────────────────────────────────┤
│                      │  │ ID  Name      Age  Gender  Status  Time     │
│ Name: [_________]    │  │ ───────────────────────────────────────────│
│ Age:  [___]          │  │ 1   John Doe   35   Male   waiting  10:30  │
│ Gender: [Male ▼]     │  │ 2   Jane Smith 28   Female checking 11:00  │
│ Phone: [_________]   │  │ 3   Bob Jones  45   Male   examined 11:30  │
│ Address:             │  │                                             │
│ [_______________]    │  │ [Delete buttons for each patient...]       │
│ Reason for Visit:    │  │                                             │
│ [_______________]    │  └─────────────────────────────────────────────┘
│ [_______________]    │
│                      │
│ [Register Patient]   │
└──────────────────────┘

✓ Success: Patient registered successfully!
```

**Actions**:
1. Fill in patient information
2. Click "Register Patient"
3. Patient appears in queue with "waiting" status
4. View all patients in the right panel

---

## 🏥 For Health Monitoring Staff

### Health Monitoring Station

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Project Ashwini - Main System                                          │
│  [Registration Dashboard]  [Health Monitoring Station]                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ Patient Selection               │  │ Record Vitals (Manual Entry)    │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ Select Patient:                 │  │ Blood Pressure: [_______]       │
│ [#1 - John Doe (35, Male)▼]    │  │ (e.g., 120/80)                  │
│                                 │  │                                 │
│ Patient Information             │  │ Temperature (°C): [_______]     │
│ Name: John Doe                  │  │ (e.g., 98.6)                    │
│ Age: 35                         │  │                                 │
│ Gender: Male                    │  │ SpO₂ (%): [_______]             │
│ Status: [checking]              │  │ (0-100)                         │
│ Reason: Fever and cough         │  │                                 │
│                                 │  │ Heart Rate (bpm): [_______]     │
│ [Start Health Check]            │  │ (e.g., 72)                      │
└─────────────────────────────────┘  │                                 │
                                     │ [Save Measurement]              │
┌─────────────────────────────────┐  └─────────────────────────────────┘
│ Latest Measurement              │
├─────────────────────────────────┤  ┌─────────────────────────────────┐
│ Blood Pressure: 120/80          │  │ IoT Device Integration (Future) │
│ Temperature (°C): 98.6          │  ├─────────────────────────────────┤
│ SpO₂ (%): 98.0                  │  │ In the future, this will allow  │
│ Heart Rate (bpm): 72.0          │  │ automatic measurement capture.  │
│ Source: manual                  │  │                                 │
│ Timestamp: 2026-01-07 11:00     │  │ [Start Device Measurement]      │
└─────────────────────────────────┘  │ (Coming Soon)                   │
                                     └─────────────────────────────────┘
```

**Actions**:
1. Select patient from dropdown
2. Click "Start Health Check" (changes status to "checking")
3. Enter vitals in the form
4. Click "Save Measurement"
5. Status automatically changes to "examined"

---

## 👨‍⚕️ For Doctors

### Doctor's Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Project Ashwini - Doctor's Dashboard          Patient 1 of 3           │
└─────────────────────────────────────────────────────────────────────────┘

[← Previous Patient]     [🔄 Refresh]     [Next Patient →]

┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ Patient Information             │  │ Prescription Management         │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ ID: 1                           │  │ Current Medicines:              │
│ Name: John Doe                  │  │ ┌─────────────────────────────┐ │
│ Age: 35 years                   │  │ │ Paracetamol                 │ │
│ Gender: Male                    │  │ │ [Tablet] three times a day  │ │
│ Phone: 1234567890               │  │ │ Quantity: Full     [Remove] │ │
│ Reason: Fever and cough         │  │ └─────────────────────────────┘ │
│ Status: [examined]              │  │                                 │
└─────────────────────────────────┘  │ Add New Medicine:               │
                                     │ Name: [_______________]         │
┌─────────────────────────────────┐  │ Dose: [_______________]         │
│ Latest Vital Signs              │  │ Type: [Tablet ▼]                │
├─────────────────────────────────┤  │ Quantity: [Full ▼]              │
│  ┌──────────┐  ┌──────────┐    │  │ [+ Add Medicine]                │
│  │   BP     │  │   Temp   │    │  │                                 │
│  │ 120/80   │  │  98.6°C  │    │  │ [Save All Changes]              │
│  └──────────┘  └──────────┘    │  └─────────────────────────────────┘
│  ┌──────────┐  ┌──────────┐    │
│  │  SpO₂    │  │ Heart    │    │  ┌─────────────────────────────────┐
│  │   98%    │  │ 72 bpm   │    │  │ Doctor's Notes                  │
│  └──────────┘  └──────────┘    │  ├─────────────────────────────────┤
└─────────────────────────────────┘  │ Clinical Notes:                 │
                                     │ [__________________________]    │
┌─────────────────────────────────┐  │ [__________________________]    │
│ Doctor's Notes                  │  │ [__________________________]    │
├─────────────────────────────────┤  │                                 │
│ Clinical Notes:                 │  │ Next Visit Date: [2026-01-10]   │
│ Patient has mild fever.         │  │                                 │
│ Prescribed Paracetamol.         │  │ [Save Notes & Next Visit]       │
│                                 │  └─────────────────────────────────┘
│ Next Visit: 2026-01-10          │
└─────────────────────────────────┘  ┌─────────────────────────────────┐
                                     │ Complete Consultation           │
                                     ├─────────────────────────────────┤
                                     │ Mark as completed. This will    │
                                     │ move them out of active queue.  │
                                     │ [Mark as Completed]             │
                                     └─────────────────────────────────┘
```

**Actions**:
1. Navigate between patients using Previous/Next buttons
2. Review patient information and vitals
3. Add medicines one by one, then "Save All Changes"
4. Enter clinical notes and next visit date
5. Click "Save Notes & Next Visit"
6. When done, click "Mark as Completed"

---

## 🔄 Patient Status Flow

```
╔═══════════════════════════════════════════════════════════════════════╗
║                      Patient Journey Through System                   ║
╚═══════════════════════════════════════════════════════════════════════╝

┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ WAITING  │  →   │ CHECKING │  →   │ EXAMINED │  →   │COMPLETED │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     ↓                 ↓                 ↓                  ↓
Registration    Health Check      Vitals        Doctor Consultation
   Staff          Started        Recorded             Finished

[Yellow]         [Blue]          [Blue]            [Green]
  Badge          Badge           Badge             Badge
```

**Status Meanings**:
- **Waiting** (Yellow): Just registered, in queue
- **Checking** (Blue): Currently at health monitoring station
- **Examined** (Blue): Vitals recorded, ready for doctor
- **Completed** (Green): Doctor finished, can leave

---

## 📱 UI Color Guide

### Status Badges
```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  waiting   │  │  checking  │  │  examined  │  │ completed  │
│  [Yellow]  │  │   [Blue]   │  │   [Blue]   │  │  [Green]   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

### Measurement Source
```
┌────────────┐  ┌────────────┐
│   manual   │  │   device   │
│   [Gray]   │  │  [Green]   │
└────────────┘  └────────────┘
```

### Navigation Headers
```
┌─────────────────────────────────────────────────────────────┐
│  [Primary Blue] - Main navigation and headers               │
│  [Info Blue] - Secondary sections                           │
│  [Success Green] - Action buttons and positive indicators   │
│  [Warning Yellow] - IoT placeholders and cautions           │
│  [Danger Red] - Delete actions and completion               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Quick Tips

### For Registration Staff
✓ Required fields: Name, Age, Gender  
✓ Patient automatically gets status "waiting"  
✓ Can delete patients if registered by mistake  
✓ Queue updates automatically after actions  

### For Health Monitoring Staff
✓ Select patient before entering vitals  
✓ Click "Start Health Check" to change status  
✓ Not all vitals are required - enter what you have  
✓ Latest measurement always shown for reference  

### For Doctors
✓ Use Previous/Next to navigate patients  
✓ Add medicines one at a time, then save all  
✓ Notes and next visit saved separately from prescription  
✓ Mark as completed when consultation finished  
✓ Completed patients won't appear in active list  

---

## 🔍 Finding Information

### Where to See Patient List
- **Registration Dashboard**: All patients with all statuses
- **Health Monitoring Station**: Dropdown shows waiting/checking/examined
- **Doctor Dashboard**: Only shows waiting/checking/examined (active)

### Where to See Latest Vitals
- **Health Monitoring Station**: "Latest Measurement" card
- **Doctor Dashboard**: "Latest Vital Signs" section

### Where to Manage Prescriptions
- **Doctor Dashboard**: "Prescription Management" card
- Add medicines one by one
- Remove unwanted medicines
- Save all changes when done

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't** forget to click "Save" buttons  
❌ **Don't** close browser before saving changes  
❌ **Don't** mark patient as completed before adding prescription  
❌ **Don't** enter invalid data (negative age, etc.)  

✓ **Do** save vitals immediately after entering  
✓ **Do** add at least one medicine before completing  
✓ **Do** add clinical notes for every patient  
✓ **Do** refresh if data doesn't update  

---

## 🆘 Troubleshooting

### "Patient not found"
→ Make sure patient is registered first

### "No measurements recorded"
→ Go to Health Monitoring Station and enter vitals

### "Can't add medicine"
→ Fill medicine name before clicking "+ Add Medicine"

### "Changes not saved"
→ Check for error messages (red alerts)
→ Verify all required fields are filled

### "Page not loading"
→ Check all three servers are running:
   - Backend (8000)
   - Main Frontend (4000)
   - Unified Frontend (3000)

---

## 📞 Access URLs Quick Reference

| Service | URL | Who Uses It |
|---------|-----|-------------|
| **Main Frontend** | http://localhost:4000 | Reception + Health Monitoring Staff |
| **Doctor Dashboard** | http://localhost:3000 | Doctors |
| **Backend API** | http://localhost:8000/api/ | Internal (system) |
| **Django Admin** | http://localhost:8000/admin | System Administrators |

---

**User Guide Version**: 1.0  
**Last Updated**: January 7, 2026
